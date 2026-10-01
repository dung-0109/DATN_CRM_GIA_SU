import { useState, useEffect } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { 
  TrendingUp, Users, BookOpen, Wallet, RefreshCw, 
  ShieldAlert, LogOut, Search, Bell, Menu, User 
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function AdminCRM() {
  const location = useLocation();
  const isDashboard = location.pathname === '/admin-crm' || location.pathname === '/admin-crm/';

  const { activeProfile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'tutors' | 'classes' | 'payouts'>('overview');
  const [triggering, setTriggering] = useState(false);
  const [tutors, setTutors] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
    <div className="flex h-screen bg-[#f5f5f9] font-sans text-[#566a7f] overflow-hidden">
      {/* Sidebar - Sneat Style */}
      <aside className={`bg-white shadow-[0_2px_6px_0_rgba(67,89,113,0.12)] transition-all duration-300 z-20 flex flex-col ${sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'}`}>
        <div className="h-16 flex items-center px-6 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#696cff] flex items-center justify-center text-white font-bold">S</div>
            <span className="text-xl font-bold text-[#566a7f] tracking-tight">Sneat CRM</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <div className="px-6 mb-2 text-xs font-bold uppercase tracking-wider text-[#a1acb8]">Menu</div>
          <nav className="space-y-1 px-3">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${activeTab === 'overview' ? 'bg-[#696cff]/10 text-[#696cff] font-semibold' : 'text-[#697a8d] hover:bg-[#f5f5f9]'}`}
            >
              <TrendingUp size={18} /> <span>Tổng quan</span>
            </button>
            <button
              onClick={() => setActiveTab('tutors')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${activeTab === 'tutors' ? 'bg-[#696cff]/10 text-[#696cff] font-semibold' : 'text-[#697a8d] hover:bg-[#f5f5f9]'}`}
            >
              <Users size={18} /> <span>Quản lý Gia sư</span>
            </button>
            <button
              onClick={() => setActiveTab('classes')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${activeTab === 'classes' ? 'bg-[#696cff]/10 text-[#696cff] font-semibold' : 'text-[#697a8d] hover:bg-[#f5f5f9]'}`}
            >
              <BookOpen size={18} /> <span>Kanban Lớp học</span>
            </button>
            <button
              onClick={() => setActiveTab('payouts')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${activeTab === 'payouts' ? 'bg-[#696cff]/10 text-[#696cff] font-semibold' : 'text-[#697a8d] hover:bg-[#f5f5f9]'}`}
            >
              <Wallet size={18} /> <span>Đối soát Kế toán</span>
            </button>
          </nav>

          <div className="px-6 mt-8 mb-2 text-xs font-bold uppercase tracking-wider text-[#a1acb8]">Điều phối</div>
          <nav className="space-y-1 px-3">
            <Link
              to="/admin-crm/matching"
              className="flex items-center gap-3 px-3 py-2.5 rounded-md text-[#697a8d] hover:bg-[#f5f5f9] transition-colors"
            >
              <RefreshCw size={18} /> <span>Ghép lớp (Matching)</span>
            </Link>
            <Link
              to="/admin-crm/disputes"
              className="flex items-center gap-3 px-3 py-2.5 rounded-md text-[#697a8d] hover:bg-[#f5f5f9] transition-colors"
            >
              <ShieldAlert size={18} /> <span>Giải quyết khiếu nại</span>
            </Link>
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 shrink-0 bg-[#f5f5f9] px-6 flex items-center justify-between">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 flex items-center px-4 h-10 flex-1 max-w-full md:max-w-[calc(100%-300px)]">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="mr-3 text-[#697a8d] hover:text-[#696cff] cursor-pointer">
              <Menu size={20} />
            </button>
            <Search size={16} className="text-[#a1acb8] mr-2" />
            <input type="text" placeholder="Tìm kiếm (Ctrl+/)" className="bg-transparent border-none outline-none text-sm w-full text-[#566a7f]" />
          </div>

          <div className="flex items-center gap-4">
            <button className="text-[#697a8d] hover:text-[#696cff] transition-colors relative cursor-pointer">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-[#ff3e1d] rounded-full"></span>
            </button>
            <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
              <div className="text-right hidden md:block">
                <div className="text-sm font-semibold text-[#566a7f]">{activeProfile?.name || 'Admin'}</div>
                <div className="text-xs text-[#a1acb8]">Quản trị viên</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#e7e7ff] text-[#696cff] flex items-center justify-center font-bold relative cursor-pointer shadow-sm border border-white">
                <User size={20} />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#71dd37] border-2 border-white rounded-full"></span>
              </div>
              <button onClick={logout} className="text-[#a1acb8] hover:text-[#ff3e1d] transition-colors cursor-pointer ml-2" title="Đăng xuất">
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#f5f5f9]">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {isDashboard ? (
              <>
                {/* Header Title */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
              <div>
                <h2 className="text-2xl font-semibold text-[#566a7f]">Dashboard Tổng Quan</h2>
                <p className="text-[#a1acb8] text-sm mt-1">Hệ thống CRM quản lý giáo dục - Giao diện Sneat</p>
              </div>
              
              <button
                onClick={handleTriggerAutoConfirm}
                disabled={triggering}
                className="px-4 py-2 bg-[#696cff] hover:bg-[#5f61e6] active:bg-[#595cd9] disabled:opacity-50 text-white text-sm font-semibold rounded-md shadow-[0_2px_4px_0_rgba(105,108,255,0.4)] transition-all cursor-pointer flex items-center gap-2"
              >
                <RefreshCw size={16} className={triggering ? 'animate-spin' : ''} />
                {triggering ? 'Đang chạy...' : 'Quét Auto-Confirm'}
              </button>
            </div>

            {/* Content Tabs */}
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Card 1 */}
                  <div className="bg-white rounded-xl shadow-sm border border-[rgba(67,89,113,0.05)] p-5 relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-sm text-[#697a8d] font-semibold">Tổng doanh thu</div>
                      <div className="p-2 bg-[#e7e7ff] text-[#696cff] rounded-lg">
                        <Wallet size={20} />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-[#566a7f]">{stats ? `${stats.totalRevenue.toLocaleString('vi-VN')}đ` : '...'}</div>
                    <div className="text-xs text-[#71dd37] mt-1 font-semibold flex items-center gap-1">
                      <TrendingUp size={12} /> +12.4% (tháng này)
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div className="bg-white rounded-xl shadow-sm border border-[rgba(67,89,113,0.05)] p-5">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-sm text-[#697a8d] font-semibold">Lớp đang dạy</div>
                      <div className="p-2 bg-[#e8fadf] text-[#71dd37] rounded-lg">
                        <BookOpen size={20} />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-[#566a7f]">{stats ? stats.activeClasses : '...'}</div>
                    <div className="text-xs text-[#697a8d] mt-1">Tổng trạng thái TEACHING</div>
                  </div>

                  {/* Card 3 */}
                  <div className="bg-white rounded-xl shadow-sm border border-[rgba(67,89,113,0.05)] p-5">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-sm text-[#697a8d] font-semibold">Gia sư Active</div>
                      <div className="p-2 bg-[#d7f5fc] text-[#03c3ec] rounded-lg">
                        <Users size={20} />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-[#566a7f]">{stats ? stats.activeTutors : '...'}</div>
                    <div className="text-xs text-[#697a8d] mt-1">Sẵn sàng nhận lớp</div>
                  </div>

                  {/* Card 4 */}
                  <div className="bg-white rounded-xl shadow-sm border border-[rgba(67,89,113,0.05)] p-5">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-sm text-[#697a8d] font-semibold">Tỷ lệ đổi GS</div>
                      <div className="p-2 bg-[#ffe0db] text-[#ff3e1d] rounded-lg">
                        <ShieldAlert size={20} />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-[#566a7f]">{stats ? `${stats.tutorChangeRate}%` : '...'}</div>
                    <div className="text-xs text-[#ff3e1d] mt-1">Cảnh báo nếu &gt; 5%</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Alerts */}
                  <div className="bg-white rounded-xl shadow-sm border border-[rgba(67,89,113,0.05)] p-6">
                    <h5 className="text-lg font-semibold text-[#566a7f] mb-4">Hoạt động cần xử lý</h5>
                    <div className="space-y-4">
                      <div className="flex gap-4 p-4 rounded-lg bg-[#fff2ec] border border-[#ffbca9]">
                        <div className="mt-1 text-[#ff8359]"><ShieldAlert size={20} /></div>
                        <div>
                          <div className="font-semibold text-[#ff8359]">Gia sư bị đánh giá thấp</div>
                          <div className="text-sm text-[#697a8d] mt-1">Gia sư Lê Văn Thầy nhận 1 sao từ Phụ huynh. Vui lòng liên hệ hỗ trợ kịp thời.</div>
                          <button className="mt-2 px-3 py-1 bg-white border border-[#ff8359] text-[#ff8359] rounded text-xs font-semibold hover:bg-[#ff8359] hover:text-white transition-colors">
                            Xử lý ngay
                          </button>
                        </div>
                      </div>
                      <div className="flex gap-4 p-4 rounded-lg bg-[#fff8e1] border border-[#ffe49a]">
                        <div className="mt-1 text-[#ffab00]"><Bell size={20} /></div>
                        <div>
                          <div className="font-semibold text-[#ffab00]">Yêu cầu đổi lịch học</div>
                          <div className="text-sm text-[#697a8d] mt-1">Có 2 yêu cầu dời lịch học bù chưa được phụ huynh xác nhận.</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Logs */}
                  <div className="bg-white rounded-xl shadow-sm border border-[rgba(67,89,113,0.05)] p-6">
                    <h5 className="text-lg font-semibold text-[#566a7f] mb-4">Nhật ký hệ thống (Audit Logs)</h5>
                    <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100">
                      
                      <div className="relative">
                        <div className="absolute left-[-24px] top-1 w-[10px] h-[10px] rounded-full bg-[#696cff] ring-4 ring-white"></div>
                        <div className="flex justify-between items-start mb-1">
                          <div className="font-semibold text-[#566a7f] text-sm">STAFF ghép lớp thành công</div>
                          <div className="text-xs text-[#a1acb8]">12 phút trước</div>
                        </div>
                        <div className="text-sm text-[#697a8d]">Tạo lớp dạy thử cho Yêu cầu #REQ_123.</div>
                      </div>

                      <div className="relative">
                        <div className="absolute left-[-24px] top-1 w-[10px] h-[10px] rounded-full bg-[#71dd37] ring-4 ring-white"></div>
                        <div className="flex justify-between items-start mb-1">
                          <div className="font-semibold text-[#566a7f] text-sm">Gia sư nộp cọc</div>
                          <div className="text-xs text-[#a1acb8]">45 phút trước</div>
                        </div>
                        <div className="text-sm text-[#697a8d]">GS Nguyễn Văn A đã thanh toán 500k.</div>
                      </div>

                      <div className="relative">
                        <div className="absolute left-[-24px] top-1 w-[10px] h-[10px] rounded-full bg-[#03c3ec] ring-4 ring-white"></div>
                        <div className="flex justify-between items-start mb-1">
                          <div className="font-semibold text-[#566a7f] text-sm">Hệ thống tạo tự động</div>
                          <div className="text-xs text-[#a1acb8]">1 giờ trước</div>
                        </div>
                        <div className="text-sm text-[#697a8d]">Tự động duyệt 5 buổi học hoàn thành.</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'tutors' && (
              <div className="bg-white rounded-xl shadow-sm border border-[rgba(67,89,113,0.05)] overflow-hidden animate-fadeIn">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                  <h5 className="text-lg font-semibold text-[#566a7f]">Danh sách Gia sư</h5>
                  <button className="px-3 py-1.5 bg-[#696cff]/10 text-[#696cff] font-semibold text-sm rounded hover:bg-[#696cff]/20 transition-colors">
                    + Thêm Gia sư
                  </button>
                </div>
                {loading ? (
                  <div className="p-8 text-center text-[#a1acb8]">Đang tải...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-[#697a8d]">
                      <thead className="bg-[#f9f9fa] text-[#566a7f] font-semibold">
                        <tr>
                          <th className="px-6 py-4">GIA SƯ</th>
                          <th className="px-6 py-4">TRÌNH ĐỘ</th>
                          <th className="px-6 py-4">VÍ LƯƠNG</th>
                          <th className="px-6 py-4">TRẠNG THÁI</th>
                          <th className="px-6 py-4 text-center">THAO TÁC</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {tutors.map(t => (
                          <tr key={t.id} className="hover:bg-[#f9f9fa] transition-colors">
                            <td className="px-6 py-4 font-semibold text-[#696cff]">{t.fullName}</td>
                            <td className="px-6 py-4">{t.qualification}</td>
                            <td className="px-6 py-4 font-bold text-[#71dd37]">{t.walletBalance.toLocaleString()}đ</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-md text-xs font-semibold ${t.status === 'ACTIVE' ? 'bg-[#e8fadf] text-[#71dd37]' : 'bg-[#ffe0db] text-[#ff3e1d]'}`}>
                                {t.status === 'ACTIVE' ? 'ACTIVE' : 'BANNED'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <button 
                                onClick={() => handleStatusToggle(t.id, t.status)}
                                className={`text-xs px-2 py-1 rounded border transition-colors ${t.status === 'ACTIVE' ? 'border-[#ff3e1d] text-[#ff3e1d] hover:bg-[#ffe0db]' : 'border-[#71dd37] text-[#71dd37] hover:bg-[#e8fadf]'}`}
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
              <div className="space-y-4 animate-fadeIn">
                <div className="flex justify-between items-center mb-4">
                  <h5 className="text-lg font-semibold text-[#566a7f]">Kanban Lớp học</h5>
                </div>
                {loading ? (
                  <div className="p-8 text-center text-[#a1acb8] bg-white rounded-xl shadow-sm">Đang tải...</div>
                ) : (
                  <div className="flex gap-6 overflow-x-auto pb-4">
                    {/* OPEN */}
                    <div className="w-80 shrink-0">
                      <div className="bg-[#f9f9fa] border-t-4 border-[#8592a3] rounded-xl shadow-sm p-4 h-full min-h-[500px]">
                        <div className="flex justify-between items-center mb-4">
                          <h6 className="font-semibold text-[#566a7f]">OPEN</h6>
                          <span className="bg-[#e7e7ff] text-[#696cff] text-xs font-bold px-2 py-1 rounded-md">{classes.filter(c => c.status === 'OPEN').length}</span>
                        </div>
                        <div className="space-y-3">
                          {classes.filter(c => c.status === 'OPEN').map(c => (
                            <div key={c.id} className="bg-white p-4 rounded-lg shadow-[0_1px_3px_0_rgba(67,89,113,0.1)] border border-gray-100 cursor-pointer hover:shadow-md transition-shadow">
                              <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-bold text-[#696cff]">ID: {c.id.slice(0,6)}</span>
                                <span className="text-xs font-semibold text-[#71dd37]">{c.hourlyRate.toLocaleString()}đ/b</span>
                              </div>
                              <div className="text-sm text-[#566a7f] font-semibold mb-1">{c.student?.fullName}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* DEPOSIT */}
                    <div className="w-80 shrink-0">
                      <div className="bg-[#f9f9fa] border-t-4 border-[#ffab00] rounded-xl shadow-sm p-4 h-full min-h-[500px]">
                        <div className="flex justify-between items-center mb-4">
                          <h6 className="font-semibold text-[#566a7f]">DEPOSIT</h6>
                          <span className="bg-[#ffe0db] text-[#ff3e1d] text-xs font-bold px-2 py-1 rounded-md">{classes.filter(c => c.status === 'DEPOSIT').length}</span>
                        </div>
                        <div className="space-y-3">
                          {classes.filter(c => c.status === 'DEPOSIT').map(c => (
                            <div key={c.id} className="bg-white p-4 rounded-lg shadow-[0_1px_3px_0_rgba(67,89,113,0.1)] border border-gray-100 cursor-pointer hover:shadow-md transition-shadow">
                              <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-bold text-[#696cff]">ID: {c.id.slice(0,6)}</span>
                                <span className="text-xs font-semibold text-[#ffab00]">Chờ cọc</span>
                              </div>
                              <div className="text-sm text-[#566a7f] font-semibold mb-1">{c.student?.fullName}</div>
                              <div className="text-xs text-[#a1acb8]">GS: {c.tutor?.fullName}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* TRIAL */}
                    <div className="w-80 shrink-0">
                      <div className="bg-[#f9f9fa] border-t-4 border-[#696cff] rounded-xl shadow-sm p-4 h-full min-h-[500px]">
                        <div className="flex justify-between items-center mb-4">
                          <h6 className="font-semibold text-[#566a7f]">TRIAL</h6>
                          <span className="bg-[#e7e7ff] text-[#696cff] text-xs font-bold px-2 py-1 rounded-md">{classes.filter(c => c.status === 'TRIAL').length}</span>
                        </div>
                        <div className="space-y-3">
                          {classes.filter(c => c.status === 'TRIAL').map(c => (
                            <div key={c.id} className="bg-white p-4 rounded-lg shadow-[0_1px_3px_0_rgba(67,89,113,0.1)] border border-gray-100 cursor-pointer hover:shadow-md transition-shadow">
                              <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-bold text-[#696cff]">ID: {c.id.slice(0,6)}</span>
                              </div>
                              <div className="text-sm text-[#566a7f] font-semibold mb-1">{c.student?.fullName}</div>
                              <div className="text-xs text-[#a1acb8]">GS: {c.tutor?.fullName}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* TEACHING */}
                    <div className="w-80 shrink-0">
                      <div className="bg-[#f9f9fa] border-t-4 border-[#71dd37] rounded-xl shadow-sm p-4 h-full min-h-[500px]">
                        <div className="flex justify-between items-center mb-4">
                          <h6 className="font-semibold text-[#566a7f]">TEACHING</h6>
                          <span className="bg-[#e8fadf] text-[#71dd37] text-xs font-bold px-2 py-1 rounded-md">{classes.filter(c => c.status === 'TEACHING').length}</span>
                        </div>
                        <div className="space-y-3">
                          {classes.filter(c => c.status === 'TEACHING').map(c => (
                            <div key={c.id} className="bg-white p-4 rounded-lg shadow-[0_1px_3px_0_rgba(67,89,113,0.1)] border border-gray-100 cursor-pointer hover:shadow-md transition-shadow">
                              <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-bold text-[#696cff]">ID: {c.id.slice(0,6)}</span>
                              </div>
                              <div className="text-sm text-[#566a7f] font-semibold mb-1">{c.student?.fullName}</div>
                              <div className="text-xs text-[#a1acb8]">GS: {c.tutor?.fullName}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            )}

            {activeTab === 'payouts' && (
              <div className="bg-white rounded-xl shadow-sm border border-[rgba(67,89,113,0.05)] overflow-hidden animate-fadeIn">
                <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between">
                  <div>
                    <h5 className="text-lg font-semibold text-[#566a7f]">Quyết toán Ví lương</h5>
                    <p className="text-[#a1acb8] text-sm mt-1">Chuyển lương cho Gia sư (Kế toán)</p>
                  </div>
                </div>
                {loading ? (
                  <div className="p-8 text-center text-[#a1acb8]">Đang tải...</div>
                ) : tutors.filter(t => t.walletBalance > 0).length === 0 ? (
                  <div className="p-12 text-center text-[#a1acb8]">Tất cả ví lương đã được quyết toán.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-[#697a8d]">
                      <thead className="bg-[#f9f9fa] text-[#566a7f] font-semibold">
                        <tr>
                          <th className="px-6 py-4">GIA SƯ</th>
                          <th className="px-6 py-4">NGÂN HÀNG</th>
                          <th className="px-6 py-4">TỔNG LƯƠNG</th>
                          <th className="px-6 py-4 text-center">THAO TÁC</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {tutors.filter(t => t.walletBalance > 0).map((t) => (
                          <tr key={t.id} className="hover:bg-[#f9f9fa] transition-colors">
                            <td className="px-6 py-4 font-semibold text-[#696cff]">{t.fullName}</td>
                            <td className="px-6 py-4">
                              <div>Agribank</div>
                              <div className="text-xs text-[#a1acb8]">**********1234</div>
                            </td>
                            <td className="px-6 py-4 font-bold text-[#71dd37] text-base">{t.walletBalance.toLocaleString()}đ</td>
                            <td className="px-6 py-4 text-center">
                              <button 
                                onClick={() => handlePayout(t.id)}
                                className="px-3 py-1.5 bg-[#696cff] text-white font-semibold text-xs rounded hover:bg-[#5f61e6] shadow-[0_2px_4px_0_rgba(105,108,255,0.4)] transition-all"
                              >
                                Đã chuyển khoản
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
            
            </>
            ) : (
              <Outlet />
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
