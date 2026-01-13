
import React, { useState, useMemo, useEffect } from 'react';
import { 
  OnboardingCase, 
  CaseStatus, 
  TaskStatus, 
  Task, 
  User
} from './types';
import { TASK_LIST } from './constants';
import { supabase } from './lib/supabase';
import Dashboard from './components/Dashboard';
import OnboardingTable from './components/OnboardingTable';
import CreateModal from './components/CreateModal';
import DetailModal from './components/DetailModal';
import Sidebar from './components/Sidebar';
import Login from './components/Login';

const ITEMS_PER_PAGE = 10;

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [cases, setCases] = useState<OnboardingCase[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('전체');
  const [currentPage, setCurrentPage] = useState(1);

  const handleLogin = (userData: User, token: string) => {
    setCurrentUser(userData);
    setAccessToken(token);
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').order('full_name');
      if (error) throw error;
      if (data) setUsers(data as unknown as User[]);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchCases = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('onboarding_cases')
        .select(`
          *,
          owner:profiles!onboarding_cases_owner_id_fkey(*),
          tasks(*, assignee:profiles!tasks_assignee_id_fkey(*)),
          history:history_logs(*, actor:profiles!history_logs_actor_id_fkey(*))
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setCases(data as unknown as OnboardingCase[]);
    } catch (err) {
      console.error('Error fetching cases:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchUsers();
      fetchCases();
    }
  }, [currentUser]);

  const calculateCaseStatus = (tasks: any[], currentStatus: CaseStatus): CaseStatus => {
    if (currentStatus === CaseStatus.CANCELED) return CaseStatus.CANCELED;
    const completedCount = tasks.filter(t => t.status === TaskStatus.COMPLETED).length;
    if (completedCount === tasks.length) return CaseStatus.COMPLETED;
    if (completedCount === 0) return CaseStatus.TODO;
    return CaseStatus.IN_PROGRESS;
  };

  const createOnboarding = async (formData: any) => {
    if (!currentUser) return;

    try {
      const { data: newCase, error: caseError } = await supabase
        .from('onboarding_cases')
        .insert([{
          ...formData,
          owner_id: currentUser.id,
          status: CaseStatus.TODO,
        }])
        .select()
        .single();

      if (caseError) throw caseError;

      const tasksToInsert = TASK_LIST.map((name, i) => ({
        case_id: newCase.id,
        name,
        status: TaskStatus.BEFORE,
        assignee_id: currentUser.id,
        sort_order: i
      }));

      const { error: taskError } = await supabase.from('tasks').insert(tasksToInsert);
      if (taskError) throw taskError;

      await supabase.from('history_logs').insert([{
        case_id: newCase.id,
        actor_id: currentUser.id,
        type: 'CASE_CREATE',
        description: '온보딩 케이스가 생성되었습니다.',
      }]);

      fetchCases();
      setIsCreateModalOpen(false);
    } catch (err) {
      alert('생성 중 오류가 발생했습니다.');
      console.error(err);
    }
  };

  const updateTask = async (caseId: string, taskId: string, updates: any) => {
    if (!currentUser) return;

    try {
      const payload: any = { ...updates };
      if (updates.status === TaskStatus.COMPLETED) {
        payload.completed_at = new Date().toISOString();
      }

      const { error: taskError } = await supabase
        .from('tasks')
        .update(payload)
        .eq('id', taskId);

      if (taskError) throw taskError;

      const targetCase = cases.find(c => c.id === caseId);
      if (targetCase) {
        const targetTask = targetCase.tasks.find(t => t.id === taskId);
        const updatedTasks = targetCase.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t);
        const nextStatus = calculateCaseStatus(updatedTasks, targetCase.status);
        
        if (nextStatus !== targetCase.status) {
          await supabase.from('onboarding_cases').update({ status: nextStatus }).eq('id', caseId);
        }

        let description = '업무 정보가 업데이트되었습니다.';
        let type = 'TASK_UPDATE';

        if (updates.status === TaskStatus.IN_PROGRESS) {
          description = '업무를 시작했습니다.';
          type = 'TASK_START';
        } else if (updates.status === TaskStatus.COMPLETED) {
          description = '업무를 완료 처리했습니다.';
          type = 'TASK_COMPLETE';
        } else if (updates.assignee_id) {
          const newAssigneeName = users.find(u => u.id === updates.assignee_id)?.full_name || '담당자';
          const isInitialAssign = !targetTask?.assignee;
          description = isInitialAssign 
            ? `담당자를 ${newAssigneeName}님으로 지정했습니다.` 
            : `담당자를 ${newAssigneeName}님으로 변경했습니다.`;
          type = 'ASSIGNEE_CHANGE';
        } else if (updates.external_url) {
          description = '증빙 파일을 업로드했습니다.';
          type = 'FILE_UPLOAD';
        }

        const finalDescription = targetTask ? `[${targetTask.name}] ${description}` : description;

        await supabase.from('history_logs').insert([{
          case_id: caseId,
          actor_id: currentUser.id,
          type: type,
          description: finalDescription
        }]);
      }

      fetchCases();
    } catch (err) {
      console.error('Update Task Error:', err);
    }
  };

  const cancelCase = async (caseId: string, reason: string) => {
    if (!currentUser) return;

    try {
      await supabase.from('onboarding_cases').update({ 
        status: CaseStatus.CANCELED, 
        cancel_reason: reason 
      }).eq('id', caseId);

      await supabase.from('history_logs').insert([{
        case_id: caseId,
        actor_id: currentUser.id,
        type: 'CASE_CANCEL',
        description: `온보딩 프로세스 취소 (사유: ${reason})`
      }]);

      fetchCases();
    } catch (err) {
      console.error('Cancel Case Error:', err);
    }
  };

  const filteredCases = useMemo(() => {
    return cases.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
      (filterStatus === '전체' || c.status === filterStatus)
    );
  }, [cases, searchTerm, filterStatus]);

  const paginatedCases = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCases.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredCases, currentPage]);

  const selectedCase = useMemo(() => cases.find(c => c.id === selectedCaseId) || null, [cases, selectedCaseId]);

  if (!currentUser) return <Login onLoginSuccess={handleLogin} />;

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-800">
      <Sidebar user={currentUser} onLogout={() => setCurrentUser(null)} />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-300 h-14 flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">온보딩 관리 시스템</h1>
            {isLoading && <span className="text-xs text-slate-400 animate-pulse font-medium">실시간 동기화 중...</span>}
          </div>
        </header>

        <main className="p-6 space-y-6">
          <Dashboard cases={cases} />

          <div className="bg-white border border-slate-300 shadow-sm">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <select 
                  value={filterStatus}
                  onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                  className="border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {['전체', '진행 전', '진행 중', '진행 완료', '진행 취소'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="입사자명 검색" 
                    className="border border-slate-300 px-3 py-1.5 text-sm w-64 focus:outline-none focus:ring-1 focus:ring-indigo-500" 
                    value={searchTerm} 
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} 
                  />
                </div>
              </div>
              <button 
                onClick={() => setIsCreateModalOpen(true)} 
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 text-sm font-bold border border-indigo-700 transition-colors shadow-sm"
              >
                새 온보딩 생성
              </button>
            </div>

            <OnboardingTable 
              cases={paginatedCases} 
              onOpenDetail={setSelectedCaseId} 
              currentPage={currentPage}
              totalPages={Math.ceil(filteredCases.length / ITEMS_PER_PAGE) || 1}
              onPageChange={setCurrentPage}
            />
          </div>
        </main>
      </div>

      {isCreateModalOpen && <CreateModal onClose={() => setIsCreateModalOpen(false)} onCreate={createOnboarding} />}
      {selectedCase && (
        <DetailModal 
          caseData={selectedCase} 
          users={users}
          accessToken={accessToken} 
          onClose={() => setSelectedCaseId(null)} 
          onUpdateTask={updateTask} 
          onCancelCase={cancelCase} 
        />
      )}
    </div>
  );
};

export default App;
