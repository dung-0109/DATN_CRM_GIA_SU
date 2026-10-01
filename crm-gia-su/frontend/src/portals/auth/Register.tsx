import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Phone, Lock, User, CheckCircle, ArrowRight, Loader, Eye, EyeOff } from 'lucide-react';
import { validatePhone, validatePassword, sanitizePhone, MAX_PASSWORD_LENGTH } from '../../utils/validation';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('PARENT');
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
      }, 2500);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f9] font-sans text-[#566a7f] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-[0_2px_14px_0_rgba(67,89,113,0.1)] border border-gray-100 p-8 space-y-6">
          {/* Brand Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#696cff] flex items-center justify-center text-white font-extrabold text-lg shadow-[0_2px_4px_0_rgba(105,108,255,0.4)]">
                S
              </div>
              <span className="text-2xl font-bold text-[#566a7f] tracking-tight">Sneat CRM</span>
            </div>
            <h2 className="text-xl font-bold text-[#566a7f]">Tạo tài khoản mới 🚀</h2>
            <p className="text-xs text-[#a1acb8]">
              Đăng ký để kết nối gia sư hoặc nhận lớp giảng dạy ngay
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-[#ffe0db] border border-[#ff3e1d]/40 rounded-lg text-xs font-semibold text-[#ff3e1d] text-center">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3.5 bg-[#e8fadf] border border-[#71dd37]/40 rounded-lg text-xs font-semibold text-[#71dd37] flex items-start gap-2">
              <CheckCircle className="shrink-0 text-[#71dd37] mt-0.5" size={16} />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#566a7f] uppercase tracking-wider mb-2">
                Họ và tên
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#a1acb8]">
                  <User size={16} />
                </span>
                <input
                  type="text"
                  required
                  placeholder="Nguyễn Văn A"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#d9dee3] rounded-lg text-[#566a7f] placeholder-[#a1acb8] focus:outline-none focus:border-[#696cff] focus:ring-2 focus:ring-[#696cff]/20 transition-all text-sm"
                />
              </div>
            </div>

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
                  required
                  placeholder="0912345678"
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
              {phoneError && (
                <p className="mt-1 text-[11px] text-[#ff3e1d] font-medium">{phoneError}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#566a7f] uppercase tracking-wider mb-2">
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
                  placeholder="············"
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

            <div>
              <label className="block text-xs font-bold text-[#566a7f] uppercase tracking-wider mb-2">
                Loại tài khoản
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('PARENT')}
                  className={`py-2.5 px-3 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                    role === 'PARENT'
                      ? 'bg-[#696cff]/10 border-[#696cff] text-[#696cff]'
                      : 'bg-white border-[#d9dee3] text-[#697a8d] hover:border-gray-400'
                  }`}
                >
                  👩 Phụ huynh
                </button>
                <button
                  type="button"
                  onClick={() => setRole('TUTOR')}
                  className={`py-2.5 px-3 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                    role === 'TUTOR'
                      ? 'bg-[#696cff]/10 border-[#696cff] text-[#696cff]'
                      : 'bg-white border-[#d9dee3] text-[#697a8d] hover:border-gray-400'
                  }`}
                >
                  👨‍🏫 Gia sư
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
                  <span>Đăng Ký Tài Khoản</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2 text-xs text-[#697a8d]">
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
  );
}