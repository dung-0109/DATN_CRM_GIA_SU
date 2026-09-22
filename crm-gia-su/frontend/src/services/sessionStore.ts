// Quản lý phiên đăng nhập ĐỘC LẬP cho từng cổng (portal):
//   STAFF  -> /admin-crm (Admin, Sales, Học vụ, Kế toán)
//   PARENT -> /client
//   TUTOR  -> /tutor
// Mỗi cổng giữ token/user/profile riêng nên có thể đăng nhập đồng thời nhiều vai trò.

export type PortalContext = 'STAFF' | 'PARENT' | 'TUTOR';

export interface SessionUser {
  id: string;
  phone: string;
  email: string | null;
  role: string;
}

export interface SessionData {
  token: string;
  user: SessionUser;
  profiles: any[];
  activeProfile: any | null;
}

const STORE_KEY = 'portal_sessions_v1';
const HINT_KEY = 'active_portal_hint';
const LEGACY_KEYS = ['accessToken', 'user', 'profiles', 'activeProfile'];

export const roleToPortal = (role?: string): PortalContext => {
  if (role === 'PARENT') return 'PARENT';
  if (role === 'TUTOR') return 'TUTOR';
  return 'STAFF';
};

// Xác định cổng hiện tại từ đường dẫn
export const resolvePortal = (pathname: string): PortalContext => {
  if (pathname.startsWith('/client')) return 'PARENT';
  if (pathname.startsWith('/tutor')) return 'TUTOR';
  if (pathname.startsWith('/admin-crm')) return 'STAFF';
  // Trang trung tính (/ , /login, /profile-select, /portals...): dùng phiên đăng nhập gần nhất
  const hint = localStorage.getItem(HINT_KEY) as PortalContext | null;
  if (hint && getSession(hint)) return hint;
  return 'STAFF';
};

const emptyAll = (): Record<PortalContext, SessionData | null> => ({
  STAFF: null,
  PARENT: null,
  TUTOR: null,
});

export const loadAll = (): Record<PortalContext, SessionData | null> => {
  try {
    return { ...emptyAll(), ...JSON.parse(localStorage.getItem(STORE_KEY) || '{}') };
  } catch {
    return emptyAll();
  }
};

export const persistAll = (all: Record<PortalContext, SessionData | null>) => {
  localStorage.setItem(STORE_KEY, JSON.stringify(all));
};

export const getSession = (portal: PortalContext): SessionData | null =>
  loadAll()[portal] ?? null;

export const saveSession = (portal: PortalContext, data: SessionData) => {
  const all = loadAll();
  all[portal] = data;
  persistAll(all);
  localStorage.setItem(HINT_KEY, portal);
};

export const clearSession = (portal: PortalContext) => {
  const all = loadAll();
  all[portal] = null;
  persistAll(all);
};

export const updateSessionProfiles = (portal: PortalContext, profiles: any[]) => {
  const s = getSession(portal);
  if (s) saveSession(portal, { ...s, profiles });
};

// Token dùng cho request API tại đường dẫn hiện tại
export const getTokenForPath = (): string | null => {
  const session = getSession(resolvePortal(window.location.pathname));
  return session?.token ?? null;
};

// Danh sách profile của cổng hiện tại (dùng bởi các trang đọc trực tiếp localStorage cũ)
export const getProfilesForCurrentPortal = (): any[] =>
  getSession(resolvePortal(window.location.pathname))?.profiles ?? [];

export const setProfilesForCurrentPortal = (profiles: any[]) => {
  updateSessionProfiles(resolvePortal(window.location.pathname), profiles);
};

// Chuyển dữ liệu phiên kiểu cũ (key rời) sang cấu trúc mới — chạy 1 lần khi mở app
export const migrateLegacySession = () => {
  const legacyToken = localStorage.getItem('accessToken');
  const legacyUser = localStorage.getItem('user');
  if (!legacyToken || !legacyUser) return;

  try {
    const user = JSON.parse(legacyUser);
    const portal = roleToPortal(user?.role);
    if (!getSession(portal)) {
      saveSession(portal, {
        token: legacyToken,
        user,
        profiles: JSON.parse(localStorage.getItem('profiles') || '[]'),
        activeProfile: JSON.parse(localStorage.getItem('activeProfile') || 'null'),
      });
    }
  } catch {
    /* dữ liệu lỗi -> bỏ qua */
  }
  LEGACY_KEYS.forEach((k) => localStorage.removeItem(k));
};
