import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Phone, Lock, User, CheckCircle, ArrowRight, Loader, Eye, EyeOff,
  GraduationCap, Sparkles, ShieldCheck, Award, HeartHandshake, Check
} from 'lucide-react';
import { validatePhone, validatePassword, sanitizePhone, MAX_PASSWORD_LENGTH } from '../../utils/validation';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'PARENT' | 'TUTOR'>('PARENT');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const phoneError = phoneTouched && phone.length > 0 ? validatePhone(phone) : null;
  const passwordError = passwordTouched && password.length > 0 ? validatePassword(password) : null;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPhoneTouched(true);
    setPasswordTouched(true);

    const pErr = validatePhone(phone);
    if (pErr) {
      setError(pErr);
      return;
    }
    const passErr = validatePassword(password);
    if (passErr) {
      setError(passErr);
      return;
    }

    setLoading(true);

    try {
      const res = await register({ phone, password, fullName, role });
      setSuccess(res.message);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f9] font-sans text-[#566a7f] flex flex-col justify-center">
      <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-white rounded-2xl shadow-[0_4px_24px_0_rgba(67,89,113,0.12)] border border-gray-100 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
          
          {/* CỘT TRÁI: Brand Showcase & Value Proposition */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#696cff] via-[#5f61e6] to-[#4f52d9] text-white p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden">
            {/* Background blur effects */}
            <div className="absolute -top-16 -left-16 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-white/15 rounded-full blur-3xl pointer-events-none" />

            {/* Top Brand Header */}
            <div className="relative z-10 space-y-6">
              <div className="inline-flex items-center gap-2.5 bg-white/15 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20">
                <Sparkles size={15} className="text-amber-300" />
                <span className="text-xs font-semibold tracking-wide text-white uppercase">Hệ Thống CRM Gia Sư Toàn Diện</span>
              </div>

              <div>
                <h1 className="text-2xl lg:text-3xl font-extrabold text-white leading-tight">
                  Khởi đầu hành trình học tập & giảng dạy vượt trội
                </h1>
                <p className="text-white/80 text-xs lg:text-sm mt-3 leading-relaxed">
                  Kết nối thông minh giữa phụ huynh tìm kiếm gia sư giỏi và giáo viên, sinh viên tài năng trên toàn quốc.
                </p>
              </div>

              {/* 3 Lợi thế nổi bật */}
              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/10">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                    <GraduationCap size={18} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-white">Khớp Lớp Nhanh Trong 2 Giờ</h2>
                    <p className="text-[11px] text-white/75 mt-0.5">
                      Thuật toán Smart Matching tự động sàng lọc gia sư chuẩn kiến thức và vị trí.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/10">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                    <ShieldCheck size={18} className="text-emerald-300" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-white">Học Thử & Bảo Hành 30 Ngày</h2>
                    <p className="text-[11px] text-white/75 mt-0.5">
                      Trải nghiệm dạy thử 1-2 buổi miễn phí, hỗ trợ đổi gia sư linh hoạt nếu không phù hợp.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/10">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                    <Award size={18} className="text-amber-300" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-white">Minh Bạch & Tín Nhiệm Karma</h2>
                    <p className="text-[11px] text-white/75 mt-0.5">
                      100% gia sư được thẩm định CCCD, hồ sơ năng lực và điểm uy tín công khai.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Stats / Trust Bar */}
            <div className="relative z-10 pt-6 mt-6 border-t border-white/15 grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-base font-extrabold text-white">5,000+</div>
                <div className="text-[10px] text-white/70">Phụ huynh</div>
              </div>
              <div className="border-x border-white/15">
                <div className="text-base font-extrabold text-white">2,500+</div>
                <div className="text-[10px] text-white/70">Gia sư uy tín</div>
              </div>
              <div>
                <div className="text-base font-extrabold text-white">98.5%</div>
                <div className="text-[10px] text-white/70">Hài lòng</div>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: Form Đăng Ký Tài Khoản */}
          <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
            <div className="max-w-md mx-auto w-full space-y-5">
              
              {/* Header Title */}
              <div>
                <div className="inline-flex items-center gap-2 mb-1.5">
                  <div className="w-8 h-8 rounded-lg bg-[#696cff] flex items-center justify-center text-white font-extrabold text-sm shadow-[0_2px_4px_0_rgba(105,108,255,0.4)]">
                    S
                  </div>
                  <span className="text-xl font-bold text-[#566a7f] tracking-tight">Sneat CRM</span>
                </div>
                <h2 className="text-xl font-bold text-[#566a7f]">Tạo tài khoản mới 👋</h2>
                <p className="text-xs text-[#a1acb8] mt-1">
                  Đăng ký miễn phí chỉ trong 30 giây để bắt đầu trải nghiệm
                </p>
              </div>

              {/* Alert Messages */}
              {error && (
                <div className="p-3 bg-[#ffe0db] border border-[#ff3e1d]/40 rounded-xl text-xs font-semibold text-[#ff3e1d] text-center">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3.5 bg-[#e8fadf] border border-[#71dd37]/40 rounded-xl text-xs font-semibold text-[#71dd37] flex items-start gap-2">
                  <CheckCircle className="shrink-0 text-[#71dd37] mt-0.5" size={16} />
                  <span>{success}</span>
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-4">
                
                {/* 1. Chọn vai trò tài khoản (Visual Card Selection) */}
                <div>
                  <label className="block text-xs font-bold text-[#566a7f] uppercase tracking-wider mb-2">
                    Bạn tham gia với vai trò gì?
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole('PARENT')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
                        role === 'PARENT'
                          ? 'bg-[#696cff]/10 border-[#696cff] ring-2 ring-[#696cff]/20'
                          : 'bg-white border-[#d9dee3] hover:border-gray-300'
                      }`}
                    >
                      {role === 'PARENT' && (
                        <div className="absolute top-2 right-2 w-4 h-4 bg-[#696cff] text-white rounded-full flex items-center justify-center">
                          <Check size={11} strokeWidth={3} />
                        </div>
                      )}
                      <div className="text-lg mb-1">👩</div>
                      <div className="text-xs font-bold text-[#566a7f]">Phụ huynh</div>
                      <div className="text-[10px] text-[#a1acb8] mt-0.5 leading-snug">Tìm gia sư dạy kèm cho con</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole('TUTOR')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
                        role === 'TUTOR'
                          ? 'bg-[#696cff]/10 border-[#696cff] ring-2 ring-[#696cff]/20'
                          : 'bg-white border-[#d9dee3] hover:border-gray-300'
                      }`}
                    >
                      {role === 'TUTOR' && (
                        <div className="absolute top-2 right-2 w-4 h-4 bg-[#696cff] text-white rounded-full flex items-center justify-center">
                          <Check size={11} strokeWidth={3} />
                        </div>
                      )}
                      <div className="text-lg mb-1">👨‍🏫</div>
                      <div className="text-xs font-bold text-[#566a7f]">Gia sư</div>
                      <div className="text-[10px] text-[#a1acb8] mt-0.5 leading-snug">Nhận lớp giảng dạy & thu nhập</div>
                    </button>
                  </div>
                </div>

                {/* 2. Họ và tên */}
                <div>
                  <label className="block text-xs font-bold text-[#566a7f] uppercase tracking-wider mb-1.5">
                    Họ và tên
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#a1acb8]">
                      <User size={16} />
                    </span>
                    <input
                      type="text"
                      required
                      placeholder={role === 'PARENT' ? 'VD: Nguyễn Thị Mai' : 'VD: Trần Minh Quân'}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#d9dee3] rounded-lg text-[#566a7f] placeholder-[#a1acb8] focus:outline-none focus:border-[#696cff] focus:ring-2 focus:ring-[#696cff]/20 transition-all text-sm"
                    />
                  </div>
                </div>

                {/* 3. Số điện thoại */}
                <div>
                  <label className="block text-xs font-bold text-[#566a7f] uppercase tracking-wider mb-1.5">
                    Số điện thoại đăng nhập
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#a1acb8]">
                      <Phone size={16} />
                    </span>
                    <input
                      type="tel"
                      required
                      placeholder="0912345678 (10 chữ số)"
                      value={phone}
                      onChange={(e) => setPhone(sanitizePhone(e.target.value))}
                      onBlur={() => setPhoneTouched(true)}
                      className={`w-full pl-10 pr-4 py-2.5 bg-white border rounded-lg text-[#566a7f] placeholder-[#a1acb8] focus:outline-none transition-all text-sm ${
                        phoneError
                          ? 'border-[#ff3e1d] focus:border-[#ff3e1d] focus:ring-2 focus:ring-[#ff3e1d]/20'
                          : 'border-[#d9dee3] focus:border-[#696cff] focus:ring-2 focus:ring-[#696cff]/20'
                      }`}
                    />
                  </div>
                  {phoneError ? (
                    <p className="mt-1 text-[11px] text-[#ff3e1d] font-medium">{phoneError}</p>
                  ) : (
                    <p className="mt-1 text-[11px] text-[#a1acb8]">Sử dụng làm tên đăng nhập chính vào hệ thống</p>
                  )}
                </div>

                {/* 4. Mật khẩu */}
                <div>
                  <label className="block text-xs font-bold text-[#566a7f] uppercase tracking-wider mb-1.5">
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#a1acb8]">
                      <Lock size={16} />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      maxLength={MAX_PASSWORD_LENGTH}
                      placeholder="Từ 8 - 15 ký tự"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onBlur={() => setPasswordTouched(true)}
                      className={`w-full pl-10 pr-11 py-2.5 bg-white border rounded-lg text-[#566a7f] placeholder-[#a1acb8] focus:outline-none transition-all text-sm ${
                        passwordError
                          ? 'border-[#ff3e1d] focus:border-[#ff3e1d] focus:ring-2 focus:ring-[#ff3e1d]/20'
                          : 'border-[#d9dee3] focus:border-[#696cff] focus:ring-2 focus:ring-[#696cff]/20'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#a1acb8] hover:text-[#566a7f] transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {passwordError && (
                    <p className="mt-1 text-[11px] text-[#ff3e1d] font-medium">{passwordError}</p>
                  )}
                </div>

                {/* Nút Đăng ký */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 mt-2 bg-[#696cff] hover:bg-[#5f61e6] active:bg-[#595cd9] disabled:opacity-50 text-white font-bold rounded-xl shadow-[0_4px_12px_0_rgba(105,108,255,0.4)] transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
                >
                  {loading ? (
                    <Loader size={18} className="animate-spin" />
                  ) : (
                    <>
                      <span>Đăng Ký Ngay</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              {/* Cam kết an toàn */}
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#a1acb8] pt-1">
                <HeartHandshake size={13} className="text-[#696cff]" />
                <span>Cam kết bảo mật dữ liệu • Miễn phí đăng ký</span>
              </div>

              {/* Chuyển hướng Đăng nhập */}
              <div className="text-center pt-2 text-xs text-[#697a8d] border-t border-gray-100">
                Đã có tài khoản?{' '}
                <Link
                  to="/login"
                  className="font-bold text-[#696cff] hover:text-[#5f61e6] transition-colors"
                >
                  Đăng nhập ngay
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}