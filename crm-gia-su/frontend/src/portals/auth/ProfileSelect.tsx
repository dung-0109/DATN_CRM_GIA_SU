import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Loader } from 'lucide-react';

export default function ProfileSelect() {
  const { profiles, selectProfile, logout } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleProfileClick = async (profile: any) => {
    setError(null);
    setLoading(true);
    try {
      const res = await selectProfile(profile.id, profile.type);
      redirectAfterSwitch(res.profile);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const redirectAfterSwitch = (profile: any) => {
    if (['ADMIN', 'SALES', 'ACADEMIC', 'ACCOUNTANT'].includes(profile.type)) {
      navigate('/admin-crm');
    } else if (profile.type === 'PARENT' || profile.type === 'STUDENT') {
      navigate('/client');
    } else if (profile.type === 'TUTOR') {
      navigate('/tutor');
    } else {
      navigate('/');
    }
  };

  const getProfileTheme = (profile: any) => {
    if (profile.subType === 'STUDENT') {
      return {
        bg: 'bg-[#d7f5fc]',
        color: 'text-[#03c3ec]',
        border: 'hover:border-[#03c3ec]',
        role: 'Học sinh',
        icon: '👦',
      };
    }
    if (profile.type === 'PARENT') {
      return {
        bg: 'bg-[#e8fadf]',
        color: 'text-[#71dd37]',
        border: 'hover:border-[#71dd37]',
        role: 'Phụ huynh',
        icon: '👩',
      };
    }
    if (profile.type === 'TUTOR') {
      return {
        bg: 'bg-[#fff8e1]',
        color: 'text-[#ffab00]',
        border: 'hover:border-[#ffab00]',
        role: 'Gia sư',
        icon: '👨‍🏫',
      };
    }
    return {
      bg: 'bg-[#e7e7ff]',
      color: 'text-[#696cff]',
      border: 'hover:border-[#696cff]',
      role: 'Quản trị viên',
      icon: '🛡️',
    };
  };

  return (
    <div className="min-h-screen bg-[#f5f5f9] font-sans text-[#566a7f] flex flex-col justify-between p-6">
      {/* Brand Header */}
      <header className="max-w-4xl mx-auto w-full flex justify-center items-center py-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-[#696cff] flex items-center justify-center text-white font-bold text-lg shadow-[0_2px_4px_0_rgba(105,108,255,0.4)]">
            S
          </div>
          <span className="text-xl font-bold text-[#566a7f] tracking-tight">Sneat CRM</span>
        </div>
      </header>

      {/* Profile Selector Content */}
      <main className="max-w-4xl mx-auto w-full my-auto py-8 text-center space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#566a7f] tracking-tight">
            Ai đang sử dụng hệ thống?
          </h1>
          <p className="mt-2 text-sm text-[#a1acb8]">
            Chọn profile của bạn để cá nhân hóa phân quyền và tiếp tục truy cập dữ liệu
          </p>
        </div>

        {error && (
          <div className="max-w-md mx-auto p-4 bg-[#ffe0db] border border-[#ff3e1d]/40 rounded-xl text-xs font-semibold text-[#ff3e1d]">
            {error}
          </div>
        )}

        {loading && (
          <div className="flex justify-center">
            <Loader size={28} className="animate-spin text-[#696cff]" />
          </div>
        )}

        {/* Profile Grid */}
        <div className="flex flex-wrap justify-center gap-6">
          {profiles.map((profile) => {
            const theme = getProfileTheme(profile);
            return (
              <button
                key={profile.id}
                onClick={() => handleProfileClick(profile)}
                disabled={loading}
                className={`group bg-white rounded-2xl p-6 w-48 shadow-[0_2px_6px_0_rgba(67,89,113,0.08)] hover:shadow-xl border-2 border-transparent ${theme.border} transition-all duration-200 hover:-translate-y-1.5 cursor-pointer disabled:opacity-50 flex flex-col items-center`}
              >
                <div className={`w-24 h-24 rounded-2xl ${theme.bg} flex items-center justify-center text-4xl shadow-inner group-hover:scale-105 transition-transform`}>
                  {theme.icon}
                </div>
                <div className="mt-4 font-bold text-[#566a7f] text-sm group-hover:text-[#696cff] transition-colors truncate w-full text-center">
                  {profile.name}
                </div>
                <span className="mt-1 text-[11px] font-semibold text-[#a1acb8] uppercase tracking-wider">
                  {theme.role}
                </span>
              </button>
            );
          })}
        </div>

        <div>
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 hover:border-[#ff3e1d] hover:text-[#ff3e1d] text-[#697a8d] rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <LogOut size={14} />
            <span>Đăng xuất tài khoản</span>
          </button>
        </div>
      </main>

      <footer className="text-center text-xs text-[#a1acb8] py-4">
        © 2026 Sneat Education Management. Powered by Antigravity IDE.
      </footer>
    </div>
  );
}
