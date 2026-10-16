import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, ShieldCheck, GraduationCap, Star, Users, CheckCircle2, 
  ArrowRight, Clock, Calendar, Award, Zap, ChevronDown, 
  ChevronUp, BookOpen, HeartHandshake, Shield, Flame, 
  UserCheck, RefreshCw, BarChart3, Layers, CheckCircle, Lock
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function LandingPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  // State cho Interactive Live Mockup Tabs
  const [activeTab, setActiveTab] = useState<'PARENT' | 'TUTOR' | 'ADMIN'>('PARENT');

  // State cho Accordion FAQ
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // State đăng nhập nhanh 1-Click
  const [quickLoginLoading, setQuickLoginLoading] = useState<string | null>(null);

  const handleQuickLogin = async (phone: string, targetPath: string, roleName: string) => {
    setQuickLoginLoading(phone);
    try {
      await login(phone, '123456');
      toast.success(`Đăng nhập thành công với vai trò ${roleName}!`);
      navigate(targetPath);
    } catch (err: any) {
      toast.error(err || 'Không thể đăng nhập tài khoản demo');
    } finally {
      setQuickLoginLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f9] font-sans text-[#566a7f] flex flex-col justify-between selection:bg-[#696cff]/20 selection:text-[#696cff]">
      {/* 1. Header/Navbar */}
      <header className="bg-white/85 backdrop-blur-md sticky top-0 z-40 border-b border-gray-100/80 shadow-[0_2px_12px_rgba(67,89,113,0.06)] px-4 sm:px-8 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#696cff] to-[#8592a3] flex items-center justify-center text-white font-black text-xl shadow-[0_4px_10px_rgba(105,108,255,0.35)] group-hover:scale-105 transition-transform">
              S
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-[#32475c] group-hover:text-[#696cff] transition-colors">
                  Sneat Tutor CRM
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-[#e7e7ff] text-[#696cff] text-[10px] font-extrabold tracking-wide uppercase">
                  DATN 2026
                </span>
              </div>
              <p className="hidden sm:block text-[11px] text-[#a1acb8] font-medium">
                Hệ sinh thái Quản lý & Điều phối Gia sư 4.0
              </p>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-7 text-xs font-bold text-[#697a8d]">
            <a href="#demo-accounts" className="hover:text-[#696cff] transition-colors flex items-center gap-1.5 py-1">
              <Zap size={14} className="text-[#ffab00]" />
              <span>Dùng Thử 1-Click</span>
            </a>
            <a href="#portals-preview" className="hover:text-[#696cff] transition-colors py-1">3 Cổng Nghiệp Vụ</a>
            <a href="#core-features" className="hover:text-[#696cff] transition-colors py-1">Tính Năng Đột Phá</a>
            <a href="#workflow" className="hover:text-[#696cff] transition-colors py-1">Quy Trình 4 Bước</a>
            <a href="#tutors" className="hover:text-[#696cff] transition-colors py-1">Gia Sư Tiêu Biểu</a>
            <a href="#faq" className="hover:text-[#696cff] transition-colors py-1">Hỏi Đáp</a>
          </nav>

          <div className="flex items-center gap-2.5">
            {user ? (
              <Link
                to="/portals"
                className="px-4 py-2 bg-gradient-to-r from-[#696cff] to-[#5f61e6] hover:from-[#5f61e6] hover:to-[#5557cf] text-white text-xs font-bold rounded-lg shadow-[0_4px_10px_rgba(105,108,255,0.35)] transition-all flex items-center gap-1.5 active:scale-95"
              >
                <span>Vào Hệ Thống</span>
                <ArrowRight size={14} />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 border border-gray-200 hover:border-[#696cff] hover:text-[#696cff] text-[#566a7f] text-xs font-bold rounded-lg bg-white shadow-sm transition-all active:scale-95"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-gradient-to-r from-[#696cff] to-[#5f61e6] hover:from-[#5f61e6] hover:to-[#5557cf] text-white text-xs font-bold rounded-lg shadow-[0_4px_10px_rgba(105,108,255,0.35)] transition-all active:scale-95"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. Top Banner: 1-Click Quick Demo Access Bar */}
      <section id="demo-accounts" className="bg-gradient-to-r from-[#e7e7ff] via-[#fff2d6] to-[#e8fadf] border-b border-indigo-100/60 py-3 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[#566a7f] font-semibold text-center md:text-left">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#696cff] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#696cff]"></span>
            </span>
            <span className="font-extrabold text-[#696cff] uppercase tracking-wider text-[11px]">Trải nghiệm nhanh (1-Click Login):</span>
            <span className="hidden sm:inline text-[#697a8d]">Chọn tài khoản mẫu để vào thẳng cổng tương ứng:</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => handleQuickLogin('0912345678', '/client', 'Phụ Huynh')}
              disabled={!!quickLoginLoading}
              className="px-3 py-1.5 bg-white hover:bg-[#696cff] hover:text-white text-[#566a7f] font-bold rounded-md shadow-xs border border-gray-200 transition-all flex items-center gap-1.5 group cursor-pointer"
            >
              <Users size={13} className="text-[#696cff] group-hover:text-white" />
              <span>Phụ Huynh (0912345678)</span>
              {quickLoginLoading === '0912345678' && <RefreshCw size={12} className="animate-spin" />}
            </button>

            <button
              onClick={() => handleQuickLogin('0868893137', '/tutor', 'Gia Sư')}
              disabled={!!quickLoginLoading}
              className="px-3 py-1.5 bg-white hover:bg-[#ffab00] hover:text-white text-[#566a7f] font-bold rounded-md shadow-xs border border-gray-200 transition-all flex items-center gap-1.5 group cursor-pointer"
            >
              <GraduationCap size={13} className="text-[#ffab00] group-hover:text-white" />
              <span>Gia Sư (0868893137)</span>
              {quickLoginLoading === '0868893137' && <RefreshCw size={12} className="animate-spin" />}
            </button>

            <button
              onClick={() => handleQuickLogin('0901234567', '/admin-crm', 'Admin CRM')}
              disabled={!!quickLoginLoading}
              className="px-3 py-1.5 bg-white hover:bg-[#71dd37] hover:text-white text-[#566a7f] font-bold rounded-md shadow-xs border border-gray-200 transition-all flex items-center gap-1.5 group cursor-pointer"
            >
              <ShieldCheck size={13} className="text-[#71dd37] group-hover:text-white" />
              <span>Admin / Học Vụ (0901234567)</span>
              {quickLoginLoading === '0901234567' && <RefreshCw size={12} className="animate-spin" />}
            </button>
          </div>
        </div>
      </section>

      {/* 3. Hero Section with Modern Aesthetics */}
      <section className="relative overflow-hidden pt-12 pb-20 px-4 sm:px-8">
        {/* Decorative background glows */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-[#696cff]/20 via-[#03c3ec]/15 to-[#71dd37]/15 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto flex flex-col items-center text-center space-y-6">
          {/* Badge Tagline */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-[#696cff]/20 text-[#696cff] text-xs font-black shadow-sm tracking-wide">
            <Sparkles size={14} className="text-[#696cff] animate-pulse" />
            <span>NỀN TẢNG KẾT NỐI GIA SƯ THẾ HỆ MỚI • CÔNG NGHỆ CRM 4.0</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight max-w-4xl text-[#32475c] leading-[1.2]">
            Ghép Lớp Thông Minh,{' '}
            <span className="bg-gradient-to-r from-[#696cff] via-[#5457ff] to-[#03c3ec] bg-clip-text text-transparent">
              Bảo Hành 30 Ngày
            </span>{' '}
            & Minh Bạch Dòng Tiền
          </h1>

          {/* Subheading */}
          <p className="text-sm sm:text-base text-[#697a8d] max-w-2xl mx-auto leading-relaxed">
            Hệ sinh thái khép kín kết nối <strong>Phụ huynh</strong>, <strong>Gia sư</strong> và <strong>Trung tâm Điều phối CRM</strong>. 
            Cam kết học thử 1 buổi, bảo hiểm cọc 100%, bảo lưu số buổi và giải quyết khiếu nại công bằng qua trọng tài học vụ.
          </p>

          {/* Dual Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3.5 w-full justify-center items-center pt-2">
            <Link
              to="/register"
              className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-[#696cff] to-[#5f61e6] hover:from-[#5f61e6] hover:to-[#5557cf] text-white font-extrabold rounded-xl shadow-[0_6px_20px_rgba(105,108,255,0.4)] transition-all text-sm flex items-center justify-center gap-2 group active:scale-95"
            >
              <span>Phụ Huynh: Đăng Ký Tìm Gia Sư</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/register"
              className="w-full sm:w-auto px-7 py-3.5 bg-white border border-gray-200 hover:border-[#ffab00] hover:text-[#ffab00] text-[#566a7f] font-extrabold rounded-xl shadow-xs transition-all text-sm flex items-center justify-center gap-2 active:scale-95"
            >
              <GraduationCap size={16} className="text-[#ffab00]" />
              <span>Gia Sư: Nhận Lớp Dạy Thử</span>
            </Link>
          </div>

          {/* Trust Highlights */}
          <div className="pt-4 flex flex-wrap justify-center items-center gap-y-2 gap-x-6 text-xs text-[#697a8d] font-semibold">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-[#71dd37]" />
              <span>Bảo hành đổi gia sư 30 ngày</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Flame size={16} className="text-[#ffab00]" />
              <span>Đánh giá tín nhiệm Karma</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={16} className="text-[#03c3ec]" />
              <span>Khớp lớp trung bình &lt; 15 phút</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Lock size={15} className="text-[#696cff]" />
              <span>Bảo hiểm hoàn cọc 100%</span>
            </span>
          </div>

          {/* 4. Interactive Live Preview Mockup Card */}
          <div className="w-full max-w-5xl mt-6 pt-4 text-left">
            <div className="bg-white rounded-2xl shadow-[0_12px_40px_rgba(67,89,113,0.12)] border border-gray-100 overflow-hidden">
              {/* Tab Selector Header */}
              <div className="bg-[#f8f9fc] border-b border-gray-100 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                    <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                    <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                  </div>
                  <span className="text-xs font-black text-[#566a7f] ml-2">MÔ PHỎNG GIAO DIỆN HỆ THỐNG TRỰC TIẾP:</span>
                </div>

                <div className="flex items-center bg-gray-200/70 p-1 rounded-xl gap-1 text-xs font-bold">
                  <button
                    onClick={() => setActiveTab('PARENT')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      activeTab === 'PARENT'
                        ? 'bg-white text-[#696cff] shadow-xs'
                        : 'text-[#697a8d] hover:text-[#566a7f]'
                    }`}
                  >
                    1. Cổng Phụ Huynh
                  </button>
                  <button
                    onClick={() => setActiveTab('TUTOR')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      activeTab === 'TUTOR'
                        ? 'bg-white text-[#ffab00] shadow-xs'
                        : 'text-[#697a8d] hover:text-[#566a7f]'
                    }`}
                  >
                    2. Cổng Gia Sư
                  </button>
                  <button
                    onClick={() => setActiveTab('ADMIN')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      activeTab === 'ADMIN'
                        ? 'bg-white text-[#71dd37] shadow-xs'
                        : 'text-[#697a8d] hover:text-[#566a7f]'
                    }`}
                  >
                    3. Phân Hệ Admin CRM
                  </button>
                </div>
              </div>

              {/* Tab Content Display */}
              <div className="p-6 sm:p-8 bg-gradient-to-b from-white to-[#fafbfe]">
                {activeTab === 'PARENT' && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                      <div>
                        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#696cff] bg-[#e7e7ff] px-2.5 py-1 rounded-full">
                          <CheckCircle2 size={13} />
                          <span>Học sinh: Lê Bảo Nam (Lớp 9) • Môn: Toán Nâng Cao Ôn Thi Vào 10</span>
                        </div>
                        <h3 className="text-lg font-extrabold text-[#32475c] mt-2">
                          Hồ sơ Yêu cầu Ghép Gia sư & Trải nghiệm Dạy thử
                        </h3>
                      </div>
                      <span className="px-3 py-1 bg-[#e8fadf] text-[#71dd37] text-xs font-extrabold rounded-full self-start sm:self-auto">
                        Trạng thái: MATCHED (Đã duyệt gia sư)
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-xs space-y-2">
                        <div className="text-xs text-[#a1acb8] font-bold uppercase">Gia Sư Được Đề Xuất</div>
                        <div className="font-extrabold text-sm text-[#566a7f] flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[#e7e7ff] text-[#696cff] flex items-center justify-center font-bold text-xs">
                            MV
                          </div>
                          <div>
                            <div>Mai Khánh Vy</div>
                            <div className="text-[11px] text-[#a1acb8] font-medium">ĐH Sư Phạm Hà Nội</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs pt-1">
                          <span className="px-2 py-0.5 rounded bg-[#fff2d6] text-[#ffab00] font-bold">⭐ 5.0 (42 buổi)</span>
                          <span className="px-2 py-0.5 rounded bg-[#e7e7ff] text-[#696cff] font-bold">💎 98 Karma</span>
                        </div>
                      </div>

                      <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-xs space-y-2">
                        <div className="text-xs text-[#a1acb8] font-bold uppercase">Lịch Dạy & Học Phí</div>
                        <div className="text-xs text-[#566a7f] space-y-1 font-semibold">
                          <div>📅 Ca rảnh: <strong>Tối Thứ 3 & Tối Thứ 6</strong></div>
                          <div>⏰ Giờ học: <strong>19:30 - 21:00 (1.5h/buổi)</strong></div>
                          <div>💰 Học phí: <strong className="text-[#696cff]">250,000 đ/buổi</strong></div>
                        </div>
                      </div>

                      <div className="p-4 bg-[#f8f9ff] rounded-xl border border-indigo-100/70 shadow-xs space-y-2 flex flex-col justify-between">
                        <div>
                          <div className="text-xs font-bold text-[#696cff] uppercase flex items-center gap-1">
                            <ShieldCheck size={14} /> Chính sách bảo vệ 30 ngày
                          </div>
                          <p className="text-[11px] text-[#697a8d] mt-1">
                            Hài lòng buổi dạy thử ➔ Chốt hợp đồng. Nếu không phù hợp được <strong>đổi gia sư miễn phí</strong> và bảo lưu số buổi còn lại.
                          </p>
                        </div>
                        <Link to="/client" className="text-xs font-bold text-[#696cff] hover:underline flex items-center gap-1">
                          Truy cập Cổng Phụ huynh →
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'TUTOR' && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                      <div>
                        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#ffab00] bg-[#fff2d6] px-2.5 py-1 rounded-full">
                          <Award size={13} />
                          <span>Hồ sơ: Nguyễn Hoàng Nam • Điểm Karma: 98/100 (Hạng Kim Cương)</span>
                        </div>
                        <h3 className="text-lg font-extrabold text-[#32475c] mt-2">
                          Sàn Lớp Mới & Ví Thù Lao Tự Động Minh Bạch
                        </h3>
                      </div>
                      <span className="px-3 py-1 bg-[#e7e7ff] text-[#696cff] text-xs font-extrabold rounded-full self-start sm:self-auto">
                        Số dư khả dụng: 4,250,000 đ
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-xs space-y-2">
                        <div className="text-xs text-[#a1acb8] font-bold uppercase">Lớp Mới Khớp Lịch Rảnh</div>
                        <div className="font-extrabold text-sm text-[#566a7f]">Lớp 12 - Ôn Thi THPTQG Toán</div>
                        <p className="text-xs text-[#697a8d]">Quận Cầu Giấy, Hà Nội • 2 buổi/tuần</p>
                        <div className="text-xs font-bold text-[#71dd37]">Thù lao: 350,000 đ/buổi</div>
                      </div>

                      <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-xs space-y-2">
                        <div className="text-xs text-[#a1acb8] font-bold uppercase">Bảo Hiểm Đóng Cọc Escrow</div>
                        <div className="text-xs text-[#566a7f] space-y-1 font-semibold">
                          <div>🔒 Tiền cọc: <strong>500,000 đ</strong> (Chỉ nộp khi nhận lớp)</div>
                          <div>🛡️ Cam kết: <strong>Hoàn cọc 100%</strong> nếu phụ huynh hủy lịch</div>
                          <div>⚡ Thù lao: Tự động giải ngân sau khi phụ huynh duyệt</div>
                        </div>
                      </div>

                      <div className="p-4 bg-[#fffbf2] rounded-xl border border-amber-100 shadow-xs space-y-2 flex flex-col justify-between">
                        <div>
                          <div className="text-xs font-bold text-[#ffab00] uppercase flex items-center gap-1">
                            <Flame size={14} /> Điểm Uy Tín Karma
                          </div>
                          <p className="text-[11px] text-[#697a8d] mt-1">
                            Check-in đúng giờ (+1đ), dạy tốt nhận 5 sao (+2đ). Điểm Karma cao được ưu tiên nhận các lớp học phí cao nhất.
                          </p>
                        </div>
                        <Link to="/tutor" className="text-xs font-bold text-[#ffab00] hover:underline flex items-center gap-1">
                          Truy cập Cổng Gia sư →
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'ADMIN' && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                      <div>
                        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#71dd37] bg-[#e8fadf] px-2.5 py-1 rounded-full">
                          <BarChart3 size={13} />
                          <span>Trung Tâm Điều Phối CRM • Smart Matching Engine</span>
                        </div>
                        <h3 className="text-lg font-extrabold text-[#32475c] mt-2">
                          Kanban Pipeline Điều Phối & Trọng Tài Học Vụ
                        </h3>
                      </div>
                      <span className="px-3 py-1 bg-[#fff2d6] text-[#ffab00] text-xs font-extrabold rounded-full self-start sm:self-auto">
                        Tỷ lệ so khớp: 98.5%
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-xs space-y-2">
                        <div className="text-xs text-[#a1acb8] font-bold uppercase">Smart Matching Score</div>
                        <div className="text-xs text-[#566a7f] space-y-1 font-semibold">
                          <div>🎯 Trọng số Karma: <strong>Tối đa 100đ</strong></div>
                          <div>🎓 Bằng Sư phạm / Giáo viên: <strong>+30đ</strong></div>
                          <div>⚠️ Lịch sử khiếu nại: <strong>-20đ/lần</strong></div>
                        </div>
                      </div>

                      <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-xs space-y-2">
                        <div className="text-xs text-[#a1acb8] font-bold uppercase">Xử Lý Tranh Chấp Học Vụ</div>
                        <div className="text-xs text-[#566a7f] space-y-1 font-semibold">
                          <div>⚖️ Tiếp nhận khiếu nại buổi học 24/7</div>
                          <div>🔄 Cơ chế hoàn học phí hoặc trừ Karma</div>
                          <div>⏰ Tự động duyệt thù lao sau 48h (Auto-Confirm)</div>
                        </div>
                      </div>

                      <div className="p-4 bg-[#f2fdf4] rounded-xl border border-green-100 shadow-xs space-y-2 flex flex-col justify-between">
                        <div>
                          <div className="text-xs font-bold text-[#71dd37] uppercase flex items-center gap-1">
                            <Layers size={14} /> Kanban Điều Phối
                          </div>
                          <p className="text-[11px] text-[#697a8d] mt-1">
                            Theo dõi trực quan từ phễu [Yêu cầu mới ➔ Đang tư vấn ➔ Chờ cọc ➔ Dạy thử ➔ Học chính thức].
                          </p>
                        </div>
                        <Link to="/admin-crm" className="text-xs font-bold text-[#71dd37] hover:underline flex items-center gap-1">
                          Truy cập Bàn Quản trị CRM →
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Metrics & Numbers */}
      <section className="bg-white border-y border-gray-100 py-12 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <div className="p-4 space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-[#696cff]">98.5%</div>
            <div className="text-xs text-[#566a7f] font-extrabold uppercase tracking-wider">Khớp Lớp Thành Công</div>
            <div className="text-[11px] text-[#a1acb8]">Dựa trên thuật toán Smart Matching</div>
          </div>
          <div className="p-4 space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-[#03c3ec]">5,200+</div>
            <div className="text-xs text-[#566a7f] font-extrabold uppercase tracking-wider">Gia Sư Kiểm Định</div>
            <div className="text-[11px] text-[#a1acb8]">Xác minh CCCD & bằng cấp sư phạm</div>
          </div>
          <div className="p-4 space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-[#71dd37]">20,000+</div>
            <div className="text-xs text-[#566a7f] font-extrabold uppercase tracking-wider">Buổi Học Hoàn Thành</div>
            <div className="text-[11px] text-[#a1acb8]">Được phụ huynh phê duyệt & chấm sao</div>
          </div>
          <div className="p-4 space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-[#ffab00]">&lt; 15 Phút</div>
            <div className="text-xs text-[#566a7f] font-extrabold uppercase tracking-wider">Thời Gian Ghép Lớp</div>
            <div className="text-[11px] text-[#a1acb8]">Tốc độ phản hồi và điều phối trung bình</div>
          </div>
        </div>
      </section>

      {/* 6. Core Features Section */}
      <section id="core-features" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#696cff] bg-[#e7e7ff] px-3 py-1 rounded-full">
            CÔNG NGHỆ & GIÁ TRỊ VƯỢT TRỘI
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#32475c]">
            4 Trụ Cột Đột Phá Khác Biệt So Với Trung Tâm Truyền Thống
          </h2>
          <p className="text-xs sm:text-sm text-[#697a8d]">
            Khắc phục triệt để tình trạng bùng lớp, giữ cọc trái phép, thông tin mập mờ và gia sư thiếu năng lực sư phạm.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="p-6 bg-white rounded-2xl shadow-xs border border-gray-100 hover:shadow-md hover:border-[#696cff]/40 transition-all space-y-3 group">
            <div className="w-12 h-12 rounded-xl bg-[#e7e7ff] text-[#696cff] flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <ShieldCheck size={24} />
            </div>
            <h3 className="font-extrabold text-base text-[#32475c]">Bảo Hành 30 Ngày Đổi Gia Sư</h3>
            <p className="text-xs text-[#697a8d] leading-relaxed">
              Nếu trong 30 ngày đầu học sinh không tiến bộ hoặc chưa hòa hợp phương pháp dạy, phụ huynh được <strong>đổi gia sư miễn phí</strong> và bảo lưu 100% số buổi còn lại.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 bg-white rounded-2xl shadow-xs border border-gray-100 hover:shadow-md hover:border-[#03c3ec]/40 transition-all space-y-3 group">
            <div className="w-12 h-12 rounded-xl bg-[#d7f5fc] text-[#03c3ec] flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <Zap size={24} />
            </div>
            <h3 className="font-extrabold text-base text-[#32475c]">Smart Matching Engine</h3>
            <p className="text-xs text-[#697a8d] leading-relaxed">
              Thuật toán tự động chấm điểm độ phù hợp (`MatchScore`) dựa trên khoảng cách địa lý, lịch rảnh trùng khớp, kinh nghiệm dạy học và học vị chuyên ngành.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 bg-white rounded-2xl shadow-xs border border-gray-100 hover:shadow-md hover:border-[#ffab00]/40 transition-all space-y-3 group">
            <div className="w-12 h-12 rounded-xl bg-[#fff2d6] text-[#ffab00] flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <Flame size={24} />
            </div>
            <h3 className="font-extrabold text-base text-[#32475c]">Điểm Tín Nhiệm Karma</h3>
            <p className="text-xs text-[#697a8d] leading-relaxed">
              Hệ thống xếp hạng uy tín gia sư. Điểm danh đúng giờ, hoàn thành lớp và nhận đánh giá 5 sao sẽ tăng Karma. Báo nghỉ muộn hoặc tranh chấp sẽ bị phạt điểm tự động.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-6 bg-white rounded-2xl shadow-xs border border-gray-100 hover:shadow-md hover:border-[#71dd37]/40 transition-all space-y-3 group">
            <div className="w-12 h-12 rounded-xl bg-[#e8fadf] text-[#71dd37] flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <HeartHandshake size={24} />
            </div>
            <h3 className="font-extrabold text-base text-[#32475c]">Trọng Tài Học Vụ & Escrow</h3>
            <p className="text-xs text-[#697a8d] leading-relaxed">
              Học phí được giữ an toàn. Chỉ giải ngân cho gia sư khi buổi học hoàn thành và phụ huynh xác nhận. Cơ chế Auto-Confirm sau 48h bảo vệ quyền lợi hai chiều.
            </p>
          </div>
        </div>
      </section>

      {/* 7. Workflow Steps */}
      <section id="workflow" className="bg-[#f0f2f8] py-20 px-4 sm:px-8 border-y border-gray-200/60">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#696cff] bg-white px-3 py-1 rounded-full shadow-xs">
              QUY TRÌNH TINH GỌN
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#32475c]">
              4 Bước Từ Đăng Tin Đến Buổi Học Chính Thức
            </h2>
            <p className="text-xs sm:text-sm text-[#697a8d]">
              Rút ngắn tối đa thời gian tìm kiếm gia sư chất lượng cao mà không tốn phí đăng ký ban đầu.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {/* Step 1 */}
            <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-xs space-y-3 relative">
              <div className="w-8 h-8 rounded-full bg-[#696cff] text-white flex items-center justify-center font-black text-sm">
                1
              </div>
              <h4 className="font-extrabold text-sm text-[#32475c]">Đăng Tin & Chọn Ca Rảnh</h4>
              <p className="text-xs text-[#697a8d] leading-relaxed">
                Phụ huynh tạo hồ sơ con, tích chọn các ô trong ma trận rảnh [Thứ 2 - CN x Sáng/Chiều/Tối] và đề xuất mức học phí.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-xs space-y-3 relative">
              <div className="w-8 h-8 rounded-full bg-[#03c3ec] text-white flex items-center justify-center font-black text-sm">
                2
              </div>
              <h4 className="font-extrabold text-sm text-[#32475c]">Smart Matching Đề Xuất</h4>
              <p className="text-xs text-[#697a8d] leading-relaxed">
                Hệ thống thẩm định các gia sư ứng tuyển, tính toán Match Score và gửi hồ sơ tiêu biểu cho phụ huynh xem xét duyệt dạy thử.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-xs space-y-3 relative">
              <div className="w-8 h-8 rounded-full bg-[#ffab00] text-white flex items-center justify-center font-black text-sm">
                3
              </div>
              <h4 className="font-extrabold text-sm text-[#32475c]">Học Thử 1 Buổi & Đánh Giá</h4>
              <p className="text-xs text-[#697a8d] leading-relaxed">
                Gia sư dạy thử 1 buổi theo lịch đã hẹn. Phụ huynh trực tiếp quan sát, chấm sao và đưa ra quyết định chốt hợp đồng.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-xs space-y-3 relative">
              <div className="w-8 h-8 rounded-full bg-[#71dd37] text-white flex items-center justify-center font-black text-sm">
                4
              </div>
              <h4 className="font-extrabold text-sm text-[#32475c]">Vào Lớp & Bảo Hành 30 Ngày</h4>
              <p className="text-xs text-[#697a8d] leading-relaxed">
                Kích hoạt thời khóa biểu chính thức. Phụ huynh được bảo hành đổi gia sư miễn phí trong 30 ngày và kiểm soát điểm danh từng buổi.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Featured Tutors Showcase */}
      <section id="tutors" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto space-y-10">
        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-3">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#696cff] bg-[#e7e7ff] px-3 py-1 rounded-full">
              ĐỘI NGŨ TINH HOA
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#32475c] mt-2">
              Gia Sư & Giáo Viên Được Kiểm Định Nổi Bật
            </h2>
          </div>
          <Link to="/register" className="text-xs font-bold text-[#696cff] hover:text-[#5f61e6] transition-colors flex items-center gap-1">
            <span>Đăng ký nhận lớp ngay</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tutor 1 */}
          <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-shadow space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#696cff] to-[#8592a3] text-white flex items-center justify-center font-bold text-base">
                HN
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-[#32475c]">Nguyễn Hoàng Nam</h4>
                <p className="text-[11px] text-[#a1acb8] font-semibold">Đại học Bách Khoa Hà Nội</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2 py-0.5 rounded bg-[#fff2d6] text-[#ffab00] font-bold">⭐ 5.0 (52 buổi)</span>
              <span className="px-2 py-0.5 rounded bg-[#e7e7ff] text-[#696cff] font-bold">💎 98 Karma</span>
            </div>
            <p className="text-xs text-[#697a8d] leading-relaxed">
              Kinh nghiệm 3 năm luyện thi vào lớp 10 và THPT Quốc gia môn Toán, Lý. Hơn 40 học sinh đạt 8.5+ trong kỳ thi vừa qua.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="px-2 py-0.5 bg-[#f5f5f9] text-[#696cff] rounded text-[11px] font-bold">Toán Cấp 2</span>
              <span className="px-2 py-0.5 bg-[#f5f5f9] text-[#696cff] rounded text-[11px] font-bold">Toán 12</span>
              <span className="px-2 py-0.5 bg-[#f5f5f9] text-[#696cff] rounded text-[11px] font-bold">Vật Lý</span>
            </div>
          </div>

          {/* Tutor 2 */}
          <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-shadow space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#03c3ec] to-[#696cff] text-white flex items-center justify-center font-bold text-base">
                KV
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-[#32475c]">Mai Khánh Vy</h4>
                <p className="text-[11px] text-[#a1acb8] font-semibold">ĐH Sư Phạm Hà Nội (Khoa Tiếng Anh)</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2 py-0.5 rounded bg-[#fff2d6] text-[#ffab00] font-bold">⭐ 4.9 (68 buổi)</span>
              <span className="px-2 py-0.5 rounded bg-[#e7e7ff] text-[#696cff] font-bold">💎 99 Karma</span>
            </div>
            <p className="text-xs text-[#697a8d] leading-relaxed">
              Chứng chỉ IELTS 8.0, nghiệp vụ sư phạm chuẩn mực. Chuyên kèm mất gốc, ngữ pháp chuyên sâu và ôn thi chứng chỉ quốc tế.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="px-2 py-0.5 bg-[#f5f5f9] text-[#03c3ec] rounded text-[11px] font-bold">Tiếng Anh Cấp 2</span>
              <span className="px-2 py-0.5 bg-[#f5f5f9] text-[#03c3ec] rounded text-[11px] font-bold">IELTS Nền Tảng</span>
            </div>
          </div>

          {/* Tutor 3 */}
          <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-shadow space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#71dd37] to-[#03c3ec] text-white flex items-center justify-center font-bold text-base">
                VT
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-[#32475c]">Lê Văn Thầy</h4>
                <p className="text-[11px] text-[#a1acb8] font-semibold">Giáo Viên Trường Chuyên (Thạc Sĩ Hóa)</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2 py-0.5 rounded bg-[#fff2d6] text-[#ffab00] font-bold">⭐ 5.0 (85 buổi)</span>
              <span className="px-2 py-0.5 rounded bg-[#e7e7ff] text-[#696cff] font-bold">💎 100 Karma</span>
            </div>
            <p className="text-xs text-[#697a8d] leading-relaxed">
              Kinh nghiệm 8 năm giảng dạy, bồi dưỡng học sinh giỏi tỉnh môn Hóa Học và ôn thi Chuyên Hóa vào lớp 10 đạt tỷ lệ đỗ trên 90%.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="px-2 py-0.5 bg-[#f5f5f9] text-[#71dd37] rounded text-[11px] font-bold">Hóa Học 9</span>
              <span className="px-2 py-0.5 bg-[#f5f5f9] text-[#71dd37] rounded text-[11px] font-bold">Chuyên Hóa 10</span>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Interactive FAQ Accordion */}
      <section id="faq" className="bg-white border-t border-gray-100 py-20 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#696cff] bg-[#e7e7ff] px-3 py-1 rounded-full">
              HỎI ĐÁP PHỔ BIẾN
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#32475c]">
              Giải Đáp Thắc Mắc Thường Gặp
            </h2>
          </div>

          <div className="space-y-3">
            {[
              {
                q: 'Chính sách "Bảo hành đổi gia sư 30 ngày" hoạt động như thế nào?',
                a: 'Trong vòng 30 ngày kể từ buổi học chính thức đầu tiên, nếu phụ huynh cảm thấy phương pháp giảng dạy chưa thực sự phù hợp với học lực của con, phụ huynh chỉ cần bấm nút "Yêu cầu đổi gia sư" trong trang Điểm danh. Hệ thống sẽ bảo lưu 100% số buổi học chưa học và chuyên viên học vụ sẽ gửi 3 hồ sơ gia sư mới thay thế hoàn toàn miễn phí.'
              },
              {
                q: 'Gia sư đóng cọc 500,000 đ có an toàn không và khi nào được hoàn?',
                a: 'Khoản cọc 500k được bảo lưu an toàn trong hệ thống Escrow của trung tâm. Khoản cọc này nhằm đảm bảo tính cam kết nhận lớp của gia sư. Khi phụ huynh duyệt nhận dạy chính thức, cọc được tính vào phí môi giới theo quy chế. Nếu lớp bị hủy vì lý do khách quan từ phía phụ huynh, gia sư được hoàn trả 100% cọc về ví.'
              },
              {
                q: 'Điểm tín nhiệm Karma của Gia sư được tính ra sao?',
                a: 'Mỗi gia sư khởi đầu với 100 điểm Karma. Hoàn thành buổi dạy đúng giờ (+1đ), nhận đánh giá 5 sao (+2đ). Nếu xin nghỉ báo trước dưới 24h (-5đ), phụ huynh khiếu nại được trọng tài chấp thuận (-10đ đến -20đ). Điểm Karma càng cao, gia sư càng được thuật toán ưu tiên ghép lớp có mức học phí cao.'
              },
              {
                q: 'Phụ huynh thanh toán học phí qua phương thức nào?',
                a: 'Phụ huynh có thể thanh toán trực tiếp qua chuyển khoản ngân hàng theo chu kỳ 8 buổi hoặc 12 buổi. Tiền học phí được trung tâm giữ an toàn và chỉ thanh toán cho gia sư sau khi từng buổi dạy được phụ huynh xác nhận thành công.'
              }
            ].map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="border border-gray-200 rounded-xl overflow-hidden transition-all">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4.5 text-left flex justify-between items-center bg-[#fafbfe] hover:bg-[#f0f2fa] transition-colors cursor-pointer"
                  >
                    <span className="font-extrabold text-sm text-[#32475c]">{faq.q}</span>
                    {isOpen ? <ChevronUp size={18} className="text-[#696cff] shrink-0" /> : <ChevronDown size={18} className="text-[#a1acb8] shrink-0" />}
                  </button>
                  {isOpen && (
                    <div className="p-4.5 bg-white text-xs text-[#697a8d] leading-relaxed border-t border-gray-100">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 10. Call to Action Banner */}
      <section className="bg-gradient-to-r from-[#696cff] to-[#4f46e5] text-white py-16 px-4 sm:px-8 text-center space-y-6">
        <div className="max-w-3xl mx-auto space-y-4">
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
            Sẵn Sàng Trải Nghiệm Hệ Sinh Thái Gia Sư 4.0?
          </h2>
          <p className="text-xs sm:text-sm text-indigo-100 max-w-xl mx-auto leading-relaxed">
            Khởi tạo yêu cầu tìm gia sư ngay hôm nay để nhận tư vấn và xếp lịch học thử 1 buổi hoàn toàn miễn phí cho con bạn.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
            <Link
              to="/register"
              className="px-8 py-3.5 bg-white text-[#696cff] hover:bg-gray-50 font-extrabold rounded-xl shadow-lg transition-all text-sm active:scale-95"
            >
              Đăng Ký Tài Khoản Mới
            </Link>
            <a
              href="#demo-accounts"
              className="px-8 py-3.5 bg-white/15 hover:bg-white/25 border border-white/30 text-white font-extrabold rounded-xl transition-all text-sm active:scale-95"
            >
              Dùng Thử 1-Click Ngay
            </a>
          </div>
        </div>
      </section>

      {/* 11. Footer */}
      <footer className="bg-white border-t border-gray-100 py-10 px-4 sm:px-8 text-xs text-[#a1acb8]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="space-y-1 text-center md:text-left">
            <div className="font-extrabold text-[#566a7f] text-sm">
              Sneat Tutor CRM • Đồ Án Tốt Nghiệp 2026
            </div>
            <div>
              Hệ thống Quản lý Quan hệ Khách hàng (CRM) và Sàn Điều phối Gia sư Chuyên nghiệp
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-6 font-bold text-[#697a8d]">
            <a href="#demo-accounts" className="hover:text-[#696cff] transition-colors">Tài khoản demo</a>
            <a href="#core-features" className="hover:text-[#696cff] transition-colors">Tính năng nghiệp vụ</a>
            <a href="#workflow" className="hover:text-[#696cff] transition-colors">Quy trình</a>
            <Link to="/login" className="hover:text-[#696cff] transition-colors">Cổng đăng nhập</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
