import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LogOut, User, LayoutDashboard, Users, BookOpen, Calendar, 
  ClipboardList, PlusCircle, ShieldCheck, Menu, X, ChevronLeft,
  ChevronRight, Wallet, Star, UserCheck, Phone, CheckCircle2,
  Sparkles, HelpCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface PageTemplateProps {
  title: string;
  subtitle?: string;
  badge?: string;
  colorClass?: string;
  children: React.ReactNode;
}

interface NavItem {
  label: string;
  path: string;
  icon: any;
  exact?: boolean;
  isHighlight?: boolean;
}

interface NavSection {
  group: string;
  items: NavItem[];
}

export default function PageTemplate({ title, subtitle, badge, children }: PageTemplateProps) {
  const { activeProfile, logout, user } = useAuth();
  const location = useLocation();

  const isClientPortal = location.pathname.startsWith('/client');
  const isTutorPortal = location.pathname.startsWith('/tutor');
  const hasSidebar = isClientPortal || isTutorPortal;

  // Sidebar collapse & mobile states
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Helper check active link
  const isActive = (path: string, exact = false) => {
    if (exact) return location.pathname === path;
    return location.pathname === path || (path !== '/client' && path !== '/tutor' && location.pathname.startsWith(path));
  };

  // 1. Phân hệ Phụ Huynh (Client Portal Navigation)
  const clientNavSections: NavSection[] = [
    {
      group: 'QUẢN LÝ HỌC TẬP',
      items: [
        { label: 'Tổng quan học tập', path: '/client', icon: LayoutDashboard, exact: true },
        { label: 'Hồ sơ các con', path: '/client/children', icon: Users },
        { label: 'Điểm danh & Buổi học', path: '/client/attendance', icon: UserCheck },
        { label: 'Báo nghỉ & Học bù', path: '/client/leaves', icon: Calendar },
      ],
    },
    {
      group: 'DỊCH VỤ GIA SƯ',
      items: [
        { label: 'Yêu cầu tìm gia sư', path: '/client/requests', icon: ClipboardList },
        { label: 'Đăng ký tìm gia sư', path: '/client/request-tutor', icon: PlusCircle, isHighlight: true },
      ],
    },
  ];

  // 2. Phân hệ Gia Sư (Tutor Portal Navigation)
  const tutorNavSections: NavSection[] = [
    {
      group: 'LỚP HỌC & GIẢNG DẠY',
      items: [
        { label: 'Tổng quan giảng dạy', path: '/tutor', icon: LayoutDashboard, exact: true },
        { label: 'Sàn lớp mới', path: '/tutor/jobs', icon: BookOpen },
        { label: 'Điểm danh buổi dạy', path: '/tutor/attendance', icon: UserCheck },
        { label: 'Báo nghỉ & Dạy bù', path: '/tutor/leaves', icon: Calendar },
      ],
    },
    {
      group: 'TÀI CHÍNH & UY TÍN',
      items: [
        { label: 'Ví & Rút tiền', path: '/tutor/transactions', icon: Wallet },
        { label: 'Đánh giá & Điểm Karma', path: '/tutor/reviews', icon: Star },
      ],
    },
  ];

  const navSections = isClientPortal ? clientNavSections : tutorNavSections;

  // Fallback layout nếu không ở Client/Tutor portal (như trang /portals)
  if (!hasSidebar) {
    return (
      <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-700 flex flex-col selection:bg-indigo-500/20 selection:text-indigo-600">
        <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 px-6 py-3.5 shadow-xs">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/portals" className="flex items-center gap-2.5 group">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-xs group-hover:bg-indigo-700 transition-colors">
                  S
                </div>
                <span className="text-base font-bold text-slate-800 tracking-tight hidden sm:inline">
                  Sneat Portal
                </span>
              </Link>
              <div className="h-5 w-[1px] bg-slate-200 mx-1 hidden sm:block" />
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-semibold text-slate-800 leading-tight">{title}</h1>
                  {badge && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100/80 leading-normal">
                      {badge}
                    </span>
                  )}
                </div>
                {subtitle && <p className="text-xs text-slate-500 hidden md:block mt-0.5 leading-normal">{subtitle}</p>}
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              {activeProfile && (
                <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-slate-200">
                  <div className="text-right hidden sm:block">
                    <div className="text-xs font-semibold text-slate-800">{activeProfile.name}</div>
                    <div className="text-[10px] text-slate-400 uppercase font-medium tracking-wider">
                      {activeProfile.subType || activeProfile.type}
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-semibold text-xs relative border border-indigo-100">
                    <User size={15} />
                    <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 border border-white rounded-full"></span>
                  </div>
                </div>
              )}

              <button
                onClick={logout}
                className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                title="Đăng xuất"
              >
                <LogOut size={17} />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8">
          {children}
        </main>

        <footer className="py-4 px-6 border-t border-slate-200/60 bg-white/40 text-center text-xs text-slate-400">
          © 2026 DATN CRM Gia Sư — Giao diện thiết kế Sneat Pro Design System
        </footer>
      </div>
    );
  }

  // --- APP SHELL SIDEBAR LAYOUT (Định Hướng 1) ---
  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans text-slate-700 overflow-hidden selection:bg-indigo-500/20 selection:text-indigo-600">
      
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* 1. Fixed App Shell Sidebar */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-200/80 flex flex-col transition-all duration-200 ease-in-out
          lg:static lg:z-20
          ${mobileOpen ? 'translate-x-0 w-64 shadow-xl' : '-translate-x-full lg:translate-x-0'}
          ${collapsed ? 'lg:w-20' : 'lg:w-64'}
        `}
      >
        {/* Brand & Logo Header */}
        <div className="h-16 flex items-center justify-between px-4 sm:px-5 border-b border-slate-100 shrink-0">
          <Link to={isClientPortal ? '/client' : '/tutor'} className="flex items-center gap-3 overflow-hidden group">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-xs group-hover:bg-indigo-700 transition-colors shrink-0">
              S
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-base font-bold text-slate-800 tracking-tight leading-none">
                  Sneat Tutor
                </span>
                <span className="text-[10px] text-indigo-600 font-semibold tracking-wider uppercase mt-1">
                  {isClientPortal ? 'Cổng Phụ Huynh' : 'Cổng Gia Sư'}
                </span>
              </div>
            )}
          </Link>

          {/* Mobile close button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Identity Pill in Sidebar (Hidden when collapsed) */}
        {!collapsed && (
          <div className="p-3.5 mx-3 mt-3 bg-slate-50 border border-slate-200/70 rounded-xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">
              {activeProfile?.name ? activeProfile.name.slice(0, 2).toUpperCase() : 'PH'}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-semibold text-slate-800 truncate">
                {activeProfile?.name || 'Tài khoản Phụ Huynh'}
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>{isClientPortal ? 'Phụ huynh học sinh' : 'Gia sư đối tác'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Menu Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {navSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              {!collapsed && (
                <div className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  {section.group}
                </div>
              )}
              {section.items.map((item, iIdx) => {
                const active = isActive(item.path, item.exact);
                const IconComponent = item.icon;

                return (
                  <Link
                    key={iIdx}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    title={collapsed ? item.label : undefined}
                    className={`
                      flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all group relative
                      ${active 
                        ? 'bg-indigo-600 text-white font-semibold shadow-2xs' 
                        : item.isHighlight
                        ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}
                      ${collapsed ? 'justify-center px-0' : ''}
                    `}
                  >
                    <IconComponent 
                      size={17} 
                      className={`shrink-0 ${active ? 'text-white' : item.isHighlight ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} 
                    />
                    {!collapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                    {active && !collapsed && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white"></span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}

          {/* 30-Day Guarantee Trust Badge */}
          {isClientPortal && !collapsed && (
            <div className="p-3 bg-emerald-50/70 border border-emerald-200/60 rounded-xl space-y-1 mt-4">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
                <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
                <span>Bảo hành 30 ngày</span>
              </div>
              <p className="text-[11px] text-emerald-700 leading-relaxed">
                Đổi gia sư miễn phí và bảo lưu 100% số buổi học còn lại nếu chưa hài lòng.
              </p>
            </div>
          )}
        </div>

        {/* Sidebar Footer Controls */}
        <div className="p-3 border-t border-slate-100 shrink-0 flex items-center justify-between gap-2">
          {/* Switch Portal button */}
          <Link
            to="/portals"
            title="Đổi phân hệ làm việc"
            className={`flex items-center gap-2 p-2 rounded-lg text-slate-500 hover:bg-slate-100 text-xs font-medium transition-colors ${collapsed ? 'w-full justify-center' : ''}`}
          >
            <User size={15} className="text-slate-400" />
            {!collapsed && <span>Đổi Cổng</span>}
          </Link>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
            title={collapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>

          {/* Logout */}
          <button
            onClick={logout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            title="Đăng xuất"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* 2. Main Content Canvas */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        
        {/* Top Header Navbar */}
        <header className="h-16 shrink-0 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between shadow-2xs z-10">
          
          {/* Left: Mobile Toggle & Page Info */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Hamburger on mobile */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              <Menu size={20} />
            </button>

            <div className="flex flex-col justify-center min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base font-semibold text-slate-800 leading-tight truncate">
                  {title}
                </h1>
                {badge && (
                  <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[11px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-100 shrink-0">
                    {badge}
                  </span>
                )}
              </div>
              {subtitle && (
                <p className="text-xs text-slate-400 hidden md:block truncate mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Right: Quick Portal Action & Profile */}
          <div className="flex items-center gap-3 shrink-0">
            {isClientPortal && (
              <Link
                to="/client/request-tutor"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium transition-colors shadow-2xs"
              >
                <PlusCircle size={14} />
                <span>Tìm Gia Sư Mới</span>
              </Link>
            )}

            <div className="h-6 w-[1px] bg-slate-200 hidden sm:block mx-0.5" />

            {/* Profile Avatar & Name */}
            <div className="flex items-center gap-2.5">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-semibold text-slate-800 truncate max-w-[140px]">
                  {activeProfile?.name || 'Tài khoản người dùng'}
                </div>
                <div className="text-[10px] text-slate-400">
                  {user?.phone || 'Chưa cập nhật SĐT'}
                </div>
              </div>

              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center font-bold text-xs relative">
                {activeProfile?.name ? activeProfile.name.slice(0, 2).toUpperCase() : 'U'}
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 border border-white rounded-full"></span>
              </div>
            </div>
          </div>
        </header>

        {/* 3. Scrollable Work Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="py-2.5 px-6 border-t border-slate-200/60 bg-white/60 text-center text-[11px] text-slate-400 shrink-0">
          © 2026 DATN CRM Gia Sư — Sneat Pro Design System • Cổng Quản Trị Học Tập Gia Đình
        </footer>
      </div>

    </div>
  );
}
