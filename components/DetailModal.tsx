
import React, { useState, useRef } from 'react';
import { OnboardingCase, TaskStatus, Task, CaseStatus, User } from '../types';
import { getStatusColor } from '../constants';
import HistoryLogView from './HistoryLogView';

interface Props {
  caseData: OnboardingCase;
  users: User[];
  accessToken: string | null;
  onClose: () => void;
  onUpdateTask: (caseId: string, taskId: string, updates: any) => void;
  onCancelCase: (caseId: string, reason: string) => void;
}

const FILE_TASK_NAME = '입사서류 및 자사이력서 확인';
const TARGET_FOLDER_ID = '1Fyh4uQnWYDJCAgL3c_QAgMP89sOah0C3';

const DetailModal: React.FC<Props> = ({ caseData, users, accessToken, onClose, onUpdateTask, onCancelCase }) => {
  const [activeTaskIdForHistory, setActiveTaskIdForHistory] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [uploadingTaskId, setUploadingTaskId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isCanceled = caseData.status === CaseStatus.CANCELED;

  const handleStatusChange = (task: Task) => {
    if (isCanceled) return;
    if (task.name === FILE_TASK_NAME && task.status === TaskStatus.BEFORE) {
      fileInputRef.current?.click();
      return;
    }
    const nextStatus = task.status === TaskStatus.BEFORE ? TaskStatus.IN_PROGRESS : TaskStatus.COMPLETED;
    onUpdateTask(caseData.id, task.id, { status: nextStatus });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !accessToken) return;
    const task = caseData.tasks.find(t => t.name === FILE_TASK_NAME);
    if (!task) return;
    
    setUploadingTaskId(task.id);

    const normalizedToken = accessToken.trim();
    if (normalizedToken === 'demo-token') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      onUpdateTask(caseData.id, task.id, { 
        status: TaskStatus.IN_PROGRESS,
        external_url: 'https://drive.google.com/drive/folders/' + TARGET_FOLDER_ID
      });
      setUploadingTaskId(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    try {
      const file = files[0];
      const metadata = {
        name: `[온보딩_${caseData.name}]_${file.name}`,
        mimeType: file.type || 'application/octet-stream',
        parents: [TARGET_FOLDER_ID]
      };
      
      const boundary = '-------314159265358979323846';
      
      const reader = new FileReader();
      const uploadResult: any = await new Promise((resolve, reject) => {
        reader.onload = async () => {
          try {
            const contentType = file.type || 'application/octet-stream';
            const metadataPart = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n`;
            const mediaHeader = `--${boundary}\r\nContent-Type: ${contentType}\r\n\r\n`;
            const mediaFooter = `\r\n--${boundary}--`;
            
            const metadataBuffer = new TextEncoder().encode(metadataPart);
            const mediaHeaderBuffer = new TextEncoder().encode(mediaHeader);
            const mediaBuffer = new Uint8Array(reader.result as ArrayBuffer);
            const mediaFooterBuffer = new TextEncoder().encode(mediaFooter);
            
            const totalBody = new Uint8Array(
              metadataBuffer.length + 
              mediaHeaderBuffer.length + 
              mediaBuffer.length + 
              mediaFooterBuffer.length
            );
            
            totalBody.set(metadataBuffer, 0);
            totalBody.set(mediaHeaderBuffer, metadataBuffer.length);
            totalBody.set(mediaBuffer, metadataBuffer.length + mediaHeaderBuffer.length);
            totalBody.set(mediaFooterBuffer, metadataBuffer.length + mediaHeaderBuffer.length + mediaBuffer.length);

            const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink', {
              method: 'POST',
              headers: { 
                'Authorization': `Bearer ${normalizedToken}`, 
                'Content-Type': `multipart/related; boundary=${boundary}` 
              },
              body: totalBody
            });

            if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`구글 API 오류: ${errorText}`);
            }
            
            resolve(await response.json());
          } catch (err) { reject(err); }
        };
        reader.readAsArrayBuffer(file);
      });

      onUpdateTask(caseData.id, task.id, { 
        status: TaskStatus.IN_PROGRESS, 
        external_url: uploadResult.webViewLink 
      });
      
      alert('파일이 정상적으로 업로드되었습니다.');
      
    } catch (err: any) { 
      console.error('Upload error:', err);
      alert(`업로드 실패: ${err.message}`); 
    } finally {
      setUploadingTaskId(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
      <div className="bg-white border border-slate-400 shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden rounded-sm">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-100 shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-base font-bold text-slate-900">{caseData.name}님 온보딩 상세현황</h2>
            <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${getStatusColor(caseData.status)}`}>{caseData.status}</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 text-slate-500">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-4 gap-4 text-xs">
          <div className="flex flex-col">
            <span className="font-bold text-slate-500 uppercase tracking-tighter mb-1">부서/팀</span>
            <span className="text-slate-800 font-medium">{caseData.division} &gt; {caseData.team}</span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-500 uppercase tracking-tighter mb-1">입사 예정일</span>
            <span className="text-slate-800 font-medium">{caseData.start_date}</span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-500 uppercase tracking-tighter mb-1">휴대전화</span>
            <span className="text-slate-800 font-medium">{caseData.phone}</span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-500 uppercase tracking-tighter mb-1">메인 담당자</span>
            <span className="text-slate-800 font-medium">{caseData.owner?.full_name || '미지정'}</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-white p-4">
          {isCanceled && (
            <div className="mb-4 bg-red-50 border border-red-200 p-3 flex items-start gap-3 rounded-sm">
              <span className="text-red-700 text-xs font-bold">취소된 프로세스: {caseData.cancel_reason || '사유 미기재'}</span>
            </div>
          )}

          <div className="border border-slate-200 rounded-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-3 py-2 font-bold text-slate-600 border-r border-slate-200 w-12 text-center">No.</th>
                  <th className="px-3 py-2 font-bold text-slate-600 border-r border-slate-200">업무 항목</th>
                  <th className="px-3 py-2 font-bold text-slate-600 border-r border-slate-200 w-44">담당자</th>
                  <th className="px-3 py-2 font-bold text-slate-600 border-r border-slate-200 w-24 text-center">상태</th>
                  <th className="px-3 py-2 font-bold text-slate-600 text-center w-40">액션</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {caseData.tasks.map((task, idx) => {
                  const isUploading = uploadingTaskId === task.id;
                  return (
                    <tr key={task.id} className={isCanceled ? 'opacity-50 grayscale' : ''}>
                      <td className="px-3 py-2 text-center border-r border-slate-100">{idx + 1}</td>
                      <td className="px-3 py-2 border-r border-slate-100 font-medium">{task.name}</td>
                      <td className="px-3 py-2 border-r border-slate-100">
                        <select 
                          disabled={isCanceled} 
                          value={task.assignee?.id || ''} 
                          onChange={(e) => onUpdateTask(caseData.id, task.id, { assignee_id: e.target.value })} 
                          className="bg-transparent border border-slate-200 px-2 py-0.5 rounded-sm w-full outline-none focus:border-indigo-500"
                        >
                          <option value="">담당자 선택</option>
                          {users.map(u => <option key={u.id} value={u.id}>{u.full_name} ({u.email})</option>)}
                        </select>
                      </td>
                      <td className="px-3 py-2 border-r border-slate-100 text-center">
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded border ${getStatusColor(task.status)}`}>{task.status}</span>
                      </td>
                      <td className="px-3 py-2 text-center space-x-2">
                        {task.external_url && (
                          <a href={task.external_url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-bold hover:underline">파일보기</a>
                        )}
                        <button onClick={() => setActiveTaskIdForHistory(task.id)} className="text-slate-500 font-bold hover:underline">이력</button>
                        {task.status !== TaskStatus.COMPLETED && (
                          <button 
                            disabled={isCanceled || isUploading} 
                            onClick={() => handleStatusChange(task)} 
                            className={`px-2 py-0.5 font-bold rounded-sm border ${task.status === TaskStatus.BEFORE ? 'bg-white border-slate-300 text-slate-600' : 'bg-indigo-600 border-indigo-700 text-white'}`}
                          >
                            {isUploading ? '업로드중' : (task.status === TaskStatus.BEFORE ? (task.name === FILE_TASK_NAME ? '업로드' : '시작') : '완료')}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <button onClick={() => setActiveTaskIdForHistory('ALL')} className="text-xs font-bold text-slate-500 hover:text-slate-800">전체 감사 로그</button>
          {!isCanceled && (
            <button 
              onClick={() => setShowCancelConfirm(true)} 
              className="px-4 py-1.5 text-xs font-bold text-red-600 border border-red-200 bg-white hover:bg-red-50 rounded-sm"
            >
              프로세스 진행 취소
            </button>
          )}
        </div>

        {activeTaskIdForHistory && <HistoryLogView caseData={caseData} taskId={activeTaskIdForHistory === 'ALL' ? undefined : activeTaskIdForHistory} onClose={() => setActiveTaskIdForHistory(null)} />}
        
        {showCancelConfirm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white border border-slate-400 p-6 max-w-sm w-full shadow-2xl rounded-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-4">프로세스 취소 확인</h3>
              <p className="text-xs text-slate-500 mb-4">취소 시 모든 업무 액션이 차단됩니다.</p>
              <textarea 
                className="w-full p-2 border border-slate-300 text-xs h-20 mb-4 outline-none focus:ring-1 focus:ring-red-500 rounded-sm" 
                placeholder="취소 사유 (필수)" 
                value={cancelReason} 
                onChange={(e) => setCancelReason(e.target.value)} 
              />
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowCancelConfirm(false)} className="px-3 py-1.5 text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-sm">취소</button>
                <button 
                  disabled={!cancelReason.trim()}
                  onClick={() => { onCancelCase(caseData.id, cancelReason); setShowCancelConfirm(false); }} 
                  className="px-4 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 border border-red-700 disabled:opacity-50 rounded-sm"
                >
                  진행 취소 처리
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailModal;
