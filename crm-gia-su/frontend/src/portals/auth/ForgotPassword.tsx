import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Phone, Lock, KeyRound, CheckCircle, ArrowLeft, ArrowRight, Loader } from 'lucide-react';
import api from '../../services/api';
import { validatePhone, validatePassword, sanitizePhone } from '../../utils/validation';

export default function ForgotPassword() {
  const [step, setStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const phoneError = validatePhone(phone);
    if (phoneError) {
      setError(phoneError);
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/v1/auth/forgot-password', { phone });
      setStep(2);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gửi OTP thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('VUI LÒNG NHẬP LẠI');
      return;
    }
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/api/v1/auth/reset-password', {
        phone,
        otp: otpCode,
        newPassword,
      });
      setSuccess(res.data.message);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đặt lại mật khẩu thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 relative overflow-hidden text-white">
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-600/10 blur-[150px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-cyan-600/10 blur-[150px]" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 mb-4">
            <KeyRound size={32} />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight">Quên mật khẩu</h2>
          <p className="mt-2 text-sm text-slate-400">Khôi phục lại mật khẩu đăng nhập của bạn</p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                step === 1 ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'
              }`}
            >
              {step === 1 ? 1 : <CheckCircle size={14} />}
            </div>
            <div className={`h-0.5 w-10 ${step === 2 ? 'bg-emerald-500' : 'bg-slate-700'}`} />
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                step === 2 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500'
              }`}
            >
              2
            </div>
          </div>

          {error && (
            <div className="mb-5 p-4 bg-red-950/40 border border-red-800/40 rounded-xl text-sm text-red-400">{error}</div>
          )}
          {success && (
            <div className="mb-5 p-4 bg-emerald-950/40 border border-emerald-800/40 rounded-xl text-sm text-emerald-400">
              {success}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Số điện thoại đã đăng ký</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500">
                    <Phone size={18} />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Số điện thoại đã đăng ký"
                    value={phone}
                    onChange={(e) => setPhone(sanitizePhone(e.target.value))}
                    className="w-full pl-11 pr-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:bg-indigo-800 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm cursor-pointer shadow-lg shadow-indigo-600/20"
              >
                {loading ? <Loader size={18} className="animate-spin" /> : <>Gửi mã OTP <ArrowRight size={16} /></>}
              </button>
            </form>
          ) : (
            <form onSubmit={handleReset} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Mã OTP (demo: 123456)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500">
                    <Lock size={18} />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Mã OTP"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Mật khẩu mới</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500">
                    <Lock size={18} />
                  </span>
                  <input
                    type="password"
                    required
                    placeholder="Mật khẩu mới"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Xác nhận mật khẩu mới</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500">
                    <Lock size={18} />
                  </span>
                  <input
                    type="password"
                    required
                    placeholder="Xác nhận mật khẩu mới"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                  />
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
                    Đặt lại mật khẩu <ArrowRight size={16} />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={loading}
                className="w-full py-2 text-xs text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <ArrowLeft size={13} /> Quay lại nhập số điện thoại
              </button>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-slate-400">
          Nhớ mật khẩu rồi?{' '}
          <Link to="/login" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
}