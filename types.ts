
export enum TaskStatus {
  BEFORE = '업무 전',
  IN_PROGRESS = '진행 중',
  COMPLETED = '업무 완료',
}

export enum CaseStatus {
  TODO = '진행 전',
  IN_PROGRESS = '진행 중',
  COMPLETED = '진행 완료',
  CANCELED = '진행 취소',
}

export interface User {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string;
}

export interface Task {
  id: string;
  case_id: string;
  name: string;
  status: TaskStatus;
  assignee: User;
  completed_at?: string;
  external_url?: string;
  sort_order: number;
}

export interface HistoryLog {
  id: string;
  created_at: string;
  actor: User;
  type: string;
  taskId?: string;
  taskName?: string;
  description: string;
  fromValue?: string;
  toValue?: string;
  reason?: string;
}

export interface OnboardingCase {
  id: string;
  name: string;
  position: string;
  job_title: string;
  division: string;
  office: string;
  team: string;
  part: string;
  role: string;
  detail_role: string;
  phone: string;
  email: string;
  start_date: string;
  owner: User;
  tasks: Task[];
  status: CaseStatus;
  cancel_reason?: string;
  history: HistoryLog[];
  created_at: string;
}
