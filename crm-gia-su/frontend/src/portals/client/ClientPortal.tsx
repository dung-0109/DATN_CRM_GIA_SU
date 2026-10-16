import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, UserCheck, Plus, MapPin, Edit3, AlertTriangle, GraduationCap, 
  Search, Star, ArrowRight, ClipboardList, Clock, BookOpen, CheckCircle2, 
  X, RefreshCw, Phone, Mail, Briefcase, MessageCircle, FileText,
  ShieldCheck, Filter, ChevronLeft, ChevronRight, LayoutGrid, List,
  Settings, Users, AlertCircle, ArrowUpRight, HelpCircle
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import PageTemplate from '../../components/PageTemplate';
import toast from 'react-hot-toast';

export default function ClientPortal() {
  const { activeProfile, user } = useAuth();
  const isParent = activeProfile?.type === 'PARENT' && !activeProfile?.subType;

  // Dữ liệu chính
  const [classes, setClasses] = useState<any[]>([]);
  const [tutorRequests, setTutorRequests] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [profileInfo, setProfileInfo] = useState<any>(null);
  const [parentStats, setParentStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Bộ lọc & Phân chia Tab để xử lý dữ liệu lớn (Scalable UX)
  const [activeMainTab, setActiveMainTab] = useState<'CLASSES' | 'REQUESTS' | 'STUDENTS' | 'WARRANTY'>('CLASSES');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentFilter, setSelectedStudentFilter] = useState('ALL');
  const [classStatusFilter, setClassStatusFilter] = useState<'ALL' | 'TEACHING' | 'TRIAL' | 'CLOSED'>('ALL');
  const [requestStatusFilter, setRequestStatusFilter] = useState<'ALL' | 'PUBLISHED' | 'CONSULTING' | 'MATCHED' | 'CANCELLED'>('ALL');
  const [viewMode, setViewMode] = useState<'GRID' | 'TABLE'>('GRID');

  // Phân trang danh sách lớp học
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Modal Hồ Sơ Phụ Huynh
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profForm, setProfForm] = useState({ 
    fullName: '', 
    address: '', 
    district: '', 
    province: '',
    occupation: '',
    contactTimePref: 'ANYTIME',
    preferredContactMethod: 'CALL',
    familyNotes: '',
  });
  const [profileLoading, setProfileLoading] = useState(false);

  // Modal Sổ Nhật Ký Buổi Học (Session Journal)
  const [selectedClassForJournal, setSelectedClassForJournal] = useState<any | null>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionTab, setSessionTab] = useState<'ALL' | 'ATTENDED' | 'CONFIRMED' | 'SCHEDULED'>('ALL');

  // Modal Đánh giá buổi học
  const [reviewingSession, setReviewingSession] = useState<any | null>(null);
  const [ratingScore, setRatingScore] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // Modal Khiếu nại buổi học
  const [disputingSession, setDisputingSession] = useState<any | null>(null);
  const [disputeReasonText, setDisputeReasonText] = useState('');
  const [disputeSubmitting, setDisputeSubmitting] = useState(false);

  // Modal Kích hoạt Bảo hành Đổi gia sư 30 ngày
  const [warrantyModalClass, setWarrantyModalClass] = useState<any | null>(null);
  const [warrantyReason, setWarrantyReason] = useState('Phương pháp giảng dạy chưa phù hợp với lực học của con');
  const [warrantyNotes, setWarrantyNotes] = useState('');
  const [warrantySubmitting, setWarrantySubmitting] = useState(false);

  // Tải dữ liệu từ Backend
  const fetchData = async () => {
    setLoading(true);
    try {
      if (isParent) {
        const [profRes, statsRes, clsRes, reqsRes, stuRes] = await Promise.allSettled([
          api.get('/api/v1/crm/parent/profile'),
          api.get('/api/v1/crm/parent/stats'),
          api.get('/api/v1/crm/parent/classes'),
          api.get('/api/v1/tutor-requests/my'),
          api.get('/api/v1/students'),
        ]);
        
        if (clsRes.status === 'fulfilled') setClasses(clsRes.value.data || []);
        if (reqsRes.status === 'fulfilled') setTutorRequests(reqsRes.value.data || []);
        if (stuRes.status === 'fulfilled') setStudents(stuRes.value.data || []);
        if (statsRes.status === 'fulfilled') setParentStats(statsRes.value.data);

        if (profRes.status === 'fulfilled') {
          const pData = profRes.value.data;
          setProfileInfo(pData);
          setProfForm({
            fullName: pData?.fullName || '',
            address: pData?.address || '',
            district: pData?.district || '',
            province: pData?.province || '',
            occupation: pData?.occupation || '',
            contactTimePref: pData?.contactTimePref || 'ANYTIME',
            preferredContactMethod: pData?.preferredContactMethod || 'CALL',
            familyNotes: pData?.familyNotes || '',
          });
        }
      }
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu phụ huynh:', err);
      toast.error('Không thể đồng bộ dữ liệu lớp học');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Xử lý Cập nhật Hồ Sơ Phụ Huynh
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      await api.post('/api/v1/crm/parent/profile', profForm);
      toast.success('Đã cập nhật hồ sơ phụ huynh thành công!');
      setProfileModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Cập nhật hồ sơ thất bại');
    } finally {
      setProfileLoading(false);
    }
  };

  // Mở Sổ Nhật Ký Buổi Học
  const openClassJournal = async (cls: any) => {
    setSelectedClassForJournal(cls);
    setSessionsLoading(true);
    try {
      const res = await api.get(`/api/v1/sessions?classId=${cls.id}`);
      setSessions(res.data || []);
    } catch (err) {
      console.error('Lỗi tải danh sách buổi học:', err);
    } finally {
      setSessionsLoading(false);
    }
  };

  // Xác nhận buổi học & Chấm sao
  const handleConfirmSessionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingSession) return;
    setReviewSubmitting(true);
    try {
      const res = await api.post(`/api/v1/sessions/${reviewingSession.id}/confirm`, {
        rating: ratingScore,
        feedback: feedbackText,
      });
      toast.success(res.data.message || 'Xác nhận buổi học thành công!');
      setReviewingSession(null);
      setFeedbackText('');
      setRatingScore(5);
      if (selectedClassForJournal) openClassJournal(selectedClassForJournal);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Xác nhận buổi học thất bại');
    } finally {
      setReviewSubmitting(false);
    }
  };

  // Khiếu nại buổi học
  const handleDisputeSessionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputingSession || !disputeReasonText.trim()) return;
    setDisputeSubmitting(true);
    try {
      const res = await api.post(`/api/v1/sessions/${disputingSession.id}/dispute`, {
        reason: disputeReasonText,
      });
      toast.success(res.data.message || 'Đã gửi khiếu nại tới bộ phận học vụ!');
      setDisputingSession(null);
      setDisputeReasonText('');
      if (selectedClassForJournal) openClassJournal(selectedClassForJournal);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gửi khiếu nại thất bại');
    } finally {
      setDisputeSubmitting(false);
    }
  };

  // Kích hoạt Bảo hành Đổi gia sư 30 ngày
  const handleWarrantySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!warrantyModalClass) return;
    setWarrantySubmitting(true);
    try {
      const res = await api.post(`/api/v1/finance/class/${warrantyModalClass.id}/warranty-claim`, {
        reason: warrantyReason,
        notes: warrantyNotes,
      });
      toast.success(res.data.message || 'Đã gửi yêu cầu bảo hành đổi gia sư thành công!');
      setWarrantyModalClass(null);
      setWarrantyNotes('');
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gửi yêu cầu bảo hành thất bại');
    } finally {
      setWarrantySubmitting(false);
    }
  };

  // Bộ lọc dữ liệu lớp học nâng cao
  const filteredClasses = useMemo(() => {
    return classes.filter((cls) => {
      // 1. Lọc theo trạng thái
      if (classStatusFilter !== 'ALL' && cls.status !== classStatusFilter) {
        return false;
      }
      // 2. Lọc theo con
      if (selectedStudentFilter !== 'ALL' && cls.studentId !== selectedStudentFilter) {
        return false;
      }
      // 3. Tìm kiếm từ khóa (tên con, môn học, tên gia sư)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const studentMatch = cls.student?.fullName?.toLowerCase().includes(q);
        const subjectMatch = cls.tutorRequest?.subject?.toLowerCase().includes(q);
        const tutorMatch = cls.tutor?.fullName?.toLowerCase().includes(q);
        return studentMatch || subjectMatch || tutorMatch;
      }
      return true;
    });
  }, [classes, classStatusFilter, selectedStudentFilter, searchQuery]);

  // Phân trang lớp học
  const totalPages = Math.ceil(filteredClasses.length / itemsPerPage) || 1;
  const paginatedClasses = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredClasses.slice(start, start + itemsPerPage);
  }, [filteredClasses, currentPage]);

  // Bộ lọc Yêu cầu tìm gia sư
  const filteredRequests = useMemo(() => {
    return tutorRequests.filter((req) => {
      if (requestStatusFilter !== 'ALL' && req.status !== requestStatusFilter) {
        return false;
      }
      if (selectedStudentFilter !== 'ALL' && req.studentId !== selectedStudentFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const studentMatch = req.student?.fullName?.toLowerCase().includes(q);
        const subjectMatch = req.subject?.toLowerCase().includes(q);
        return studentMatch || subjectMatch;
      }
      return true;
    });
  }, [tutorRequests, requestStatusFilter, selectedStudentFilter, searchQuery]);

  // Kiểm tra thiếu địa chỉ
  const isAddressMissing = profileInfo && (!profileInfo.address || !profileInfo.district || !profileInfo.province);

  return (
    <PageTemplate
      title="Cổng Quản Trị Học Tập Gia Đình"
      subtitle="Theo dõi tiến độ học tập, quản lý yêu cầu gia sư và bảo lưu quyền lợi học phí"
      badge="Phụ Huynh"
    >
      <div className="w-full space-y-6 text-left font-sans text-[#566a7f]">
        
        {/* 1. Header Family Card & Quick Metrics Bar */}
        <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-5 lg:p-6 transition-all">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5">
            {/* Parent Identity & Summary */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#696cff] to-[#5f61e6] text-white flex items-center justify-center font-black text-xl shadow-[0_4px_12px_rgba(105,108,255,0.35)] shrink-0">
                {profileInfo?.fullName ? profileInfo.fullName.slice(0, 2).toUpperCase() : 'PH'}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg lg:text-xl font-extrabold text-[#32475c]">
                    {profileInfo?.fullName || 'Tài khoản Phụ huynh'}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#e7e7ff] text-[#696cff]">
                    Phụ huynh chính
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-[#697a8d] flex-wrap">
                  <span className="flex items-center gap-1">
                    <Phone size={13} className="text-[#696cff]" />
                    {profileInfo?.user?.phone || user?.phone || 'Chưa cập nhật SĐT'}
                  </span>
                  <span className="hidden sm:inline text-gray-300">•</span>
                  <span className="flex items-center gap-1">
                    <MapPin size={13} className={isAddressMissing ? 'text-[#ff3e1d]' : 'text-[#71dd37]'} />
                    {profileInfo?.district && profileInfo?.province 
                      ? `${profileInfo.district}, ${profileInfo.province}`
                      : 'Chưa cập nhật khu vực'}
                  </span>
                </div>
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-2.5 w-full lg:w-auto flex-wrap sm:flex-nowrap">
              <button
                onClick={() => setProfileModalOpen(true)}
                className="px-3.5 py-2 bg-[#f5f5f9] hover:bg-gray-200 text-[#566a7f] rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Settings size={14} />
                <span>Hồ Sơ Gia Đình</span>
              </button>

              <Link
                to="/client/children"
                className="px-3.5 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-[#566a7f] rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Plus size={14} className="text-[#696cff]" />
                <span>Thêm Con ({students.length})</span>
              </Link>

              <Link
                to="/client/request-tutor"
                className="px-4 py-2 bg-gradient-to-r from-[#696cff] to-[#5f61e6] hover:from-[#5f61e6] hover:to-[#5557cf] text-white rounded-xl text-xs font-bold shadow-[0_4px_10px_rgba(105,108,255,0.35)] transition-all flex items-center gap-1.5 active:scale-95"
              >
                <Plus size={14} />
                <span>Đăng Ký Tìm Gia Sư</span>
              </Link>
            </div>
          </div>

          {/* 4 Quick Stat Counters */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5 pt-5 border-t border-gray-100">
            <div 
              onClick={() => setActiveMainTab('STUDENTS')}
              className="p-3 bg-[#f8f9fa] hover:bg-[#e7e7ff]/20 rounded-xl border border-gray-100 transition-all cursor-pointer flex items-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#e7e7ff] text-[#696cff] flex items-center justify-center font-bold shrink-0">
                <GraduationCap size={20} />
              </div>
              <div>
                <div className="text-lg font-black text-[#32475c] leading-none">
                  {parentStats?.studentsCount ?? students.length}
                </div>
                <div className="text-[11px] font-bold text-[#697a8d] uppercase tracking-wider mt-1">Con cái quản lý</div>
              </div>
            </div>

            <div 
              onClick={() => setActiveMainTab('REQUESTS')}
              className="p-3 bg-[#f8f9fa] hover:bg-[#fff2d6]/30 rounded-xl border border-gray-100 transition-all cursor-pointer flex items-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#fff2d6] text-[#ffab00] flex items-center justify-center font-bold shrink-0">
                <ClipboardList size={20} />
              </div>
              <div>
                <div className="text-lg font-black text-[#32475c] leading-none">
                  {parentStats?.requestsCount ?? tutorRequests.length}
                </div>
                <div className="text-[11px] font-bold text-[#697a8d] uppercase tracking-wider mt-1">Yêu cầu tìm kiếm</div>
              </div>
            </div>

            <div 
              onClick={() => { setActiveMainTab('CLASSES'); setClassStatusFilter('TEACHING'); }}
              className="p-3 bg-[#f8f9fa] hover:bg-[#e8fadf]/30 rounded-xl border border-gray-100 transition-all cursor-pointer flex items-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#e8fadf] text-[#71dd37] flex items-center justify-center font-bold shrink-0">
                <BookOpen size={20} />
              </div>
              <div>
                <div className="text-lg font-black text-[#32475c] leading-none">
                  {parentStats?.activeClassesCount ?? classes.filter(c => c.status === 'TEACHING').length}
                </div>
                <div className="text-[11px] font-bold text-[#697a8d] uppercase tracking-wider mt-1">Lớp chính thức</div>
              </div>
            </div>

            <div 
              onClick={() => { setActiveMainTab('CLASSES'); setClassStatusFilter('TRIAL'); }}
              className="p-3 bg-[#f8f9fa] hover:bg-[#d7f5fc]/30 rounded-xl border border-gray-100 transition-all cursor-pointer flex items-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#d7f5fc] text-[#03c3ec] flex items-center justify-center font-bold shrink-0">
                <UserCheck size={20} />
              </div>
              <div>
                <div className="text-lg font-black text-[#32475c] leading-none">
                  {parentStats?.trialClassesCount ?? classes.filter(c => c.status === 'TRIAL').length}
                </div>
                <div className="text-[11px] font-bold text-[#697a8d] uppercase tracking-wider mt-1">Lớp dạy thử</div>
              </div>
            </div>
          </div>
        </div>

        {/* Missing Address Banner */}
        {isAddressMissing && (
          <div className="bg-[#fff4e5] border border-[#ffbca9] rounded-xl p-4 flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-[#ff8359] shrink-0" size={20} />
              <div className="text-xs">
                <strong className="text-[#ff8359] font-bold">Chưa hoàn thiện địa chỉ nơi ở: </strong>
                <span className="text-[#697a8d]">Cập nhật địa chỉ chi tiết để trung tâm gợi ý các gia sư ở gần khu vực nhất.</span>
              </div>
            </div>
            <button
              onClick={() => setProfileModalOpen(true)}
              className="px-3 py-1.5 bg-[#ff8359] hover:bg-[#f27448] text-white rounded-lg text-xs font-bold shrink-0 transition-colors cursor-pointer"
            >
              Cập nhật ngay
            </button>
          </div>
        )}

        {/* 2. Structured Tab Navigation & Action Controls */}
        <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-4 space-y-4">
          
          {/* Main 4 Function Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
              <button
                onClick={() => { setActiveMainTab('CLASSES'); setCurrentPage(1); }}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                  activeMainTab === 'CLASSES'
                    ? 'bg-[#696cff] text-white shadow-[0_2px_6px_rgba(105,108,255,0.4)]'
                    : 'bg-[#f5f5f9] text-[#697a8d] hover:bg-gray-200'
                }`}
              >
                <BookOpen size={15} />
                <span>Lớp Học Gia Đình ({classes.length})</span>
              </button>

              <button
                onClick={() => { setActiveMainTab('REQUESTS'); setCurrentPage(1); }}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                  activeMainTab === 'REQUESTS'
                    ? 'bg-[#696cff] text-white shadow-[0_2px_6px_rgba(105,108,255,0.4)]'
                    : 'bg-[#f5f5f9] text-[#697a8d] hover:bg-gray-200'
                }`}
              >
                <ClipboardList size={15} />
                <span>Yêu Cầu Gia Sư ({tutorRequests.length})</span>
              </button>

              <button
                onClick={() => { setActiveMainTab('STUDENTS'); setCurrentPage(1); }}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                  activeMainTab === 'STUDENTS'
                    ? 'bg-[#696cff] text-white shadow-[0_2px_6px_rgba(105,108,255,0.4)]'
                    : 'bg-[#f5f5f9] text-[#697a8d] hover:bg-gray-200'
                }`}
              >
                <Users size={15} />
                <span>Hồ Sơ Con Cái ({students.length})</span>
              </button>

              <button
                onClick={() => { setActiveMainTab('WARRANTY'); setCurrentPage(1); }}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                  activeMainTab === 'WARRANTY'
                    ? 'bg-[#696cff] text-white shadow-[0_2px_6px_rgba(105,108,255,0.4)]'
                    : 'bg-[#f5f5f9] text-[#697a8d] hover:bg-gray-200'
                }`}
              >
                <ShieldCheck size={15} />
                <span>Bảo Hành 30 Ngày</span>
              </button>
            </div>

            {/* Quick Links to Specialized Pages */}
            <div className="flex items-center gap-2 text-xs">
              <Link
                to="/client/attendance"
                className="px-3 py-1.5 bg-[#f5f5f9] hover:bg-[#e7e7ff] text-[#697a8d] hover:text-[#696cff] font-bold rounded-lg transition-colors flex items-center gap-1"
                title="Quản lý chi tiết điểm danh từng buổi"
              >
                <UserCheck size={14} />
                <span>Duyệt Điểm Danh</span>
              </Link>
              <Link
                to="/client/leaves"
                className="px-3 py-1.5 bg-[#f5f5f9] hover:bg-[#e7e7ff] text-[#697a8d] hover:text-[#696cff] font-bold rounded-lg transition-colors flex items-center gap-1"
                title="Xem đơn xin nghỉ và lịch học bù"
              >
                <Calendar size={14} />
                <span>Báo Nghỉ</span>
              </Link>
            </div>
          </div>

          {/* Search Bar & Multidimensional Filters (Handling High Volume Data) */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            {/* Search Input */}
            <div className="sm:col-span-6 relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#a1acb8]">
                <Search size={15} />
              </span>
              <input
                type="text"
                placeholder="Tìm kiếm theo tên con, môn học, tên gia sư..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full pl-10 pr-4 py-2 bg-[#f5f5f9] border border-[#d9dee3] rounded-xl text-xs text-[#566a7f] focus:outline-none focus:border-[#696cff] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#a1acb8] hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Child Filter Dropdown */}
            <div className="sm:col-span-3">
              <select
                value={selectedStudentFilter}
                onChange={(e) => { setSelectedStudentFilter(e.target.value); setCurrentPage(1); }}
                className="w-full px-3 py-2 bg-[#f5f5f9] border border-[#d9dee3] rounded-xl text-xs font-semibold text-[#566a7f] focus:outline-none focus:border-[#696cff]"
              >
                <option value="ALL">Tất cả học sinh ({students.length})</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    Con: {s.fullName} ({s.grade || 'Chưa rõ lớp'})
                  </option>
                ))}
              </select>
            </div>

            {/* Sub-status filter based on active tab */}
            <div className="sm:col-span-3">
              {activeMainTab === 'CLASSES' && (
                <select
                  value={classStatusFilter}
                  onChange={(e) => { setClassStatusFilter(e.target.value as any); setCurrentPage(1); }}
                  className="w-full px-3 py-2 bg-[#f5f5f9] border border-[#d9dee3] rounded-xl text-xs font-semibold text-[#566a7f] focus:outline-none focus:border-[#696cff]"
                >
                  <option value="ALL">Tất cả trạng thái lớp</option>
                  <option value="TEACHING">Đang học chính thức</option>
                  <option value="TRIAL">Đang dạy thử</option>
                  <option value="CLOSED">Đã kết thúc / Hủy</option>
                </select>
              )}

              {activeMainTab === 'REQUESTS' && (
                <select
                  value={requestStatusFilter}
                  onChange={(e) => { setRequestStatusFilter(e.target.value as any); setCurrentPage(1); }}
                  className="w-full px-3 py-2 bg-[#f5f5f9] border border-[#d9dee3] rounded-xl text-xs font-semibold text-[#566a7f] focus:outline-none focus:border-[#696cff]"
                >
                  <option value="ALL">Tất cả trạng thái yêu cầu</option>
                  <option value="PUBLISHED">Đang tuyển gia sư</option>
                  <option value="CONSULTING">Chờ duyệt gia sư đề xuất</option>
                  <option value="MATCHED">Đã khớp lớp & dạy thử</option>
                  <option value="CANCELLED">Đã hủy</option>
                </select>
              )}

              {activeMainTab === 'STUDENTS' && (
                <Link
                  to="/client/children"
                  className="w-full py-2 bg-[#e7e7ff] hover:bg-[#dcdffe] text-[#696cff] font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition-colors"
                >
                  <Plus size={14} /> Thêm Hồ Sơ Con Mới
                </Link>
              )}

              {activeMainTab === 'WARRANTY' && (
                <div className="text-[11px] text-[#71dd37] font-bold flex items-center justify-end gap-1 py-1">
                  <ShieldCheck size={15} /> Bảo hiểm 30 ngày kích hoạt
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3. Main Workspace Display Area */}
        <div className="space-y-4">
          
          {/* TAB 1: DANH SÁCH LỚP HỌC (CLASSES) */}
          {activeMainTab === 'CLASSES' && (
            <div className="space-y-4">
              {loading ? (
                <div className="bg-white rounded-2xl p-12 text-center text-xs text-[#a1acb8] flex flex-col items-center gap-2">
                  <RefreshCw size={24} className="animate-spin text-[#696cff]" />
                  <span>Đang tải danh sách lớp học...</span>
                </div>
              ) : filteredClasses.length === 0 ? (
                <div className="bg-white rounded-2xl p-10 text-center border border-gray-100 shadow-xs space-y-3">
                  <BookOpen size={40} className="mx-auto text-gray-300" />
                  <h4 className="font-bold text-base text-[#566a7f]">Không tìm thấy lớp học phù hợp</h4>
                  <p className="text-xs text-[#a1acb8] max-w-md mx-auto">
                    {searchQuery || selectedStudentFilter !== 'ALL' || classStatusFilter !== 'ALL'
                      ? 'Không có kết quả khớp với bộ lọc hiện tại. Thử chọn lại bộ lọc hoặc từ khóa tìm kiếm.'
                      : 'Gia đình bạn hiện chưa có lớp học nào đang diễn ra. Hãy tạo yêu cầu tìm gia sư ngay.'}
                  </p>
                  <div className="pt-2">
                    <Link
                      to="/client/request-tutor"
                      className="px-4 py-2 bg-[#696cff] hover:bg-[#5f61e6] text-white text-xs font-bold rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5"
                    >
                      <Plus size={14} /> Tạo Yêu Cầu Tìm Gia Sư
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {paginatedClasses.map((cls) => {
                      const isTeaching = cls.status === 'TEACHING';
                      const isTrial = cls.status === 'TRIAL';
                      const remaining = cls.remainingSessions ?? 0;
                      const totalEstimated = 8;
                      const progressPct = Math.min(100, Math.round(((totalEstimated - remaining) / totalEstimated) * 100));

                      return (
                        <div
                          key={cls.id}
                          className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-[#696cff]/40 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                        >
                          {/* Card Header: Student & Subject */}
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="text-[10px] uppercase font-bold text-[#696cff] bg-[#e7e7ff] px-2.5 py-0.5 rounded-full">
                                  Học sinh: {cls.student?.fullName || 'Học viên'}
                                </span>
                                <h3 className="font-extrabold text-base text-[#32475c] mt-1.5">
                                  {cls.tutorRequest?.subject || 'Lớp Kèm Học'}
                                </h3>
                                <div className="text-xs text-[#a1acb8] font-medium">
                                  Khối lớp: {cls.student?.grade || cls.tutorRequest?.grade || 'Chưa cập nhật'}
                                </div>
                              </div>

                              <span
                                className={`px-2.5 py-1 text-[11px] font-bold rounded-full shrink-0 ${
                                  isTeaching
                                    ? 'bg-[#e8fadf] text-[#71dd37]'
                                    : isTrial
                                    ? 'bg-[#fff2d6] text-[#ffab00]'
                                    : 'bg-gray-100 text-gray-500'
                                }`}
                              >
                                {isTeaching ? 'Học chính thức' : isTrial ? 'Dạy thử' : cls.status}
                              </span>
                            </div>

                            {/* Tutor Info Preview */}
                            <div className="p-2.5 bg-[#f8f9fa] rounded-xl border border-gray-100 flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-[#e7e7ff] text-[#696cff] flex items-center justify-center font-bold text-xs shrink-0">
                                  {cls.tutor?.fullName ? cls.tutor.fullName.slice(0, 2).toUpperCase() : 'GS'}
                                </div>
                                <div>
                                  <div className="font-bold text-[#566a7f] truncate max-w-[130px]">
                                    {cls.tutor?.fullName || 'Chờ điều phối'}
                                  </div>
                                  <div className="text-[10px] text-[#a1acb8]">Gia sư phụ trách</div>
                                </div>
                              </div>

                              {cls.tutor?.ratingAvg && (
                                <span className="flex items-center gap-1 font-bold text-[#ffab00] bg-white px-2 py-0.5 rounded-md border border-gray-100 shadow-2xs">
                                  <Star size={11} fill="#ffab00" /> {Number(cls.tutor.ratingAvg).toFixed(1)}
                                </span>
                              )}
                            </div>

                            {/* Progress & Sessions */}
                            <div className="space-y-1.5 pt-1">
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-[#697a8d]">Số buổi còn lại:</span>
                                <strong className="text-[#696cff] font-bold">{remaining} buổi</strong>
                              </div>
                              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                <div 
                                  className="bg-gradient-to-r from-[#696cff] to-[#03c3ec] h-full rounded-full transition-all"
                                  style={{ width: `${Math.max(15, progressPct)}%` }}
                                />
                              </div>
                              <div className="flex justify-between items-center text-[11px] text-[#a1acb8]">
                                <span>Học phí: {parseInt(cls.hourlyRate).toLocaleString()} đ/buổi</span>
                                <span>{cls._count?.sessions || 0} buổi đã ghi nhận</span>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="space-y-2 pt-2 border-t border-gray-100">
                            <button
                              onClick={() => openClassJournal(cls)}
                              className="w-full py-2 bg-[#696cff] hover:bg-[#5f61e6] text-white text-xs font-bold rounded-xl shadow-[0_2px_4px_rgba(105,108,255,0.3)] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <BookOpen size={14} />
                              <span>Sổ Nhật Ký Buổi Học ({cls._count?.sessions || 0})</span>
                            </button>

                            <div className="grid grid-cols-2 gap-2">
                              <Link
                                to="/client/leaves"
                                className="py-1.5 bg-[#f5f5f9] hover:bg-gray-200 text-[#697a8d] hover:text-[#566a7f] text-xs font-semibold rounded-lg transition-colors text-center flex items-center justify-center gap-1"
                              >
                                <Calendar size={13} />
                                <span>Báo nghỉ</span>
                              </Link>

                              {isTeaching && (
                                <button
                                  onClick={() => setWarrantyModalClass(cls)}
                                  className="py-1.5 bg-[#fff4e5] hover:bg-[#ffe5c7] text-[#ff8359] text-xs font-bold rounded-lg transition-colors text-center flex items-center justify-center gap-1 cursor-pointer"
                                  title="Đổi gia sư miễn phí và bảo lưu số buổi trong 30 ngày"
                                >
                                  <ShieldCheck size={13} />
                                  <span>Đổi gia sư</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="bg-white rounded-xl p-3 border border-gray-100 flex items-center justify-between text-xs">
                      <span className="text-[#a1acb8]">
                        Hiển thị {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredClasses.length)} trong tổng số {filteredClasses.length} lớp học
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-100 cursor-pointer"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <span className="px-3 py-1 font-bold text-[#696cff]">
                          Trang {currentPage} / {totalPages}
                        </span>
                        <button
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-100 cursor-pointer"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* TAB 2: YÊU CẦU TÌM GIA SƯ (TUTOR REQUESTS PIPELINE) */}
          {activeMainTab === 'REQUESTS' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-extrabold text-[#32475c]">Tiến Trình Yêu Cầu Ghép Gia Sư</h3>
                  <p className="text-xs text-[#a1acb8]">Theo dõi hồ sơ gia sư ứng tuyển, duyệt lịch dạy thử và khớp lớp</p>
                </div>
                <Link
                  to="/client/requests"
                  className="text-xs font-bold text-[#696cff] hover:underline flex items-center gap-1"
                >
                  <span>Mở trang quản lý chuyên sâu</span>
                  <ArrowRight size={13} />
                </Link>
              </div>

              {filteredRequests.length === 0 ? (
                <div className="bg-white rounded-2xl p-10 text-center border border-gray-100 shadow-xs space-y-3">
                  <ClipboardList size={38} className="mx-auto text-gray-300" />
                  <h4 className="font-bold text-base text-[#566a7f]">Không có yêu cầu nào phù hợp</h4>
                  <p className="text-xs text-[#a1acb8] max-w-md mx-auto">
                    Bạn chưa có yêu cầu tìm kiếm gia sư nào hoặc bộ lọc hiện tại không khớp kết quả.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredRequests.map((req) => {
                    const candidateCount = req._count?.classApplications || req.classApplications?.length || 0;
                    return (
                      <div
                        key={req.id}
                        className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs hover:border-[#696cff]/40 transition-all flex flex-col justify-between space-y-4"
                      >
                        <div className="space-y-2">
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <span className="text-[10px] uppercase font-bold text-[#ffab00] bg-[#fff2d6] px-2.5 py-0.5 rounded-full">
                                {req.status === 'PUBLISHED' ? 'Đang tuyển gia sư' : req.status === 'CONSULTING' ? 'Chờ bạn duyệt hồ sơ' : req.status === 'MATCHED' ? 'Đã khớp lớp' : req.status}
                              </span>
                              <h4 className="font-extrabold text-base text-[#32475c] mt-2">
                                Môn {req.subject} ({req.grade})
                              </h4>
                              <p className="text-xs text-[#697a8d]">
                                Học sinh: <strong>{req.student?.fullName}</strong> • {req.sessionsPerWeek} buổi/tuần
                              </p>
                            </div>
                            <span className="text-xs font-bold text-[#71dd37] bg-[#e8fadf] px-2.5 py-1 rounded-lg shrink-0">
                              {parseInt(req.budgetPerSession).toLocaleString()} đ/buổi
                            </span>
                          </div>

                          <div className="p-3 bg-[#f8f9fa] rounded-xl border border-gray-100 text-xs text-[#697a8d] space-y-1">
                            <div>📅 Ca rảnh: {req.scheduleNotes || 'Linh hoạt thỏa thuận'}</div>
                            <div>📍 Hình thức: {req.learningMode === 'ONLINE' ? 'Học trực tuyến' : req.address || 'Tại nhà'}</div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                          <span className="text-[#696cff] font-bold flex items-center gap-1">
                            <Users size={14} /> {candidateCount} gia sư đã ứng tuyển
                          </span>
                          <Link
                            to="/client/requests"
                            className="px-3 py-1.5 bg-[#e7e7ff] hover:bg-[#696cff] text-[#696cff] hover:text-white font-bold rounded-lg transition-colors flex items-center gap-1"
                          >
                            <span>Xem hồ sơ ứng viên</span>
                            <ArrowRight size={13} />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: HỒ SƠ CÁC CON (CHILDREN PROFILES) */}
          {activeMainTab === 'STUDENTS' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-extrabold text-[#32475c]">Danh Sách Con Cái Đang Học Tập</h3>
                  <p className="text-xs text-[#a1acb8]">Quản lý mục tiêu điểm số, học lực và lớp học kèm của từng con</p>
                </div>
                <Link
                  to="/client/children"
                  className="px-3.5 py-2 bg-[#696cff] hover:bg-[#5f61e6] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Plus size={14} /> Thêm Hồ Sơ Con
                </Link>
              </div>

              {students.length === 0 ? (
                <div className="bg-white rounded-2xl p-10 text-center border border-gray-100 shadow-xs space-y-3">
                  <GraduationCap size={40} className="mx-auto text-gray-300" />
                  <h4 className="font-bold text-base text-[#566a7f]">Chưa có hồ sơ học sinh nào</h4>
                  <p className="text-xs text-[#a1acb8] max-w-sm mx-auto">
                    Thêm thông tin con cái để bắt đầu đăng ký tìm kiếm gia sư dạy kèm phù hợp nhất.
                  </p>
                  <Link
                    to="/client/children"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#696cff] text-white text-xs font-bold rounded-xl"
                  >
                    <Plus size={14} /> Thêm Con Ngay
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {students.map((stu) => {
                    const studentClasses = classes.filter((c) => c.studentId === stu.id);
                    return (
                      <div
                        key={stu.id}
                        className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs hover:border-[#696cff]/40 transition-all space-y-4 flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-extrabold text-base text-[#32475c]">{stu.fullName}</h4>
                              <p className="text-xs text-[#a1acb8] font-medium">
                                {stu.school || 'Trường chưa cập nhật'} • {stu.grade || 'Khối lớp'}
                              </p>
                            </div>
                            <span className="px-2 py-0.5 rounded bg-[#e7e7ff] text-[#696cff] text-[10px] font-bold">
                              {stu.gender === 'MALE' ? 'Nam' : 'Nữ'}
                            </span>
                          </div>

                          <div className="p-3 bg-[#f8f9fa] rounded-xl text-xs space-y-1.5">
                            <div>🎯 Mục tiêu: <strong>{stu.targetGoal || 'Ôn tập nâng cao'}</strong></div>
                            <div>📚 Môn cần kèm: <strong>{stu.subjectsNeeded || 'Chưa cập nhật'}</strong></div>
                            <div>💡 Học lực: <strong>{stu.academicLevel || 'Trung bình - Khá'}</strong></div>
                          </div>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-gray-100">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-[#697a8d]">Số lớp đang học:</span>
                            <span className="font-bold text-[#696cff]">{studentClasses.length} lớp</span>
                          </div>

                          <Link
                            to={`/client/request-tutor?studentId=${stu.id}`}
                            className="w-full py-2 bg-[#f5f5f9] hover:bg-[#696cff] hover:text-white text-[#696cff] text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                          >
                            <Plus size={14} /> Tìm Gia Sư Cho Bé
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: CHÍNH SÁCH BẢO HÀNH 30 NGÀY (WARRANTY & DISPUTE CENTER) */}
          {activeMainTab === 'WARRANTY' && (
            <div className="space-y-5">
              <div className="p-6 bg-gradient-to-r from-[#696cff]/10 via-[#03c3ec]/10 to-[#71dd37]/10 rounded-2xl border border-[#696cff]/20 space-y-2">
                <div className="flex items-center gap-2 text-[#696cff] font-extrabold text-sm">
                  <ShieldCheck size={18} />
                  <span>CHÍNH SÁCH BẢO HÀNH 30 NGÀY & ĐỔI GIA SƯ MIỄN PHÍ</span>
                </div>
                <p className="text-xs text-[#566a7f] leading-relaxed">
                  Trong vòng 30 ngày kể từ buổi học chính thức đầu tiên, nếu gia đình cảm thấy phương pháp giảng dạy chưa phù hợp hoặc học sinh chưa tiến bộ, phụ huynh có thể yêu cầu đổi gia sư mới hoàn toàn miễn phí. Toàn bộ số buổi học còn lại sẽ được <strong>bảo lưu 100%</strong> sang gia sư thay thế.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs space-y-4">
                <h4 className="font-extrabold text-sm text-[#32475c]">Danh Sách Các Lớp Đang Được Bảo Hành</h4>

                {classes.filter(c => c.status === 'TEACHING').length === 0 ? (
                  <p className="text-xs text-[#a1acb8] py-4 text-center">
                    Chưa có lớp học chính thức nào đang kích hoạt bảo hành.
                  </p>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {classes.filter(c => c.status === 'TEACHING').map((cls) => (
                      <div key={cls.id} className="py-3 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                        <div>
                          <div className="font-extrabold text-sm text-[#32475c]">
                            Môn {cls.tutorRequest?.subject} - Con: {cls.student?.fullName}
                          </div>
                          <div className="text-xs text-[#a1acb8] mt-0.5">
                            Gia sư hiện tại: <strong className="text-[#566a7f]">{cls.tutor?.fullName || 'Chưa rõ'}</strong> • Số buổi bảo lưu: <strong className="text-[#696cff]">{cls.remainingSessions ?? 0} buổi</strong>
                          </div>
                        </div>

                        <button
                          onClick={() => setWarrantyModalClass(cls)}
                          className="px-3.5 py-1.5 bg-[#fff4e5] hover:bg-[#ffe5c7] text-[#ff8359] text-xs font-bold rounded-lg transition-colors flex items-center gap-1 self-start sm:self-auto cursor-pointer"
                        >
                          <ShieldCheck size={14} />
                          <span>Yêu Cầu Đổi Gia Sư Mới</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 4. Modal: Hồ Sơ Gia Đình Phụ Huynh */}
        {profileModalOpen && (
          <div className="fixed inset-0 z-50 bg-[#233446]/50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-gray-100">
              <div className="p-5 bg-gradient-to-r from-[#696cff] to-[#5f61e6] text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Settings size={18} />
                  <h3 className="font-extrabold text-base">Cập Nhật Hồ Sơ Gia Đình & Nơi Ở</h3>
                </div>
                <button
                  onClick={() => setProfileModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleUpdateProfile} className="p-5 overflow-y-auto space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-[#566a7f] uppercase mb-1">Họ và Tên Phụ Huynh *</label>
                  <input
                    type="text"
                    required
                    value={profForm.fullName}
                    onChange={(e) => setProfForm({ ...profForm, fullName: e.target.value })}
                    className="w-full px-3 py-2 bg-[#f5f5f9] border border-[#d9dee3] rounded-lg text-[#566a7f] focus:outline-none focus:border-[#696cff]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#566a7f] uppercase mb-1">Kênh Liên Hệ Ưu Tiên</label>
                    <select
                      value={profForm.preferredContactMethod}
                      onChange={(e) => setProfForm({ ...profForm, preferredContactMethod: e.target.value })}
                      className="w-full px-3 py-2 bg-[#f5f5f9] border border-[#d9dee3] rounded-lg text-[#566a7f] focus:outline-none focus:border-[#696cff]"
                    >
                      <option value="CALL">Gọi điện thoại trực tiếp</option>
                      <option value="ZALO">Nhắn tin Zalo</option>
                      <option value="EMAIL">Gửi Email</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#566a7f] uppercase mb-1">Khung Giờ Nhận Cuộc Gọi</label>
                    <select
                      value={profForm.contactTimePref}
                      onChange={(e) => setProfForm({ ...profForm, contactTimePref: e.target.value })}
                      className="w-full px-3 py-2 bg-[#f5f5f9] border border-[#d9dee3] rounded-lg text-[#566a7f] focus:outline-none focus:border-[#696cff]"
                    >
                      <option value="ANYTIME">Linh hoạt mọi lúc</option>
                      <option value="MORNING">Buổi sáng (8h - 11h30)</option>
                      <option value="AFTERNOON">Buổi chiều (14h - 17h)</option>
                      <option value="EVENING">Buổi tối (Sau 18h)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#566a7f] uppercase mb-1">Nghề Nghiệp / Cơ Quan</label>
                  <input
                    type="text"
                    placeholder="Bác sĩ, Giáo viên, Kinh doanh..."
                    value={profForm.occupation}
                    onChange={(e) => setProfForm({ ...profForm, occupation: e.target.value })}
                    className="w-full px-3 py-2 bg-[#f5f5f9] border border-[#d9dee3] rounded-lg text-[#566a7f] focus:outline-none focus:border-[#696cff]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#566a7f] uppercase mb-1">Địa Chỉ Chi Tiết (Số nhà, Tên đường) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Tòa R2 Chung cư Royal City, 72 Nguyễn Trãi"
                    value={profForm.address}
                    onChange={(e) => setProfForm({ ...profForm, address: e.target.value })}
                    className="w-full px-3 py-2 bg-[#f5f5f9] border border-[#d9dee3] rounded-lg text-[#566a7f] focus:outline-none focus:border-[#696cff]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#566a7f] uppercase mb-1">Quận / Huyện *</label>
                    <input
                      type="text"
                      required
                      placeholder="Cầu Giấy, Thanh Xuân..."
                      value={profForm.district}
                      onChange={(e) => setProfForm({ ...profForm, district: e.target.value })}
                      className="w-full px-3 py-2 bg-[#f5f5f9] border border-[#d9dee3] rounded-lg text-[#566a7f] focus:outline-none focus:border-[#696cff]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#566a7f] uppercase mb-1">Tỉnh / Thành Phố *</label>
                    <input
                      type="text"
                      required
                      placeholder="Hà Nội, TP.HCM..."
                      value={profForm.province}
                      onChange={(e) => setProfForm({ ...profForm, province: e.target.value })}
                      className="w-full px-3 py-2 bg-[#f5f5f9] border border-[#d9dee3] rounded-lg text-[#566a7f] focus:outline-none focus:border-[#696cff]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#566a7f] uppercase mb-1">Lưu Ý Điều Kiện Gia Đình</label>
                  <textarea
                    rows={2}
                    placeholder="Chung cư quẹt thẻ tầng hầm, nhà có chó dữ, cần gia sư kiên nhẫn..."
                    value={profForm.familyNotes}
                    onChange={(e) => setProfForm({ ...profForm, familyNotes: e.target.value })}
                    className="w-full p-2.5 bg-[#f5f5f9] border border-[#d9dee3] rounded-lg text-[#566a7f] focus:outline-none focus:border-[#696cff] resize-none"
                  />
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setProfileModalOpen(false)}
                    className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-[#697a8d] font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Hủy Bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="flex-1 py-2 bg-[#696cff] hover:bg-[#5f61e6] text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    {profileLoading ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 5. Modal: Sổ Nhật Ký Buổi Học (Class Journal Modal) */}
        {selectedClassForJournal && (
          <div className="fixed inset-0 z-50 bg-[#233446]/50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-gray-100">
              <div className="p-5 bg-gradient-to-r from-[#696cff] to-[#5f61e6] text-white flex justify-between items-center">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-white/80">Sổ Nhật Ký Học Tập</div>
                  <h3 className="font-extrabold text-base text-white mt-0.5">
                    Học sinh: {selectedClassForJournal.student?.fullName} • Môn: {selectedClassForJournal.tutorRequest?.subject}
                  </h3>
                  <div className="text-xs text-white/90">
                    Gia sư: <strong>{selectedClassForJournal.tutor?.fullName || 'Chưa rõ'}</strong> • Học phí: {parseInt(selectedClassForJournal.hourlyRate).toLocaleString()} đ/buổi
                  </div>
                </div>
                <button
                  onClick={() => setSelectedClassForJournal(null)}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-5 overflow-y-auto space-y-4 text-xs">
                {/* Session Filter Tabs */}
                <div className="flex gap-1.5 border-b border-gray-100 pb-3">
                  {(['ALL', 'ATTENDED', 'CONFIRMED', 'SCHEDULED'] as const).map((tab) => {
                    const count = tab === 'ALL' ? sessions.length : sessions.filter((s) => s.status === tab).length;
                    const labels = { ALL: 'Tất cả', ATTENDED: 'Chờ duyệt', CONFIRMED: 'Đã hoàn thành', SCHEDULED: 'Lịch sắp tới' };
                    return (
                      <button
                        key={tab}
                        onClick={() => setSessionTab(tab)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          sessionTab === tab ? 'bg-[#696cff] text-white shadow-xs' : 'bg-gray-100 text-[#697a8d] hover:bg-gray-200'
                        }`}
                      >
                        {labels[tab]} ({count})
                      </button>
                    );
                  })}
                </div>

                {sessionsLoading ? (
                  <div className="py-12 text-center text-[#a1acb8] flex flex-col items-center gap-2">
                    <RefreshCw size={24} className="animate-spin text-[#696cff]" />
                    <span>Đang tải các buổi học...</span>
                  </div>
                ) : sessions.length === 0 ? (
                  <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    Chưa có buổi học nào được ghi nhận cho lớp này.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sessions
                      .filter((s) => (sessionTab === 'ALL' ? true : s.status === sessionTab))
                      .map((session, idx) => {
                        const schedDate = new Date(session.scheduledTime);
                        const isAttended = session.status === 'ATTENDED';
                        const isConfirmed = session.status === 'CONFIRMED';
                        const isDisputed = session.status === 'DISPUTED';

                        return (
                          <div
                            key={session.id}
                            className={`p-4 rounded-xl border transition-all ${
                              isAttended
                                ? 'bg-[#fffcf4] border-[#ffecb3] ring-1 ring-[#ffab00]/30'
                                : isConfirmed
                                ? 'bg-white border-gray-100'
                                : 'bg-[#f8f9fa] border-gray-100'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                              <div>
                                <h5 className="font-extrabold text-sm text-[#32475c]">
                                  Buổi #{sessions.length - idx} • {schedDate.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
                                </h5>
                                <p className="text-[11px] text-[#a1acb8] mt-0.5">
                                  Giờ dạy: {schedDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>

                              <div className="flex items-center gap-2">
                                {isAttended && (
                                  <span className="px-2.5 py-1 bg-[#fff8e1] text-[#ffab00] rounded-full text-[11px] font-bold">
                                    Chờ bạn duyệt
                                  </span>
                                )}
                                {isConfirmed && (
                                  <span className="px-2.5 py-1 bg-[#e8fadf] text-[#71dd37] rounded-full text-[11px] font-bold">
                                    Đã duyệt & hoàn thành
                                  </span>
                                )}
                                {isDisputed && (
                                  <span className="px-2.5 py-1 bg-[#ffe0db] text-[#ff3e1d] rounded-full text-[11px] font-bold">
                                    Đang khiếu nại
                                  </span>
                                )}
                              </div>
                            </div>

                            {session.tutorNotes && (
                              <div className="mt-2.5 p-2.5 bg-gray-50 rounded-lg border border-gray-100 text-xs text-[#566a7f]">
                                <strong className="text-[#696cff]">Nhận xét gia sư: </strong>
                                <span>{session.tutorNotes}</span>
                              </div>
                            )}

                            {isAttended && (
                              <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-end gap-2">
                                <button
                                  onClick={() => setDisputingSession(session)}
                                  className="px-3 py-1.5 bg-[#ffe0db] hover:bg-[#ffc9c2] text-[#ff3e1d] text-xs font-bold rounded-lg transition-colors cursor-pointer"
                                >
                                  Khiếu Nại
                                </button>
                                <button
                                  onClick={() => setReviewingSession(session)}
                                  className="px-3.5 py-1.5 bg-[#71dd37] hover:bg-[#64c830] text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                                >
                                  Duyệt & Đánh Giá Buổi Học
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 6. Modal: Kích hoạt Bảo hành Đổi gia sư 30 ngày */}
        {warrantyModalClass && (
          <div className="fixed inset-0 z-50 bg-[#233446]/50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-gray-100">
              <div className="p-5 bg-gradient-to-r from-[#ffab00] to-[#ff8359] text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={20} />
                  <h3 className="font-extrabold text-base">Kích Hoạt Bảo Hành Đổi Gia Sư 30 Ngày</h3>
                </div>
                <button
                  onClick={() => setWarrantyModalClass(null)}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleWarrantySubmit} className="p-5 space-y-4 text-xs">
                <div className="p-3 bg-[#fff9f0] rounded-xl border border-amber-100 space-y-1">
                  <div className="font-bold text-[#ffab00]">Quyền lợi bảo lưu 100% số buổi:</div>
                  <div className="text-[#697a8d]">
                    Lớp: <strong>{warrantyModalClass.tutorRequest?.subject}</strong> (Con: {warrantyModalClass.student?.fullName}).
                  </div>
                  <div className="text-[#697a8d]">
                    Số buổi còn lại được bảo lưu nguyên vẹn: <strong className="text-[#696cff]">{warrantyModalClass.remainingSessions ?? 0} buổi</strong>.
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#566a7f] uppercase mb-1">Lý Do Đổi Gia Sư *</label>
                  <select
                    value={warrantyReason}
                    onChange={(e) => setWarrantyReason(e.target.value)}
                    className="w-full px-3 py-2 bg-[#f5f5f9] border border-[#d9dee3] rounded-lg text-[#566a7f] focus:outline-none focus:border-[#696cff]"
                  >
                    <option value="Phương pháp giảng dạy chưa phù hợp với lực học của con">Phương pháp giảng dạy chưa phù hợp với lực học của con</option>
                    <option value="Gia sư thường xuyên đổi lịch hoặc đến muộn">Gia sư thường xuyên đổi lịch hoặc đến muộn</option>
                    <option value="Học sinh không hòa hợp tâm lý với gia sư">Học sinh không hòa hợp tâm lý với gia sư</option>
                    <option value="Cần đổi sang giáo viên có chuyên môn sâu hơn">Cần đổi sang giáo viên có chuyên môn sâu hơn</option>
                    <option value="Lý do khác">Lý do khác</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#566a7f] uppercase mb-1">Ghi Chú Thêm Cho Trung Tâm</label>
                  <textarea
                    rows={3}
                    placeholder="Mô tả cụ thể mong muốn về gia sư mới..."
                    value={warrantyNotes}
                    onChange={(e) => setWarrantyNotes(e.target.value)}
                    className="w-full p-2.5 bg-[#f5f5f9] border border-[#d9dee3] rounded-lg text-[#566a7f] focus:outline-none focus:border-[#696cff] resize-none"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setWarrantyModalClass(null)}
                    className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-[#697a8d] font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={warrantySubmitting}
                    className="flex-1 py-2 bg-[#ff8359] hover:bg-[#f27448] text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    {warrantySubmitting ? 'Đang gửi...' : 'Gửi Yêu Cầu Đổi Gia Sư'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 7. Modal: Duyệt Buổi Học & Đánh Giá Sao */}
        {reviewingSession && (
          <div className="fixed inset-0 z-50 bg-[#233446]/50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-gray-100">
              <div className="p-4 bg-gradient-to-r from-[#71dd37] to-[#59bc25] text-white flex justify-between items-center">
                <h4 className="font-extrabold text-sm">Xác Nhận Buổi Học & Đánh Giá Gia Sư</h4>
                <button onClick={() => setReviewingSession(null)} className="cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleConfirmSessionSubmit} className="p-5 space-y-4 text-xs">
                <div className="text-center space-y-2">
                  <label className="block text-[#566a7f] font-bold">Mức độ hài lòng buổi học:</label>
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => setRatingScore(s)}
                        className="p-1 cursor-pointer transition-transform hover:scale-110"
                      >
                        <Star size={24} fill={s <= ratingScore ? '#ffab00' : 'none'} className={s <= ratingScore ? 'text-[#ffab00]' : 'text-gray-300'} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#566a7f] uppercase mb-1">Lời Nhận Xét / Góp Ý</label>
                  <textarea
                    rows={3}
                    placeholder="Gia sư dạy nhiệt tình, con hiểu bài..."
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    className="w-full p-2.5 bg-[#f5f5f9] border border-[#d9dee3] rounded-lg text-[#566a7f] focus:outline-none focus:border-[#696cff] resize-none"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setReviewingSession(null)}
                    className="flex-1 py-2 bg-gray-100 text-[#697a8d] font-bold rounded-xl cursor-pointer"
                  >
                    Đóng
                  </button>
                  <button
                    type="submit"
                    disabled={reviewSubmitting}
                    className="flex-1 py-2 bg-[#71dd37] text-white font-bold rounded-xl shadow-xs cursor-pointer"
                  >
                    {reviewSubmitting ? 'Đang duyệt...' : 'Xác Nhận Buổi Học'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 8. Modal: Khiếu Nại Buổi Học */}
        {disputingSession && (
          <div className="fixed inset-0 z-50 bg-[#233446]/50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-gray-100">
              <div className="p-4 bg-gradient-to-r from-[#ff3e1d] to-[#e6381a] text-white flex justify-between items-center">
                <h4 className="font-extrabold text-sm">Gửi Khiếu Nại Buổi Học</h4>
                <button onClick={() => setDisputingSession(null)} className="cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleDisputeSessionSubmit} className="p-5 space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-[#566a7f] uppercase mb-1">Lý Do Khiếu Nại *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Gia sư không đến dạy, về sớm hơn giờ quy định, không làm bài tập..."
                    value={disputeReasonText}
                    onChange={(e) => setDisputeReasonText(e.target.value)}
                    className="w-full p-2.5 bg-[#f5f5f9] border border-[#d9dee3] rounded-lg text-[#566a7f] focus:outline-none focus:border-[#ff3e1d] resize-none"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setDisputingSession(null)}
                    className="flex-1 py-2 bg-gray-100 text-[#697a8d] font-bold rounded-xl cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={disputeSubmitting}
                    className="flex-1 py-2 bg-[#ff3e1d] text-white font-bold rounded-xl shadow-xs cursor-pointer"
                  >
                    {disputeSubmitting ? 'Đang gửi...' : 'Gửi Khiếu Nại Tới Học Vụ'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </PageTemplate>
  );
}
