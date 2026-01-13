
import React from 'react';
import { OnboardingCase, CaseStatus } from '../types';

interface Props {
  cases: OnboardingCase[];
}

const Dashboard: React.FC<Props> = ({ cases }) => {
  const stats = {
    todo: cases.filter(c => c.status === CaseStatus.TODO).length,
    inProgress: cases.filter(c => c.status === CaseStatus.IN_PROGRESS).length,
    done: cases.filter(c => c.status === CaseStatus.COMPLETED).length,
    canceled: cases.filter(c => c.status === CaseStatus.CANCELED).length,
  };

  const cards = [
    { label: '진행 전', count: stats.todo, colorClass: 'border-slate-300' },
    { label: '진행 중', count: stats.inProgress, colorClass: 'border-amber-400' },
    { label: '진행 완료', count: stats.done, colorClass: 'border-emerald-500' },
    { label: '진행 취소', count: stats.canceled, colorClass: 'border-red-500' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div 
          key={card.label} 
          className={`bg-white p-5 border-l-4 border border-slate-300 shadow-sm ${card.colorClass}`}
        >
          <div className="text-xs font-bold text-slate-500 mb-2 uppercase">{card.label}</div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-900">{card.count}</span>
            <span className="text-xs text-slate-400">건</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Dashboard;
