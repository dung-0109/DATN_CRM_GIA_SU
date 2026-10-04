import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import type {
  PortalContext,
  SessionData,
  SessionUser,
} from '../services/sessionStore';
import {
  roleToPortal,
  resolvePortal,
  loadAll,
  persistAll,
  clearSession,
  saveSession,
  getSession,
  migrateLegacySession,
} from '../services/sessionStore';

interface Profile {
  id: string;
  name: string;
  type: string;
  subType?: string;
}

interface AuthContextType {
  user: SessionUser | null;
  token: string | null;
  profiles: Profile[];
  activeProfile: Profile | null;
  currentPortal: PortalContext;
  isLoading: boolean;
  login: (phone: string, password: string) => Promise<any>;
  register: (data: any) => Promise<any>;
  verifyOtp: (phone: string, otp: string) => Promise<any>;
  selectProfile: (profileId: string, profileType: string, parentPin?: string) => Promise<any>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Toàn bộ phiên của 3 cổng, đồng bộ với localStorage
  const [sessions, setSessions] = useState<Record<PortalContext, SessionData | null>>(() => {
    migrateLegacySession();
    return loadAll();
  });
  const [pathname, setPathname] = useState<string>(() => window.location.pathname);

  // Theo dõi điều hướng để xác định cổng hiện tại (AuthProvider nằm ngoài Router)
  useEffect(() => {
    const notify = () => setPathname(window.location.pathname);
    const origPush = history.pushState.bind(history);
    const origReplace = history.replaceState.bind(history);
    history.pushState = function (...args: any[]) {
      const result = (origPush as any).apply(this, args);
      notify();
      return result;
    };
    history.replaceState = function (...args: any[]) {
      const result = (origReplace as any).apply(this, args);
      notify();
      return result;
    };
    window.addEventListener('popstate', notify);
    return () => {
      history.pushState = origPush;
      history.replaceState = origReplace;
      window.removeEventListener('popstate', notify);
    };
  }, []);

  // Ghi toàn bộ sessions xuống localStorage mỗi khi thay đổi
  useEffect(() => {
    persistAll(sessions);
  }, [sessions]);

  const portal = resolvePortal(pathname);
  const session = sessions[portal];

  const login = async (phone: string, password: string) => {
    try {
      const response = await api.post('/api/v1/auth/login', { phone, password });
      const { accessToken, user: userData, profiles: userProfiles } = response.data;

      const targetPortal = roleToPortal(userData?.role);
      saveSession(targetPortal, {
        token: accessToken,
        user: userData,
        profiles: userProfiles ?? [],
        activeProfile: null, // Yêu cầu chọn profile sau khi đăng nhập
      });
      setSessions((prev) => ({
        ...prev,
        [targetPortal]: {
          token: accessToken,
          user: userData,
          profiles: userProfiles ?? [],
          activeProfile: null,
        },
      }));

      return response.data;
    } catch (error: any) {
      throw error.response?.data?.message || 'Đăng nhập thất bại';
    }
  };

  const register = async (data: any) => {
    try {
      const response = await api.post('/api/v1/auth/register', data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data?.message || 'Đăng ký thất bại';
    }
  };

  const verifyOtp = async (phone: string, otp: string) => {
    try {
      const response = await api.post('/api/v1/auth/verify-otp', { phone, otp });
      return response.data;
    } catch (error: any) {
      throw error.response?.data?.message || 'Xác thực OTP thất bại';
    }
  };

  const selectProfile = async (profileId: string, profileType: string, parentPin?: string) => {
    try {
      const response = await api.post('/api/v1/auth/profile-switch', {
        profileId,
        profileType,
        parentPin,
      });

      const { accessToken, profile } = response.data;
      
      // Determine which portal this profile belongs to
      const targetPortal = roleToPortal(profileType);

      // Get the freshest session data from localStorage
      const latestSession = getSession(targetPortal);

      // Cập nhật phiên của CỔNG đích với token mới theo quyền profile
      const newSessionData = {
        ...(latestSession ?? ({ user: null, profiles: [] } as any)),
        token: accessToken,
        activeProfile: profile,
      };
      saveSession(targetPortal, newSessionData);
      
      setSessions((prev) => ({
        ...prev,
        [targetPortal]: newSessionData,
      }));

      return response.data;
    } catch (error: any) {
      throw error.response?.data?.message || 'Chuyển đổi profile thất bại';
    }
  };

  // Đăng xuất CHỈ xóa phiên của cổng hiện tại, các cổng khác giữ nguyên
  const logout = () => {
    clearSession(portal);
    setSessions((prev) => ({ ...prev, [portal]: null }));
  };

  return (
    <AuthContext.Provider
      value={{
        user: session?.user ?? null,
        token: session?.token ?? null,
        profiles: session?.profiles ?? [],
        activeProfile: session?.activeProfile ?? null,
        currentPortal: portal,
        isLoading: false,
        login,
        register,
        verifyOtp,
        selectProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth phải được dùng bên trong AuthProvider');
  }
  return context;
};
