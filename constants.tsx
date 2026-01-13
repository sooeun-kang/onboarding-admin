
import { User } from './types';

export const TASK_LIST = [
  '입사안내메일 전송',
  '고웍스 사원등록',
  '신규계정신청서 작성',
  '사원증 발급',
  'PC 및 자리 확인',
  '네임택 제작',
  '입사서류 및 자사이력서 확인',
  '근로계약서 작성',
  '명함 신청',
];

export const getStatusColor = (status: string) => {
  switch (status) {
    case '진행 전':
    case '업무 전': 
      return 'bg-slate-100 text-slate-600 border-slate-200'; // default
    case '진행 중': 
      return 'bg-amber-50 text-amber-700 border-amber-200'; // warning
    case '진행 완료':
    case '업무 완료': 
      return 'bg-emerald-50 text-emerald-700 border-emerald-200'; // success
    case '진행 취소': 
      return 'bg-red-50 text-red-700 border-red-200'; // error
    default: 
      return 'bg-slate-100 text-slate-600 border-slate-200';
  }
};
