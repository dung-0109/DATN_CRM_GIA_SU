import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, LogOut, Loader } from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 relative overflow-hidden text-white">
      {/* Glow Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-600/10 blur-[150px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-cyan-600/10 blur-[150px]" />

      <div className="w-full max-w-4xl relative z-10 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight">Ai đang sử dụng hệ thống?</h1>
        <p className="mt-2 text-slate-400">Chọn profile của bạn để tiếp tục truy cập các dịch vụ</p>

        {error && (
          <div className="mt-6 max-w-md mx-auto p-4 bg-red-950/40 border border-red-800/40 rounded-xl text-sm text-red-400">
            {error}
          </div>
        )}

        {loading && (
          <div className="mt-4 flex justify-center">
             <Loader size={24} className="animate-spin text-indigo-500" />
          </div>
        )}

        {/* Profile Grid (Netflix Style) */}
        <div className="mt-12 flex flex-wrap justify-center gap-8">
          {profiles.map((profile) => (
            <button
              key={profile.id}
              onClick={() => handleProfileClick(profile)}
              disabled={loading}
              className="group flex flex-col items-center gap-3 cursor-pointer focus:outline-none disabled:opacity-50"
            >
              <div className="w-28 h-28 rounded-2xl bg-slate-900 border-2 border-slate-800 group-hover:border-indigo-500 group-hover:bg-indigo-950/30 flex items-center justify-center text-slate-400 group-hover:text-indigo-400 transition-all duration-300 shadow-lg">
                {profile.subType === 'STUDENT' ? (
                  <span className="text-3xl font-bold">👦</span>
                ) : profile.type === 'PARENT' ? (
                  <span className="text-3xl font-bold">👩</span>
                ) : profile.type === 'TUTOR' ? (
                  <span className="text-3xl font-bold">👨‍🏫</span>
                ) : (
                  <User size={40} />
                )}
              </div>
              <span className="text-sm font-semibold text-slate-400 group-hover:text-white transition-colors">
                {profile.name}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={logout}
          className="mt-16 inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-all cursor-pointer"
        >
          <LogOut size={14} /> Đăng xuất tài khoản
        </button>
      </div>
    </div>
  );
}
