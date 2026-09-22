import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Shield, Lock, Phone, ArrowRight, Loader, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { validatePhone, sanitizePhone, MAX_PASSWORD_LENGTH } from '../../utils/validation';
import { roleToPortal } from '../../services/sessionStore';

const PORTAL_HOME: Record<string, string> = {
  STAFF: '/admin-crm',
  PARENT: '/client',
  TUTOR: '/tutor',
};

export default function Login() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/profile-select';

  const livePhoneError = phoneTouched && phone.length > 0 ? validatePhone(phone) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const phoneError = validatePhone(phone);
    if (phoneError) {
      setError(phoneError);
      return;
    }

    setLoading(true);

    try {
      const data = await login(phone, password);
      // Luôn đưa về cổng tương ứng vai trò của tài khoản vừa đăng nhập
      const portal = roleToPortal(data?.user?.role);
      const portalPrefix = PORTAL_HOME[portal] ?? '/';
      const dest = from.startsWith(portalPrefix) ? from : portalPrefix;
      navigate(dest, { replace: true });
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 relative overflow-hidden text-white">
      {/* Glow Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-600/10 blur-[150px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-cyan-600/10 blur-[150px]" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Logo Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 mb-4">
            <Shield size={32} />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight">Đăng nhập tài khoản</h2>
          <p className="mt-2 text-sm text-slate-400">
            Hệ thống quản lý CRM & Cổng tương tác Gia sư
          </p>
        </div>

        {/* Form Box */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
          {error && (
            <div className="mb-6 p-4 bg-red-950/40 border border-red-800/40 rounded-xl text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Số điện thoại
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500">
                  <Phone size={18} />
                </span>
                <input
                  type="tel"
                  value={phone}
                  maxLength={11}
                  onChange={(e) => {
                    setPhone(sanitizePhone(e.target.value));
                  }}
                  onBlur={() => setPhoneTouched(true)}
                  placeholder="Số điện thoại"
                  className={`w-full pl-11 pr-4 py-3 bg-slate-950/60 border rounded-xl text-white placeholder-slate-600 focus:outline-none transition-all text-sm ${
                    livePhoneError
                      ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                      : 'border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                  }`}
                />
              </div>
              {livePhoneError && (
                <p className="mt-1.5 text-[11px] text-red-400 font-medium">{livePhoneError}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500">
                  <Lock size={18} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  maxLength={MAX_PASSWORD_LENGTH}
                  placeholder="Mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:bg-indigo-800 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm cursor-pointer shadow-lg shadow-indigo-600/20"
            >
              {loading ? (
                <Loader size={18} className="animate-spin" />
              ) : (
                <>
                  Tiếp tục <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-4 text-center">
            <Link
              to="/forgot-password"
              className="text-xs font-medium text-slate-400 hover:text-indigo-300 transition-colors"
            >
              Quên mật khẩu?
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-slate-400">
          Chưa có tài khoản?{' '}
          <Link
            to="/register"
            className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}