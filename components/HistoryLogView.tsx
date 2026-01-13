
import React from 'react';
import { OnboardingCase, HistoryLog } from '../types';

interface Props {
  caseData: OnboardingCase;
  taskId?: string;
  onClose: () => void;
}

const HistoryLogView: React.FC<Props> = ({ caseData, taskId, onClose }) => {
  const targetTask = taskId ? caseData.tasks.find(t => t.id === taskId) : null;
  
  const filteredLogs = targetTask 
    ? caseData.history.filter(log => log.description.startsWith(`[${targetTask.name}]`))
    : caseData.history;

  const targetName = targetTask ? targetTask.name : "전체 온보딩";

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm">
      <div className="bg-white border border-slate-300 shadow-2xl w-full max-w-lg max-h-[70vh] flex flex-col overflow-hidden rounded-sm">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0">
          <div>
            <h3 className="text-lg font-bold text-slate-800">변경 이력</h3>
            <p className="text-xs text-slate-500">{targetName}</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-slate-400 italic text-sm">기록된 이력이 없습니다.</div>
          ) : (
            <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
              {filteredLogs.map((log) => (
                <div key={log.id} className="relative flex items-start gap-6 group">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-slate-200 shadow-sm shrink-0 z-10">
                    <img src={log.actor.avatar_url} className="w-8 h-8 rounded-full" alt="" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-slate-800">{log.actor.full_name}</span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {new Date(log.created_at).toLocaleString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit', year: 'numeric', month: '2-digit', day: '2-digit' })}
                      </span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <p className="text-sm text-slate-600 leading-relaxed">{log.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryLogView;
