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
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-700 flex flex-col selection:bg-indigo-500/20 selection:text-indigo-600">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 px-6 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand & Page Info */}
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
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-semibold text-slate-800">{title}</h1>
                {badge && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100/80">
                    {badge}
                  </span>
                )}
              </div>
              {subtitle && <p className="text-xs text-slate-500 hidden md:block">{subtitle}</p>}
            </div>
          </div>

          {/* Right Actions */}
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

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="py-4 px-6 border-t border-slate-200/60 bg-white/40 text-center text-xs text-slate-400">
        © 2026 DATN CRM Gia Sư — Giao diện thiết kế Sneat Pro Design System
      </footer>
    </div>
  );
}
