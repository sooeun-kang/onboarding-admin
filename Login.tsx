
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { User } from '../types';
import { supabase } from '../lib/supabase';

interface LoginProps {
  onLoginSuccess: (userData: User, accessToken: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [isSdkReady, setIsSdkReady] = useState(false);
  const tokenClientRef = useRef<any>(null);
  const initializedRef = useRef(false);

  const CLIENT_ID = "391184744242-1l77jr2u0e96tmhjfok2lqdthvulltap.apps.googleusercontent.com"; 

  const saveUserProfileAndSession = async (userData: User, token: string) => {
    try {
      // 1. profiles 테이블에 유저 정보 upsert (구글 sub를 ID로 사용)
      // [Fix] Changed 'name' to 'full_name' and 'avatar' to 'avatar_url' to match User interface and profile table schema
      await supabase.from('profiles').upsert({
        id: userData.id,
        full_name: userData.full_name,
        email: userData.email,
        avatar_url: userData.avatar_url,
        updated_at: new Date().toISOString()
      });

      // 2. user_sessions 테이블에 로그인 내역 기록 (테이블이 존재한다고 가정)
      await supabase.from('user_sessions').insert({
        user_id: userData.id,
        login_at: new Date().toISOString(),
        user_agent: navigator.userAgent
      }).select().catch(err => console.warn('user_sessions table might not exist yet:', err));

    } catch (err) {
      console.error("Error saving user profile/session:", err);
    }
  };

  const fetchUserProfile = async (token: string) => {
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch profile');
      const data = await response.json();
      
      // [Fix] Mapped Google profile fields to User interface properties (full_name, avatar_url)
      const userData: User = {
        id: data.sub || 'google-user',
        full_name: data.name || '구글 사용자',
        email: data.email || '',
        avatar_url: data.picture || 'https://picsum.photos/seed/google/80/80'
      };

      await saveUserProfileAndSession(userData, token);
      onLoginSuccess(userData, token);
    } catch (e) {
      console.error("Profile fetch error:", e);
      // [Fix] Mapped fallback fields to correct User interface properties
      const fallbackUser: User = {
        id: 'google-user',
        full_name: '인사팀 관리자',
        email: 'admin@company.com',
        avatar_url: 'https://picsum.photos/seed/admin/80/80'
      };
      onLoginSuccess(fallbackUser, token);
    }
  };

  const initializeGoogle = useCallback(() => {
    if (typeof window === 'undefined' || !(window as any).google || initializedRef.current) return;

    const google = (window as any).google;

    try {
      const client = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
        callback: (tokenResponse: any) => {
          if (tokenResponse && tokenResponse.access_token) {
            fetchUserProfile(tokenResponse.access_token);
          }
        },
      });
      
      tokenClientRef.current = client;
      initializedRef.current = true;
      setIsSdkReady(true);
    } catch (e) {
      console.error("Google SDK Initialization failed", e);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if ((window as any).google) {
        initializeGoogle();
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [initializeGoogle]);

  const handleGoogleLoginClick = () => {
    if (tokenClientRef.current) {
      tokenClientRef.current.requestAccessToken({ prompt: 'consent' });
    } else {
      alert("구글 로그인 라이브러리가 로드 중입니다. 잠시 후 다시 시도해 주세요.");
    }
  };

  const handleDemoLogin = () => {
    // [Fix] Corrected demo login object to match User interface properties
    onLoginSuccess({ 
      id: 'demo-user', 
      full_name: '데모 관리자', 
      email: 'demo@company.com', 
      avatar_url: 'https://picsum.photos/seed/manager/80/80' 
    }, 'demo-token');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-200 px-4">
      <div className="max-w-md w-full bg-white border border-slate-400 shadow-none p-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-slate-800 flex items-center justify-center mb-4">
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-white" fill="currentColor">
              <path d="M4 18v-8h3v8H4zm5 0V4h3v14H9zm5 0v-6h3v6h-3zm5 0v-4h3v4h-3z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">온보딩 백오피스</h1>
          <p className="text-slate-500 text-xs mt-2 text-center leading-normal">
            내부 관리자 전용 시스템입니다.<br />승인된 계정으로 로그인해 주십시오.
          </p>
        </div>

        <div className="space-y-4 flex flex-col items-center">
          <button 
            onClick={handleGoogleLoginClick}
            disabled={!isSdkReady}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm border border-slate-300 transition-colors disabled:opacity-50"
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.49h4.84c-.21 1.12-.84 2.07-1.79 2.7l2.85 2.2c1.67-1.53 2.63-3.79 2.63-6.46z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.85-2.2c-.79.53-1.8.85-3.11.85-2.39 0-4.41-1.61-5.14-3.77H1.03v2.33C2.51 15.96 5.52 18 9 18z" fill="#34A853"/>
              <path d="M3.86 10.74c-.19-.56-.3-1.15-.3-1.74s.11-1.18.3-1.74V4.93H1.03C.37 6.16 0 7.54 0 9s.37 2.84 1.03 4.07l2.83-2.33z" fill="#FBBC05"/>
              <path d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0 5.52 0 2.51 2.04 1.03 4.93l2.83 2.33c.73-2.16 2.75-3.77 5.14-3.77z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </button>
          
          <div className="w-full flex items-center gap-2 py-2">
            <div className="flex-1 border-t border-slate-200"></div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">OR</span>
            <div className="flex-1 border-t border-slate-200"></div>
          </div>

          <button 
            onClick={handleDemoLogin}
            className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-300 transition-colors"
          >
            데모 계정으로 로그인 (Demo)
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 text-[10px] text-slate-400 leading-relaxed">
          * 구글 로그인 시 구글 드라이브 파일 업로드 권한이 요청됩니다.<br />
          * 브라우저 팝업 차단 설정이 되어 있다면 해제해 주세요.
        </div>
      </div>
    </div>
  );
};

export default Login;
