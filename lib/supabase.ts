
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.1';

/**
 * [주의] 
 * 1. 아래 'your-project-url'과 'your-anon-key'를 
 *    Supabase 대시보드(Settings > API)에서 확인한 실제 값으로 교체하세요.
 * 2. 보안을 위해 실제 운영 환경에서는 환경 변수(process.env)를 사용해야 합니다.
 */
const supabaseUrl = (window as any).env?.SUPABASE_URL || 'https://cymmxjzhucagfeoreojr.supabase.co';
const supabaseAnonKey = (window as any).env?.SUPABASE_ANON_KEY || 'sb_publishable_HLmZZsLwmB-ASrrVFd51xA_979dHY6O';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
