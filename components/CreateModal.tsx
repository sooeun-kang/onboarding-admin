
import React, { useState } from 'react';

interface Props {
  onClose: () => void;
  onCreate: (data: any) => void;
}

const CreateModal: React.FC<Props> = ({ onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    job_title: '',
    division: '',
    office: '',
    team: '',
    part: '',
    role: '',
    detail_role: '',
    phone: '',
    email: '',
    start_date: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white border border-slate-400 shadow-2xl w-full max-w-2xl overflow-hidden rounded-sm">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h2 className="text-base font-bold text-slate-800">새 온보딩 프로세스 생성</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 text-slate-500">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            {[
              { label: '성명 *', name: 'name', type: 'text', placeholder: '홍길동' },
              { label: '입사 예정일 *', name: 'start_date', type: 'date', placeholder: '' },
              { label: '직급 *', name: 'position', type: 'text', placeholder: '사원' },
              { label: '직책 *', name: 'job_title', type: 'text', placeholder: '팀원' },
              { label: '본부 *', name: 'division', type: 'text', placeholder: '경영지원본부' },
              { label: '실 *', name: 'office', type: 'text', placeholder: '인사실' },
              { label: '팀 *', name: 'team', type: 'text', placeholder: 'HR팀' },
              { label: '파트 *', name: 'part', type: 'text', placeholder: '채용파트' },
              { label: '직무 *', name: 'role', type: 'text', placeholder: '인사' },
              { label: '세부직무 *', name: 'detail_role', type: 'text', placeholder: '채용 및 온보딩' },
              { label: '휴대전화 *', name: 'phone', type: 'text', placeholder: '010-0000-0000' },
              { label: '개인 이메일 *', name: 'email', type: 'email', placeholder: 'test@email.com' },
            ].map((field) => (
              <div key={field.name} className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-600">{field.label}</label>
                <input 
                  required 
                  name={field.name} 
                  type={field.type}
                  onChange={handleChange} 
                  placeholder={field.placeholder}
                  className="px-3 py-1.5 border border-slate-300 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white" 
                />
              </div>
            ))}
          </div>
          
          <div className="flex gap-2 justify-end pt-4 border-t border-slate-200">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors rounded-sm"
            >
              취소
            </button>
            <button 
              type="submit" 
              className="px-6 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 border border-indigo-700 transition-all rounded-sm"
            >
              프로세스 생성
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateModal;
