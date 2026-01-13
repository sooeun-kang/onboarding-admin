
import React from 'react';
import { OnboardingCase, TaskStatus } from '../types';
import { getStatusColor } from '../constants';

interface Props {
  cases: OnboardingCase[];
  onOpenDetail: (id: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const OnboardingTable: React.FC<Props> = ({ cases, onOpenDetail, currentPage, totalPages, onPageChange }) => {
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-300">
              <th className="px-4 py-3 text-xs font-bold text-slate-600 border-r border-slate-200 text-center w-12">NO.</th>
              <th className="px-4 py-3 text-xs font-bold text-slate-600 border-r border-slate-200">입사자명</th>
              <th className="px-4 py-3 text-xs font-bold text-slate-600 border-r border-slate-200">소속</th>
              <th className="px-4 py-3 text-xs font-bold text-slate-600 border-r border-slate-200 text-center w-28">입사일</th>
              <th className="px-4 py-3 text-xs font-bold text-slate-600 border-r border-slate-200">담당자</th>
              <th className="px-4 py-3 text-xs font-bold text-slate-600 border-r border-slate-200 w-48 text-center">진행률</th>
              <th className="px-4 py-3 text-xs font-bold text-slate-600 border-r border-slate-200 text-center w-24">상태</th>
              <th className="px-4 py-3 text-xs font-bold text-slate-600 text-center w-24">상세</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {cases.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-slate-400 text-sm italic">
                  데이터가 존재하지 않습니다.
                </td>
              </tr>
            ) : (
              cases.map((c, idx) => {
                const completedCount = c.tasks.filter(t => t.status === TaskStatus.COMPLETED).length;
                const totalCount = c.tasks.length;
                const progress = Math.round((completedCount / totalCount) * 100);
                const displayNo = (currentPage - 1) * 10 + (idx + 1);
                
                return (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2.5 text-xs text-slate-500 text-center border-r border-slate-100">{displayNo}</td>
                    <td className="px-4 py-2.5 text-sm font-bold text-slate-900 border-r border-slate-100">{c.name}</td>
                    <td className="px-4 py-2.5 text-xs text-slate-600 border-r border-slate-100">{c.division} &gt; {c.team}</td>
                    <td className="px-4 py-2.5 text-xs text-slate-600 text-center border-r border-slate-100">{c.start_date}</td>
                    <td className="px-4 py-2.5 border-r border-slate-100">
                      <div className="flex items-center gap-2">
                        <img src={c.owner.avatar_url} alt="" className="w-5 h-5 rounded-full border border-slate-200" />
                        <span className="text-xs text-slate-700">{c.owner.full_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 border-r border-slate-100">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${c.status === '진행 취소' ? 'bg-red-400' : 'bg-indigo-600'}`}
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 w-8">{progress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-center border-r border-slate-100">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${getStatusColor(c.status)}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <button 
                        onClick={() => onOpenDetail(c.id)}
                        className="text-[11px] font-bold text-indigo-600 hover:underline"
                      >
                        상세보기
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 0 && (
        <div className="px-4 py-3 border-t border-slate-300 flex items-center justify-center bg-slate-50 gap-1">
          <button 
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="px-2 py-1 text-xs border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-50 disabled:bg-slate-50 rounded"
          >
            이전
          </button>
          
          {pageNumbers.map(num => (
            <button 
              key={num}
              onClick={() => onPageChange(num)}
              className={`w-7 h-7 flex items-center justify-center text-xs font-medium border rounded ${currentPage === num ? 'bg-indigo-600 text-white border-indigo-700 font-bold' : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-100'}`}
            >
              {num}
            </button>
          ))}

          <button 
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="px-2 py-1 text-xs border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-50 disabled:bg-slate-50 rounded"
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
};

export default OnboardingTable;
