import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { BookOpen, Users, Wallet, LogOut, Plus, RefreshCw, TrendingUp, ShieldAlert, FileText } from 'lucide-react';
import api from './services/api';
import Login from './portals/auth/Login';
import Register from './portals/auth/Register';
import ProfileSelect from './portals/auth/ProfileSelect';
import { ProtectedRoute } from './components/ProtectedRoute';
import ForgotPassword from './portals/auth/ForgotPassword';
import { useAuth } from './context/AuthContext';
import RequestTutor from './portals/client/RequestTutor';
import MyChildren from './portals/client/MyChildren';
import TutorJobs from './portals/tutor/TutorJobs';
import SalesMatching from './portals/admin-crm/SalesMatching';
import TutorAttendance from './portals/tutor/TutorAttendance';
import ParentAttendance from './portals/client/ParentAttendance';
import AcademicDisputes from './portals/admin-crm/AcademicDisputes';
import LeavesManager from './portals/shared/LeavesManager';

function DashboardCard({ title, desc, icon: Icon, to, colorClass }: any) {
  return (
    <Link to={to} className="group relative block p-6 bg-indigo-900/40 border border-indigo-700/30 rounded-2xl hover:border-indigo-500/50 hover:bg-indigo-900/60 transition-all duration-300 backdrop-blur-md overflow-hidden">
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${colorClass} opacity-10 rounded-bl-full group-hover:scale-110 transition-transform duration-300`} />
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClass} text-white`}>
          <Icon size={24} />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white group-hover:text-indigo-200 transition-colors">{title}</h3>
          <p className="mt-2 text-sm text-slate-400 leading-relaxed">{desc}</p>
        </div>
      </div>
    </Link>
  );
}

function PortalSelector() {
  return (
    <div className="w-full min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-600/10 blur-[120px]" />

      <div className="max-w-4xl w-full text-center relative z-10">
        <span className="px-3 py-1 text-xs font-semibold text-indigo-400 bg-indigo-950/60 border border-indigo-800/50 rounded-full">
          DỰ ÁN ĐỒ ÁN MÔN HỌC
        </span>
        <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-none">
          CRM Trung Tâm Gia Sư
        </h1>
        <p className="mt-3 text-lg text-slate-400 max-w-xl mx-auto">
          Hệ thống quản lý khách hàng và Cổng tương tác trực tuyến ba bên: Phụ huynh - Gia sư - Trung tâm.
        </p>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <DashboardCard
            title="CRM Back-office"
            desc="Dành cho Nhân viên Học vụ, Sales và Kế toán quản trị lớp học, đối soát và khớp lớp tự động."
            icon={Users}
            to="/admin-crm"
            colorClass="from-indigo-600 to-indigo-400"
          />
          <DashboardCard
            title="Client Portal"
            desc="Dành cho Phụ huynh & Học sinh mua gói học phí, xác nhận buổi học bằng mã PIN và báo nghỉ."
            icon={BookOpen}
            to="/client"
            colorClass="from-cyan-500 to-teal-400"
          />
          <DashboardCard
            title="Tutor Portal"
            desc="Dành cho Gia sư đăng ký lịch rảnh, ứng tuyển lớp mới, điểm danh buổi học và quản lý thu nhập."
            icon={Wallet}
            to="/tutor"
            colorClass="from-amber-500 to-orange-400"
          />
        </div>
      </div>
    </div>
  );
}

function PageTemplate({ title, colorClass, children }: any) {
  const { activeProfile, logout } = useAuth();
  return (
    <div className="w-full min-h-screen bg-slate-950 text-white p-6 relative overflow-hidden flex flex-col">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/5 blur-[120px]" />
      
      <header className="flex justify-between items-center pb-6 border-b border-indigo-900/30 relative z-10">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${colorClass}`} />
          <h1 className="text-xl font-bold tracking-tight">{title}</h1>
        </div>
        <div className="flex items-center gap-4">
          {activeProfile && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
              Profile: {activeProfile.name}
            </span>
          )}
          <Link to="/" className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
            Cổng Portal
          </Link>
          <button onClick={logout} className="text-sm font-medium text-red-400 hover:text-red-300 transition-colors cursor-pointer inline-flex items-center gap-1">
            <LogOut size={14} /> Đăng xuất
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col relative z-10 max-w-7xl mx-auto w-full py-12">
        {children}
      </main>
    </div>
  );
}

function AdminCRM() {
  const [activeTab, setActiveTab] = useState<'overview' | 'tutors' | 'classes' | 'payouts'>('overview');
  const [triggering, setTriggering] = useState(false);
  const [tutors, setTutors] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    api.get('/api/v1/crm/stats')
      .then((res) => setStats(res.data))
      .catch((err) => console.error('Không thể tải số liệu tổng quan', err));
  }, []);

  const fetchTutors = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/v1/crm/tutors');
      setTutors(res.data);
    } catch (err) {
      console.error('Không thể tải danh sách gia sư', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/v1/crm/classes');
      setClasses(res.data);
    } catch (err) {
      console.error('Không thể tải danh sách lớp học', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'tutors' || activeTab === 'payouts') {
      fetchTutors();
    } else if (activeTab === 'classes') {
      fetchClasses();
    }
  }, [activeTab]);

  const handleStatusToggle = async (tutorId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'BANNED' : 'ACTIVE';
    try {
      await api.post(`/api/v1/crm/tutors/${tutorId}/status`, { status: newStatus });
      alert(`Đã cập nhật trạng thái gia sư thành ${newStatus === 'ACTIVE' ? 'Hoạt động' : 'Bị Khóa'}!`);
      fetchTutors();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Cập nhật trạng thái thất bại');
    }
  };

  const handlePayout = async (tutorId: string) => {
    try {
      const res = await api.post(`/api/v1/crm/tutors/${tutorId}/payout`);
      alert(res.data.message);
      fetchTutors();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Quyết toán lương thất bại');
    }
  };

  const handleTriggerAutoConfirm = async () => {
    setTriggering(true);
    try {
      const res = await api.post('/api/v1/sessions/trigger-auto-confirm');
      alert(res.data.message);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Kích hoạt quét tự động thất bại');
    } finally {
      setTriggering(false);
    }
  };

  return (
    <PageTemplate title="CRM Back-office nội bộ" colorClass="from-indigo-600 to-indigo-400">
      <div className="flex flex-col lg:flex-row gap-8 w-full items-start">
        {/* Left Sidebar Menu */}
        <aside className="w-full lg:w-64 shrink-0 space-y-4 relative z-15">
          <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3 backdrop-blur-md">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Danh mục quản lý</span>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition-all cursor-pointer w-full ${activeTab === 'overview' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-650/20' : 'text-slate-400 hover:text-white hover:bg-slate-850'}`}
              >
                <TrendingUp size={14} /> Tổng quan & Giám sát
              </button>
              
              <button
                onClick={() => setActiveTab('tutors')}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition-all cursor-pointer w-full ${activeTab === 'tutors' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-650/20' : 'text-slate-400 hover:text-white hover:bg-slate-850'}`}
              >
                <Users size={14} /> Hồ sơ Gia sư (FR-01)
              </button>

              <button
                onClick={() => setActiveTab('classes')}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition-all cursor-pointer w-full ${activeTab === 'classes' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-650/20' : 'text-slate-400 hover:text-white hover:bg-slate-850'}`}
              >
                <BookOpen size={14} /> Lớp học & Gói (FR-03)
              </button>

              <button
                onClick={() => setActiveTab('payouts')}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition-all cursor-pointer w-full ${activeTab === 'payouts' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-650/20' : 'text-slate-400 hover:text-white hover:bg-slate-850'}`}
              >
                <Wallet size={14} /> Đối soát Kế toán (FR-07)
              </button>
            </div>
          </div>

          <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3 backdrop-blur-md">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Hành động điều phối</span>
            <div className="flex flex-col gap-1">
              <Link
                to="/admin-crm/matching"
                className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-850 transition-all"
              >
                <RefreshCw size={14} /> Điều phối Khớp lớp
              </Link>
              <Link
                to="/admin-crm/disputes"
                className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-850 transition-all"
              >
                <ShieldAlert size={14} className="text-red-400" /> Giải quyết khiếu nại
              </Link>
            </div>
          </div>
        </aside>

        {/* Right Content Area */}
        <div className="flex-1 w-full space-y-6">
          {/* Dashboard Title & Quick Actions */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
            <div>
              <h2 className="text-2xl font-extrabold text-white">Bảng quản trị Học vụ & Sales</h2>
              <p className="text-slate-400 text-xs mt-1">Theo dõi tình hình kinh doanh, phê duyệt đối soát và giám sát chất lượng gia sư.</p>
            </div>
            
            <div>
              <button
                onClick={handleTriggerAutoConfirm}
                disabled={triggering}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-600/20 cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw size={12} className={triggering ? 'animate-spin' : ''} />
                {triggering ? 'Đang chạy...' : 'Kích hoạt Auto-Confirm (0h)'}
              </button>
            </div>
          </div>

          {/* Tab Contents */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-fadeIn">
              {/* 5 KPIs Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
                  <span className="text-slate-555 text-[10px] uppercase font-bold tracking-wider">Doanh thu gói học</span>
                  <h3 className="text-xl font-extrabold text-white mt-1">{stats ? `${stats.totalRevenue.toLocaleString('vi-VN')}đ` : '...'}</h3>
                  <div className={`text-[10px] mt-1 flex items-center gap-0.5 ${stats && stats.totalRevenue > 0 ? 'text-emerald-450' : 'text-slate-500'}`}>
                    <TrendingUp size={10} /> {stats && stats.totalRevenue > 0 ? 'Tổng doanh thu' : 'Chưa có giao dịch'}
                  </div>
                </div>

                <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
                  <span className="text-slate-555 text-[10px] uppercase font-bold tracking-wider">Lớp đang hoạt động</span>
                  <h3 className="text-xl font-extrabold text-white mt-1">{stats ? `${stats.activeClasses} Lớp` : '...'}</h3>
                  <div className="text-[10px] text-indigo-400 mt-1">Đang dạy (TEACHING)</div>
                </div>

                <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
                  <span className="text-slate-555 text-[10px] uppercase font-bold tracking-wider">Gia sư hoạt động</span>
                  <h3 className="text-xl font-extrabold text-white mt-1">{stats ? `${stats.activeTutors} Gia sư` : '...'}</h3>
                  <div className="text-[10px] text-slate-450 mt-1">Trạng thái: ACTIVE</div>
                </div>

                <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
                  <span className="text-slate-555 text-[10px] uppercase font-bold tracking-wider">Time-to-Match TB</span>
                  <h3 className="text-xl font-extrabold text-white mt-1">{stats && stats.timeToMatchHours !== null ? `${stats.timeToMatchHours.toLocaleString('vi-VN')} giờ` : '—'}</h3>
                  {stats && stats.timeToMatchHours !== null && stats.timeToMatchHours <= 24 && (
                    <div className="text-[10px] text-emerald-450 mt-1">🎯 Đạt KPI (&lt;24 giờ)</div>
                  )}
                </div>

                <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
                  <span className="text-slate-555 text-[10px] uppercase font-bold tracking-wider">Tỷ lệ đổi gia sư</span>
                  <h3 className="text-xl font-extrabold text-white mt-1">{stats && stats.tutorChangeRate !== null ? `${stats.tutorChangeRate}%` : '—'}</h3>
                  {stats && stats.tutorChangeRate !== null && stats.tutorChangeRate <= 5 && (
                    <div className="text-[10px] text-emerald-450 mt-1">🎯 Đạt KPI (&lt;5%)</div>
                  )}
                </div>
              </div>

              {/* Alerts & Logs Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Quality Alerts (BR-PEN-01) */}
                <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-3xl backdrop-blur-md">
                  <h3 className="text-md font-bold text-white mb-4 flex items-center gap-2 text-rose-455">
                    <ShieldAlert size={18} /> Cảnh báo giám sát chất lượng (BR-PEN-01)
                  </h3>
                  <div className="space-y-3">
                    <div className="p-3.5 bg-rose-950/20 border border-rose-900/30 rounded-2xl text-xs leading-relaxed text-rose-350">
                      ⚠️ <strong>Cảnh báo khẩn:</strong> Gia sư <strong>Lê Văn Thầy</strong> nhận đánh giá <strong>1 sao</strong> trong 2 buổi liên tiếp của lớp học toán (ID: Toán 9).
                      <div className="mt-2.5 flex gap-2">
                        <button className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold text-[10px] cursor-pointer transition-all">
                          Liên hệ Phụ huynh
                        </button>
                        <button className="px-2.5 py-1 bg-slate-950 border border-slate-800 hover:border-slate-750 text-slate-300 rounded-lg text-[10px] cursor-pointer transition-all">
                          Xem lịch sử dạy học
                        </button>
                      </div>
                    </div>

                    <div className="p-3 bg-amber-950/10 border border-amber-900/20 rounded-2xl text-[11px] leading-relaxed text-amber-300">
                      🔔 <strong>Nhắc nhở:</strong> Có 2 đơn xin dời lịch học bù đang chờ Phụ huynh phản hồi quá 24h.
                    </div>
                  </div>
                </div>

                {/* Audit Logs tracking (FR-CRM-08 / BR-PEN-03) */}
                <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-3xl backdrop-blur-md">
                  <h3 className="text-md font-bold text-white mb-4 flex items-center gap-2">
                    <FileText className="text-indigo-400" size={18} /> Nhật ký hệ thống Audit Logs (FR-CRM-08)
                  </h3>
                  <div className="space-y-3 font-mono text-[10px] text-slate-400 max-h-[160px] overflow-y-auto pr-1">
                    <div className="pb-2 border-b border-slate-850/50">
                      <span className="text-slate-550">[21:10:45]</span> <strong className="text-indigo-400">STAFF</strong> đã tạo lớp học dạy thử thành công.
                    </div>
                    <div className="pb-2 border-b border-slate-850/50">
                      <span className="text-slate-550">[21:05:12]</span> <strong className="text-cyan-400">PARENT</strong> mua gói học phí gối đầu (10 buổi) - ID gói: PKG_10B.
                    </div>
                    <div className="pb-2 border-b border-slate-850/50">
                      <span className="text-slate-550">[20:45:00]</span> <strong className="text-amber-400">TUTOR</strong> điểm danh buổi học ngày 09/08/2026 thành công.
                    </div>
                    <div className="pb-2 border-b border-slate-850/50">
                      <span className="text-slate-550">[20:44:30]</span> <strong className="text-slate-300">SYSTEM</strong> kích hoạt khóa đăng nhập PIN tạm thời 15 phút của user 0987654321.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tutors' && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-md animate-fadeIn">
              <h3 className="text-lg font-bold mb-4">Danh sách quản lý hồ sơ Gia sư</h3>
              {loading ? (
                <div className="text-center py-6 text-slate-500 text-xs">Đang tải danh sách gia sư...</div>
              ) : tutors.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs">Không có gia sư nào trong hệ thống.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left text-slate-300">
                    <thead className="bg-slate-950 text-slate-450 uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="p-3">Họ và Tên</th>
                        <th className="p-3">Học vấn / Trình độ</th>
                        <th className="p-3">Số dư Ví Lương</th>
                        <th className="p-3">Trạng thái</th>
                        <th className="p-3 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850">
                      {tutors.map((t) => (
                        <tr key={t.id} className="hover:bg-slate-950/30">
                          <td className="p-3 font-bold text-white">{t.fullName}</td>
                          <td className="p-3 text-slate-400">{t.qualification} ({t.occupation})</td>
                          <td className="p-3 text-emerald-400 font-semibold">{t.walletBalance.toLocaleString()}đ</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${t.status === 'ACTIVE' ? 'bg-emerald-950 text-emerald-400 border border-emerald-850' : 'bg-red-950 text-red-400 border border-red-850'}`}>
                              {t.status === 'ACTIVE' ? 'Hoạt động' : 'Bị Khóa'}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleStatusToggle(t.id, t.status)}
                              className={`px-3 py-1 text-[10px] font-bold rounded-lg cursor-pointer transition-all ${t.status === 'ACTIVE' ? 'bg-red-650 hover:bg-red-600 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950'}`}
                            >
                              {t.status === 'ACTIVE' ? 'Khóa' : 'Kích hoạt'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'classes' && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-md animate-fadeIn">
              <h3 className="text-lg font-bold mb-4">Danh sách quản lý Lớp học hoạt động</h3>
              {loading ? (
                <div className="text-center py-6 text-slate-500 text-xs">Đang tải danh sách lớp học...</div>
              ) : classes.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs">Không có lớp học nào.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left text-slate-300">
                    <thead className="bg-slate-950 text-slate-450 uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="p-3">Mã Lớp</th>
                        <th className="p-3">Học sinh / Phụ huynh</th>
                        <th className="p-3">Gia sư đảm nhận</th>
                        <th className="p-3">Đơn giá / Buổi</th>
                        <th className="p-3">Số buổi còn lại</th>
                        <th className="p-3">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850">
                      {classes.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-950/30">
                          <td className="p-3 font-mono text-[10px] text-slate-455">{c.id.slice(0, 8)}</td>
                          <td className="p-3">
                            <div className="font-bold text-white">{c.student?.fullName}</div>
                            <div className="text-[10px] text-slate-555">Phụ huynh: {c.parent?.fullName}</div>
                          </td>
                          <td className="p-3 text-indigo-400 font-semibold">{c.tutor?.fullName || 'Chưa giao'}</td>
                          <td className="p-3 text-slate-400">{c.hourlyRate.toLocaleString()}đ</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${c.remainingSessions <= 2 ? 'bg-amber-950 text-amber-400 border border-amber-850' : 'bg-indigo-950 text-indigo-400 border border-indigo-850'}`}>
                              {c.remainingSessions} buổi
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${c.status === 'TEACHING' ? 'bg-emerald-950 text-emerald-400 border border-emerald-850' : 'bg-amber-950 text-amber-400 border border-amber-850'}`}>
                              {c.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'payouts' && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-md animate-fadeIn">
              <h3 className="text-lg font-bold mb-2">Quyết toán Ví lương Gia sư (Bộ phận Kế toán)</h3>
              <p className="text-slate-455 text-xs mb-6">Thao tác chuyển tiền lương về tài khoản ngân hàng thực tế của Gia sư và đưa ví lương hệ thống về 0.</p>
              {loading ? (
                <div className="text-center py-6 text-slate-500 text-xs">Đang tải danh sách ví lương...</div>
              ) : tutors.filter(t => t.walletBalance > 0).length === 0 ? (
                <div className="text-center py-8 text-slate-555 text-xs italic">Tất cả ví lương gia sư đã được quyết toán sạch (0đ).</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left text-slate-300">
                    <thead className="bg-slate-950 text-slate-450 uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="p-3">Gia sư nhận lương</th>
                        <th className="p-3">Học vị / Học hàm</th>
                        <th className="p-3">Mã ngân hàng nhận (Demo)</th>
                        <th className="p-3">Tổng tiền lương tích lũy</th>
                        <th className="p-3 text-right">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850">
                      {tutors.filter(t => t.walletBalance > 0).map((t) => (
                        <tr key={t.id} className="hover:bg-slate-950/30">
                          <td className="p-3 font-bold text-white">{t.fullName}</td>
                          <td className="p-3 text-slate-450">{t.qualification}</td>
                          <td className="p-3 font-mono text-slate-450">Agribank - **********1234</td>
                          <td className="p-3 text-emerald-400 font-bold text-sm">{t.walletBalance.toLocaleString()}đ</td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => handlePayout(t.id)}
                              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-455 active:bg-emerald-600 text-slate-950 text-xs font-bold rounded-lg cursor-pointer transition-all shadow-md shadow-emerald-500/10"
                            >
                              Duyệt chuyển khoản lương
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </PageTemplate>
  );
}

function ClientPortal() {
  const { activeProfile } = useAuth();
  const isParent = activeProfile?.type === 'PARENT' && !activeProfile?.subType;

  const [balance, setBalance] = useState(0);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<any | null>(null);
  const [submittingPackage, setSubmittingPackage] = useState(false);

  // Parent Profile state
  const [profileInfo, setProfileInfo] = useState<any>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profForm, setProfForm] = useState({ fullName: '', address: '', district: '', province: '', newPin: '' });
  const [profileLoading, setProfileLoading] = useState(false);

  const fetchWalletAndClasses = async () => {
    setLoading(true);
    try {
      const balRes = await api.get('/api/v1/wallet/balance');
      setBalance(balRes.data.balance);

      const clsRes = await api.get('/api/v1/classes');
      setClasses(clsRes.data);

      if (isParent) {
        const profRes = await api.get('/api/v1/crm/parent/profile');
        setProfileInfo(profRes.data);
        setProfForm({
          fullName: profRes.data?.fullName || '',
          address: profRes.data?.address || '',
          district: profRes.data?.district || '',
          province: profRes.data?.province || '',
          newPin: '',
        });
      }
    } catch (err) {
      console.error('Không thể tải thông tin ví/lớp học/hồ sơ', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const payload: any = {
        fullName: profForm.fullName,
        address: profForm.address,
        district: profForm.district,
        province: profForm.province,
      };
      if (profForm.newPin) {
        if (profForm.newPin.length !== 4 || isNaN(Number(profForm.newPin))) {
          alert('Mã PIN mới phải đúng 4 ký số!');
          setProfileLoading(false);
          return;
        }
        payload.newPin = profForm.newPin;
      }
      await api.post('/api/v1/crm/parent/profile', payload);
      alert('Đã cập nhật hồ sơ phụ huynh thành công!');
      setEditingProfile(false);
      fetchWalletAndClasses();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Cập nhật thất bại');
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletAndClasses();
  }, []);

  const handleTopup = async () => {
    try {
      const res = await api.post('/api/v1/wallet/topup', { amount: 1000000 });
      setBalance(res.data.balance);
      alert('Đã nạp thành công 1,000,000đ vào ví giả lập!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Nạp tiền thất bại');
    }
  };

  const handleBuyPackage = async (totalSessions: number, price: number) => {
    if (!selectedClass) return;
    setSubmittingPackage(true);
    try {
      const res = await api.post('/api/v1/packages/purchase', {
        classId: selectedClass.id,
        name: `Gói ${totalSessions} buổi học`,
        totalSessions,
        price,
      });
      alert(res.data.message);
      setSelectedClass(null);
      fetchWalletAndClasses();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Mua gói học phí thất bại');
    } finally {
      setSubmittingPackage(false);
    }
  };

  return (
    <PageTemplate title="Client Portal (Phụ huynh & Học sinh)" colorClass="from-cyan-500 to-teal-400">
      <div className="w-full space-y-8 text-left">
        {/* Wallet & Topup Section (Only for Parent profile) */}
        {isParent && (
          <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-3xl backdrop-blur-md flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Ví tiền Phụ huynh</span>
              <h2 className="text-3xl font-extrabold mt-1 text-cyan-400">{balance.toLocaleString()}đ</h2>
            </div>
            <button
              onClick={handleTopup}
              className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md shadow-cyan-500/10 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} /> Nạp 1,000,000đ (Demo)
            </button>
          </div>
        )}

        {/* Profile Settings Section (For Parent only) */}
        {isParent && profileInfo && (
          <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-3xl backdrop-blur-md space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-white">Hồ sơ cá nhân Phụ huynh</h3>
                <p className="text-xs text-slate-400 mt-1">Cập nhật thông tin liên hệ và địa chỉ của bạn để tiện phối hợp lớp học.</p>
              </div>
              <button
                onClick={() => setEditingProfile(!editingProfile)}
                className="px-3.5 py-1.5 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                {editingProfile ? 'Đóng' : 'Chỉnh sửa'}
              </button>
            </div>

            {!editingProfile ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-2xl space-y-2">
                  <div>
                    <span className="text-slate-500 uppercase font-bold text-[10px]">Họ và tên Phụ huynh</span>
                    <div className="font-bold text-white text-sm mt-0.5">{profileInfo.fullName}</div>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase font-bold text-[10px]">Mã PIN bảo mật hiện tại</span>
                    <div className="text-slate-400 mt-0.5">**** (Sử dụng để duyệt thanh toán)</div>
                  </div>
                </div>

                <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-2xl space-y-2">
                  <div>
                    <span className="text-slate-500 uppercase font-bold text-[10px]">Địa chỉ liên lạc</span>
                    <div className="text-white mt-0.5 font-semibold">
                      {profileInfo.address || 'Chưa cập nhật'}, {profileInfo.district || 'Chưa cập nhật'}, {profileInfo.province || 'Chưa cập nhật'}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-2xl p-4 bg-slate-950/40 border border-slate-850 rounded-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-450 mb-1.5">Họ và Tên</label>
                    <input
                      type="text"
                      required
                      value={profForm.fullName}
                      onChange={(e) => setProfForm(prev => ({ ...prev, fullName: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-850 rounded-xl text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-450 mb-1.5">Mã PIN mới (Tuỳ chọn - 4 số)</label>
                    <input
                      type="password"
                      placeholder="Nhập 4 số để đổi mã PIN"
                      maxLength={4}
                      value={profForm.newPin}
                      onChange={(e) => setProfForm(prev => ({ ...prev, newPin: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-850 rounded-xl text-xs text-white focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1">
                    <label className="block text-[10px] uppercase font-bold text-slate-455 mb-1.5">Địa chỉ</label>
                    <input
                      type="text"
                      required
                      placeholder="Số nhà, đường..."
                      value={profForm.address}
                      onChange={(e) => setProfForm(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-850 rounded-xl text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-455 mb-1.5">Quận / Huyện</label>
                    <input
                      type="text"
                      required
                      placeholder="Quận Cầu Giấy..."
                      value={profForm.district}
                      onChange={(e) => setProfForm(prev => ({ ...prev, district: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-850 rounded-xl text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-455 mb-1.5">Tỉnh / Thành phố</label>
                    <input
                      type="text"
                      required
                      placeholder="Hà Nội..."
                      value={profForm.province}
                      onChange={(e) => setProfForm(prev => ({ ...prev, province: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-850 rounded-xl text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingProfile(false)}
                    className="px-4 py-2 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Huỷ
                  </button>
                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-800 text-white font-bold text-xs rounded-xl cursor-pointer"
                  >
                    {profileLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Classes List */}
        <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-3xl backdrop-blur-md">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white">Danh sách lớp học của con</h3>
            {isParent && (
              <div className="flex gap-2">
                <Link to="/client/children" className="px-4 py-2 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-all cursor-pointer">
                  Con của tôi
                </Link>
                <Link to="/client/leaves" className="px-4 py-2 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-all cursor-pointer">
                  Báo Nghỉ & Dời Lịch
                </Link>
                <Link to="/client/attendance" className="px-4 py-2 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-all cursor-pointer">
                  Duyệt Điểm Danh
                </Link>
                <Link to="/client/request-tutor" className="px-4 py-2 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-all cursor-pointer">
                  Đăng ký tìm Gia sư
                </Link>
              </div>
            )}
          </div>

          {loading ? (
            <div className="text-center py-6 text-slate-500 text-sm">Đang tải danh sách lớp học...</div>
          ) : classes.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">Chưa có lớp học nào đang hoạt động.</div>
          ) : (
            <div className="space-y-4">
              {classes.map((cls) => (
                <div key={cls.id} className="p-4 bg-slate-950/60 border border-slate-850 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h4 className="font-bold text-white text-sm">Học sinh: {cls.student?.fullName || 'Chưa rõ'}</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Gia sư: {cls.tutor?.fullName || 'Chờ khớp'} | Đơn giá: {parseInt(cls.hourlyRate).toLocaleString()}đ/buổi
                    </p>
                    <div className="mt-2.5 flex items-center gap-3">
                      <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                        cls.status === 'TEACHING'
                          ? 'bg-emerald-950 border border-emerald-800 text-emerald-400'
                          : cls.status === 'TRIAL_PENDING'
                          ? 'bg-amber-950 border border-amber-800 text-amber-400'
                          : 'bg-slate-900 text-slate-400'
                      }`}>
                        {cls.status === 'TRIAL_PENDING' ? 'Chờ dạy thử' : cls.status === 'TEACHING' ? 'Đang giảng dạy' : cls.status}
                      </span>
                      <span className="text-xs text-slate-400">
                        Số buổi còn lại: <strong className="text-cyan-400">{cls.remainingSessions}</strong>
                      </span>
                    </div>
                  </div>

                  {isParent && (cls.status === 'TRIAL_PENDING' || cls.status === 'TEACHING') && (
                    <button
                      onClick={() => setSelectedClass(cls)}
                      className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg transition-all cursor-pointer inline-flex items-center gap-1 shrink-0"
                    >
                      Mua gói học phí
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal mua gói học phí */}
      {selectedClass && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 text-left shadow-2xl relative">
            <h3 className="text-lg font-bold mb-2">Mua Gói Học Phí Trả Trước</h3>
            <p className="text-slate-400 text-xs mb-6">
              Học sinh: <strong className="text-white">{selectedClass.student?.fullName}</strong> | Đơn giá: <strong className="text-white">{parseInt(selectedClass.hourlyRate).toLocaleString()}đ/buổi</strong>
            </p>

            <div className="space-y-4">
              <button
                disabled={submittingPackage}
                onClick={() => handleBuyPackage(10, selectedClass.hourlyRate * 10)}
                className="w-full p-4 bg-slate-950 hover:bg-slate-950/40 border border-slate-800 hover:border-indigo-500/50 rounded-2xl text-left transition-all cursor-pointer flex justify-between items-center"
              >
                <div>
                  <h4 className="font-bold text-sm text-white">Gói 10 buổi học</h4>
                  <span className="text-xs text-slate-500">Đơn giá chuẩn</span>
                </div>
                <strong className="text-indigo-400">{(selectedClass.hourlyRate * 10).toLocaleString()}đ</strong>
              </button>

              <button
                disabled={submittingPackage}
                onClick={() => handleBuyPackage(20, selectedClass.hourlyRate * 20 * 0.95)} // Giảm 5%
                className="w-full p-4 bg-slate-950 hover:bg-slate-950/40 border border-slate-800 hover:border-indigo-500/50 rounded-2xl text-left transition-all cursor-pointer flex justify-between items-center"
              >
                <div>
                  <h4 className="font-bold text-sm text-white">Gói 20 buổi học</h4>
                  <span className="text-xs text-emerald-500 font-semibold">Ưu đãi giảm 5%</span>
                </div>
                <strong className="text-indigo-400">{(selectedClass.hourlyRate * 20 * 0.95).toLocaleString()}đ</strong>
              </button>
            </div>

            <button
              onClick={() => setSelectedClass(null)}
              className="mt-6 py-2 bg-slate-950 border border-slate-800 hover:border-slate-700 font-semibold rounded-xl text-xs cursor-pointer transition-all text-slate-400 hover:text-white text-center w-full"
            >
              Huỷ bỏ
            </button>
          </div>
        </div>
      )}
    </PageTemplate>
  );
}

function TutorPortal() {
  const [balance, setBalance] = useState(0);
  const [classes, setClasses] = useState<any[]>([]);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Bank Form State
  const [newBank, setNewBank] = useState({ bankName: '', accountNumber: '', accountHolder: '' });
  const [bankError, setBankError] = useState('');

  // Schedule Form State
  const [newSched, setNewSched] = useState({ dayOfWeek: 2, slotStart: '08:00', slotEnd: '10:00' });

  // Tutor Profile state
  const [profileInfo, setProfileInfo] = useState<any>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profForm, setProfForm] = useState({ fullName: '', gender: 'Nam', dateOfBirth: '2000-01-01', identityNumber: '', occupation: '', qualification: '' });
  const [profileLoading, setProfileLoading] = useState(false);

  const fetchTutorData = async () => {
    setLoading(true);
    try {
      const balRes = await api.get('/api/v1/wallet/balance');
      setBalance(balRes.data.balance);

      const clsRes = await api.get('/api/v1/classes');
      setClasses(clsRes.data);

      const bankRes = await api.get('/api/v1/crm/tutor/bank-accounts');
      setBankAccounts(bankRes.data);

      const schedRes = await api.get('/api/v1/crm/tutor/schedules');
      setSchedules(schedRes.data);

      const profRes = await api.get('/api/v1/crm/tutor/profile');
      setProfileInfo(profRes.data);
      setProfForm({
        fullName: profRes.data?.fullName || '',
        gender: profRes.data?.gender || 'Nam',
        dateOfBirth: profRes.data?.dateOfBirth ? new Date(profRes.data.dateOfBirth).toISOString().split('T')[0] : '2000-01-01',
        identityNumber: profRes.data?.identityNumber || '',
        occupation: profRes.data?.occupation || '',
        qualification: profRes.data?.qualification || '',
      });
    } catch (err) {
      console.error('Không thể tải thông tin ví/lớp học gia sư/hồ sơ', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      await api.post('/api/v1/crm/tutor/profile', profForm);
      alert('Đã cập nhật hồ sơ gia sư thành công!');
      setEditingProfile(false);
      fetchTutorData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Cập nhật thất bại');
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    fetchTutorData();
  }, []);

  const handleAddBank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBank.bankName || !newBank.accountNumber || !newBank.accountHolder) {
      setBankError('Vui lòng điền đầy đủ thông tin tài khoản.');
      return;
    }
    try {
      setBankError('');
      await api.post('/api/v1/crm/tutor/bank-accounts', newBank);
      setNewBank({ bankName: '', accountNumber: '', accountHolder: '' });
      const bankRes = await api.get('/api/v1/crm/tutor/bank-accounts');
      setBankAccounts(bankRes.data);
      alert('Đã liên kết tài khoản ngân hàng thành công!');
    } catch (err: any) {
      setBankError(err.response?.data?.message || err.message || 'Thất bại');
    }
  };

  const handleDeleteBank = async (id: string) => {
    if (!confirm('Bạn có chắc muốn huỷ liên kết tài khoản ngân hàng này?')) return;
    try {
      await api.delete(`/api/v1/crm/tutor/bank-accounts/${id}`);
      const bankRes = await api.get('/api/v1/crm/tutor/bank-accounts');
      setBankAccounts(bankRes.data);
      alert('Đã huỷ liên kết tài khoản ngân hàng!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Thất bại');
    }
  };

  const handleAddSchedSlot = () => {
    const exists = schedules.some(
      (s) =>
        s.dayOfWeek === Number(newSched.dayOfWeek) &&
        s.slotStart === newSched.slotStart &&
        s.slotEnd === newSched.slotEnd
    );
    if (exists) {
      alert('Khung giờ này đã tồn tại trong lịch đề xuất!');
      return;
    }
    setSchedules((prev) => [
      ...prev,
      {
        dayOfWeek: Number(newSched.dayOfWeek),
        slotStart: newSched.slotStart,
        slotEnd: newSched.slotEnd,
      },
    ].sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.slotStart.localeCompare(b.slotStart)));
  };

  const handleRemoveSchedSlot = (index: number) => {
    setSchedules((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveSchedules = async () => {
    try {
      const res = await api.post('/api/v1/crm/tutor/schedules', { schedules });
      setSchedules(res.data);
      alert('Đã lưu cấu hình lịch rảnh giảng dạy thành công!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lưu lịch rảnh thất bại');
    }
  };

  const getDayName = (day: number) => {
    if (day === 8) return 'Chủ Nhật';
    return `Thứ ${day}`;
  };

  return (
    <PageTemplate title="Tutor Portal (Gia sư)" colorClass="from-amber-500 to-orange-400">
      <div className="flex flex-col lg:flex-row gap-8 w-full text-left items-start">
        {/* Left Side: Classes & Free Schedules */}
        <div className="flex-1 w-full space-y-8">
          {/* Profile Settings Section (FR-TUT-05) */}
          {profileInfo && (
            <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-3xl backdrop-blur-md space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-white">Hồ sơ cá nhân Gia sư</h3>
                  <p className="text-xs text-slate-400 mt-1">Cấu hình thông tin giảng dạy, học vị và CCCD xác minh.</p>
                </div>
                <button
                  onClick={() => setEditingProfile(!editingProfile)}
                  className="px-3.5 py-1.5 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  {editingProfile ? 'Đóng' : 'Chỉnh sửa'}
                </button>
              </div>

              {!editingProfile ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-2xl space-y-2">
                    <div>
                      <span className="text-slate-500 uppercase font-bold text-[10px]">Họ và tên Gia sư</span>
                      <div className="font-bold text-white text-sm mt-0.5">{profileInfo.fullName}</div>
                    </div>
                    <div>
                      <span className="text-slate-500 uppercase font-bold text-[10px]">Số CCCD / CMND</span>
                      <div className="text-white mt-0.5 font-mono">{profileInfo.identityNumber || 'Chưa cập nhật'}</div>
                    </div>
                    <div>
                      <span className="text-slate-550 uppercase font-bold text-[10px]">Giới tính / Ngày sinh</span>
                      <div className="text-slate-400 mt-0.5">
                        {profileInfo.gender} | {profileInfo.dateOfBirth ? new Date(profileInfo.dateOfBirth).toLocaleDateString() : 'Chưa cập nhật'}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-2xl space-y-2">
                    <div>
                      <span className="text-slate-500 uppercase font-bold text-[10px]">Học vị / Học hàm</span>
                      <div className="text-white mt-0.5 font-semibold">{profileInfo.qualification || 'Chưa cập nhật'}</div>
                    </div>
                    <div>
                      <span className="text-slate-500 uppercase font-bold text-[10px]">Nghề nghiệp hiện tại</span>
                      <div className="text-white mt-0.5">{profileInfo.occupation || 'Chưa cập nhật'}</div>
                    </div>
                    <div>
                      <span className="text-slate-500 uppercase font-bold text-[10px]">Trạng thái hồ sơ</span>
                      <div className="mt-1">
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${
                          profileInfo.status === 'ACTIVE'
                            ? 'bg-emerald-950 border border-emerald-800 text-emerald-400'
                            : 'bg-amber-950 border border-amber-800 text-amber-400'
                        }`}>
                          {profileInfo.status === 'ACTIVE' ? 'Đã kích hoạt' : 'Chờ kiểm duyệt'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleUpdateProfile} className="space-y-4 p-4 bg-slate-950/40 border border-slate-850 rounded-2xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-450 mb-1.5">Họ và Tên</label>
                      <input
                        type="text"
                        required
                        value={profForm.fullName}
                        onChange={(e) => setProfForm(prev => ({ ...prev, fullName: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-850 rounded-xl text-xs text-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-455 mb-1.5">Số CCCD / CMND (Xác minh)</label>
                      <input
                        type="text"
                        required
                        placeholder="Số CCCD..."
                        value={profForm.identityNumber}
                        onChange={(e) => setProfForm(prev => ({ ...prev, identityNumber: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-850 rounded-xl text-xs text-white focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-455 mb-1.5">Giới tính</label>
                      <select
                        value={profForm.gender}
                        onChange={(e) => setProfForm(prev => ({ ...prev, gender: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-850 rounded-xl text-xs text-white focus:outline-none"
                      >
                        <option value="Nam">Nam</option>
                        <option value="Nữ">Nữ</option>
                        <option value="Khác">Khác</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-455 mb-1.5">Ngày sinh</label>
                      <input
                        type="date"
                        required
                        value={profForm.dateOfBirth}
                        onChange={(e) => setProfForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-850 rounded-xl text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-455 mb-1.5">Nghề nghiệp hiện tại</label>
                      <input
                        type="text"
                        required
                        placeholder="Ví dụ: Sinh viên Bách Khoa, Giáo viên..."
                        value={profForm.occupation}
                        onChange={(e) => setProfForm(prev => ({ ...prev, occupation: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-850 rounded-xl text-xs text-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-455 mb-1.5">Trình độ / Học vị</label>
                      <input
                        type="text"
                        required
                        placeholder="Ví dụ: Cử nhân Sư phạm, Thạc sĩ..."
                        value={profForm.qualification}
                        onChange={(e) => setProfForm(prev => ({ ...prev, qualification: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-850 rounded-xl text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingProfile(false)}
                      className="px-4 py-2 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      Huỷ
                    </button>
                    <button
                      type="submit"
                      disabled={profileLoading}
                      className="px-4 py-2 bg-indigo-650 hover:bg-indigo-600 disabled:bg-indigo-850 text-white font-bold text-xs rounded-xl cursor-pointer"
                    >
                      {profileLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Classes List */}
          <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-3xl backdrop-blur-md">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
              <h3 className="text-lg font-bold text-white">Danh sách lớp học đang dạy</h3>
              <div className="flex flex-wrap gap-2">
                <Link to="/tutor/leaves" className="px-3.5 py-1.5 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-all cursor-pointer">
                  Báo Nghỉ & Dời Lịch
                </Link>
                <Link to="/tutor/attendance" className="px-3.5 py-1.5 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-all cursor-pointer">
                  Ghi Điểm Danh
                </Link>
                <Link to="/tutor/jobs" className="px-3.5 py-1.5 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-all cursor-pointer">
                  Xem lớp tuyển dụng
                </Link>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-6 text-slate-500 text-sm">Đang tải danh sách lớp học...</div>
            ) : classes.length === 0 ? (
              <div className="text-center py-8 text-slate-550 text-sm italic">Chưa có lớp học nào được nhận.</div>
            ) : (
              <div className="space-y-4">
                {classes.map((cls) => (
                  <div key={cls.id} className="p-4 bg-slate-950/60 border border-slate-850 rounded-2xl flex justify-between items-center gap-4">
                    <div>
                      <h4 className="font-bold text-white text-sm">Học sinh: {cls.student?.fullName || 'Chưa rõ'}</h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Mức lương: {parseInt(cls.tutorWageRate).toLocaleString()}đ/buổi | Trạng thái: {cls.status}
                      </p>
                    </div>
                    <span className="text-xs text-slate-400">
                      Số buổi còn lại: <strong className="text-amber-400">{cls.remainingSessions} buổi</strong>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Schedules Setting */}
          <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-3xl backdrop-blur-md">
            <h3 className="text-lg font-bold text-white mb-2">Đăng ký Lịch rảnh trong tuần (FR-TUT-01)</h3>
            <p className="text-xs text-slate-400 mb-6">Cấu hình các khung giờ bạn có thể nhận lớp để hệ thống tự động gợi ý và ghép lớp phù hợp.</p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end mb-6 p-4 bg-slate-950/40 border border-slate-850 rounded-2xl">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-450 mb-1.5">Ngày trong tuần</label>
                <select
                  value={newSched.dayOfWeek}
                  onChange={(e) => setNewSched(prev => ({ ...prev, dayOfWeek: Number(e.target.value) }))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-850 rounded-xl text-xs text-white focus:outline-none"
                >
                  <option value={2}>Thứ 2</option>
                  <option value={3}>Thứ 3</option>
                  <option value={4}>Thứ 4</option>
                  <option value={5}>Thứ 5</option>
                  <option value={6}>Thứ 6</option>
                  <option value={7}>Thứ 7</option>
                  <option value={8}>Chủ Nhật</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-450 mb-1.5">Giờ bắt đầu</label>
                <input
                  type="time"
                  value={newSched.slotStart}
                  onChange={(e) => setNewSched(prev => ({ ...prev, slotStart: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-850 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-450 mb-1.5">Giờ kết thúc</label>
                <input
                  type="time"
                  value={newSched.slotEnd}
                  onChange={(e) => setNewSched(prev => ({ ...prev, slotEnd: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-850 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={handleAddSchedSlot}
                className="w-full py-2 bg-indigo-650 hover:bg-indigo-600 active:bg-indigo-700 text-white font-bold text-xs rounded-xl cursor-pointer transition-all shadow-md shadow-indigo-650/20"
              >
                + Thêm khung giờ
              </button>
            </div>

            {schedules.length === 0 ? (
              <div className="text-center py-6 text-slate-555 text-xs italic border border-dashed border-slate-800 rounded-2xl">
                Chưa đăng ký khung giờ rảnh nào. Vui lòng thêm khung giờ ở trên.
              </div>
            ) : (
              <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                {schedules.map((s, idx) => (
                  <div key={idx} className="p-3 bg-slate-950/60 border border-slate-850 rounded-xl flex justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 bg-indigo-950 border border-indigo-900/40 text-indigo-400 font-bold rounded text-[10px]">
                        {getDayName(s.dayOfWeek)}
                      </span>
                      <span className="text-xs text-slate-350 font-semibold font-mono">
                        {s.slotStart} - {s.slotEnd}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveSchedSlot(idx)}
                      className="text-[10px] font-bold text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                    >
                      Xoá
                    </button>
                  </div>
                ))}
              </div>
            )}

            {schedules.length > 0 && (
              <button
                onClick={handleSaveSchedules}
                className="mt-6 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs rounded-xl cursor-pointer transition-all shadow-md"
              >
                Lưu lịch rảnh giảng dạy
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Wallet & Linked Bank Accounts */}
        <div className="w-full lg:w-80 shrink-0 space-y-8">
          {/* Wallet Balance */}
          <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-3xl backdrop-blur-md flex justify-between items-center">
            <div>
              <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Ví tiền lương Gia sư</span>
              <h2 className="text-3xl font-extrabold mt-1 text-amber-400">{balance.toLocaleString()}đ</h2>
            </div>
            <button
              onClick={fetchTutorData}
              className="p-2.5 bg-slate-950 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer"
            >
              <RefreshCw size={16} />
            </button>
          </div>

          {/* Linked Bank Accounts */}
          <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-3xl backdrop-blur-md space-y-6">
            <div>
              <h3 className="text-md font-bold text-white">Tài khoản Ngân hàng (FR-TUT-05)</h3>
              <p className="text-[10px] text-slate-450 mt-1">Liên kết tối đa 3 tài khoản ngân hàng để nhận chuyển khoản lương.</p>
            </div>

            <div className="space-y-3">
              {bankAccounts.length === 0 ? (
                <div className="text-center py-4 text-slate-550 text-xs italic">
                  Chưa liên kết tài khoản ngân hàng nào.
                </div>
              ) : (
                bankAccounts.map((acc) => (
                  <div key={acc.id} className="p-3 bg-slate-950/60 border border-slate-855 rounded-xl space-y-1 relative">
                    <button
                      onClick={() => handleDeleteBank(acc.id)}
                      className="absolute top-3 right-3 text-[10px] text-red-400 hover:text-red-300 font-bold transition-colors cursor-pointer"
                    >
                      Xoá
                    </button>
                    <div className="text-xs font-bold text-white">{acc.bankName}</div>
                    <div className="text-[11px] font-mono text-slate-400">{acc.accountNumber}</div>
                    <div className="text-[10px] uppercase font-semibold text-slate-500">{acc.accountHolder}</div>
                    {acc.isDefault && (
                      <span className="inline-block mt-1 px-1.5 py-0.5 bg-emerald-950 border border-emerald-900/40 text-emerald-450 font-bold text-[9px] rounded">
                        Mặc định
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>

            {bankAccounts.length < 3 && (
              <form onSubmit={handleAddBank} className="pt-4 border-t border-slate-850/60 space-y-3">
                <span className="text-[10px] text-slate-450 uppercase font-bold tracking-wider block">Liên kết tài khoản mới</span>

                {bankError && (
                  <div className="text-[10px] text-red-400 font-medium leading-normal bg-red-950/20 border border-red-900/30 p-2 rounded-lg">
                    {bankError}
                  </div>
                )}

                <div>
                  <input
                    type="text"
                    placeholder="Tên Ngân hàng (Ví dụ: Vietcombank)"
                    value={newBank.bankName}
                    onChange={(e) => setNewBank(prev => ({ ...prev, bankName: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-855 rounded-xl text-xs text-white focus:outline-none placeholder-slate-600"
                  />
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Số tài khoản"
                    value={newBank.accountNumber}
                    onChange={(e) => setNewBank(prev => ({ ...prev, accountNumber: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-855 rounded-xl text-xs text-white focus:outline-none placeholder-slate-600 font-mono"
                  />
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Tên chủ tài khoản (Không dấu)"
                    value={newBank.accountHolder}
                    onChange={(e) => setNewBank(prev => ({ ...prev, accountHolder: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-855 rounded-xl text-xs text-white focus:outline-none placeholder-slate-600 uppercase"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-amber-500 hover:bg-amber-450 active:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl cursor-pointer transition-all shadow-md"
                >
                  Liên kết tài khoản
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </PageTemplate>
  );
}

function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden flex flex-col justify-between">
      {/* Background glow effects */}
      <div className="absolute top-[-10%] left-[-15%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[150px]" />
      <div className="absolute top-[30%] right-[-10%] w-[45%] h-[45%] rounded-full bg-cyan-600/10 blur-[150px]" />
      <div className="absolute bottom-[-10%] left-[10%] w-[50%] h-[50%] rounded-full bg-amber-600/5 blur-[150px]" />

      {/* Header/Navbar */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-6 py-5 flex justify-between items-center border-b border-slate-900">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-slate-950 font-black text-sm shadow-md">
            AG
          </div>
          <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Antigravity Tutor
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-400">
          <a href="#benefits" className="hover:text-white transition-colors">Lợi ích</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">Quy trình</a>
          <a href="#tutors" className="hover:text-white transition-colors">Gia sư nổi bật</a>
          <a href="#stats" className="hover:text-white transition-colors">Thống kê</a>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <Link
              to="/profile-select"
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-650/20"
            >
              Vào hệ thống Portal
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 border border-slate-800 hover:border-slate-700 text-slate-350 hover:text-white text-xs font-bold rounded-xl transition-all"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-505 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-650/20"
              >
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto w-full px-6 pt-16 pb-20 text-center space-y-8 flex-1 flex flex-col justify-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] uppercase font-bold tracking-wider text-indigo-400">
          ⚡ Nền tảng kết nối Gia sư thông minh thế hệ mới
        </div>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight max-w-4xl mx-auto leading-[1.1] text-white">
          Tìm kiếm lớp học phù hợp và{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
            Gia sư chất lượng cao
          </span>
        </h1>
        <p className="text-sm md:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Tối ưu hóa quy trình so khớp lớp học bằng công nghệ. Quản lý lịch dạy, chấm điểm danh trực quan, bảo mật thanh toán học phí qua hệ thống ví và giải quyết tranh chấp thông minh.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <Link
            to="/register"
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-indigo-600 via-indigo-600 to-cyan-600 hover:opacity-95 text-white font-bold rounded-2xl transition-all text-sm shadow-lg shadow-indigo-700/25"
          >
            Phụ huynh: Tìm Gia sư
          </Link>
          <Link
            to="/register"
            className="w-full sm:w-auto px-8 py-3.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 font-bold rounded-2xl transition-all text-sm"
          >
            Gia sư: Đăng ký dạy
          </Link>
        </div>

        {/* Small Trust Badge */}
        <div className="pt-8 text-xs text-slate-500 font-medium">
          Được tin dùng bởi hơn <span className="text-white font-bold">15,000+ Phụ huynh</span> và <span className="text-white font-bold">5,000+ Gia sư</span> chuyên nghiệp toàn quốc
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="relative z-10 max-w-7xl mx-auto w-full px-6 py-12 border-t border-slate-900">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="p-6 bg-slate-900/40 border border-slate-850/50 rounded-2xl backdrop-blur-sm">
            <h3 className="text-3xl md:text-4xl font-black text-indigo-405">98.5%</h3>
            <p className="text-xs text-slate-505 mt-2 uppercase font-bold tracking-wider">Tỷ lệ so khớp thành công</p>
          </div>
          <div className="p-6 bg-slate-900/40 border border-slate-850/50 rounded-2xl backdrop-blur-sm">
            <h3 className="text-3xl md:text-4xl font-black text-cyan-405">5,200+</h3>
            <p className="text-xs text-slate-505 mt-2 uppercase font-bold tracking-wider">Gia sư chất lượng cao</p>
          </div>
          <div className="p-6 bg-slate-900/40 border border-slate-850/50 rounded-2xl backdrop-blur-sm">
            <h3 className="text-3xl md:text-4xl font-black text-emerald-405">20,000đ+</h3>
            <p className="text-xs text-slate-505 mt-2 uppercase font-bold tracking-wider">Số buổi dạy đã hoàn thành</p>
          </div>
          <div className="p-6 bg-slate-900/40 border border-slate-850/50 rounded-2xl backdrop-blur-sm">
            <h3 className="text-3xl md:text-4xl font-black text-amber-405">&lt; 15 Phút</h3>
            <p className="text-xs text-slate-505 mt-2 uppercase font-bold tracking-wider">Thời gian khớp lớp trung bình</p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="relative z-10 max-w-7xl mx-auto w-full px-6 py-20 border-t border-slate-900 space-y-16 text-left">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950/60 border border-indigo-900 px-3 py-1 rounded-full">
            Giá trị cốt lõi
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-white">Chúng tôi giải quyết các vấn đề gì?</h2>
          <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
            Các quy trình thủ công truyền thống tại các trung tâm gia sư thường thiếu minh bạch và chậm trễ. Antigravity tự động hóa toàn bộ để bảo vệ lợi ích của cả hai bên.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* For Parents */}
          <div className="p-8 bg-slate-900/40 border border-slate-850 rounded-3xl space-y-6">
            <h3 className="text-xl font-bold text-cyan-400 flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-cyan-400 rounded-full inline-block" />
              Dành cho Phụ huynh & Học sinh
            </h3>
            <ul className="space-y-4 text-slate-350 text-xs">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <div>
                  <strong className="text-white">Hồ sơ Gia sư đã được kiểm duyệt:</strong> Tất cả hồ sơ bao gồm CCCD và Bằng cấp đều được nhân sự CRM trung tâm kiểm duyệt trước khi hiển thị.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <div>
                  <strong className="text-white">Gói học phí trả trước minh bạch:</strong> Mua gói buổi học linh hoạt trực tiếp qua Ví phụ huynh. Học phí chỉ được thanh toán cho Gia sư sau khi buổi học hoàn thành và được bạn ký duyệt.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <div>
                  <strong className="text-white">Quản lý lịch học dễ dàng:</strong> Ghi nhận điểm danh buổi học có kèm ghi chú bài vở và nhận xét của gia sư. Báo nghỉ dời lịch nhanh chóng.
                </div>
              </li>
            </ul>
          </div>

          {/* For Tutors */}
          <div className="p-8 bg-slate-900/40 border border-slate-850 rounded-3xl space-y-6">
            <h3 className="text-xl font-bold text-amber-400 flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-amber-400 rounded-full inline-block" />
              Dành cho Gia sư / Giáo viên
            </h3>
            <ul className="space-y-4 text-slate-350 text-xs">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <div>
                  <strong className="text-white">Nhận lớp và tăng thu nhập:</strong> Ứng tuyển nhanh chóng vào các lớp mới đang tuyển trên bảng tin tuyển dụng. Thuật toán tự khớp lớp dựa trên lịch rảnh.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <div>
                  <strong className="text-white">Ví thu nhập và liên kết ngân hàng:</strong> Rút tiền nhanh chóng qua tối đa 3 tài khoản ngân hàng liên kết. Tiền về ví ngay sau khi phụ huynh ký duyệt điểm danh.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <div>
                  <strong className="text-white">Chế độ báo nghỉ linh hoạt:</strong> Báo nghỉ học buổi lẻ trước 24 giờ mà không bị trừ phạt, chủ động đề xuất lịch dạy bù gửi phụ huynh duyệt.
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Featured Tutors Section */}
      <section id="tutors" className="relative z-10 max-w-7xl mx-auto w-full px-6 py-20 border-t border-slate-900 space-y-12 text-left">
        <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Đội ngũ tinh hoa</span>
            <h2 className="text-2xl md:text-3xl font-black text-white mt-2">Gia sư chất lượng cao nổi bật</h2>
          </div>
          <Link to="/register" className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-all">
            Xem toàn bộ danh sách →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 bg-slate-900/60 border border-slate-850 rounded-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center font-bold text-sm text-indigo-400 border border-slate-700">
                NA
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Nguyễn Hoàng Nam</h4>
                <p className="text-[10px] text-slate-500 uppercase font-bold mt-0.5">Đại học Bách Khoa Hà Nội</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-normal">
              Kinh nghiệm 3 năm luyện thi THPT Quốc gia môn Toán, Lý. Hơn 50 học sinh đạt điểm 9+.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-2">
              <span className="px-2 py-0.5 bg-slate-950 border border-slate-800 rounded text-[9px] font-bold text-indigo-300">Toán cấp 3</span>
              <span className="px-2 py-0.5 bg-slate-950 border border-slate-800 rounded text-[9px] font-bold text-indigo-300">Vật Lý 12</span>
            </div>
          </div>

          <div className="p-5 bg-slate-900/60 border border-slate-850 rounded-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center font-bold text-sm text-cyan-400 border border-slate-700">
                MV
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Mai Khánh Vy</h4>
                <p className="text-[10px] text-slate-505 uppercase font-bold mt-0.5">Đại học Sư Phạm HN (K. Anh)</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-normal">
              Chứng chỉ IELTS 8.0. Chuyên ôn thi chứng chỉ Cambridge (Starters, Movers, Flyers) và IELTS nền tảng.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-2">
              <span className="px-2 py-0.5 bg-slate-950 border border-slate-800 rounded text-[9px] font-bold text-cyan-300">Tiếng Anh cấp 2</span>
              <span className="px-2 py-0.5 bg-slate-950 border border-slate-800 rounded text-[9px] font-bold text-cyan-300">IELTS 7.0+</span>
            </div>
          </div>

          <div className="p-5 bg-slate-900/60 border border-slate-850 rounded-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center font-bold text-sm text-emerald-400 border border-slate-700">
                QD
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Quách Minh Đức</h4>
                <p className="text-[10px] text-slate-505 uppercase font-bold mt-0.5">Giáo viên trường Chuyên</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-normal">
              Thạc sĩ chuyên ngành Hóa học. Ôn thi HSG tỉnh và ôn thi Chuyên Hóa vào lớp 10 chất lượng cao.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-2">
              <span className="px-2 py-0.5 bg-slate-950 border border-slate-800 rounded text-[9px] font-bold text-emerald-300">Hóa học 9</span>
              <span className="px-2 py-0.5 bg-slate-950 border border-slate-800 rounded text-[9px] font-bold text-emerald-300">Hóa học 12</span>
            </div>
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section id="how-it-works" className="relative z-10 max-w-7xl mx-auto w-full px-6 py-20 border-t border-slate-900 space-y-12 text-center">
        <div className="space-y-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Cách hoạt động</span>
          <h2 className="text-2xl md:text-3xl font-black text-white">Bắt đầu học tập sau 3 bước đơn giản</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="p-6 bg-slate-900/20 border border-slate-850/50 rounded-2xl relative">
            <span className="absolute top-4 right-6 text-4xl font-extrabold text-slate-800">01</span>
            <h4 className="font-bold text-white text-base">Đăng ký & Xác minh</h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Tạo tài khoản nhanh chóng, xác thực OTP. Cập nhật hồ sơ cá nhân hoặc CCCD (đối với gia sư) để kích hoạt.
            </p>
          </div>

          <div className="p-6 bg-slate-900/20 border border-slate-850/50 rounded-2xl relative">
            <span className="absolute top-4 right-6 text-4xl font-extrabold text-slate-800">02</span>
            <h4 className="font-bold text-white text-base">So khớp lớp tự động</h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Phụ huynh đăng tin tìm gia sư; Gia sư đăng ký lịch rảnh. Hệ thống CRM tự động ghép lớp phù hợp.
            </p>
          </div>

          <div className="p-6 bg-slate-900/20 border border-slate-850/50 rounded-2xl relative">
            <span className="absolute top-4 right-6 text-4xl font-extrabold text-slate-800">03</span>
            <h4 className="font-bold text-white text-base">Học thử & Thanh toán</h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Tiến hành học thử 1 buổi. Nếu hài lòng, phụ huynh tiến hành mua gói học phí trả trước để gia sư dạy chính thức.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto w-full px-6 py-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
        <div>
          © 2026 Antigravity Tutor System. All rights reserved.
        </div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-white transition-colors">Điều khoản dịch vụ</a>
          <a href="#" className="hover:text-white transition-colors">Chính sách bảo mật</a>
          <a href="#" className="hover:text-white transition-colors">Liên hệ hỗ trợ</a>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected routes requiring login but no active profile (Profile selector itself) */}
        <Route path="/profile-select" element={
          <ProtectedRoute>
            <ProfileSelect />
          </ProtectedRoute>
        } />

        {/* Protected routes requiring login AND active profile */}
        <Route path="/portals" element={
          <ProtectedRoute>
            <PortalSelector />
          </ProtectedRoute>
        } />
        <Route path="/admin-crm" element={
          <ProtectedRoute allowedRoles={['ADMIN', 'SALES', 'ACADEMIC', 'ACCOUNTANT']}>
            <AdminCRM />
          </ProtectedRoute>
        } />
        <Route path="/admin-crm/matching" element={
          <ProtectedRoute allowedRoles={['ADMIN', 'SALES']}>
            <SalesMatching />
          </ProtectedRoute>
        } />
        <Route path="/admin-crm/disputes" element={
          <ProtectedRoute allowedRoles={['ADMIN', 'ACADEMIC']}>
            <AcademicDisputes />
          </ProtectedRoute>
        } />
        <Route path="/client" element={
          <ProtectedRoute allowedRoles={['PARENT', 'STUDENT']}>
            <ClientPortal />
          </ProtectedRoute>
        } />
        <Route path="/client/request-tutor" element={
          <ProtectedRoute allowedRoles={['PARENT']}>
            <RequestTutor />
          </ProtectedRoute>
        } />
        <Route path="/client/children" element={
          <ProtectedRoute allowedRoles={['PARENT']}>
            <MyChildren />
          </ProtectedRoute>
        } />
        <Route path="/client/attendance" element={
          <ProtectedRoute allowedRoles={['PARENT']}>
            <ParentAttendance />
          </ProtectedRoute>
        } />
        <Route path="/client/leaves" element={
          <ProtectedRoute allowedRoles={['PARENT']}>
            <LeavesManager />
          </ProtectedRoute>
        } />
        <Route path="/tutor" element={
          <ProtectedRoute allowedRoles={['TUTOR']}>
            <TutorPortal />
          </ProtectedRoute>
        } />
        <Route path="/tutor/jobs" element={
          <ProtectedRoute allowedRoles={['TUTOR']}>
            <TutorJobs />
          </ProtectedRoute>
        } />
        <Route path="/tutor/attendance" element={
          <ProtectedRoute allowedRoles={['TUTOR']}>
            <TutorAttendance />
          </ProtectedRoute>
        } />
        <Route path="/tutor/leaves" element={
          <ProtectedRoute allowedRoles={['TUTOR']}>
            <LeavesManager />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
