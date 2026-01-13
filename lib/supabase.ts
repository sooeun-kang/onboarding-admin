
import { createClient } from '@supabase/supabase-js';

// Vercel 환경 변수 또는 기본값 사용
const supabaseUrl = (window as any).env?.SUPABASE_URL || 'https://cymmxjzhucagfeoreojr.supabase.co';
const supabaseAnonKey = (window as any).env?.SUPABASE_ANON_KEY || 'sb_publishable_HLmZZsLwmB-ASrrVFd51xA_979dHY6O';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
