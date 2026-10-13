import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, token, activeProfile, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f5f9] flex items-center justify-center text-[#566a7f] font-medium">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-[#696cff] border-t-transparent rounded-full animate-spin"></div>
          <span>Đang tải thông tin xác thực...</span>
        </div>
      </div>
    );
  }

  // 1. Chưa đăng nhập -> Chuyển hướng sang Login
  if (!user || !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Đã đăng nhập nhưng chưa chọn Profile -> Yêu cầu chọn Profile trước
  if (!activeProfile && location.pathname !== '/profile-select') {
    return <Navigate to="/profile-select" replace />;
  }

  // 3. Đã chọn Profile -> Kiểm tra phân quyền truy cập
  if (activeProfile && allowedRoles) {
    // Nếu role của active profile (type) không nằm trong allowedRoles
    const currentRole = activeProfile.type;
    const isStudent = activeProfile.subType === 'STUDENT';
    const activeRoleToCheck = isStudent ? 'STUDENT' : currentRole;

    if (!allowedRoles.includes(activeRoleToCheck)) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};
