import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  Lock, Phone, ArrowRight, Loader, Eye, EyeOff, Sparkles, 
  ShieldCheck, GraduationCap, Award, HeartHandshake 
} from 'lucide-react';
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
  const { login, selectProfile } = useAuth();
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
      
      if (data?.profiles && data.profiles.length === 1) {
        // Auto select if only 1 profile
        const profile = data.profiles[0];
        await selectProfile(profile.id, profile.type);
        const portal = roleToPortal(profile.type);
        const portalPrefix = PORTAL_HOME[portal] ?? '/';
        const dest = from.startsWith(portalPrefix) ? from : portalPrefix;
        navigate(dest, { replace: true });
      } else {
        // Multiple profiles (or 0 somehow), go to profile-select
        navigate('/profile-select', { replace: true });
      }
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f9] font-sans text-[#566a7f] flex flex-col justify-center">
      <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-white rounded-2xl shadow-[0_4px_24px_0_rgba(67,89,113,0.12)] border border-gray-100 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">
          
          {/* CỘT TRÁI: Brand Showcase */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#696cff] via-[#5f61e6] to-[#4f52d9] text-white p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -top-16 -left-16 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-white/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-6">
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20">
                <Sparkles size={15} className="text-amber-300" />
                <span className="text-xs font-semibold tracking-wide text-white uppercase">Cổng Đăng Nhập Hệ Thống</span>
              </div>

              <div>
                <h1 className="text-2xl lg:text-3xl font-extrabold text-white leading-tight">
                  Chào mừng bạn quay trở lại!
                </h1>
                <p className="text-white/80 text-xs lg:text-sm mt-3 leading-relaxed">
                  Truy cập bảng điều khiển vận hành CRM, Cổng Phụ huynh hoặc Cổng Gia sư để tiếp tục công việc.
                </p>
              </div>

              <div className="space-y-3.5 pt-2">
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/10">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                    <GraduationCap size={18} className="text-white" />
                  </div>
                  <div className="text-xs text-white">
                    <span className="font-bold">Quản trị tập trung 3 Cổng:</span> Client, Tutor & Admin CRM.
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/10">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                    <ShieldCheck size={18} className="text-emerald-300" />
                  </div>
                  <div className="text-xs text-white">
                    <span className="font-bold">Bảo mật mã hóa JWT & PIN:</span> An toàn dữ liệu tuyệt đối.
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/10">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                    <Award size={18} className="text-amber-300" />
                  </div>
                  <div className="text-xs text-white">
                    <span className="font-bold">Đối soát thông minh 24/7:</span> Tự động hóa quy trình nghiệp vụ.
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-6 mt-6 border-t border-white/15 text-xs text-white/75 flex items-center justify-between">
              <span>Phiên bản Sneat 2.0</span>
              <span>© 2026 CRM Gia Sư</span>
            </div>
          </div>

          {/* CỘT PHẢI: Form Đăng Nhập */}
          <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
            <div className="max-w-md mx-auto w-full space-y-5">
              
              <div>
                <div className="inline-flex items-center gap-2 mb-1.5">
                  <div className="w-8 h-8 rounded-lg bg-[#696cff] flex items-center justify-center text-white font-extrabold text-sm shadow-[0_2px_4px_0_rgba(105,108,255,0.4)]">
                    S
                  </div>
                  <span className="text-xl font-bold text-[#566a7f] tracking-tight">Sneat CRM</span>
                </div>
                <h2 className="text-xl font-bold text-[#566a7f]">Đăng nhập tài khoản 👋</h2>
                <p className="text-xs text-[#a1acb8] mt-1">
                  Nhập số điện thoại và mật khẩu của bạn để tiếp tục
                </p>
              </div>

              {error && (
                <div className="p-3 bg-[#ffe0db] border border-[#ff3e1d]/40 rounded-xl text-xs font-semibold text-[#ff3e1d] text-center">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#566a7f] uppercase tracking-wider mb-1.5">
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
                      placeholder="VD: 0123456789"
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
                  <div className="flex justify-between items-center mb-1.5">
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
                  className="w-full py-3 mt-2 bg-[#696cff] hover:bg-[#5f61e6] active:bg-[#595cd9] disabled:opacity-50 text-white font-bold rounded-xl shadow-[0_4px_12px_0_rgba(105,108,255,0.4)] transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
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

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#a1acb8] pt-1">
                <HeartHandshake size={13} className="text-[#696cff]" />
                <span>Hệ thống đăng nhập an toàn & bảo mật</span>
              </div>

              <div className="text-center pt-2 text-xs text-[#697a8d] border-t border-gray-100">
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
      </div>
    </div>
  );
}