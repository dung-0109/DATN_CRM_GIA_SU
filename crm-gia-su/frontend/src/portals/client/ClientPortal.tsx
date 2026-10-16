import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, UserCheck, Plus, MapPin, AlertTriangle, GraduationCap, 
  Search, Star, ArrowRight, ClipboardList, BookOpen, 
  X, RefreshCw, Phone, ShieldCheck, ChevronLeft, ChevronRight,
  Settings, Users
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

  // Bộ lọc & Phân chia Tab để xử lý dữ liệu lớn (Scalable, Uncluttered UX)
  const [activeMainTab, setActiveMainTab] = useState<'CLASSES' | 'REQUESTS' | 'STUDENTS' | 'WARRANTY'>('CLASSES');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentFilter, setSelectedStudentFilter] = useState('ALL');
  const [classStatusFilter, setClassStatusFilter] = useState<'ALL' | 'TEACHING' | 'TRIAL' | 'CLOSED'>('ALL');
  const [requestStatusFilter, setRequestStatusFilter] = useState<'ALL' | 'PUBLISHED' | 'CONSULTING' | 'MATCHED' | 'CANCELLED'>('ALL');

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
      if (classStatusFilter !== 'ALL' && cls.status !== classStatusFilter) {
        return false;
      }
      if (selectedStudentFilter !== 'ALL' && cls.studentId !== selectedStudentFilter) {
        return false;
      }
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
      title="Quản Trị Học Tập Gia Đình"
      subtitle="Theo dõi tiến độ học tập, quản lý yêu cầu gia sư và bảo lưu quyền lợi học phí"
      badge="Phụ Huynh"
    >
      <div className="w-full space-y-5 text-left font-sans text-slate-700">
        
        {/* 1. Header Family Card & Quick Metrics Bar */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            
            {/* Parent Identity & Summary */}
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-base shrink-0">
                {profileInfo?.fullName ? profileInfo.fullName.slice(0, 2).toUpperCase() : 'PH'}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base font-semibold text-slate-800">
                    {profileInfo?.fullName || 'Tài khoản Phụ huynh'}
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200/60">
                    Phụ huynh chính
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-500 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Phone size={12} className="text-slate-400" />
                    {profileInfo?.user?.phone || user?.phone || 'Chưa cập nhật SĐT'}
                  </span>
                  <span className="hidden sm:inline text-slate-300">•</span>
                  <span className="flex items-center gap-1">
                    <MapPin size={12} className={isAddressMissing ? 'text-amber-500' : 'text-slate-400'} />
                    {profileInfo?.district && profileInfo?.province 
                      ? `${profileInfo.district}, ${profileInfo.province}`
                      : 'Chưa cập nhật khu vực'}
                  </span>
                </div>
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-2 w-full lg:w-auto flex-wrap sm:flex-nowrap">
              <button
                onClick={() => setProfileModalOpen(true)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Settings size={13} />
                <span>Hồ Sơ Gia Đình</span>
              </button>

              <Link
                to="/client/children"
                className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
              >
                <Plus size={13} className="text-indigo-600" />
                <span>Thêm Con ({students.length})</span>
              </Link>

              <Link
                to="/client/request-tutor"
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <Plus size={13} />
                <span>Tìm Gia Sư Mới</span>
              </Link>
            </div>
          </div>

          {/* 4 Clean Metric Counters */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100">
            <div 
              onClick={() => setActiveMainTab('STUDENTS')}
              className="p-3 bg-white hover:bg-slate-50/80 rounded-lg border border-slate-200/70 hover:border-indigo-300 transition-all cursor-pointer flex items-center gap-3 group"
            >
              <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600 flex items-center justify-center font-semibold shrink-0 transition-colors">
                <GraduationCap size={18} />
              </div>
              <div>
                <div className="text-lg font-bold text-slate-800 leading-none">
                  {parentStats?.studentsCount ?? students.length}
                </div>
                <div className="text-xs font-medium text-slate-500 mt-1">Con cái quản lý</div>
              </div>
            </div>

            <div 
              onClick={() => setActiveMainTab('REQUESTS')}
              className="p-3 bg-white hover:bg-slate-50/80 rounded-lg border border-slate-200/70 hover:border-indigo-300 transition-all cursor-pointer flex items-center gap-3 group"
            >
              <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600 flex items-center justify-center font-semibold shrink-0 transition-colors">
                <ClipboardList size={18} />
              </div>
              <div>
                <div className="text-lg font-bold text-slate-800 leading-none">
                  {parentStats?.requestsCount ?? tutorRequests.length}
                </div>
                <div className="text-xs font-medium text-slate-500 mt-1">Yêu cầu tìm kiếm</div>
              </div>
            </div>

            <div 
              onClick={() => { setActiveMainTab('CLASSES'); setClassStatusFilter('TEACHING'); }}
              className="p-3 bg-white hover:bg-slate-50/80 rounded-lg border border-slate-200/70 hover:border-indigo-300 transition-all cursor-pointer flex items-center gap-3 group"
            >
              <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-emerald-50 group-hover:text-emerald-600 flex items-center justify-center font-semibold shrink-0 transition-colors">
                <BookOpen size={18} />
              </div>
              <div>
                <div className="text-lg font-bold text-slate-800 leading-none">
                  {parentStats?.activeClassesCount ?? classes.filter(c => c.status === 'TEACHING').length}
                </div>
                <div className="text-xs font-medium text-slate-500 mt-1">Lớp chính thức</div>
              </div>
            </div>

            <div 
              onClick={() => { setActiveMainTab('CLASSES'); setClassStatusFilter('TRIAL'); }}
              className="p-3 bg-white hover:bg-slate-50/80 rounded-lg border border-slate-200/70 hover:border-indigo-300 transition-all cursor-pointer flex items-center gap-3 group"
            >
              <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-amber-50 group-hover:text-amber-600 flex items-center justify-center font-semibold shrink-0 transition-colors">
                <UserCheck size={18} />
              </div>
              <div>
                <div className="text-lg font-bold text-slate-800 leading-none">
                  {parentStats?.trialClassesCount ?? classes.filter(c => c.status === 'TRIAL').length}
                </div>
                <div className="text-xs font-medium text-slate-500 mt-1">Lớp dạy thử</div>
              </div>
            </div>
          </div>
        </div>

        {/* Missing Address Banner */}
        {isAddressMissing && (
          <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="text-amber-600 shrink-0" size={17} />
              <div className="text-amber-900">
                <span className="font-semibold">Chưa hoàn thiện địa chỉ nơi ở: </span>
                <span className="text-amber-800">Cập nhật khu vực để hệ thống ưu tiên gợi ý các gia sư ở gần nhà nhất.</span>
              </div>
            </div>
            <button
              onClick={() => setProfileModalOpen(true)}
              className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-md font-medium shrink-0 transition-colors cursor-pointer"
            >
              Cập nhật ngay
            </button>
          </div>
        )}

        {/* 2. Segmented Navigation Controls */}
        <div className="space-y-3">
          
          {/* Main 4 Function Tabs (Modern Segmented Controls) */}
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="bg-slate-200/60 p-1 rounded-xl inline-flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
              <button
                onClick={() => { setActiveMainTab('CLASSES'); setCurrentPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeMainTab === 'CLASSES'
                    ? 'bg-white text-slate-800 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookOpen size={14} />
                <span>Lớp Học ({classes.length})</span>
              </button>

              <button
                onClick={() => { setActiveMainTab('REQUESTS'); setCurrentPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeMainTab === 'REQUESTS'
                    ? 'bg-white text-slate-800 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ClipboardList size={14} />
                <span>Yêu Cầu Gia Sư ({tutorRequests.length})</span>
              </button>

              <button
                onClick={() => { setActiveMainTab('STUDENTS'); setCurrentPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeMainTab === 'STUDENTS'
                    ? 'bg-white text-slate-800 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users size={14} />
                <span>Hồ Sơ Con ({students.length})</span>
              </button>

              <button
                onClick={() => { setActiveMainTab('WARRANTY'); setCurrentPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeMainTab === 'WARRANTY'
                    ? 'bg-white text-slate-800 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck size={14} />
                <span>Bảo Hành 30 Ngày</span>
              </button>
            </div>

            {/* Quick Links */}
            <div className="flex items-center gap-2 text-xs">
              <Link
                to="/client/attendance"
                className="px-2.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-600 rounded-lg transition-colors flex items-center gap-1 font-medium shadow-2xs"
              >
                <UserCheck size={13} />
                <span>Duyệt Điểm Danh</span>
              </Link>
              <Link
                to="/client/leaves"
                className="px-2.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-600 rounded-lg transition-colors flex items-center gap-1 font-medium shadow-2xs"
              >
                <Calendar size={13} />
                <span>Báo Nghỉ</span>
              </Link>
            </div>
          </div>

          {/* Search Bar & Multidimensional Filters */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-3 shadow-2xs">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
            {/* Search Input */}
            <div className="sm:col-span-6 relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Search size={14} />
              </span>
              <input
                type="text"
                placeholder="Tìm kiếm theo tên con, môn học, tên gia sư..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full pl-9 pr-8 py-1.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Child Filter Dropdown */}
            <div className="sm:col-span-3">
              <select
                value={selectedStudentFilter}
                onChange={(e) => { setSelectedStudentFilter(e.target.value); setCurrentPage(1); }}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">Tất cả con cái ({students.length})</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    Con: {s.fullName} ({s.grade || 'Khối lớp'})
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
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-indigo-500"
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
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-indigo-500"
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
                  className="w-full py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium rounded-lg text-xs flex items-center justify-center gap-1 transition-colors"
                >
                  <Plus size={13} /> Thêm Hồ Sơ Con Mới
                </Link>
              )}

              {activeMainTab === 'WARRANTY' && (
                <div className="text-xs text-emerald-700 font-medium flex items-center justify-end gap-1 py-1">
                  <ShieldCheck size={14} /> Bảo hiểm 30 ngày kích hoạt
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

        {/* 3. Main Workspace Display Area */}
        <div className="space-y-4">
          
          {/* TAB 1: DANH SÁCH LỚP HỌC (CLASSES) */}
          {activeMainTab === 'CLASSES' && (
            <div className="space-y-4">
              {loading ? (
                <div className="bg-white rounded-xl p-12 text-center text-xs text-slate-400 flex flex-col items-center gap-2 border border-slate-200/80">
                  <RefreshCw size={20} className="animate-spin text-indigo-600" />
                  <span>Đang tải danh sách lớp học...</span>
                </div>
              ) : filteredClasses.length === 0 ? (
                <div className="bg-white rounded-xl p-10 text-center border border-slate-200/80 space-y-2.5">
                  <BookOpen size={36} className="mx-auto text-slate-300" />
                  <h4 className="font-semibold text-sm text-slate-700">Không tìm thấy lớp học phù hợp</h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    {searchQuery || selectedStudentFilter !== 'ALL' || classStatusFilter !== 'ALL'
                      ? 'Không có kết quả khớp với bộ lọc hiện tại. Thử chọn lại bộ lọc hoặc từ khóa tìm kiếm.'
                      : 'Gia đình bạn hiện chưa có lớp học nào đang diễn ra. Hãy tạo yêu cầu tìm gia sư ngay.'}
                  </p>
                  <div className="pt-2">
                    <Link
                      to="/client/request-tutor"
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-colors inline-flex items-center gap-1.5"
                    >
                      <Plus size={13} /> Tạo Yêu Cầu Tìm Gia Sư
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {paginatedClasses.map((cls) => {
                      const isTeaching = cls.status === 'TEACHING';
                      const isTrial = cls.status === 'TRIAL';
                      const remaining = cls.remainingSessions ?? 0;
                      const totalEstimated = 8;
                      const progressPct = Math.min(100, Math.round(((totalEstimated - remaining) / totalEstimated) * 100));

                      return (
                        <div
                          key={cls.id}
                          className="bg-white rounded-xl p-4 sm:p-4.5 border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col justify-between space-y-3.5 group shadow-2xs"
                        >
                          {/* Card Header: Student & Subject */}
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="text-[11px] font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md inline-block">
                                  Học sinh: {cls.student?.fullName || 'Học viên'}
                                </span>
                                <h3 className="font-semibold text-sm text-slate-800 mt-1">
                                  {cls.tutorRequest?.subject || 'Lớp Kèm Học'}
                                </h3>
                                <div className="text-xs text-slate-400">
                                  Khối lớp: {cls.student?.grade || cls.tutorRequest?.grade || 'Chưa cập nhật'}
                                </div>
                              </div>

                              <span
                                className={`px-2 py-0.5 text-[11px] font-medium rounded-full shrink-0 ${
                                  isTeaching
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                                    : isTrial
                                    ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                                }`}
                              >
                                {isTeaching ? 'Chính thức' : isTrial ? 'Dạy thử' : cls.status}
                              </span>
                            </div>

                            {/* Tutor Info Preview */}
                            <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-semibold text-xs shrink-0">
                                  {cls.tutor?.fullName ? cls.tutor.fullName.slice(0, 2).toUpperCase() : 'GS'}
                                </div>
                                <div>
                                  <div className="font-medium text-slate-700 truncate max-w-[130px]">
                                    {cls.tutor?.fullName || 'Chờ điều phối'}
                                  </div>
                                  <div className="text-[10px] text-slate-400">Gia sư phụ trách</div>
                                </div>
                              </div>

                              {cls.tutor?.ratingAvg && (
                                <span className="flex items-center gap-1 font-semibold text-amber-600 bg-white px-1.5 py-0.5 rounded border border-slate-200/60 text-[11px]">
                                  <Star size={11} fill="#d97706" className="text-amber-600" /> {Number(cls.tutor.ratingAvg).toFixed(1)}
                                </span>
                              )}
                            </div>

                            {/* Progress & Sessions */}
                            <div className="space-y-1 pt-0.5">
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-500">Số buổi còn lại:</span>
                                <strong className="text-indigo-600 font-semibold">{remaining} buổi</strong>
                              </div>
                              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div 
                                  className="bg-indigo-600 h-full rounded-full transition-all"
                                  style={{ width: `${Math.max(12, progressPct)}%` }}
                                />
                              </div>
                              <div className="flex justify-between items-center text-[11px] text-slate-400">
                                <span>{parseInt(cls.hourlyRate).toLocaleString()} đ/buổi</span>
                                <span>{cls._count?.sessions || 0} buổi đã dạy</span>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="space-y-1.5 pt-2 border-t border-slate-100">
                            <button
                              onClick={() => openClassJournal(cls)}
                              className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <BookOpen size={13} />
                              <span>Sổ Nhật Ký Buổi Học ({cls._count?.sessions || 0})</span>
                            </button>

                            <div className="grid grid-cols-2 gap-1.5">
                              <Link
                                to="/client/leaves"
                                className="py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-md transition-colors text-center flex items-center justify-center gap-1"
                              >
                                <Calendar size={12} />
                                <span>Báo nghỉ</span>
                              </Link>

                              {isTeaching && (
                                <button
                                  onClick={() => setWarrantyModalClass(cls)}
                                  className="py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/60 text-xs font-medium rounded-md transition-colors text-center flex items-center justify-center gap-1 cursor-pointer"
                                  title="Đổi gia sư miễn phí và bảo lưu số buổi trong 30 ngày"
                                >
                                  <ShieldCheck size={12} />
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
                    <div className="bg-white rounded-lg p-3 border border-slate-200/80 flex items-center justify-between text-xs">
                      <span className="text-slate-500">
                        Hiển thị {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredClasses.length)} trong {filteredClasses.length} lớp học
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="p-1 rounded border border-slate-200 disabled:opacity-30 hover:bg-slate-100 cursor-pointer"
                        >
                          <ChevronLeft size={15} />
                        </button>
                        <span className="px-2.5 py-0.5 font-medium text-slate-700">
                          {currentPage} / {totalPages}
                        </span>
                        <button
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          className="p-1 rounded border border-slate-200 disabled:opacity-30 hover:bg-slate-100 cursor-pointer"
                        >
                          <ChevronRight size={15} />
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
            <div className="space-y-3.5">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">Tiến Trình Tìm Gia Sư</h3>
                  <p className="text-xs text-slate-400">Theo dõi hồ sơ gia sư ứng tuyển và duyệt lịch dạy thử</p>
                </div>
                <Link
                  to="/client/requests"
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  <span>Xem chi tiết danh sách</span>
                  <ArrowRight size={12} />
                </Link>
              </div>

              {filteredRequests.length === 0 ? (
                <div className="bg-white rounded-xl p-10 text-center border border-slate-200/80 space-y-2">
                  <ClipboardList size={34} className="mx-auto text-slate-300" />
                  <h4 className="font-semibold text-sm text-slate-700">Không có yêu cầu nào</h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Bạn chưa có yêu cầu tìm kiếm gia sư nào hoặc bộ lọc hiện tại không khớp kết quả.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {filteredRequests.map((req) => {
                    const candidateCount = req._count?.classApplications || req.classApplications?.length || 0;
                    return (
                      <div
                        key={req.id}
                        className="bg-white rounded-xl p-4 border border-slate-200/80 transition-all flex flex-col justify-between space-y-3 shadow-2xs"
                      >
                        <div className="space-y-2">
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <span className="text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-full">
                                {req.status === 'PUBLISHED' ? 'Đang tuyển gia sư' : req.status === 'CONSULTING' ? 'Chờ duyệt hồ sơ' : req.status === 'MATCHED' ? 'Đã khớp lớp' : req.status}
                              </span>
                              <h4 className="font-semibold text-sm text-slate-800 mt-1.5">
                                Môn {req.subject} ({req.grade})
                              </h4>
                              <p className="text-xs text-slate-500">
                                Học sinh: <strong className="text-slate-700 font-medium">{req.student?.fullName}</strong> • {req.sessionsPerWeek} buổi/tuần
                              </p>
                            </div>
                            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded shrink-0">
                              {parseInt(req.budgetPerSession).toLocaleString()} đ/buổi
                            </span>
                          </div>

                          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-600 space-y-1">
                            <div>📅 Ca rảnh: {req.scheduleNotes || 'Linh hoạt thỏa thuận'}</div>
                            <div>📍 Hình thức: {req.learningMode === 'ONLINE' ? 'Trực tuyến' : req.address || 'Tại nhà'}</div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                          <span className="text-indigo-600 font-medium flex items-center gap-1">
                            <Users size={13} /> {candidateCount} gia sư đã ứng tuyển
                          </span>
                          <Link
                            to="/client/requests"
                            className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium rounded-md transition-colors flex items-center gap-1"
                          >
                            <span>Xem ứng viên</span>
                            <ArrowRight size={12} />
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
            <div className="space-y-3.5">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">Danh Sách Con Cái</h3>
                  <p className="text-xs text-slate-400">Quản lý mục tiêu điểm số và các lớp kèm của từng con</p>
                </div>
                <Link
                  to="/client/children"
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
                >
                  <Plus size={13} /> Thêm Hồ Sơ Con
                </Link>
              </div>

              {students.length === 0 ? (
                <div className="bg-white rounded-xl p-10 text-center border border-slate-200/80 space-y-2">
                  <GraduationCap size={36} className="mx-auto text-slate-300" />
                  <h4 className="font-semibold text-sm text-slate-700">Chưa có hồ sơ học sinh nào</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Thêm thông tin con cái để bắt đầu đăng ký tìm kiếm gia sư dạy kèm phù hợp nhất.
                  </p>
                  <Link
                    to="/client/children"
                    className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg"
                  >
                    <Plus size={13} /> Thêm Con Ngay
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {students.map((stu) => {
                    const studentClasses = classes.filter((c) => c.studentId === stu.id);
                    return (
                      <div
                        key={stu.id}
                        className="bg-white rounded-xl p-4 border border-slate-200/80 space-y-3 flex flex-col justify-between shadow-2xs"
                      >
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold text-sm text-slate-800">{stu.fullName}</h4>
                              <p className="text-xs text-slate-400">
                                {stu.school || 'Trường chưa cập nhật'} • {stu.grade || 'Khối lớp'}
                              </p>
                            </div>
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-medium">
                              {stu.gender === 'MALE' ? 'Nam' : 'Nữ'}
                            </span>
                          </div>

                          <div className="p-2.5 bg-slate-50 rounded-lg text-xs space-y-1 text-slate-600">
                            {stu.learningStyle && (
                              <div>📚 Bộ sách: <strong className="text-slate-700 font-medium">{stu.learningStyle}</strong></div>
                            )}
                            {stu.personalityTraits && (
                              <div>🌱 Tính cách: <strong className="text-slate-700 font-medium">{stu.personalityTraits}</strong></div>
                            )}
                            <div>💡 Học lực: <strong className="text-slate-700 font-medium">{stu.academicLevel === 'EXCELLENT' ? 'Giỏi / Xuất sắc' : stu.academicLevel === 'GOOD' ? 'Khá' : stu.academicLevel === 'WEAK' ? 'Yếu / Mất gốc' : 'Trung bình'}</strong></div>
                            {stu.subjectsNeeded && (
                              <div>📝 Môn cần kèm: <strong className="text-slate-700 font-medium">{stu.subjectsNeeded}</strong></div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-slate-100">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-500">Số lớp đang học:</span>
                            <span className="font-semibold text-indigo-600">{studentClasses.length} lớp</span>
                          </div>

                          <Link
                            to={`/client/request-tutor?studentId=${stu.id}`}
                            className="w-full py-1.5 bg-slate-50 hover:bg-indigo-50 text-indigo-600 border border-indigo-100 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1"
                          >
                            <Plus size={13} /> Tìm Gia Sư Cho Bé
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
            <div className="space-y-4">
              <div className="p-4.5 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-1.5">
                <div className="flex items-center gap-1.5 text-indigo-700 font-semibold text-xs">
                  <ShieldCheck size={16} />
                  <span>CHÍNH SÁCH BẢO HÀNH 30 NGÀY & ĐỔI GIA SƯ MIỄN PHÍ</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Trong vòng 30 ngày kể từ buổi học đầu tiên, nếu gia đình cảm thấy phương pháp chưa phù hợp hoặc học sinh chưa tiến bộ, phụ huynh có thể yêu cầu đổi gia sư mới hoàn toàn miễn phí. Toàn bộ số buổi học còn lại sẽ được <strong>bảo lưu 100%</strong> sang gia sư thay thế.
                </p>
              </div>

              <div className="bg-white rounded-xl p-4 border border-slate-200/80 space-y-3 shadow-2xs">
                <h4 className="font-semibold text-xs uppercase tracking-wider text-slate-500">Các Lớp Đang Được Bảo Hành</h4>

                {classes.filter(c => c.status === 'TEACHING').length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">
                    Chưa có lớp học chính thức nào đang kích hoạt bảo hành.
                  </p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {classes.filter(c => c.status === 'TEACHING').map((cls) => (
                      <div key={cls.id} className="py-2.5 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                        <div>
                          <div className="font-medium text-xs text-slate-800">
                            Môn {cls.tutorRequest?.subject} - Con: {cls.student?.fullName}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            Gia sư: <strong className="text-slate-600 font-medium">{cls.tutor?.fullName || 'Chưa rõ'}</strong> • Số buổi bảo lưu: <strong className="text-indigo-600 font-semibold">{cls.remainingSessions ?? 0} buổi</strong>
                          </div>
                        </div>

                        <button
                          onClick={() => setWarrantyModalClass(cls)}
                          className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/60 text-xs font-medium rounded-md transition-colors flex items-center gap-1 self-start sm:self-auto cursor-pointer"
                        >
                          <ShieldCheck size={13} />
                          <span>Yêu Cầu Đổi Gia Sư</span>
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
          <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white rounded-xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-xl overflow-hidden border border-slate-200">
              <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Settings size={16} />
                  <h3 className="font-semibold text-sm">Cập Nhật Hồ Sơ Gia Đình & Nơi Ở</h3>
                </div>
                <button
                  onClick={() => setProfileModalOpen(false)}
                  className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              <form onSubmit={handleUpdateProfile} className="p-4.5 overflow-y-auto space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Họ và Tên Phụ Huynh *</label>
                  <input
                    type="text"
                    required
                    value={profForm.fullName}
                    onChange={(e) => setProfForm({ ...profForm, fullName: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Kênh Liên Hệ Ưu Tiên</label>
                    <select
                      value={profForm.preferredContactMethod}
                      onChange={(e) => setProfForm({ ...profForm, preferredContactMethod: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-indigo-600"
                    >
                      <option value="CALL">Gọi điện thoại trực tiếp</option>
                      <option value="ZALO">Nhắn tin Zalo</option>
                      <option value="EMAIL">Gửi Email</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Khung Giờ Nhận Cuộc Gọi</label>
                    <select
                      value={profForm.contactTimePref}
                      onChange={(e) => setProfForm({ ...profForm, contactTimePref: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-indigo-600"
                    >
                      <option value="ANYTIME">Linh hoạt mọi lúc</option>
                      <option value="MORNING">Buổi sáng (8h - 11h30)</option>
                      <option value="AFTERNOON">Buổi chiều (14h - 17h)</option>
                      <option value="EVENING">Buổi tối (Sau 18h)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Nghề Nghiệp / Cơ Quan</label>
                  <input
                    type="text"
                    placeholder="Bác sĩ, Giáo viên, Kinh doanh..."
                    value={profForm.occupation}
                    onChange={(e) => setProfForm({ ...profForm, occupation: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Địa Chỉ Chi Tiết (Số nhà, Tên đường) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Tòa R2 Chung cư Royal City, 72 Nguyễn Trãi"
                    value={profForm.address}
                    onChange={(e) => setProfForm({ ...profForm, address: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Quận / Huyện *</label>
                    <input
                      type="text"
                      required
                      placeholder="Cầu Giấy, Thanh Xuân..."
                      value={profForm.district}
                      onChange={(e) => setProfForm({ ...profForm, district: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Tỉnh / Thành Phố *</label>
                    <input
                      type="text"
                      required
                      placeholder="Hà Nội, TP.HCM..."
                      value={profForm.province}
                      onChange={(e) => setProfForm({ ...profForm, province: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Lưu Ý Điều Kiện Gia Đình</label>
                  <textarea
                    rows={2}
                    placeholder="Chung cư quẹt thẻ tầng hầm, nhà có chó dữ, cần gia sư kiên nhẫn..."
                    value={profForm.familyNotes}
                    onChange={(e) => setProfForm({ ...profForm, familyNotes: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-indigo-600 resize-none"
                  />
                </div>

                <div className="flex items-center gap-2.5 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setProfileModalOpen(false)}
                    className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium rounded-lg transition-colors cursor-pointer"
                  >
                    Hủy Bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-2xs transition-colors cursor-pointer"
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
          <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-xl overflow-hidden border border-slate-200">
              <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
                <div>
                  <div className="text-[11px] font-medium text-slate-400">Sổ Nhật Ký Học Tập</div>
                  <h3 className="font-semibold text-sm text-white mt-0.5">
                    Học sinh: {selectedClassForJournal.student?.fullName} • Môn: {selectedClassForJournal.tutorRequest?.subject}
                  </h3>
                  <div className="text-xs text-slate-300">
                    Gia sư: <strong>{selectedClassForJournal.tutor?.fullName || 'Chưa rõ'}</strong> • Học phí: {parseInt(selectedClassForJournal.hourlyRate).toLocaleString()} đ/buổi
                  </div>
                </div>
                <button
                  onClick={() => setSelectedClassForJournal(null)}
                  className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="p-4 overflow-y-auto space-y-3.5 text-xs">
                {/* Session Filter Tabs */}
                <div className="flex gap-1.5 border-b border-slate-100 pb-2.5">
                  {(['ALL', 'ATTENDED', 'CONFIRMED', 'SCHEDULED'] as const).map((tab) => {
                    const count = tab === 'ALL' ? sessions.length : sessions.filter((s) => s.status === tab).length;
                    const labels = { ALL: 'Tất cả', ATTENDED: 'Chờ duyệt', CONFIRMED: 'Đã hoàn thành', SCHEDULED: 'Lịch sắp tới' };
                    return (
                      <button
                        key={tab}
                        onClick={() => setSessionTab(tab)}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                          sessionTab === tab ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {labels[tab]} ({count})
                      </button>
                    );
                  })}
                </div>

                {sessionsLoading ? (
                  <div className="py-10 text-center text-slate-400 flex flex-col items-center gap-2">
                    <RefreshCw size={20} className="animate-spin text-indigo-600" />
                    <span>Đang tải các buổi học...</span>
                  </div>
                ) : sessions.length === 0 ? (
                  <div className="p-6 text-center bg-slate-50 rounded-lg border border-slate-200 text-slate-500">
                    Chưa có buổi học nào được ghi nhận cho lớp này.
                  </div>
                ) : (
                  <div className="space-y-2.5">
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
                            className={`p-3 rounded-lg border transition-all ${
                              isAttended
                                ? 'bg-amber-50/50 border-amber-200'
                                : isConfirmed
                                ? 'bg-white border-slate-200/80'
                                : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1.5">
                              <div>
                                <h5 className="font-semibold text-xs text-slate-800">
                                  Buổi #{sessions.length - idx} • {schedDate.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
                                </h5>
                                <p className="text-[11px] text-slate-400 mt-0.5">
                                  Giờ dạy: {schedDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>

                              <div className="flex items-center gap-1.5">
                                {isAttended && (
                                  <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-[11px] font-medium">
                                    Chờ bạn duyệt
                                  </span>
                                )}
                                {isConfirmed && (
                                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[11px] font-medium">
                                    Đã hoàn thành
                                  </span>
                                )}
                                {isDisputed && (
                                  <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded text-[11px] font-medium">
                                    Đang khiếu nại
                                  </span>
                                )}
                              </div>
                            </div>

                            {session.tutorNotes && (
                              <div className="mt-2 p-2 bg-slate-50 rounded border border-slate-100 text-xs text-slate-600">
                                <strong className="text-slate-800">Nhận xét gia sư: </strong>
                                <span>{session.tutorNotes}</span>
                              </div>
                            )}

                            {isAttended && (
                              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                                <button
                                  onClick={() => setDisputingSession(session)}
                                  className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-medium rounded transition-colors cursor-pointer"
                                >
                                  Khiếu Nại
                                </button>
                                <button
                                  onClick={() => setReviewingSession(session)}
                                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded transition-colors cursor-pointer"
                                >
                                  Duyệt & Đánh Giá
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
          <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white rounded-xl max-w-lg w-full shadow-xl overflow-hidden border border-slate-200">
              <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} />
                  <h3 className="font-semibold text-sm">Kích Hoạt Bảo Hành Đổi Gia Sư 30 Ngày</h3>
                </div>
                <button
                  onClick={() => setWarrantyModalClass(null)}
                  className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              <form onSubmit={handleWarrantySubmit} className="p-4.5 space-y-3.5 text-xs">
                <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-200/80 space-y-1">
                  <div className="font-medium text-amber-900">Quyền lợi bảo lưu 100% số buổi:</div>
                  <div className="text-amber-800">
                    Lớp: <strong>{warrantyModalClass.tutorRequest?.subject}</strong> (Con: {warrantyModalClass.student?.fullName}).
                  </div>
                  <div className="text-amber-800">
                    Số buổi còn lại được bảo lưu trọn vẹn: <strong className="text-indigo-600 font-semibold">{warrantyModalClass.remainingSessions ?? 0} buổi</strong>.
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Lý Do Đổi Gia Sư *</label>
                  <select
                    value={warrantyReason}
                    onChange={(e) => setWarrantyReason(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-indigo-600"
                  >
                    <option value="Phương pháp giảng dạy chưa phù hợp với lực học của con">Phương pháp giảng dạy chưa phù hợp với lực học của con</option>
                    <option value="Gia sư thường xuyên đổi lịch hoặc đến muộn">Gia sư thường xuyên đổi lịch hoặc đến muộn</option>
                    <option value="Học sinh không hòa hợp tâm lý với gia sư">Học sinh không hòa hợp tâm lý với gia sư</option>
                    <option value="Cần đổi sang giáo viên có chuyên môn sâu hơn">Cần đổi sang giáo viên có chuyên môn sâu hơn</option>
                    <option value="Lý do khác">Lý do khác</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Ghi Chú Thêm Cho Trung Tâm</label>
                  <textarea
                    rows={3}
                    placeholder="Mô tả cụ thể mong muốn về gia sư mới..."
                    value={warrantyNotes}
                    onChange={(e) => setWarrantyNotes(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-indigo-600 resize-none"
                  />
                </div>

                <div className="flex items-center gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setWarrantyModalClass(null)}
                    className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium rounded-lg transition-colors cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={warrantySubmitting}
                    className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg transition-colors cursor-pointer"
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
          <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white rounded-xl max-w-sm w-full shadow-xl overflow-hidden border border-slate-200">
              <div className="p-3.5 bg-slate-900 text-white flex justify-between items-center">
                <h4 className="font-semibold text-xs">Xác Nhận & Đánh Giá Buổi Học</h4>
                <button onClick={() => setReviewingSession(null)} className="cursor-pointer">
                  <X size={15} />
                </button>
              </div>

              <form onSubmit={handleConfirmSessionSubmit} className="p-4 space-y-3.5 text-xs">
                <div className="text-center space-y-1.5">
                  <label className="block text-slate-700 font-medium">Mức độ hài lòng:</label>
                  <div className="flex justify-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => setRatingScore(s)}
                        className="p-1 cursor-pointer transition-transform hover:scale-110"
                      >
                        <Star size={20} fill={s <= ratingScore ? '#f59e0b' : 'none'} className={s <= ratingScore ? 'text-amber-500' : 'text-slate-300'} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Lời Nhận Xét / Góp Ý</label>
                  <textarea
                    rows={3}
                    placeholder="Gia sư dạy nhiệt tình, con hiểu bài..."
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-indigo-600 resize-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setReviewingSession(null)}
                    className="flex-1 py-1.5 bg-slate-100 text-slate-600 font-medium rounded-lg cursor-pointer"
                  >
                    Đóng
                  </button>
                  <button
                    type="submit"
                    disabled={reviewSubmitting}
                    className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg cursor-pointer"
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
          <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white rounded-xl max-w-sm w-full shadow-xl overflow-hidden border border-slate-200">
              <div className="p-3.5 bg-rose-600 text-white flex justify-between items-center">
                <h4 className="font-semibold text-xs">Gửi Khiếu Nại Buổi Học</h4>
                <button onClick={() => setDisputingSession(null)} className="cursor-pointer">
                  <X size={15} />
                </button>
              </div>

              <form onSubmit={handleDisputeSessionSubmit} className="p-4 space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Lý Do Khiếu Nại *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Gia sư không đến dạy, về sớm hơn giờ quy định, không làm bài tập..."
                    value={disputeReasonText}
                    onChange={(e) => setDisputeReasonText(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-rose-600 resize-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setDisputingSession(null)}
                    className="flex-1 py-1.5 bg-slate-100 text-slate-600 font-medium rounded-lg cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={disputeSubmitting}
                    className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg cursor-pointer"
                  >
                    {disputeSubmitting ? 'Đang gửi...' : 'Gửi Khiếu Nại'}
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
