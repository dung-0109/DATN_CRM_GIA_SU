import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Phone, CheckCircle, ArrowLeft, ArrowRight, Loader } from 'lucide-react';
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
      setError('Mật khẩu xác nhận không khớp');
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
            <h2 className="text-xl font-bold text-[#566a7f]">Quên mật khẩu? 🔒</h2>
            <p className="text-xs text-[#a1acb8]">
              Nhập số điện thoại để nhận mã xác nhận và khôi phục mật khẩu
            </p>
          </div>

          {/* Steps Indicator */}
          <div className="flex items-center justify-center gap-3">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step === 1
                  ? 'bg-[#696cff] text-white shadow-sm'
                  : 'bg-[#e8fadf] text-[#71dd37]'
              }`}
            >
              {step === 1 ? '1' : <CheckCircle size={14} />}
            </div>
            <div className={`h-1 w-12 rounded-full ${step === 2 ? 'bg-[#71dd37]' : 'bg-gray-200'}`} />
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step === 2
                  ? 'bg-[#696cff] text-white shadow-sm'
                  : 'bg-gray-100 text-[#a1acb8]'
              }`}
            >
              2
            </div>
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

          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#566a7f] uppercase tracking-wider mb-2">
                  Số điện thoại đăng ký
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
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#d9dee3] rounded-lg text-[#566a7f] placeholder-[#a1acb8] focus:outline-none focus:border-[#696cff] focus:ring-2 focus:ring-[#696cff]/20 transition-all text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#696cff] hover:bg-[#5f61e6] active:bg-[#595cd9] disabled:opacity-50 text-white font-bold rounded-lg shadow-[0_2px_4px_0_rgba(105,108,255,0.4)] transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                {loading ? <Loader size={18} className="animate-spin" /> : <><span>Gửi mã OTP</span> <ArrowRight size={16} /></>}
              </button>
            </form>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#566a7f] uppercase tracking-wider mb-2">
                  Mã OTP xác nhận (Demo: 123456)
                </label>
                <input
                  type="text"
                  required
                  placeholder="123456"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-[#d9dee3] rounded-lg text-[#566a7f] placeholder-[#a1acb8] focus:outline-none focus:border-[#696cff] focus:ring-2 focus:ring-[#696cff]/20 transition-all text-sm font-mono tracking-widest text-center text-base"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#566a7f] uppercase tracking-wider mb-2">
                  Mật khẩu mới
                </label>
                <input
                  type="password"
                  required
                  placeholder="············"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-[#d9dee3] rounded-lg text-[#566a7f] placeholder-[#a1acb8] focus:outline-none focus:border-[#696cff] focus:ring-2 focus:ring-[#696cff]/20 transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#566a7f] uppercase tracking-wider mb-2">
                  Xác nhận lại mật khẩu
                </label>
                <input
                  type="password"
                  required
                  placeholder="············"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-[#d9dee3] rounded-lg text-[#566a7f] placeholder-[#a1acb8] focus:outline-none focus:border-[#696cff] focus:ring-2 focus:ring-[#696cff]/20 transition-all text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#696cff] hover:bg-[#5f61e6] active:bg-[#595cd9] disabled:opacity-50 text-white font-bold rounded-lg shadow-[0_2px_4px_0_rgba(105,108,255,0.4)] transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                {loading ? <Loader size={18} className="animate-spin" /> : <span>Đổi mật khẩu mới</span>}
              </button>
            </form>
          )}

          <div className="text-center pt-2">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#696cff] hover:text-[#5f61e6] transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Quay lại trang đăng nhập</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}