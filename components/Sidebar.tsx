
import React from 'react';
import { User } from '../types';

interface SidebarProps {
  user: User;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, onLogout }) => {
  return (
    <div className="w-56 bg-slate-900 text-slate-300 flex flex-col sticky top-0 h-screen shrink-0 border-r border-slate-800">
      <div className="p-5 border-b border-slate-800 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-emerald-500 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor">
              <path d="M4 18v-8h3v8H4zm5 0V4h3v14H9zm5 0v-6h3v6h-3zm5 0v-4h3v4h-3z" />
            </svg>
          </div>
          <span className="text-sm font-black text-white uppercase tracking-tight">Onboarding Admin</span>
        </div>
      </div>

      <nav className="flex-1 px-2 space-y-1">
        <button className="w-full flex items-center gap-3 px-3 py-2 bg-indigo-600 text-white rounded shadow-sm text-sm font-bold">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
          </svg>
          <span>온보딩 관리</span>
        </button>

        <button className="w-full flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded text-sm font-medium transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292" />
          </svg>
          <span>사원 관리</span>
        </button>
      </nav>

      <div className="p-4 bg-slate-800/50 border-t border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 overflow-hidden">
            <img 
              src={user.avatar_url} 
              alt="Profile" 
              className="w-8 h-8 rounded border border-slate-700 shrink-0"
            />
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-white truncate">{user.full_name}</span>
              <span className="text-[10px] text-slate-500 truncate">{user.email}</span>
            </div>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="w-full py-2 bg-slate-700 hover:bg-red-600 hover:text-white text-slate-300 text-xs font-bold rounded transition-colors border border-slate-600"
        >
          로그아웃
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
