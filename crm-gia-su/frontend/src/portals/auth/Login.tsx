import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Lock, Phone, ArrowRight, Loader, Eye, EyeOff } from 'lucide-react';
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
    <div className="min-h-screen bg-[#f5f5f9] font-sans text-[#566a7f] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-[0_2px_14px_0_rgba(67,89,113,0.1)] border border-gray-100 p-8 space-y-6">
          {/* Brand Logo Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#696cff] flex items-center justify-center text-white font-extrabold text-lg shadow-[0_2px_4px_0_rgba(105,108,255,0.4)]">
                S
              </div>
              <span className="text-2xl font-bold text-[#566a7f] tracking-tight">Sneat CRM</span>
            </div>
            <h2 className="text-xl font-bold text-[#566a7f]">Chào mừng trở lại! 👋</h2>
            <p className="text-xs text-[#a1acb8]">
              Đăng nhập tài khoản để điều hành và truy cập hệ thống
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-[#ffe0db] border border-[#ff3e1d]/40 rounded-lg text-xs font-semibold text-[#ff3e1d] text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#566a7f] uppercase tracking-wider mb-2">
                Số điện thoại
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#a1acb8]">
                  <Phone size={16} />
                </span>
                <input
                  type="tel"
                  value={phone}
                  maxLength={11}
                  onChange={(e) => {
                    setPhone(sanitizePhone(e.target.value));
                  }}
                  onBlur={() => setPhoneTouched(true)}
                  placeholder="0912345678"
                  className={`w-full pl-10 pr-4 py-2.5 bg-white border rounded-lg text-[#566a7f] placeholder-[#a1acb8] focus:outline-none transition-all text-sm ${
                    livePhoneError
                      ? 'border-[#ff3e1d] focus:border-[#ff3e1d] focus:ring-2 focus:ring-[#ff3e1d]/20'
                      : 'border-[#d9dee3] focus:border-[#696cff] focus:ring-2 focus:ring-[#696cff]/20'
                  }`}
                />
              </div>
              {livePhoneError && (
                <p className="mt-1 text-[11px] text-[#ff3e1d] font-medium">{livePhoneError}</p>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-[#566a7f] uppercase tracking-wider">
                  Mật khẩu
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-[#696cff] hover:text-[#5f61e6] transition-colors"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#a1acb8]">
                  <Lock size={16} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  maxLength={MAX_PASSWORD_LENGTH}
                  placeholder="············"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-2.5 bg-white border border-[#d9dee3] rounded-lg text-[#566a7f] placeholder-[#a1acb8] focus:outline-none focus:border-[#696cff] focus:ring-2 focus:ring-[#696cff]/20 transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#a1acb8] hover:text-[#566a7f] transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 mt-2 bg-[#696cff] hover:bg-[#5f61e6] active:bg-[#595cd9] disabled:opacity-50 text-white font-bold rounded-lg shadow-[0_2px_4px_0_rgba(105,108,255,0.4)] transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              {loading ? (
                <Loader size={18} className="animate-spin" />
              ) : (
                <>
                  <span>Đăng Nhập</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="text-center pt-2 text-xs text-[#697a8d]">
            Chưa có tài khoản?{' '}
            <Link
              to="/register"
              className="font-bold text-[#696cff] hover:text-[#5f61e6] transition-colors"
            >
              Đăng ký ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}