import React from 'react';
import { Link } from 'react-router-dom';
import { LogOut, User, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface PageTemplateProps {
  title: string;
  subtitle?: string;
  badge?: string;
  colorClass?: string;
  children: React.ReactNode;
}

export default function PageTemplate({ title, subtitle, badge, children }: PageTemplateProps) {
  const { activeProfile, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#f5f5f9] font-sans text-[#566a7f] flex flex-col selection:bg-[#696cff]/20 selection:text-[#696cff]">
      {/* Sneat Top Navbar */}
      <header className="bg-white border-b border-gray-100 shadow-[0_2px_6px_0_rgba(67,89,113,0.08)] sticky top-0 z-30 px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand & Page Info */}
          <div className="flex items-center gap-3">
            <Link to="/portals" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-[#696cff] flex items-center justify-center text-white font-bold shadow-[0_2px_4px_0_rgba(105,108,255,0.4)] group-hover:scale-105 transition-transform">
                S
              </div>
              <span className="text-lg font-bold text-[#566a7f] tracking-tight hidden sm:inline">
                Sneat Portal
              </span>
            </Link>
            <div className="h-5 w-[1px] bg-gray-200 mx-1 hidden sm:block" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-semibold text-[#566a7f]">{title}</h1>
                {badge && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#e7e7ff] text-[#696cff]">
                    {badge}
                  </span>
                )}
              </div>
              {subtitle && <p className="text-xs text-[#a1acb8] hidden md:block">{subtitle}</p>}
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3 sm:gap-4">


            {activeProfile && (
              <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-gray-200">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-semibold text-[#566a7f]">{activeProfile.name}</div>
                  <div className="text-[10px] text-[#a1acb8] uppercase font-bold tracking-wider">
                    {activeProfile.subType || activeProfile.type}
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#e7e7ff] text-[#696cff] flex items-center justify-center font-bold text-xs relative shadow-sm border border-white">
                  <User size={16} />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#71dd37] border-2 border-white rounded-full"></span>
                </div>
              </div>
            )}

            <button
              onClick={logout}
              className="text-[#a1acb8] hover:text-[#ff3e1d] p-1.5 rounded-md hover:bg-[#ffe0db]/40 transition-colors cursor-pointer"
              title="Đăng xuất"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8">
        {children}
      </main>

      {/* Sneat Footer */}
      <footer className="py-4 px-6 border-t border-gray-200/60 bg-white/50 text-center text-xs text-[#a1acb8]">
        © 2026 DATN CRM Gia Sư — Giao diện thiết kế Sneat Pro Design System
      </footer>
    </div>
  );
}
