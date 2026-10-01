import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Wallet, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#f5f5f9] font-sans text-[#566a7f] flex flex-col justify-between selection:bg-[#696cff]/20 selection:text-[#696cff]">
      {/* Header/Navbar */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-gray-100 shadow-[0_2px_6px_0_rgba(67,89,113,0.06)] px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#696cff] flex items-center justify-center text-white font-black text-lg shadow-[0_2px_4px_0_rgba(105,108,255,0.4)]">
              S
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-[#566a7f]">
                Sneat Tutor CRM
              </span>
              <span className="hidden sm:inline-block text-[10px] text-[#a1acb8] ml-2 font-semibold uppercase tracking-wider">
                Nền tảng Gia sư 4.0
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#697a8d]">
            <a href="#benefits" className="hover:text-[#696cff] transition-colors">Lợi ích</a>
            <a href="#how-it-works" className="hover:text-[#696cff] transition-colors">Quy trình</a>
            <a href="#tutors" className="hover:text-[#696cff] transition-colors">Gia sư nổi bật</a>
            <a href="#stats" className="hover:text-[#696cff] transition-colors">Thống kê</a>
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <Link
                to="/portals"
                className="px-4 py-2 bg-[#696cff] hover:bg-[#5f61e6] text-white text-xs font-bold rounded-lg shadow-[0_2px_4px_0_rgba(105,108,255,0.4)] transition-all flex items-center gap-1.5"
              >
                <span>Vào Hệ Thống</span>
                <ArrowRight size={14} />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 border border-gray-200 hover:border-[#696cff] hover:text-[#696cff] text-[#697a8d] text-xs font-bold rounded-lg bg-white shadow-sm transition-all"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-[#696cff] hover:bg-[#5f61e6] text-white text-xs font-bold rounded-lg shadow-[0_2px_4px_0_rgba(105,108,255,0.4)] transition-all"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto w-full px-6 pt-16 pb-20 text-center space-y-6 flex-1 flex flex-col justify-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#e7e7ff] text-[#696cff] text-xs font-bold mx-auto shadow-sm">
          <Sparkles size={14} /> Nền tảng kết nối & điều phối Gia sư thông minh thế hệ mới
        </div>

        <h1 className="text-4xl md:text-6xl font-black tracking-tight max-w-4xl mx-auto leading-[1.15] text-[#566a7f]">
          Tìm kiếm lớp học phù hợp và{' '}
          <span className="text-[#696cff]">
            Gia sư chất lượng cao
          </span>
        </h1>

        <p className="text-sm md:text-base text-[#697a8d] max-w-2xl mx-auto leading-relaxed">
          Tối ưu hóa quy trình ghép lớp học bằng công nghệ CRM hiện đại. Quản lý lịch dạy, đối soát ví lương, ghi điểm danh minh bạch và giải quyết khiếu nại công bằng.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <Link
            to="/register"
            className="w-full sm:w-auto px-8 py-3.5 bg-[#696cff] hover:bg-[#5f61e6] text-white font-bold rounded-xl shadow-[0_4px_12px_0_rgba(105,108,255,0.4)] transition-all text-sm flex items-center justify-center gap-2"
          >
            <span>Phụ huynh: Tìm Gia Sư</span>
            <ArrowRight size={16} />
          </Link>
          <Link
            to="/register"
            className="w-full sm:w-auto px-8 py-3.5 bg-white border border-gray-200 hover:border-[#696cff] hover:text-[#696cff] text-[#566a7f] font-bold rounded-xl shadow-sm transition-all text-sm"
          >
            Gia sư: Đăng ký nhận lớp
          </Link>
        </div>

        {/* Small Trust Badge */}
        <div className="pt-6 text-xs text-[#a1acb8] font-medium">
          Được tin dùng bởi hơn <strong className="text-[#566a7f]">15,000+ Phụ huynh</strong> và{' '}
          <strong className="text-[#696cff]">5,000+ Gia sư</strong> chuyên nghiệp toàn quốc
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="max-w-7xl mx-auto w-full px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-3xl md:text-4xl font-black text-[#696cff]">98.5%</h3>
            <p className="text-xs text-[#a1acb8] mt-2 uppercase font-bold tracking-wider">Tỷ lệ so khớp thành công</p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-3xl md:text-4xl font-black text-[#03c3ec]">5,200+</h3>
            <p className="text-xs text-[#a1acb8] mt-2 uppercase font-bold tracking-wider">Gia sư được kiểm duyệt</p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-3xl md:text-4xl font-black text-[#71dd37]">20,000+</h3>
            <p className="text-xs text-[#a1acb8] mt-2 uppercase font-bold tracking-wider">Buổi dạy hoàn thành</p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-3xl md:text-4xl font-black text-[#ffab00]">&lt; 15 Phút</h3>
            <p className="text-xs text-[#a1acb8] mt-2 uppercase font-bold tracking-wider">Thời gian khớp lớp</p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="max-w-7xl mx-auto w-full px-6 py-16 space-y-12 text-left">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#696cff] bg-[#e7e7ff] px-3 py-1 rounded-full">
            Giá trị cốt lõi
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#566a7f]">Hệ Thống Giải Quyết Những Gì?</h2>
          <p className="text-xs md:text-sm text-[#a1acb8]">
            Các trung tâm truyền thống thường quản lý thủ công và thiếu minh bạch tài chính. Sneat CRM tự động hóa toàn diện quy trình ba bên.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* For Parents */}
          <div className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#d7f5fc] text-[#03c3ec] flex items-center justify-center font-bold">
                <BookOpen size={20} />
              </div>
              <h3 className="text-lg font-bold text-[#566a7f]">Dành cho Phụ huynh & Học sinh</h3>
            </div>
            <ul className="space-y-3.5 text-xs text-[#697a8d]">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-[#71dd37] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#566a7f]">Hồ sơ Gia sư đã được kiểm duyệt:</strong> Toàn bộ CCCD, bằng cấp và lý lịch được phòng nhân sự CRM đối soát kỹ lưỡng.
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-[#71dd37] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#566a7f]">Học phí trả trước an toàn:</strong> Tiền học chỉ được giải ngân cho Gia sư khi buổi dạy hoàn thành và được bạn phê duyệt.
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-[#71dd37] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#566a7f]">Báo nghỉ & Học bù linh hoạt:</strong> Báo hoãn lịch học trực tuyến dễ dàng và đề xuất lịch học bù mà không sợ mất phí.
                </div>
              </li>
            </ul>
          </div>

          {/* For Tutors */}
          <div className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#fff8e1] text-[#ffab00] flex items-center justify-center font-bold">
                <Wallet size={20} />
              </div>
              <h3 className="text-lg font-bold text-[#566a7f]">Dành cho Gia sư & Giáo viên</h3>
            </div>
            <ul className="space-y-3.5 text-xs text-[#697a8d]">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-[#71dd37] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#566a7f]">Nhận lớp tự động theo lịch rảnh:</strong> Thuật toán tự động đề xuất các lớp học phù hợp với khung giờ rảnh bạn đăng ký.
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-[#71dd37] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#566a7f]">Ví thu nhập & Hoàn cọc tự động:</strong> Rút tiền nhanh chóng qua tài khoản ngân hàng liên kết, cọc được bảo hiểm hoàn trả minh bạch.
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-[#71dd37] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#566a7f]">Xếp hạng tín nhiệm Karma:</strong> Dạy học uy tín giúp nâng cao điểm Karma để được ưu tiên ghép các lớp có học phí cao.
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Featured Tutors Section */}
      <section id="tutors" className="max-w-7xl mx-auto w-full px-6 py-16 space-y-8 text-left">
        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#696cff]">Đội ngũ tinh hoa</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#566a7f] mt-1">Gia sư chất lượng cao nổi bật</h2>
          </div>
          <Link to="/register" className="text-xs font-bold text-[#696cff] hover:text-[#5f61e6] transition-colors">
            Xem toàn bộ gia sư →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 space-y-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#e7e7ff] text-[#696cff] flex items-center justify-center font-bold text-base">
                NA
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#566a7f]">Nguyễn Hoàng Nam</h4>
                <p className="text-[11px] text-[#a1acb8] font-semibold mt-0.5">Đại học Bách Khoa Hà Nội</p>
              </div>
            </div>
            <p className="text-xs text-[#697a8d] leading-relaxed">
              Kinh nghiệm 3 năm luyện thi THPT Quốc gia môn Toán, Lý. Hơn 50 học sinh đạt điểm 9+.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="px-2 py-0.5 bg-[#e7e7ff] text-[#696cff] rounded text-[11px] font-bold">Toán Cấp 3</span>
              <span className="px-2 py-0.5 bg-[#e7e7ff] text-[#696cff] rounded text-[11px] font-bold">Vật Lý 12</span>
            </div>
          </div>

          <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 space-y-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#d7f5fc] text-[#03c3ec] flex items-center justify-center font-bold text-base">
                MV
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#566a7f]">Mai Khánh Vy</h4>
                <p className="text-[11px] text-[#a1acb8] font-semibold mt-0.5">Đại học Sư Phạm Hà Nội (K. Anh)</p>
              </div>
            </div>
            <p className="text-xs text-[#697a8d] leading-relaxed">
              Chứng chỉ IELTS 8.0. Chuyên ôn thi chứng chỉ Cambridge (Starters, Movers, Flyers) và IELTS nền tảng.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="px-2 py-0.5 bg-[#d7f5fc] text-[#03c3ec] rounded text-[11px] font-bold">Tiếng Anh Cấp 2</span>
              <span className="px-2 py-0.5 bg-[#d7f5fc] text-[#03c3ec] rounded text-[11px] font-bold">IELTS 7.0+</span>
            </div>
          </div>

          <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 space-y-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#e8fadf] text-[#71dd37] flex items-center justify-center font-bold text-base">
                QD
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#566a7f]">Quách Minh Đức</h4>
                <p className="text-[11px] text-[#a1acb8] font-semibold mt-0.5">Giáo viên trường Chuyên</p>
              </div>
            </div>
            <p className="text-xs text-[#697a8d] leading-relaxed">
              Thạc sĩ chuyên ngành Hóa học. Ôn thi HSG tỉnh và ôn thi Chuyên Hóa vào lớp 10 chất lượng cao.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="px-2 py-0.5 bg-[#e8fadf] text-[#71dd37] rounded text-[11px] font-bold">Hóa Học 9</span>
              <span className="px-2 py-0.5 bg-[#e8fadf] text-[#71dd37] rounded text-[11px] font-bold">Hóa Học 12</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-8 px-6 text-xs text-[#a1acb8]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            © 2026 Sneat Education Management CRM System. All rights reserved.
          </div>
          <div className="flex gap-6 font-semibold text-[#697a8d]">
            <a href="#" className="hover:text-[#696cff] transition-colors">Điều khoản dịch vụ</a>
            <a href="#" className="hover:text-[#696cff] transition-colors">Chính sách bảo mật</a>
            <a href="#" className="hover:text-[#696cff] transition-colors">Liên hệ hỗ trợ</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
