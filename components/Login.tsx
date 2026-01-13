
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

  const toUUID = (str: string) => {
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str)) return str;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    const hex2 = Math.abs(hash * 31).toString(16).padStart(8, '0');
    const hex3 = Math.abs(hash * 7).toString(16).padStart(12, '0');
    return `${hex}-${hex2.substring(0,4)}-4${hex2.substring(4,7)}-a${hex3.substring(0,3)}-${hex3.substring(0,12)}`;
  };

  const saveUserProfileAndSession = async (userData: User, token: string) => {
    try {
      const { error: upsertError } = await supabase.from('profiles').upsert({
        id: userData.id,
        full_name: userData.full_name,
        email: userData.email,
        avatar_url: userData.avatar_url,
        updated_at: new Date().toISOString()
      });
      if (upsertError) throw upsertError;
      await supabase.from('user_sessions').insert({
        user_id: userData.id,
        login_at: new Date().toISOString(),
        user_agent: navigator.userAgent
      }).catch((err: any) => console.warn('session record failed:', err));
    } catch (err: any) {
      console.error("Error saving profile:", err);
    }
  };

  const fetchUserProfile = async (token: string) => {
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch profile');
      const data = await response.json();
      const userData: User = {
        id: toUUID(data.sub || 'google-user'),
        full_name: data.name || '구글 사용자',
        email: data.email || '',
        avatar_url: data.picture || 'https://picsum.photos/seed/google/80/80'
      };
      await saveUserProfileAndSession(userData, token);
      onLoginSuccess(userData, token);
    } catch (e: any) {
      console.error("Profile fetch error:", e);
      onLoginSuccess({
        id: '00000000-0000-0000-0000-000000000000',
        full_name: '인사팀 관리자',
        email: 'admin@company.com',
        avatar_url: 'https://picsum.photos/seed/admin/80/80'
      }, token);
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
    } catch (e: any) {
      console.error("Google SDK error", e);
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
    if (tokenClientRef.current) tokenClientRef.current.requestAccessToken({ prompt: 'consent' });
    else alert("로그인 라이브러리 로드 중...");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-200 px-4">
      <div className="max-w-md w-full bg-white border border-slate-400 p-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-slate-800 flex items-center justify-center mb-4">
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-white" fill="currentColor">
              <path d="M4 18v-8h3v8H4zm5 0V4h3v14H9zm5 0v-6h3v6h-3zm5 0v-4h3v4h-3z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">온보딩 백오피스</h1>
          <p className="text-slate-500 text-xs mt-2 text-center">내부 관리자 전용 시스템입니다.</p>
        </div>
        <button 
          onClick={handleGoogleLoginClick}
          disabled={!isSdkReady}
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm border border-slate-300 transition-colors disabled:opacity-50"
        >
          Sign in with Google
        </button>
        <button 
          onClick={() => onLoginSuccess({ id: '00000000-0000-0000-0000-000000000000', full_name: '데모 관리자', email: 'demo@company.com', avatar_url: 'https://picsum.photos/seed/m/80/80' }, 'demo-token')}
          className="w-full mt-4 py-2 text-slate-400 text-[10px] hover:underline"
        >
          데모 계정으로 로그인
        </button>
      </div>
    </div>
  );
};

export default Login;
