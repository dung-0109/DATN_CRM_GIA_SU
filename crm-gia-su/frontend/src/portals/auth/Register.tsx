import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield, Phone, Lock, User, CheckCircle, ArrowRight, Loader, Eye, EyeOff } from 'lucide-react';
import { validatePhone, validatePassword, sanitizePhone, MAX_PASSWORD_LENGTH } from '../../utils/validation';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('PARENT'); // PARENT hoặc TUTOR
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

    const phoneError = validatePhone(phone);
    if (phoneError) {
      setError(phoneError);
      return;
    }
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);

    try {
      const res = await register({ phone, password, fullName, role });
      setSuccess(res.message);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
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
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 mb-4">
            <Shield size={32} />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight">Đăng ký tài khoản mới</h2>
          <p className="mt-2 text-sm text-slate-400">
            Hệ thống quản lý CRM & Cổng tương tác Gia sư
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
          {error && (
            <div className="mb-6 p-4 bg-red-950/40 border border-red-800/40 rounded-xl text-sm text-red-400">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-emerald-950/40 border border-emerald-800/40 rounded-xl text-sm text-emerald-400 flex items-start gap-3">
              <CheckCircle className="shrink-0 text-emerald-400 mt-0.5" size={16} />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Họ và tên
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500">
                  <User size={18} />
                </span>
                <input
                  type="text"
                  required
                  placeholder="Họ và tên"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Số điện thoại
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500">
                  <Phone size={18} />
                </span>
                <input
                  type="text"
                  required
                  placeholder="Số điện thoại"
                  value={phone}
                  onChange={(e) => setPhone(sanitizePhone(e.target.value))}
                  onBlur={() => setPhoneTouched(true)}
                  className={`w-full pl-11 pr-4 py-3 bg-slate-950/60 border rounded-xl text-white placeholder-slate-600 focus:outline-none transition-all text-sm ${
                    phoneError
                      ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                      : 'border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                  }`}
                />
                {phoneError && (
                  <p className="mt-1.5 text-[11px] text-red-400 font-medium">{phoneError}</p>
                )}
              </div>
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
                  onBlur={() => setPasswordTouched(true)}
                  className={`w-full pl-11 pr-11 py-3 bg-slate-950/60 border rounded-xl text-white placeholder-slate-600 focus:outline-none transition-all text-sm ${
                    passwordError
                      ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                      : 'border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                {passwordError && (
                  <p className="mt-1.5 text-[11px] text-red-400 font-medium">{passwordError}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Bạn đăng ký làm
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole('PARENT')}
                  className={`py-3 rounded-xl border text-sm font-semibold transition-all ${
                    role === 'PARENT'
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  Phụ huynh học sinh
                </button>
                <button
                  type="button"
                  onClick={() => setRole('TUTOR')}
                  className={`py-3 rounded-xl border text-sm font-semibold transition-all ${
                    role === 'TUTOR'
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  Gia sư dạy học
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:bg-indigo-800 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm cursor-pointer shadow-lg shadow-indigo-600/20"
            >
              {loading ? (
                <Loader size={18} className="animate-spin" />
              ) : (
                <>
                  Đăng ký ngay <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-slate-400">
          Đã có tài khoản?{' '}
          <Link
            to="/login"
            className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}