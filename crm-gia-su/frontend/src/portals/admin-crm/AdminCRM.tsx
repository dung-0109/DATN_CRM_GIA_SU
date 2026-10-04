import { useState, useEffect } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { 
  TrendingUp, Users, BookOpen, Wallet, RefreshCw, 
  ShieldAlert, LogOut, Search, Bell, Menu, User, LayoutGrid, List 
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/ConfirmModal';

export default function AdminCRM() {
  const location = useLocation();
  const navigate = useNavigate();
  const isDashboard = location.pathname === '/admin-crm' || location.pathname === '/admin-crm/';

  const { activeProfile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'tutors' | 'parents' | 'classes' | 'payouts'>('overview');
  const [triggering, setTriggering] = useState(false);
  const [tutors, setTutors] = useState<any[]>([]);
  const [parents, setParents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination States
  const [tutorPage, setTutorPage] = useState(1);
  const [parentPage, setParentPage] = useState(1);
  const [classPage, setClassPage] = useState(1);
  const [tutorStatusFilter, setTutorStatusFilter] = useState('ALL');
  const [classViewMode, setClassViewMode] = useState<'kanban' | 'table'>('kanban');
  const ITEMS_PER_PAGE = 10;

  // Confirm Modal State
  const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, title: string, message: string, onConfirm: () => void, isDestructive?: boolean}>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  // Add User Modal State
  const [addUserModal, setAddUserModal] = useState<{isOpen: boolean, role: 'TUTOR' | 'PARENT'}>({
    isOpen: false,
    role: 'TUTOR'
  });
  const [newUserForm, setNewUserForm] = useState({ fullName: '', phone: '', password: '' });
  const [isAddingUser, setIsAddingUser] = useState(false);

  const filteredTutors = tutors.filter(t => {
    const matchSearch = t.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || t.user?.phone?.includes(searchQuery);
    const matchStatus = tutorStatusFilter === 'ALL' || t.status === tutorStatusFilter;
    return matchSearch && matchStatus;
  });
  const filteredParents = parents.filter(p => p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || p.user?.phone?.includes(searchQuery));
  const filteredClasses = classes.filter(c => c.id.includes(searchQuery) || c.student?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) || c.tutorRequest?.subject?.toLowerCase().includes(searchQuery.toLowerCase()));

  // Paginating Data
  const paginatedTutors = filteredTutors.slice((tutorPage - 1) * ITEMS_PER_PAGE, tutorPage * ITEMS_PER_PAGE);
  const paginatedParents = filteredParents.slice((parentPage - 1) * ITEMS_PER_PAGE, parentPage * ITEMS_PER_PAGE);
  const paginatedClasses = filteredClasses.slice((classPage - 1) * ITEMS_PER_PAGE, classPage * ITEMS_PER_PAGE);

  const totalTutorPages = Math.ceil(filteredTutors.length / ITEMS_PER_PAGE);
  const totalParentPages = Math.ceil(filteredParents.length / ITEMS_PER_PAGE);
  const totalClassPages = Math.ceil(filteredClasses.length / ITEMS_PER_PAGE);

  const handleTabClick = (tab: 'overview' | 'tutors' | 'parents' | 'classes' | 'payouts') => {
    setActiveTab(tab);
    setSearchQuery(''); // Reset search when switching tabs
    setTutorPage(1);
    setParentPage(1);
    setClassPage(1);
    if (!isDashboard) {
      navigate('/admin-crm');
    }
  };

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

  const fetchParents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/v1/crm/parents');
      setParents(res.data);
    } catch (err) {
      console.error('Không thể tải danh sách phụ huynh', err);
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
    } else if (activeTab === 'parents') {
      fetchParents();
    } else if (activeTab === 'classes') {
      fetchClasses();
    }
  }, [activeTab]);

  const handleStatusToggle = async (tutorId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'BANNED' : 'ACTIVE';
    try {
      await api.post(`/api/v1/crm/tutors/${tutorId}/status`, { status: newStatus });
      toast.success(`Đã cập nhật trạng thái gia sư thành ${newStatus === 'ACTIVE' ? 'Hoạt động' : 'Bị Khóa'}!`);
      fetchTutors();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Cập nhật trạng thái thất bại');
    }
  };

  const handlePayout = async (tutorId: string) => {
    try {
      const res = await api.post(`/api/v1/crm/tutors/${tutorId}/payout`);
      toast.success(res.data.message);
      fetchTutors();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Quyết toán lương thất bại');
    }
  };

  const handleTriggerAutoConfirm = async () => {
    setTriggering(true);
    try {
      const res = await api.post('/api/v1/sessions/trigger-auto-confirm');
      toast.success(res.data.message);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Kích hoạt quét tự động thất bại');
    } finally {
      setTriggering(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#f5f5f9] font-sans text-[#566a7f] overflow-hidden">
      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        isDestructive={confirmModal.isDestructive}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
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
              onClick={() => handleTabClick('overview')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${activeTab === 'overview' ? 'bg-[#696cff]/10 text-[#696cff] font-semibold' : 'text-[#697a8d] hover:bg-[#f5f5f9]'}`}
            >
              <TrendingUp size={18} /> <span>Tổng quan</span>
            </button>
            <button
              onClick={() => handleTabClick('tutors')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${activeTab === 'tutors' ? 'bg-[#696cff]/10 text-[#696cff] font-semibold' : 'text-[#697a8d] hover:bg-[#f5f5f9]'}`}
            >
              <Users size={18} /> <span>Quản lý Gia sư</span>
            </button>
            <button
              onClick={() => handleTabClick('parents')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${activeTab === 'parents' ? 'bg-[#696cff]/10 text-[#696cff] font-semibold' : 'text-[#697a8d] hover:bg-[#f5f5f9]'}`}
            >
              <User size={18} /> <span>Quản lý Phụ huynh</span>
            </button>
            <button
              onClick={() => handleTabClick('classes')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${activeTab === 'classes' ? 'bg-[#696cff]/10 text-[#696cff] font-semibold' : 'text-[#697a8d] hover:bg-[#f5f5f9]'}`}
            >
              <BookOpen size={18} /> <span>Kanban Lớp học</span>
            </button>
            <button
              onClick={() => handleTabClick('payouts')}
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
            <input 
              type="text" 
              placeholder="Tìm kiếm Gia sư, Phụ huynh, Lớp học... (Ctrl+/)" 
              className="bg-transparent border-none outline-none text-sm w-full text-[#566a7f]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
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
                {activeTab === 'overview' && (
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
                )}

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
              <div className="bg-white rounded-xl shadow-[0_4px_20px_0_rgba(0,0,0,0.05)] border border-transparent overflow-hidden animate-fadeIn">
                <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h5 className="text-xl font-bold text-[#566a7f]">Danh sách Gia sư</h5>
                  <div className="flex items-center gap-3">
                    <select 
                      className="px-4 py-2 border border-[#d9dee3] rounded-lg text-sm bg-white focus:outline-none focus:border-[#696cff] text-[#566a7f] shadow-sm cursor-pointer transition-colors"
                      value={tutorStatusFilter}
                      onChange={(e) => { setTutorStatusFilter(e.target.value); setTutorPage(1); }}
                    >
                      <option value="ALL">Tất cả trạng thái</option>
                      <option value="ACTIVE">Đang hoạt động (Active)</option>
                      <option value="BANNED">Bị khóa (Banned)</option>
                    </select>
                    <button 
                      onClick={() => setAddUserModal({ isOpen: true, role: 'TUTOR' })}
                      className="px-4 py-2 bg-[#696cff] text-white font-semibold text-sm rounded-lg hover:bg-[#5f61e6] shadow-[0_2px_4px_rgba(105,108,255,0.4)] transition-all transform hover:-translate-y-[1px]"
                    >
                      + Thêm Gia sư
                    </button>
                  </div>
                </div>
                {loading ? (
                  <div className="p-12 flex justify-center items-center">
                    <RefreshCw className="animate-spin text-[#696cff]" size={28} />
                  </div>
                ) : (
                  <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-[#697a8d]">
                      <thead className="bg-[#f8f9fa] text-[#a1acb8] font-bold text-xs uppercase tracking-wider">
                        <tr>
                          <th className="px-6 py-4 rounded-tl-lg">Gia sư</th>
                          <th className="px-6 py-4">Liên hệ</th>
                          <th className="px-6 py-4">Trình độ</th>
                          <th className="px-6 py-4">Ví lương</th>
                          <th className="px-6 py-4">Trạng thái</th>
                          <th className="px-6 py-4 text-center rounded-tr-lg">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {paginatedTutors.length === 0 ? (
                          <tr><td colSpan={6} className="py-12 text-center text-[#a1acb8]">Không tìm thấy gia sư nào.</td></tr>
                        ) : paginatedTutors.map(t => (
                          <tr key={t.id} className="hover:bg-[#fcfcfd] transition-colors group">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm" style={{ backgroundColor: `hsl(${t.fullName.length * 20 % 360}, 70%, 60%)` }}>
                                  {t.fullName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-bold text-[#566a7f] group-hover:text-[#696cff] transition-colors">{t.fullName}</div>
                                  <div className="text-xs text-[#a1acb8]">ID: {t.id.substring(0,6).toUpperCase()}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-xs">
                              <div className="text-[#566a7f] font-semibold mb-1 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#696cff]"></div>
                                {t.user?.phone || 'Chưa cập nhật'}
                              </div>
                              <div className="text-[#a1acb8] ml-3.5">{t.user?.email || 'No email'}</div>
                            </td>
                            <td className="px-6 py-4 font-medium text-[#566a7f]">{t.qualification}</td>
                            <td className="px-6 py-4 font-bold text-[#71dd37]">{t.walletBalance.toLocaleString()}đ</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${t.status === 'ACTIVE' ? 'bg-[#e8fadf] text-[#71dd37]' : 'bg-[#ffe0db] text-[#ff3e1d]'}`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${t.status === 'ACTIVE' ? 'bg-[#71dd37]' : 'bg-[#ff3e1d]'}`}></div>
                                {t.status === 'ACTIVE' ? 'Hoạt động' : 'Đã khóa'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <button 
                                onClick={() => handleStatusToggle(t.id, t.status)}
                                className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-all hover:shadow-sm ${t.status === 'ACTIVE' ? 'border-[#ff3e1d] text-[#ff3e1d] hover:bg-[#ffe0db]' : 'border-[#71dd37] text-[#71dd37] hover:bg-[#e8fadf]'}`}
                              >
                                {t.status === 'ACTIVE' ? 'Khóa TK' : 'Mở Khóa'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {/* Tutors Pagination */}
                  {totalTutorPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-white">
                      <div className="text-sm text-[#a1acb8]">
                        Hiển thị <strong>{(tutorPage - 1) * ITEMS_PER_PAGE + 1}</strong> - <strong>{Math.min(tutorPage * ITEMS_PER_PAGE, filteredTutors.length)}</strong> trên tổng số <strong>{filteredTutors.length}</strong> gia sư
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setTutorPage(p => Math.max(1, p - 1))} disabled={tutorPage === 1} className="px-3 py-1 text-sm border rounded text-[#697a8d] disabled:opacity-50">Trước</button>
                        <span className="px-3 py-1 text-sm font-semibold text-[#696cff]">{tutorPage} / {totalTutorPages}</span>
                        <button onClick={() => setTutorPage(p => Math.min(totalTutorPages, p + 1))} disabled={tutorPage === totalTutorPages} className="px-3 py-1 text-sm border rounded text-[#697a8d] disabled:opacity-50">Sau</button>
                      </div>
                    </div>
                  )}
                  </>
                )}
              </div>
            )}

          {activeTab === 'parents' && (
              <div className="bg-white rounded-xl shadow-[0_4px_20px_0_rgba(0,0,0,0.05)] border border-transparent overflow-hidden animate-fadeIn">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                  <h5 className="text-xl font-bold text-[#566a7f]">Danh sách Phụ huynh</h5>
                  <button 
                    onClick={() => setAddUserModal({ isOpen: true, role: 'PARENT' })}
                    className="px-4 py-2 bg-[#696cff] text-white font-semibold text-sm rounded-lg hover:bg-[#5f61e6] shadow-[0_2px_4px_rgba(105,108,255,0.4)] transition-all transform hover:-translate-y-[1px]"
                  >
                    + Thêm Phụ huynh
                  </button>
                </div>
                {loading ? (
                  <div className="p-12 flex justify-center items-center">
                    <RefreshCw className="animate-spin text-[#696cff]" size={28} />
                  </div>
                ) : (
                  <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-[#697a8d]">
                      <thead className="bg-[#f8f9fa] text-[#a1acb8] font-bold text-xs uppercase tracking-wider">
                        <tr>
                          <th className="px-6 py-4 rounded-tl-lg">Phụ huynh</th>
                          <th className="px-6 py-4">Liên hệ</th>
                          <th className="px-6 py-4">Khu vực</th>
                          <th className="px-6 py-4 text-center rounded-tr-lg">Hoạt động</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {paginatedParents.length === 0 ? (
                          <tr><td colSpan={4} className="py-12 text-center text-[#a1acb8]">Không tìm thấy phụ huynh nào.</td></tr>
                        ) : paginatedParents.map(p => (
                          <tr key={p.id} className="hover:bg-[#fcfcfd] transition-colors group">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm" style={{ backgroundColor: `hsl(${p.fullName.length * 40 % 360}, 60%, 55%)` }}>
                                  {p.fullName.charAt(0).toUpperCase()}
                                </div>
                                <div className="font-bold text-[#566a7f] group-hover:text-[#696cff] transition-colors">{p.fullName}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-xs">
                              <div className="text-[#566a7f] font-semibold mb-1 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#03c3ec]"></div>
                                {p.user?.phone || 'Chưa cập nhật'}
                              </div>
                              <div className="text-[#a1acb8] ml-3.5">{p.user?.email || 'No email'}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-semibold text-[#566a7f] mb-0.5">{p.district}</div>
                              <div className="text-xs text-[#a1acb8]">{p.province}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex justify-center items-center gap-4 text-xs font-semibold">
                                <div className="flex flex-col items-center p-2 rounded-lg bg-[#f8f9fa] min-w-[60px]">
                                  <span className="text-[#696cff] text-base">{p._count?.classes || 0}</span>
                                  <span className="text-[#a1acb8]">Lớp học</span>
                                </div>
                                <div className="flex flex-col items-center p-2 rounded-lg bg-[#f8f9fa] min-w-[60px]">
                                  <span className="text-[#ffab00] text-base">{p._count?.tutorRequests || 0}</span>
                                  <span className="text-[#a1acb8]">Yêu cầu</span>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {/* Parents Pagination */}
                  {totalParentPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-white">
                      <div className="text-sm text-[#a1acb8]">
                        Hiển thị <strong>{(parentPage - 1) * ITEMS_PER_PAGE + 1}</strong> - <strong>{Math.min(parentPage * ITEMS_PER_PAGE, filteredParents.length)}</strong> trên tổng số <strong>{filteredParents.length}</strong> phụ huynh
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setParentPage(p => Math.max(1, p - 1))} disabled={parentPage === 1} className="px-3 py-1 text-sm border rounded text-[#697a8d] disabled:opacity-50">Trước</button>
                        <span className="px-3 py-1 text-sm font-semibold text-[#696cff]">{parentPage} / {totalParentPages}</span>
                        <button onClick={() => setParentPage(p => Math.min(totalParentPages, p + 1))} disabled={parentPage === totalParentPages} className="px-3 py-1 text-sm border rounded text-[#697a8d] disabled:opacity-50">Sau</button>
                      </div>
                    </div>
                  )}
                  </>
                )}
              </div>
            )}

            {activeTab === 'classes' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                  <h5 className="text-xl font-bold text-[#566a7f]">Quản lý Lớp học</h5>
                  <div className="flex bg-white rounded-lg shadow-sm p-1 border border-gray-100">
                    <button 
                      onClick={() => setClassViewMode('kanban')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all ${classViewMode === 'kanban' ? 'bg-[#696cff] text-white shadow-sm' : 'text-[#697a8d] hover:bg-gray-50'}`}
                    >
                      <LayoutGrid size={16} /> Kanban
                    </button>
                    <button 
                      onClick={() => setClassViewMode('table')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all ${classViewMode === 'table' ? 'bg-[#696cff] text-white shadow-sm' : 'text-[#697a8d] hover:bg-gray-50'}`}
                    >
                      <List size={16} /> Danh sách
                    </button>
                  </div>
                </div>
                {loading ? (
                  <div className="p-8 text-center text-[#a1acb8] bg-white rounded-xl shadow-sm">Đang tải...</div>
                ) : classViewMode === 'kanban' ? (
                      <div className="flex gap-6 overflow-x-auto pb-4">
                        {/* OPEN */}
                        <div className="w-80 shrink-0">
                          <div className="bg-[#f9f9fa] border-t-4 border-[#8592a3] rounded-xl shadow-[0_4px_20px_0_rgba(0,0,0,0.05)] p-4 h-full flex flex-col border-x border-b border-gray-100">
                            <div className="flex justify-between items-center mb-4">
                              <h6 className="font-bold text-[#566a7f] uppercase tracking-wider text-sm">OPEN</h6>
                              <span className="bg-[#e7e7ff] text-[#696cff] text-xs font-bold px-2.5 py-1 rounded-full">{filteredClasses.filter(c => c.status === 'OPEN').length}</span>
                            </div>
                            <div className="space-y-3 h-[calc(100vh-280px)] overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-[#d9dee3] [&::-webkit-scrollbar-thumb]:rounded-full">
                              {filteredClasses.filter(c => c.status === 'OPEN').map(c => (
                                <div key={c.id} className="bg-white p-4 rounded-xl shadow-[0_2px_4px_0_rgba(67,89,113,0.05)] border border-gray-100 hover:border-[#696cff]/30 cursor-pointer transition-all transform hover:-translate-y-1">
                                  <div className="flex justify-between items-start mb-3">
                                    <span className="text-xs font-bold bg-[#e7e7ff] text-[#696cff] px-2 py-1 rounded-md line-clamp-1">{c.tutorRequest?.subject} (Lớp {c.tutorRequest?.grade})</span>
                                    <span className="text-xs font-bold text-[#71dd37] whitespace-nowrap ml-2 bg-[#e8fadf] px-2 py-1 rounded-md">{c.hourlyRate.toLocaleString()}đ</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs" style={{ backgroundColor: `hsl(${c.student?.fullName?.length || 0 * 40 % 360}, 60%, 55%)` }}>
                                      {(c.student?.fullName || 'H').charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                      <div className="text-sm text-[#566a7f] font-bold">{c.student?.fullName}</div>
                                      <div className="text-xs text-[#a1acb8]">Học sinh</div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* DEPOSIT */}
                        <div className="w-80 shrink-0">
                          <div className="bg-[#f9f9fa] border-t-4 border-[#ffab00] rounded-xl shadow-[0_4px_20px_0_rgba(0,0,0,0.05)] p-4 h-full flex flex-col border-x border-b border-gray-100">
                            <div className="flex justify-between items-center mb-4">
                              <h6 className="font-bold text-[#566a7f] uppercase tracking-wider text-sm">DEPOSIT</h6>
                              <span className="bg-[#ffe0db] text-[#ff3e1d] text-xs font-bold px-2.5 py-1 rounded-full">{filteredClasses.filter(c => c.status === 'DEPOSIT').length}</span>
                            </div>
                            <div className="space-y-3 h-[calc(100vh-280px)] overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-[#d9dee3] [&::-webkit-scrollbar-thumb]:rounded-full">
                              {filteredClasses.filter(c => c.status === 'DEPOSIT').map(c => (
                                <div key={c.id} className="bg-white p-4 rounded-xl shadow-[0_2px_4px_0_rgba(67,89,113,0.05)] border border-gray-100 hover:border-[#ffab00]/30 cursor-pointer transition-all transform hover:-translate-y-1">
                                  <div className="flex justify-between items-start mb-3">
                                    <span className="text-xs font-bold bg-[#e7e7ff] text-[#696cff] px-2 py-1 rounded-md line-clamp-1">{c.tutorRequest?.subject} (Lớp {c.tutorRequest?.grade})</span>
                                    <span className="text-xs font-bold text-[#ffab00] whitespace-nowrap ml-2 bg-[#fff2ec] px-2 py-1 rounded-md">Chờ cọc</span>
                                  </div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className="w-6 h-6 rounded-md flex items-center justify-center font-bold text-white text-[10px]" style={{ backgroundColor: `hsl(${c.student?.fullName?.length || 0 * 40 % 360}, 60%, 55%)` }}>
                                      {(c.student?.fullName || 'H').charAt(0).toUpperCase()}
                                    </div>
                                    <div className="text-sm text-[#566a7f] font-semibold">{c.student?.fullName}</div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-white text-[10px]" style={{ backgroundColor: `hsl(${c.tutor?.fullName?.length || 0 * 70 % 360}, 70%, 60%)` }}>
                                      {(c.tutor?.fullName || 'G').charAt(0).toUpperCase()}
                                    </div>
                                    <div className="text-xs text-[#a1acb8]">GS: <span className="font-semibold text-[#566a7f]">{c.tutor?.fullName}</span></div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* TRIAL */}
                        <div className="w-80 shrink-0">
                          <div className="bg-[#f9f9fa] border-t-4 border-[#696cff] rounded-xl shadow-[0_4px_20px_0_rgba(0,0,0,0.05)] p-4 h-full flex flex-col border-x border-b border-gray-100">
                            <div className="flex justify-between items-center mb-4">
                              <h6 className="font-bold text-[#566a7f] uppercase tracking-wider text-sm">TRIAL</h6>
                              <span className="bg-[#e7e7ff] text-[#696cff] text-xs font-bold px-2.5 py-1 rounded-full">{filteredClasses.filter(c => c.status === 'TRIAL').length}</span>
                            </div>
                            <div className="space-y-3 h-[calc(100vh-280px)] overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-[#d9dee3] [&::-webkit-scrollbar-thumb]:rounded-full">
                              {filteredClasses.filter(c => c.status === 'TRIAL').map(c => (
                                <div key={c.id} className="bg-white p-4 rounded-xl shadow-[0_2px_4px_0_rgba(67,89,113,0.05)] border border-gray-100 hover:border-[#696cff]/30 cursor-pointer transition-all transform hover:-translate-y-1">
                                  <div className="flex justify-between items-start mb-3">
                                    <span className="text-xs font-bold bg-[#e7e7ff] text-[#696cff] px-2 py-1 rounded-md line-clamp-1">{c.tutorRequest?.subject} (Lớp {c.tutorRequest?.grade})</span>
                                  </div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className="w-6 h-6 rounded-md flex items-center justify-center font-bold text-white text-[10px]" style={{ backgroundColor: `hsl(${c.student?.fullName?.length || 0 * 40 % 360}, 60%, 55%)` }}>
                                      {(c.student?.fullName || 'H').charAt(0).toUpperCase()}
                                    </div>
                                    <div className="text-sm text-[#566a7f] font-semibold">{c.student?.fullName}</div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-white text-[10px]" style={{ backgroundColor: `hsl(${c.tutor?.fullName?.length || 0 * 70 % 360}, 70%, 60%)` }}>
                                      {(c.tutor?.fullName || 'G').charAt(0).toUpperCase()}
                                    </div>
                                    <div className="text-xs text-[#a1acb8]">GS: <span className="font-semibold text-[#566a7f]">{c.tutor?.fullName}</span></div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* TEACHING */}
                        <div className="w-80 shrink-0">
                          <div className="bg-[#f9f9fa] border-t-4 border-[#71dd37] rounded-xl shadow-[0_4px_20px_0_rgba(0,0,0,0.05)] p-4 h-full flex flex-col border-x border-b border-gray-100">
                            <div className="flex justify-between items-center mb-4">
                              <h6 className="font-bold text-[#566a7f] uppercase tracking-wider text-sm">TEACHING</h6>
                              <span className="bg-[#e8fadf] text-[#71dd37] text-xs font-bold px-2.5 py-1 rounded-full">{filteredClasses.filter(c => c.status === 'TEACHING').length}</span>
                            </div>
                            <div className="space-y-3 h-[calc(100vh-280px)] overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-[#d9dee3] [&::-webkit-scrollbar-thumb]:rounded-full">
                              {filteredClasses.filter(c => c.status === 'TEACHING').map(c => (
                                <div key={c.id} className="bg-white p-4 rounded-xl shadow-[0_2px_4px_0_rgba(67,89,113,0.05)] border border-gray-100 hover:border-[#71dd37]/30 cursor-pointer transition-all transform hover:-translate-y-1">
                                  <div className="flex justify-between items-start mb-3">
                                    <span className="text-xs font-bold bg-[#e8fadf] text-[#71dd37] px-2 py-1 rounded-md line-clamp-1">{c.tutorRequest?.subject} (Lớp {c.tutorRequest?.grade})</span>
                                  </div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className="w-6 h-6 rounded-md flex items-center justify-center font-bold text-white text-[10px]" style={{ backgroundColor: `hsl(${c.student?.fullName?.length || 0 * 40 % 360}, 60%, 55%)` }}>
                                      {(c.student?.fullName || 'H').charAt(0).toUpperCase()}
                                    </div>
                                    <div className="text-sm text-[#566a7f] font-semibold">{c.student?.fullName}</div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-white text-[10px]" style={{ backgroundColor: `hsl(${c.tutor?.fullName?.length || 0 * 70 % 360}, 70%, 60%)` }}>
                                      {(c.tutor?.fullName || 'G').charAt(0).toUpperCase()}
                                    </div>
                                    <div className="text-xs text-[#a1acb8]">GS: <span className="font-semibold text-[#566a7f]">{c.tutor?.fullName}</span></div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white rounded-xl shadow-[0_4px_20px_0_rgba(0,0,0,0.05)] border border-transparent overflow-hidden animate-fadeIn">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-sm text-[#697a8d]">
                            <thead className="bg-[#f8f9fa] text-[#a1acb8] font-bold text-xs uppercase tracking-wider">
                              <tr>
                                <th className="px-6 py-4 rounded-tl-lg">Lớp / Môn học</th>
                                <th className="px-6 py-4">Học sinh</th>
                                <th className="px-6 py-4">Gia sư</th>
                                <th className="px-6 py-4">Học phí</th>
                                <th className="px-6 py-4">Trạng thái</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {paginatedClasses.length === 0 ? (
                                <tr><td colSpan={5} className="py-12 text-center text-[#a1acb8]">Không có lớp học nào.</td></tr>
                              ) : paginatedClasses.map(c => (
                                <tr key={c.id} className="hover:bg-[#fcfcfd] transition-colors group">
                                  <td className="px-6 py-4">
                                    <div className="font-bold text-[#696cff]">{c.tutorRequest?.subject} (Lớp {c.tutorRequest?.grade})</div>
                                    <div className="text-xs text-[#a1acb8]">ID: {c.id.substring(0,8).toUpperCase()}</div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                      <div className="w-6 h-6 rounded-md flex items-center justify-center font-bold text-white text-[10px]" style={{ backgroundColor: `hsl(${c.student?.fullName?.length || 0 * 40 % 360}, 60%, 55%)` }}>
                                        {(c.student?.fullName || 'H').charAt(0).toUpperCase()}
                                      </div>
                                      <div className="text-sm font-semibold text-[#566a7f]">{c.student?.fullName}</div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    {c.tutor ? (
                                      <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-white text-[10px]" style={{ backgroundColor: `hsl(${c.tutor?.fullName?.length || 0 * 70 % 360}, 70%, 60%)` }}>
                                          {(c.tutor?.fullName || 'G').charAt(0).toUpperCase()}
                                        </div>
                                        <div className="text-sm font-semibold text-[#566a7f]">{c.tutor?.fullName}</div>
                                      </div>
                                    ) : (
                                      <span className="text-xs text-[#a1acb8] italic">Chưa có GS</span>
                                    )}
                                  </td>
                                  <td className="px-6 py-4 font-bold text-[#71dd37]">{c.hourlyRate.toLocaleString()}đ<span className="text-xs text-[#a1acb8] font-normal">/h</span></td>
                                  <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                      c.status === 'OPEN' ? 'bg-[#e7e7ff] text-[#696cff]' :
                                      c.status === 'DEPOSIT' ? 'bg-[#ffe0db] text-[#ff3e1d]' :
                                      c.status === 'TRIAL' ? 'bg-[#e7e7ff] text-[#696cff]' :
                                      c.status === 'TEACHING' ? 'bg-[#e8fadf] text-[#71dd37]' :
                                      'bg-[#f1f2f4] text-[#a1acb8]'
                                    }`}>
                                      <div className={`w-1.5 h-1.5 rounded-full ${
                                        c.status === 'OPEN' ? 'bg-[#696cff]' :
                                        c.status === 'DEPOSIT' ? 'bg-[#ff3e1d]' :
                                        c.status === 'TRIAL' ? 'bg-[#696cff]' :
                                        c.status === 'TEACHING' ? 'bg-[#71dd37]' :
                                        'bg-[#a1acb8]'
                                      }`}></div>
                                      {c.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {/* Classes Pagination */}
                        {totalClassPages > 1 && (
                          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-white">
                            <div className="text-sm text-[#a1acb8]">
                              Hiển thị <strong>{(classPage - 1) * ITEMS_PER_PAGE + 1}</strong> - <strong>{Math.min(classPage * ITEMS_PER_PAGE, filteredClasses.length)}</strong> trên tổng số <strong>{filteredClasses.length}</strong> lớp học
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => setClassPage(p => Math.max(1, p - 1))} disabled={classPage === 1} className="px-3 py-1 text-sm border rounded text-[#697a8d] disabled:opacity-50 hover:bg-gray-50">Trước</button>
                              <span className="px-3 py-1 text-sm font-semibold text-[#696cff]">{classPage} / {totalClassPages}</span>
                              <button onClick={() => setClassPage(p => Math.min(totalClassPages, p + 1))} disabled={classPage === totalClassPages} className="px-3 py-1 text-sm border rounded text-[#697a8d] disabled:opacity-50 hover:bg-gray-50">Sau</button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
              </div>
            )}

            {activeTab === 'payouts' && (
              <div className="bg-white rounded-xl shadow-[0_4px_20px_0_rgba(0,0,0,0.05)] border border-transparent overflow-hidden animate-fadeIn">
                <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between">
                  <div>
                    <h5 className="text-xl font-bold text-[#566a7f]">Quyết toán Ví lương</h5>
                    <p className="text-[#a1acb8] text-sm mt-1">Chuyển lương cho Gia sư (Kế toán)</p>
                  </div>
                </div>
                {loading ? (
                  <div className="p-12 flex justify-center items-center">
                    <RefreshCw className="animate-spin text-[#696cff]" size={28} />
                  </div>
                ) : tutors.filter(t => t.walletBalance > 0).length === 0 ? (
                  <div className="p-12 text-center text-[#a1acb8]">Tất cả ví lương đã được quyết toán.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-[#697a8d]">
                      <thead className="bg-[#f8f9fa] text-[#a1acb8] font-bold text-xs uppercase tracking-wider">
                        <tr>
                          <th className="px-6 py-4 rounded-tl-lg">Gia sư</th>
                          <th className="px-6 py-4">Ngân hàng</th>
                          <th className="px-6 py-4">Tổng lương</th>
                          <th className="px-6 py-4 text-center rounded-tr-lg">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredTutors.filter(t => t.walletBalance > 0).map((t) => (
                          <tr key={t.id} className="hover:bg-[#fcfcfd] transition-colors group">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm" style={{ backgroundColor: `hsl(${t.fullName.length * 20 % 360}, 70%, 60%)` }}>
                                  {t.fullName.charAt(0).toUpperCase()}
                                </div>
                                <div className="font-bold text-[#566a7f] group-hover:text-[#696cff] transition-colors">{t.fullName}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-xs">
                              {t.tutorBankAccounts && t.tutorBankAccounts.length > 0 ? (
                                <>
                                  <div className="text-[#566a7f] font-semibold mb-1 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#ffab00]"></div>
                                    {t.tutorBankAccounts[0].bankName}
                                  </div>
                                  <div className="text-[#a1acb8] ml-3.5">{t.tutorBankAccounts[0].accountHolder} - {t.tutorBankAccounts[0].accountNumberEncrypted}</div>
                                </>
                              ) : (
                                <div className="text-[#ff3e1d] italic bg-[#ffe0db] inline-block px-2 py-1 rounded">Chưa cập nhật</div>
                              )}
                            </td>
                            <td className="px-6 py-4 font-bold text-[#71dd37] text-base">{t.walletBalance.toLocaleString()}đ</td>
                            <td className="px-6 py-4 text-center">
                              <button 
                                onClick={() => handlePayout(t.id)}
                                className="px-4 py-2 bg-[#696cff] text-white font-semibold text-xs rounded-lg hover:bg-[#5f61e6] shadow-[0_2px_4px_0_rgba(105,108,255,0.4)] transition-all transform hover:-translate-y-[1px]"
                              >
                                Xác nhận Đã Chuyển
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

            {/* Add User Modal */}
            {addUserModal.isOpen && (
              <div className="fixed inset-0 bg-[rgba(35,52,70,0.5)] flex items-center justify-center p-4 z-[60] animate-fadeIn backdrop-blur-sm">
                <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-scaleIn border border-[rgba(67,89,113,0.1)]">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-[#e7e7ff] flex items-center justify-center text-[#696cff]">
                      <User size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-[#566a7f]">
                      Thêm {addUserModal.role === 'TUTOR' ? 'Gia sư' : 'Phụ huynh'} mới
                    </h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-[#566a7f] mb-1.5">Họ và tên</label>
                      <input 
                        type="text" 
                        value={newUserForm.fullName}
                        onChange={e => setNewUserForm(prev => ({...prev, fullName: e.target.value}))}
                        className="w-full px-4 py-2 border border-[#d9dee3] rounded-lg text-sm focus:outline-none focus:border-[#696cff] focus:ring-1 focus:ring-[#696cff] transition-all"
                        placeholder="Nhập họ và tên..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#566a7f] mb-1.5">Số điện thoại</label>
                      <input 
                        type="text" 
                        value={newUserForm.phone}
                        onChange={e => setNewUserForm(prev => ({...prev, phone: e.target.value}))}
                        className="w-full px-4 py-2 border border-[#d9dee3] rounded-lg text-sm focus:outline-none focus:border-[#696cff] focus:ring-1 focus:ring-[#696cff] transition-all"
                        placeholder="0912345678"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#566a7f] mb-1.5">Mật khẩu khởi tạo</label>
                      <input 
                        type="password" 
                        value={newUserForm.password}
                        onChange={e => setNewUserForm(prev => ({...prev, password: e.target.value}))}
                        className="w-full px-4 py-2 border border-[#d9dee3] rounded-lg text-sm focus:outline-none focus:border-[#696cff] focus:ring-1 focus:ring-[#696cff] transition-all"
                        placeholder="Tối thiểu 8 ký tự..."
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 mt-8">
                    <button
                      onClick={() => setAddUserModal({ isOpen: false, role: 'TUTOR' })}
                      disabled={isAddingUser}
                      className="px-5 py-2.5 text-[#697a8d] hover:bg-[#f1f2f4] active:bg-[#e4e6e9] text-sm font-bold rounded-lg transition-all"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      onClick={async () => {
                        if (!newUserForm.fullName || !newUserForm.phone || !newUserForm.password) {
                          toast.error("Vui lòng điền đầy đủ thông tin");
                          return;
                        }
                        setIsAddingUser(true);
                        try {
                          await api.post('/api/v1/auth/register', {
                            fullName: newUserForm.fullName,
                            phone: newUserForm.phone,
                            password: newUserForm.password,
                            role: addUserModal.role
                          });
                          toast.success(`Đã thêm ${addUserModal.role === 'TUTOR' ? 'Gia sư' : 'Phụ huynh'} mới thành công!`);
                          setAddUserModal({ isOpen: false, role: 'TUTOR' });
                          setNewUserForm({ fullName: '', phone: '', password: '' });
                          fetchData();
                        } catch (err: any) {
                          toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi tạo người dùng');
                        } finally {
                          setIsAddingUser(false);
                        }
                      }}
                      disabled={isAddingUser}
                      className="px-5 py-2.5 bg-[#696cff] hover:bg-[#5f61e6] active:bg-[#595cd9] disabled:opacity-50 text-white text-sm font-bold rounded-lg shadow-[0_2px_4px_0_rgba(105,108,255,0.4)] transition-all flex items-center gap-2"
                    >
                      {isAddingUser ? <RefreshCw size={16} className="animate-spin" /> : null}
                      Tạo tài khoản
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
