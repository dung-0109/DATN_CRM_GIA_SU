import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Lock, LogOut, Loader } from 'lucide-react';

export default function ProfileSelect() {
  const { profiles, selectProfile, logout } = useAuth();
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleProfileClick = async (profile: any) => {
    setError(null);
    setPin('');

    // Nếu là Phụ huynh, cần nhập mã PIN
    if (profile.type === 'PARENT' && !profile.subType) {
      setSelectedProfile(profile);
      return;
    }

    // Các profile khác (Học sinh, Gia sư, Staff) - switch trực tiếp không cần PIN
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

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 4) {
      setError('Mã PIN phải gồm 4 chữ số');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await selectProfile(selectedProfile.id, selectedProfile.type, pin);
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
        {!selectedProfile ? (
          <>
            <h1 className="text-4xl font-extrabold tracking-tight">Ai đang sử dụng hệ thống?</h1>
            <p className="mt-2 text-slate-400">Chọn profile của bạn để tiếp tục truy cập các dịch vụ</p>

            {error && (
              <div className="mt-6 max-w-md mx-auto p-4 bg-red-950/40 border border-red-800/40 rounded-xl text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Profile Grid (Netflix Style) */}
            <div className="mt-12 flex flex-wrap justify-center gap-8">
              {profiles.map((profile) => (
                <button
                  key={profile.id}
                  onClick={() => handleProfileClick(profile)}
                  className="group flex flex-col items-center gap-3 cursor-pointer focus:outline-none"
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
          </>
        ) : (
          <div className="max-w-md w-full mx-auto">
            <div className="inline-flex p-3 rounded-2xl bg-amber-600/20 border border-amber-500/30 text-amber-400 mb-4">
              <Lock size={32} />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight">Nhập mã PIN Phụ huynh</h2>
            <p className="mt-2 text-sm text-slate-400">
              Profile Phụ huynh chứa thông tin ví tiền nhạy cảm. Vui lòng nhập mã PIN bảo mật (mặc định: 1234).
            </p>

            <div className="mt-8 bg-slate-900/60 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl shadow-2xl text-left">
              {error && (
                <div className="mb-6 p-4 bg-red-950/40 border border-red-800/40 rounded-xl text-sm text-red-400">
                  {error}
                </div>
              )}

              <form onSubmit={handlePinSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Mã PIN 4 số
                  </label>
                  <input
                    type="password"
                    required
                    maxLength={4}
                    placeholder="••••"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                    className="w-full text-center tracking-[1.5em] font-mono py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-xl"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProfile(null);
                      setError(null);
                    }}
                    className="flex-1 py-3 bg-slate-950/60 border border-slate-800 hover:border-slate-700 font-semibold rounded-xl text-sm cursor-pointer transition-all text-slate-400 hover:text-white text-center"
                  >
                    Quay lại
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:bg-indigo-800 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm cursor-pointer shadow-lg shadow-indigo-600/20"
                  >
                    {loading ? (
                      <Loader size={18} className="animate-spin" />
                    ) : (
                      'Xác nhận'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
