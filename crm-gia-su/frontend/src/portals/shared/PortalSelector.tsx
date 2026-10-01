import { Link } from 'react-router-dom';
import { Users, BookOpen, Wallet, LogOut, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface PortalCardProps {
  title: string;
  badge: string;
  desc: string;
  icon: any;
  to: string;
  theme: {
    iconBg: string;
    iconColor: string;
    badgeBg: string;
    badgeColor: string;
    accentColor: string;
  };
}

function PortalCard({ title, badge, desc, icon: Icon, to, theme }: PortalCardProps) {
  return (
    <Link
      to={to}
      className="group bg-white rounded-xl shadow-[0_2px_6px_0_rgba(67,89,113,0.08)] hover:shadow-[0_8px_16px_0_rgba(67,89,113,0.16)] border border-gray-100 p-6 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1"
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl ${theme.iconBg} ${theme.iconColor} flex items-center justify-center font-bold shadow-sm`}>
            <Icon size={24} />
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${theme.badgeBg} ${theme.badgeColor}`}>
            {badge}
          </span>
        </div>

        <h3 className="text-xl font-bold text-[#566a7f] group-hover:text-[#696cff] transition-colors">
          {title}
        </h3>
        <p className="mt-2.5 text-xs text-[#697a8d] leading-relaxed">
          {desc}
        </p>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-[#696cff] group-hover:translate-x-1 transition-transform">
        <span>Truy cập phân hệ</span>
        <ArrowRight size={16} />
      </div>
    </Link>
  );
}

export default function PortalSelector() {
  const { activeProfile, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#f5f5f9] font-sans text-[#566a7f] flex flex-col justify-between p-6">
      {/* Top Navbar */}
      <header className="max-w-6xl mx-auto w-full flex justify-between items-center py-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-[#696cff] flex items-center justify-center text-white font-bold shadow-[0_2px_4px_0_rgba(105,108,255,0.4)]">
            S
          </div>
          <div>
            <span className="text-lg font-bold text-[#566a7f] tracking-tight">Sneat CRM</span>
            <span className="text-xs text-[#a1acb8] block">Nền tảng Quản trị & Điều phối Gia sư</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/profile-select"
            className="text-xs font-semibold text-[#697a8d] hover:text-[#696cff] bg-white border border-gray-200 px-3 py-1.5 rounded-md shadow-sm transition-colors flex items-center gap-1.5"
          >
            <UserCheck size={14} />
            <span>Đổi Profile</span>
          </Link>
          <button
            onClick={logout}
            className="text-xs font-semibold text-[#ff3e1d] hover:bg-[#ffe0db] bg-white border border-gray-200 px-3 py-1.5 rounded-md shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Đăng xuất</span>
          </button>
        </div>
      </header>

      {/* Main Switcher Area */}
      <main className="max-w-6xl mx-auto w-full my-auto py-10 space-y-10">
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <span className="px-3 py-1 text-[11px] font-bold tracking-wider uppercase text-[#696cff] bg-[#e7e7ff] rounded-full inline-flex items-center gap-1.5">
            <ShieldCheck size={14} /> Hệ thống Đa Phân Hệ Portal
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#566a7f] tracking-tight">
            Chọn Phân Hệ Làm Việc
          </h1>
          <p className="text-sm text-[#a1acb8]">
            {activeProfile
              ? `Bạn đang đăng nhập với vai trò: ${activeProfile.name} (${activeProfile.subType || activeProfile.type})`
              : 'Vui lòng chọn cổng thông tin tương ứng với nhiệm vụ của bạn.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <PortalCard
            title="CRM Back-office"
            badge="Staff & Admin"
            desc="Dành cho Nhân viên Học vụ, Sales và Kế toán: quản trị học viên, giáo viên, đối soát ví lương và ghép lớp tự động."
            icon={Users}
            to="/admin-crm"
            theme={{
              iconBg: 'bg-[#e7e7ff]',
              iconColor: 'text-[#696cff]',
              badgeBg: 'bg-[#e7e7ff]',
              badgeColor: 'text-[#696cff]',
              accentColor: '#696cff',
            }}
          />

          <PortalCard
            title="Client Portal"
            badge="Phụ huynh & HS"
            desc="Dành cho Phụ huynh và Học sinh: tìm gia sư, quản lý con em, xác nhận điểm danh bằng PIN và báo nghỉ trực tuyến."
            icon={BookOpen}
            to="/client"
            theme={{
              iconBg: 'bg-[#d7f5fc]',
              iconColor: 'text-[#03c3ec]',
              badgeBg: 'bg-[#d7f5fc]',
              badgeColor: 'text-[#03c3ec]',
              accentColor: '#03c3ec',
            }}
          />

          <PortalCard
            title="Tutor Portal"
            badge="Gia sư / Giáo viên"
            desc="Dành cho Gia sư: cập nhật hồ sơ năng lực, đăng ký lịch rảnh, nhận lớp dạy thử, điểm danh và rút tiền ví lương."
            icon={Wallet}
            to="/tutor"
            theme={{
              iconBg: 'bg-[#fff8e1]',
              iconColor: 'text-[#ffab00]',
              badgeBg: 'bg-[#fff8e1]',
              badgeColor: 'text-[#ffab00]',
              accentColor: '#ffab00',
            }}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-[#a1acb8] py-4">
        © 2026 Sneat Education Management CRM System. All rights reserved.
      </footer>
    </div>
  );
}
