import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, UserCheck, Plus, MapPin, Edit3, AlertTriangle, GraduationCap, 
  Search, Star, ArrowRight, ClipboardList, Clock, BookOpen, CheckCircle2, 
  MessageSquare, Check, X, RefreshCw, Phone, Mail, Briefcase, MessageCircle, FileText 
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import PageTemplate from '../../components/PageTemplate';

export default function ClientPortal() {
  const { activeProfile } = useAuth();
  const isParent = activeProfile?.type === 'PARENT' && !activeProfile?.subType;

  const [classes, setClasses] = useState<any[]>([]);
  const [tutorRequests, setTutorRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileInfo, setProfileInfo] = useState<any>(null);
  const [parentStats, setParentStats] = useState<any>(null);
  const [editingProfile, setEditingProfile] = useState(false);
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

  // Learning Journal & Session detail state
  const [selectedClassForJournal, setSelectedClassForJournal] = useState<any | null>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionTab, setSessionTab] = useState<'ALL' | 'ATTENDED' | 'CONFIRMED' | 'SCHEDULED'>('ALL');
  
  // Rating/Confirm form modal
  const [reviewingSession, setReviewingSession] = useState<any | null>(null);
  const [ratingScore, setRatingScore] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // Dispute modal
  const [disputingSession, setDisputingSession] = useState<any | null>(null);
  const [disputeReasonText, setDisputeReasonText] = useState('');
  const [disputeSubmitting, setDisputeSubmitting] = useState(false);

  const fetchWalletAndClasses = async () => {
    setLoading(true);
    try {
      if (isParent) {
        const [profRes, statsRes, clsRes, reqsRes] = await Promise.allSettled([
          api.get('/api/v1/crm/parent/profile'),
          api.get('/api/v1/crm/parent/stats'),
          api.get('/api/v1/crm/parent/classes'),
          api.get('/api/v1/tutor-requests/my'),
        ]);
        
        if (clsRes.status === 'fulfilled') setClasses(clsRes.value.data || []);
        if (profRes.status === 'fulfilled') {
          setProfileInfo(profRes.value.data);
          setProfForm({
            fullName: profRes.value.data?.fullName || '',
            address: profRes.value.data?.address || '',
            district: profRes.value.data?.district || '',
            province: profRes.value.data?.province || '',
            occupation: profRes.value.data?.occupation || '',
            contactTimePref: profRes.value.data?.contactTimePref || 'ANYTIME',
            preferredContactMethod: profRes.value.data?.preferredContactMethod || 'CALL',
            familyNotes: profRes.value.data?.familyNotes || '',
          });
        }
        if (statsRes.status === 'fulfilled') setParentStats(statsRes.value.data);
        if (reqsRes.status === 'fulfilled') setTutorRequests(reqsRes.value.data || []);
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
        occupation: profForm.occupation,
        contactTimePref: profForm.contactTimePref,
        preferredContactMethod: profForm.preferredContactMethod,
        familyNotes: profForm.familyNotes,
      };
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

  const openClassJournal = async (cls: any) => {
    setSelectedClassForJournal(cls);
    setSessionsLoading(true);
    try {
      const res = await api.get(`/api/v1/sessions?classId=${cls.id}`);
      setSessions(res.data || []);
    } catch (err) {
      console.error('Lỗi tải danh sách buổi học', err);
    } finally {
      setSessionsLoading(false);
    }
  };

  const handleConfirmSessionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingSession) return;
    setReviewSubmitting(true);
    try {
      const res = await api.post(`/api/v1/sessions/${reviewingSession.id}/confirm`, {
        rating: ratingScore,
        feedback: feedbackText,
      });
      alert(res.data.message || 'Xác nhận buổi học thành công!');
      setReviewingSession(null);
      setFeedbackText('');
      setRatingScore(5);
      if (selectedClassForJournal) {
        openClassJournal(selectedClassForJournal);
      }
      fetchWalletAndClasses();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Xác nhận buổi học thất bại');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleDisputeSessionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputingSession || !disputeReasonText.trim()) return;
    setDisputeSubmitting(true);
    try {
      const res = await api.post(`/api/v1/sessions/${disputingSession.id}/dispute`, {
        reason: disputeReasonText,
      });
      alert(res.data.message || 'Đã gửi khiếu nại buổi học thành công!');
      setDisputingSession(null);
      setDisputeReasonText('');
      if (selectedClassForJournal) {
        openClassJournal(selectedClassForJournal);
      }
      fetchWalletAndClasses();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gửi khiếu nại thất bại');
    } finally {
      setDisputeSubmitting(false);
    }
  };

  useEffect(() => {
    fetchWalletAndClasses();
  }, []);

  return (
    <PageTemplate
      title="Tổng Quan & Quản Lý Gia Đình"
      subtitle="Theo dõi lớp học, nhật ký buổi học, đánh giá dạy thử và yêu cầu tìm gia sư"
      badge="Client Portal"
    >
      <div className="w-full space-y-6 text-left font-sans text-[#566a7f]">
        {/* Navigation Action Buttons Header */}
        {isParent && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#71dd37]"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-[#a1acb8]">Thao tác nhanh</span>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <Link
                to="/client/children"
                className="px-3.5 py-1.5 bg-[#f5f5f9] hover:bg-[#696cff]/10 text-[#697a8d] hover:text-[#696cff] text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
              >
                <GraduationCap size={14} /> Quản lý Con cái
              </Link>
              <Link
                to="/client/requests"
                className="px-3.5 py-1.5 bg-[#f5f5f9] hover:bg-[#696cff]/10 text-[#697a8d] hover:text-[#696cff] text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
              >
                <ClipboardList size={14} /> Yêu cầu gia sư {tutorRequests.length > 0 && `(${tutorRequests.length})`}
              </Link>
              <Link
                to="/client/leaves"
                className="px-3.5 py-1.5 bg-[#f5f5f9] hover:bg-[#696cff]/10 text-[#697a8d] hover:text-[#696cff] text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Calendar size={14} /> Báo Nghỉ & Dời Lịch
              </Link>
              <Link
                to="/client/attendance"
                className="px-3.5 py-1.5 bg-[#f5f5f9] hover:bg-[#696cff]/10 text-[#697a8d] hover:text-[#696cff] text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
              >
                <UserCheck size={14} /> Đánh Giá Dạy Thử
              </Link>
              <Link
                to="/client/request-tutor"
                className="px-3.5 py-1.5 bg-[#696cff] hover:bg-[#5f61e6] text-white text-xs font-semibold rounded-lg shadow-[0_2px_4px_0_rgba(105,108,255,0.4)] transition-all flex items-center gap-1.5"
              >
                <Plus size={14} /> Đăng Ký Tìm Gia Sư
              </Link>
            </div>
          </div>
        )}

        {/* Alert Banner for Missing Address (Full Width) */}
        {isParent && profileInfo && (!profileInfo.address || !profileInfo.district || !profileInfo.province) && (
          <div className="bg-[#fff2ec] border border-[#ffbca9] rounded-xl p-4 flex items-start gap-3 shadow-sm animate-fadeIn">
            <AlertTriangle className="text-[#ff8359] shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="text-[#ff8359] font-bold text-sm">Bạn chưa hoàn thiện địa chỉ giao dịch</h4>
              <p className="text-[#697a8d] text-xs mt-1">Cập nhật ngay địa chỉ chi tiết để hệ thống dễ dàng gợi ý và ưu tiên các gia sư ở gần khu vực của bạn nhất.</p>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left Column: Core Value / Action */}
          <div className="flex-1 w-full space-y-6">
            {/* Metric Badges - Compact Bar */}
            {isParent && parentStats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-fadeIn">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#e7e7ff] text-[#696cff] flex items-center justify-center shrink-0">
                    <GraduationCap size={20} />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-[#566a7f] leading-none">{parentStats.studentsCount}</div>
                    <div className="text-[10px] uppercase text-[#697a8d] font-bold mt-1">Học sinh</div>
                  </div>
                </div>

                <Link
                  to="/client/requests"
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 flex items-center gap-3 hover:border-[#696cff]/40 transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-full bg-[#fff2ec] text-[#ff8359] group-hover:scale-105 transition-transform flex items-center justify-center shrink-0">
                    <Search size={20} />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-[#566a7f] leading-none">{parentStats.requestsCount}</div>
                    <div className="text-[10px] uppercase text-[#697a8d] font-bold mt-1">Yêu cầu tìm kiếm</div>
                  </div>
                </Link>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#e8fadf] text-[#71dd37] flex items-center justify-center shrink-0">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-[#566a7f] leading-none">{parentStats.activeClassesCount}</div>
                    <div className="text-[10px] uppercase text-[#697a8d] font-bold mt-1">Lớp chính thức</div>
                  </div>
                </div>

                <Link
                  to="/client/attendance"
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 flex items-center gap-3 hover:border-[#ffab00]/40 transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-full bg-[#fff8e1] text-[#ffab00] group-hover:scale-105 transition-transform flex items-center justify-center shrink-0">
                    <UserCheck size={20} />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-[#566a7f] leading-none">{parentStats.trialClassesCount}</div>
                    <div className="text-[10px] uppercase text-[#697a8d] font-bold mt-1">Lớp dạy thử</div>
                  </div>
                </Link>
              </div>
            )}

            {/* Quick Request Section */}
            {tutorRequests.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ffab00] animate-pulse"></span>
                    <h3 className="text-base font-bold text-[#566a7f]">
                      Yêu cầu tìm Gia sư đang xử lý ({tutorRequests.length})
                    </h3>
                  </div>
                  <Link
                    to="/client/requests"
                    className="text-xs font-bold text-[#696cff] hover:underline flex items-center gap-1"
                  >
                    Xem tất cả ({tutorRequests.length}) <ArrowRight size={13} />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {tutorRequests.slice(0, 4).map((req) => (
                    <div
                      key={req.id}
                      className="bg-[#f8f9fa] rounded-xl p-3.5 border border-gray-100 flex flex-col justify-between hover:border-[#696cff]/40 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#566a7f] text-sm">
                            {req.subject} ({req.grade})
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#fff2d6] text-[#ffab00]">
                            {req.status === 'PUBLISHED' ? 'Đang tuyển' : req.status === 'MATCHED' ? 'Đã khớp' : 'Đang xử lý'}
                          </span>
                        </div>
                        <p className="text-xs text-[#a1acb8]">
                          Bé: <strong className="text-[#566a7f] font-semibold">{req.student?.fullName}</strong> • {req.sessionsPerWeek} buổi/tuần
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-gray-200 flex items-center justify-between text-xs">
                        <span className="text-[11px] text-[#696cff] font-semibold">
                          {req._count?.classApplications || req.classApplications?.length || 0} gia sư ứng tuyển
                        </span>
                        <Link
                          to="/client/requests"
                          className="text-[11px] font-bold text-[#696cff] hover:underline"
                        >
                          Xem hồ sơ &gt;
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Classes List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <div>
                  <h3 className="text-lg font-bold text-[#566a7f]">Danh sách lớp học của gia đình</h3>
                  <p className="text-xs text-[#a1acb8] mt-0.5">Theo dõi lịch học, tiến độ và nhật ký nhận xét từng buổi học của gia sư</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#e7e7ff] text-[#696cff]">
                  {classes.length} lớp học
                </span>
              </div>

              {loading ? (
                <div className="text-center py-12 text-[#a1acb8] text-sm">Đang tải danh sách lớp học...</div>
              ) : classes.length === 0 ? (
                <div className="py-6 flex flex-col items-center justify-center animate-fadeIn text-center space-y-4">
                  <div className="w-16 h-16 bg-[#f5f5f9] rounded-full flex items-center justify-center text-[#696cff] mb-1 shadow-inner">
                    <Search size={32} strokeWidth={1.5} />
                  </div>
                  <div className="max-w-md">
                    <h4 className="text-lg font-bold text-[#566a7f] mb-1">Bạn chưa có lớp học nào!</h4>
                    <p className="text-sm text-[#a1acb8]">Hệ thống chưa ghi nhận lớp học nào đang hoạt động. Hãy hoàn thành 2 bước dưới đây để bắt đầu tìm kiếm gia sư phù hợp nhất.</p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xl justify-center mt-1">
                    <div className="bg-[#f9f9fa] border border-gray-200 rounded-xl p-5 flex-1 w-full relative">
                      <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-[#696cff] text-white flex items-center justify-center font-bold text-sm shadow-md border-2 border-white">1</div>
                      <h5 className="font-bold text-[#566a7f] text-sm mb-1">Thêm hồ sơ Học sinh</h5>
                      <p className="text-xs text-[#a1acb8] mb-4">Cập nhật thông tin con cái (lớp, học lực) để trung tâm nắm bắt.</p>
                      <Link to="/client/children" className="inline-flex items-center justify-center w-full py-2 bg-white border border-[#696cff] text-[#696cff] hover:bg-[#696cff] hover:text-white rounded-lg text-xs font-bold transition-colors">
                        Thêm Học Sinh
                      </Link>
                    </div>
                    
                    <ArrowRight className="text-gray-300 hidden sm:block shrink-0" size={24} />
                    
                    <div className="bg-[#f9f9fa] border border-gray-200 rounded-xl p-5 flex-1 w-full relative">
                      <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-[#696cff] text-white flex items-center justify-center font-bold text-sm shadow-md border-2 border-white">2</div>
                      <h5 className="font-bold text-[#566a7f] text-sm mb-1">Tạo Yêu cầu Gia sư</h5>
                      <p className="text-xs text-[#a1acb8] mb-4">Chọn môn học, thời gian rảnh và mức học phí mong muốn.</p>
                      <Link to="/client/request-tutor" className="inline-flex items-center justify-center w-full py-2 bg-[#696cff] text-white hover:bg-[#5f61e6] rounded-lg text-xs font-bold shadow-md transition-colors">
                        Tìm Gia Sư Ngay
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {classes.map((cls) => (
                    <div
                      key={cls.id}
                      className="p-5 bg-[#f9f9fa] border border-gray-100 hover:border-[#696cff]/40 rounded-xl transition-all shadow-sm flex flex-col justify-between space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-[#566a7f] text-base">
                              {cls.student?.fullName || 'Học viên'}
                            </h4>
                            {cls.student?.grade && (
                              <span className="text-[10px] bg-gray-200 text-gray-700 font-semibold px-2 py-0.5 rounded">
                                {cls.student.grade}
                              </span>
                            )}
                          </div>
                          {cls.tutorRequest?.subject && (
                            <p className="text-xs font-semibold text-[#696cff] mt-0.5">
                              Môn: {cls.tutorRequest.subject}
                            </p>
                          )}
                          <p className="text-xs text-[#a1acb8] mt-1 flex items-center gap-1">
                            Gia sư: <strong className="text-[#566a7f]">{cls.tutor?.fullName || 'Chờ điều phối'}</strong>
                            {cls.tutor?.ratingAvg && (
                              <span className="flex items-center gap-0.5 text-[#ffab00] font-bold text-[11px] ml-1">
                                <Star size={11} fill="#ffab00" /> {Number(cls.tutor.ratingAvg).toFixed(1)}
                              </span>
                            )}
                          </p>
                        </div>
                        <span
                          className={`px-2.5 py-1 text-xs font-bold rounded-md ${
                            cls.status === 'TEACHING'
                              ? 'bg-[#e8fadf] text-[#71dd37]'
                              : cls.status === 'TRIAL'
                              ? 'bg-[#fff8e1] text-[#ffab00]'
                              : 'bg-[#e7e7ff] text-[#696cff]'
                          }`}
                        >
                          {cls.status === 'TRIAL' ? 'Dạy thử' : cls.status === 'TEACHING' ? 'Đang học chính thức' : cls.status}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between text-xs">
                        <span className="text-[#697a8d]">
                          Đơn giá: <strong className="text-[#71dd37]">{parseInt(cls.hourlyRate).toLocaleString()}đ/buổi</strong>
                        </span>
                        <span className="text-[#697a8d]">
                          Còn lại: <strong className="text-[#696cff]">{cls.remainingSessions ?? 0} buổi</strong>
                        </span>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="pt-2 flex items-center gap-2">
                        <button
                          onClick={() => openClassJournal(cls)}
                          className="flex-1 py-2 px-3 bg-[#696cff] hover:bg-[#5f61e6] text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-[0_2px_4px_0_rgba(105,108,255,0.3)] cursor-pointer"
                        >
                          <BookOpen size={14} /> Sổ Nhật Ký & Lịch Học ({cls._count?.sessions || 0})
                        </button>
                        <Link
                          to="/client/leaves"
                          className="py-2 px-3 bg-white hover:bg-gray-100 text-[#697a8d] hover:text-[#566a7f] border border-gray-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                          title="Báo nghỉ hoặc dời lịch buổi học"
                        >
                          <Calendar size={13} /> Báo nghỉ
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Sidebar */}
          <div className="w-full lg:w-[320px] shrink-0 space-y-6">
            {/* Compact Profile Widget */}
            {isParent && profileInfo && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4 relative">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[#a1acb8] text-[10px] font-bold uppercase tracking-wider">Hồ sơ Phụ huynh</span>
                    <h3 className="text-lg font-extrabold text-[#566a7f] mt-1 capitalize">{profileInfo.fullName || 'Chưa cập nhật'}</h3>
                  </div>
                  <button
                    onClick={() => setEditingProfile(!editingProfile)}
                    className="p-1.5 bg-[#f5f5f9] hover:bg-gray-200 rounded-md text-[#697a8d] hover:text-[#566a7f] transition-all cursor-pointer"
                    title={editingProfile ? 'Đóng' : 'Chỉnh sửa'}
                  >
                    <Edit3 size={14} />
                  </button>
                </div>

                {!editingProfile ? (
                  <div className="pt-2 border-t border-gray-100 space-y-2.5 text-xs text-[#566a7f]">
                    <div className="flex items-center gap-2">
                      <Phone size={13} className="text-[#696cff] shrink-0" />
                      <span>{profileInfo.user?.phone || activeProfile?.phone || 'Chưa có SĐT'}</span>
                    </div>

                    {profileInfo.user?.email && (
                      <div className="flex items-center gap-2">
                        <Mail size={13} className="text-[#696cff] shrink-0" />
                        <span className="truncate">{profileInfo.user.email}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Briefcase size={13} className="text-[#696cff] shrink-0" />
                      <span>Nghề nghiệp: <strong>{profileInfo.occupation || 'Chưa cập nhật'}</strong></span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MessageCircle size={13} className="text-[#696cff] shrink-0" />
                      <span>
                        Kênh ưu tiên:{' '}
                        <strong className="text-[#696cff]">
                          {profileInfo.preferredContactMethod === 'ZALO'
                            ? 'Zalo'
                            : profileInfo.preferredContactMethod === 'EMAIL'
                            ? 'Email'
                            : 'Gọi điện thoại'}
                        </strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock size={13} className="text-[#696cff] shrink-0" />
                      <span>
                        Giờ nhận cuộc gọi:{' '}
                        <strong>
                          {profileInfo.contactTimePref === 'MORNING'
                            ? 'Sáng (8h - 11h30)'
                            : profileInfo.contactTimePref === 'AFTERNOON'
                            ? 'Chiều (14h - 17h)'
                            : profileInfo.contactTimePref === 'EVENING'
                            ? 'Tối sau 18h'
                            : 'Linh hoạt mọi lúc'}
                        </strong>
                      </span>
                    </div>

                    <div className="pt-1.5 border-t border-gray-100">
                      <span className="text-[#a1acb8] uppercase font-bold text-[10px] flex items-center gap-1 mb-1">
                        <MapPin size={11} /> Địa chỉ gia đình
                      </span>
                      <div className="text-[#566a7f] font-semibold leading-relaxed">
                        {profileInfo.address || 'Chưa cập nhật'},<br />
                        {profileInfo.district || 'Chưa cập nhật'}, {profileInfo.province || 'Chưa cập nhật'}
                      </div>
                    </div>

                    {profileInfo.familyNotes && (
                      <div className="pt-1.5 border-t border-gray-100">
                        <span className="text-[#a1acb8] uppercase font-bold text-[10px] flex items-center gap-1 mb-1">
                          <FileText size={11} /> Lưu ý gia đình
                        </span>
                        <p className="italic text-[#697a8d] bg-[#f8f9fa] p-2 rounded border border-gray-100">
                          {profileInfo.familyNotes}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleUpdateProfile} className="space-y-3 pt-2 border-t border-gray-100">
                    <div>
                      <label className="block text-[10px] font-semibold text-[#a1acb8] uppercase mb-1">Họ và Tên *</label>
                      <input
                        type="text"
                        required
                        value={profForm.fullName}
                        onChange={(e) => setProfForm((prev) => ({ ...prev, fullName: e.target.value }))}
                        className="w-full px-2.5 py-1.5 bg-[#f5f5f9] border border-[#d9dee3] rounded-md text-xs text-[#566a7f] focus:outline-none focus:border-[#696cff]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-[#a1acb8] uppercase mb-1">Nghề nghiệp / Cơ quan</label>
                      <input
                        type="text"
                        placeholder="Bác sĩ, Giáo viên, Kinh doanh..."
                        value={profForm.occupation}
                        onChange={(e) => setProfForm((prev) => ({ ...prev, occupation: e.target.value }))}
                        className="w-full px-2.5 py-1.5 bg-[#f5f5f9] border border-[#d9dee3] rounded-md text-xs text-[#566a7f] focus:outline-none focus:border-[#696cff]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-semibold text-[#a1acb8] uppercase mb-1">Kênh liên hệ</label>
                        <select
                          value={profForm.preferredContactMethod}
                          onChange={(e) => setProfForm((prev) => ({ ...prev, preferredContactMethod: e.target.value }))}
                          className="w-full px-2 py-1.5 bg-[#f5f5f9] border border-[#d9dee3] rounded-md text-xs text-[#566a7f] focus:outline-none focus:border-[#696cff]"
                        >
                          <option value="CALL">Gọi điện thoại</option>
                          <option value="ZALO">Nhắn tin Zalo</option>
                          <option value="EMAIL">Gửi Email</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-[#a1acb8] uppercase mb-1">Giờ nghe máy</label>
                        <select
                          value={profForm.contactTimePref}
                          onChange={(e) => setProfForm((prev) => ({ ...prev, contactTimePref: e.target.value }))}
                          className="w-full px-2 py-1.5 bg-[#f5f5f9] border border-[#d9dee3] rounded-md text-xs text-[#566a7f] focus:outline-none focus:border-[#696cff]"
                        >
                          <option value="ANYTIME">Linh hoạt</option>
                          <option value="MORNING">Sáng (8h-11h30)</option>
                          <option value="AFTERNOON">Chiều (14h-17h)</option>
                          <option value="EVENING">Tối sau 18h</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-[#a1acb8] uppercase mb-1">Địa chỉ (Số nhà, Tên đường) *</label>
                      <input
                        type="text"
                        required
                        value={profForm.address}
                        onChange={(e) => setProfForm((prev) => ({ ...prev, address: e.target.value }))}
                        className="w-full px-2.5 py-1.5 bg-[#f5f5f9] border border-[#d9dee3] rounded-md text-xs text-[#566a7f] focus:outline-none focus:border-[#696cff]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-semibold text-[#a1acb8] uppercase mb-1">Quận/Huyện *</label>
                        <input
                          type="text"
                          required
                          value={profForm.district}
                          onChange={(e) => setProfForm((prev) => ({ ...prev, district: e.target.value }))}
                          className="w-full px-2.5 py-1.5 bg-[#f5f5f9] border border-[#d9dee3] rounded-md text-xs text-[#566a7f] focus:outline-none focus:border-[#696cff]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-[#a1acb8] uppercase mb-1">Tỉnh/TP *</label>
                        <input
                          type="text"
                          required
                          value={profForm.province}
                          onChange={(e) => setProfForm((prev) => ({ ...prev, province: e.target.value }))}
                          className="w-full px-2.5 py-1.5 bg-[#f5f5f9] border border-[#d9dee3] rounded-md text-xs text-[#566a7f] focus:outline-none focus:border-[#696cff]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-[#a1acb8] uppercase mb-1">Lưu ý điều kiện gia đình</label>
                      <textarea
                        rows={2}
                        placeholder="Chung cư quẹt thẻ, nhà có chó dữ, cần gia sư kiên nhẫn..."
                        value={profForm.familyNotes}
                        onChange={(e) => setProfForm((prev) => ({ ...prev, familyNotes: e.target.value }))}
                        className="w-full p-2 bg-[#f5f5f9] border border-[#d9dee3] rounded-md text-xs text-[#566a7f] focus:outline-none focus:border-[#696cff] resize-none"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setEditingProfile(false)}
                        className="flex-1 py-1.5 bg-gray-100 hover:bg-gray-200 text-[#697a8d] font-semibold text-xs rounded-md cursor-pointer transition-colors"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        disabled={profileLoading}
                        className="flex-1 py-1.5 bg-[#696cff] hover:bg-[#5f61e6] disabled:opacity-50 text-white font-bold text-xs rounded-md shadow-sm cursor-pointer transition-colors"
                      >
                        {profileLoading ? 'Đang lưu...' : 'Lưu hồ sơ'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
            
            {/* Additional Support Banner in Sidebar */}
            <div className="bg-[#f5f5f9] rounded-xl border border-dashed border-[#d9dee3] p-4 text-center space-y-2">
              <span className="text-[#a1acb8] font-bold text-xs">CẦN HỖ TRỢ?</span>
              <p className="text-xs text-[#566a7f]">Hotline Trung tâm: <strong className="text-[#696cff]">1900 1234</strong></p>
              <p className="text-xs text-[#566a7f]">Email: support@crmgiasu.vn</p>
            </div>
          </div>
        </div>

        {/* Modal Sổ Nhật Ký & Chi Tiết Buổi Học */}
        {selectedClassForJournal && (
          <div className="fixed inset-0 z-50 bg-[#233446]/50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-gray-100">
              {/* Modal Header */}
              <div className="p-5 bg-gradient-to-r from-[#696cff] to-[#8592a3] text-white flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-white/20 rounded text-[11px] font-bold uppercase tracking-wider">
                      Sổ Nhật Ký Học Tập
                    </span>
                    <span className="text-xs bg-white text-[#696cff] font-bold px-2 py-0.5 rounded-full">
                      {selectedClassForJournal.status === 'TEACHING' ? 'Học chính thức' : 'Dạy thử'}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold mt-1 text-white flex items-center gap-2">
                    Học sinh: {selectedClassForJournal.student?.fullName}
                    {selectedClassForJournal.tutorRequest?.subject && (
                      <span className="text-sm font-normal text-white/90">
                        • {selectedClassForJournal.tutorRequest.subject} ({selectedClassForJournal.tutorRequest.grade || selectedClassForJournal.student?.grade})
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-white/80 mt-0.5">
                    Gia sư phụ trách: <strong className="text-white">{selectedClassForJournal.tutor?.fullName || 'Chưa rõ'}</strong> • Học phí: {parseInt(selectedClassForJournal.hourlyRate).toLocaleString()}đ/buổi
                  </p>
                </div>
                <button
                  onClick={() => setSelectedClassForJournal(null)}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 text-left">
                {/* Statistics Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="bg-[#f5f5f9] rounded-xl p-3 text-center border border-gray-100">
                    <div className="text-lg font-extrabold text-[#566a7f]">{sessions.length}</div>
                    <div className="text-[11px] font-bold text-[#a1acb8] uppercase">Tổng buổi học</div>
                  </div>
                  <div className="bg-[#fff8e1] rounded-xl p-3 text-center border border-[#ffecb3]">
                    <div className="text-lg font-extrabold text-[#ffab00]">
                      {sessions.filter((s) => s.status === 'ATTENDED').length}
                    </div>
                    <div className="text-[11px] font-bold text-[#ffab00] uppercase">Chờ bạn duyệt</div>
                  </div>
                  <div className="bg-[#e8fadf] rounded-xl p-3 text-center border border-[#d2f4c5]">
                    <div className="text-lg font-extrabold text-[#71dd37]">
                      {sessions.filter((s) => s.status === 'CONFIRMED').length}
                    </div>
                    <div className="text-[11px] font-bold text-[#71dd37] uppercase">Đã hoàn thành</div>
                  </div>
                  <div className="bg-[#e7e7ff] rounded-xl p-3 text-center border border-[#d2d3fe]">
                    <div className="text-lg font-extrabold text-[#696cff]">
                      {sessions.filter((s) => s.status === 'SCHEDULED').length}
                    </div>
                    <div className="text-[11px] font-bold text-[#696cff] uppercase">Lịch sắp tới</div>
                  </div>
                </div>

                {/* Filter Tabs & Quick Action */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-1.5 overflow-x-auto">
                    {(['ALL', 'ATTENDED', 'CONFIRMED', 'SCHEDULED'] as const).map((tab) => {
                      const count = tab === 'ALL' ? sessions.length : sessions.filter((s) => s.status === tab).length;
                      const labels = {
                        ALL: 'Tất cả',
                        ATTENDED: 'Chờ duyệt',
                        CONFIRMED: 'Đã hoàn thành',
                        SCHEDULED: 'Lịch sắp tới',
                      };
                      return (
                        <button
                          key={tab}
                          onClick={() => setSessionTab(tab)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                            sessionTab === tab
                              ? 'bg-[#696cff] text-white shadow-sm'
                              : 'bg-gray-100 text-[#697a8d] hover:bg-gray-200'
                          }`}
                        >
                          {labels[tab]} ({count})
                        </button>
                      );
                    })}
                  </div>

                  <Link
                    to="/client/leaves"
                    className="text-xs font-bold text-[#696cff] hover:text-[#5f61e6] flex items-center gap-1 bg-[#e7e7ff]/60 px-3 py-1.5 rounded-lg hover:bg-[#e7e7ff] transition-colors"
                  >
                    <Calendar size={13} /> Báo nghỉ / Đổi lịch
                  </Link>
                </div>

                {/* Session List */}
                {sessionsLoading ? (
                  <div className="py-12 text-center text-[#a1acb8] text-xs flex flex-col items-center gap-2">
                    <RefreshCw size={24} className="animate-spin text-[#696cff]" />
                    Đang tải danh sách các buổi học...
                  </div>
                ) : sessions.length === 0 ? (
                  <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200 space-y-2">
                    <Clock size={36} className="mx-auto text-gray-400" />
                    <h5 className="font-bold text-sm text-[#566a7f]">Chưa có buổi học nào được ghi nhận</h5>
                    <p className="text-xs text-[#a1acb8] max-w-sm mx-auto">
                      Gia sư sẽ tạo lịch học hoặc điểm danh sau mỗi buổi dạy. Mọi nhật ký và đánh giá sẽ hiển thị tại đây.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sessions
                      .filter((s) => (sessionTab === 'ALL' ? true : s.status === sessionTab))
                      .map((session, index) => {
                        const schedDate = new Date(session.scheduledTime);
                        const isAttended = session.status === 'ATTENDED';
                        const isConfirmed = session.status === 'CONFIRMED';
                        const isDisputed = session.status === 'DISPUTED';
                        const isScheduled = session.status === 'SCHEDULED';

                        return (
                          <div
                            key={session.id}
                            className={`p-4 rounded-xl border transition-all ${
                              isAttended
                                ? 'bg-[#fffcf4] border-[#ffecb3] shadow-sm ring-1 ring-[#ffab00]/20'
                                : isConfirmed
                                ? 'bg-white border-gray-100 hover:border-gray-200'
                                : isDisputed
                                ? 'bg-[#fff5f5] border-[#ffccd2]'
                                : 'bg-[#f8f9fa] border-gray-100'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                              <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-gray-100 text-[#566a7f] flex items-center justify-center font-bold text-xs shrink-0">
                                  #{sessions.length - index}
                                </span>
                                <div>
                                  <h5 className="text-sm font-bold text-[#566a7f]">
                                    {schedDate.toLocaleDateString('vi-VN', {
                                      weekday: 'long',
                                      day: '2-digit',
                                      month: '2-digit',
                                      year: 'numeric',
                                    })}
                                  </h5>
                                  <p className="text-[11px] text-[#a1acb8]">
                                    Khung giờ:{' '}
                                    {session.actualStart && session.actualEnd
                                      ? `${new Date(session.actualStart).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - ${new Date(session.actualEnd).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`
                                      : schedDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                </div>
                              </div>

                              <div>
                                {isAttended && (
                                  <span className="px-2.5 py-1 bg-[#fff8e1] text-[#ffab00] border border-[#ffe599] rounded-full text-xs font-bold flex items-center gap-1">
                                    <Clock size={12} className="animate-spin" /> Chờ bạn duyệt
                                  </span>
                                )}
                                {isConfirmed && (
                                  <span className="px-2.5 py-1 bg-[#e8fadf] text-[#71dd37] border border-[#c2f3aa] rounded-full text-xs font-bold flex items-center gap-1">
                                    <CheckCircle2 size={12} /> Đã hoàn thành
                                  </span>
                                )}
                                {isScheduled && (
                                  <span className="px-2.5 py-1 bg-[#e7e7ff] text-[#696cff] border border-[#d2d3fe] rounded-full text-xs font-bold flex items-center gap-1">
                                    <Calendar size={12} /> Lịch sắp tới
                                  </span>
                                )}
                                {isDisputed && (
                                  <span className="px-2.5 py-1 bg-[#ffe0db] text-[#ff3e1d] border border-[#ffb3a7] rounded-full text-xs font-bold flex items-center gap-1">
                                    <AlertTriangle size={12} /> Đang khiếu nại
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Tutor Notes */}
                            <div className="mt-3 bg-[#f5f5f9] rounded-lg p-3 text-xs space-y-1">
                              <div className="flex items-center gap-1 text-[#697a8d] font-bold text-[11px] uppercase">
                                <MessageSquare size={12} className="text-[#696cff]" /> Nhật ký & Nhận xét của Gia sư:
                              </div>
                              <p className="text-[#566a7f] italic pl-4">
                                {session.tutorNotes || '(Gia sư chưa bổ sung nhận xét cho buổi học này)'}
                              </p>
                            </div>

                            {/* Parent Review Display if Confirmed */}
                            {isConfirmed && (session.parentRating || session.parentFeedback) && (
                              <div className="mt-2.5 bg-[#f0fbf0] rounded-lg p-2.5 text-xs border border-[#d2f4c5] flex items-start gap-2">
                                <Star size={14} className="text-[#ffab00] fill-[#ffab00] shrink-0 mt-0.5" />
                                <div>
                                  <div className="flex items-center gap-1">
                                    <span className="font-bold text-[#71dd37]">Đánh giá của bạn:</span>
                                    <span className="text-[#ffab00] font-bold">
                                      {'★'.repeat(session.parentRating || 5)} ({session.parentRating || 5}/5)
                                    </span>
                                  </div>
                                  {session.parentFeedback && (
                                    <p className="text-[#566a7f] mt-0.5">{session.parentFeedback}</p>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Disputed Alert */}
                            {isDisputed && (
                              <div className="mt-2.5 bg-[#fff0ed] rounded-lg p-2.5 text-xs border border-[#ffbca9] text-[#ff3e1d] flex items-start gap-2">
                                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                                <div>
                                  <strong>Lý do khiếu nại:</strong> {session.disputeReason}
                                  <p className="text-[#697a8d] text-[11px] mt-0.5">
                                    Học Vụ trung tâm đã ghi nhận và sẽ liên hệ hỗ trợ giải quyết trong 24 giờ.
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* ATTENDED Action Buttons for Parent */}
                            {isAttended && (
                              <div className="mt-3 pt-3 border-t border-[#ffecb3] flex flex-wrap items-center justify-between gap-2">
                                <div className="text-xs text-[#a1acb8]">
                                  Gia sư đã điểm danh buổi học. Vui lòng kiểm tra và duyệt trả thù lao.
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => {
                                      setDisputingSession(session);
                                      setDisputeReasonText('');
                                    }}
                                    className="px-3 py-1.5 bg-white hover:bg-red-50 text-[#ff3e1d] border border-red-200 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                                  >
                                    Khiếu nại
                                  </button>
                                  <button
                                    onClick={() => {
                                      setReviewingSession(session);
                                      setRatingScore(5);
                                      setFeedbackText('');
                                    }}
                                    className="px-4 py-1.5 bg-[#71dd37] hover:bg-[#65c731] text-white text-xs font-bold rounded-lg transition-all shadow-[0_2px_4px_0_rgba(113,221,55,0.4)] flex items-center gap-1.5 cursor-pointer"
                                  >
                                    <Check size={14} /> Xác Nhận & Đánh Giá
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => setSelectedClassForJournal(null)}
                  className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-[#566a7f] text-xs font-bold rounded-lg cursor-pointer transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sub-modal: Confirm & Rating */}
        {reviewingSession && (
          <div className="fixed inset-0 z-60 bg-[#233446]/60 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 text-left shadow-2xl border border-gray-100 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <h4 className="text-base font-bold text-[#566a7f] flex items-center gap-2">
                  <Star size={18} className="text-[#ffab00]" /> Xác Nhận & Đánh Giá Buổi Học
                </h4>
                <button
                  onClick={() => setReviewingSession(null)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="text-xs text-[#697a8d]">
                Buổi học ngày:{' '}
                <strong className="text-[#566a7f]">
                  {new Date(reviewingSession.scheduledTime).toLocaleDateString('vi-VN')}
                </strong>
                . Khi xác nhận, hệ thống sẽ tự động chuyển thù lao buổi dạy vào ví của gia sư.
              </p>

              <form onSubmit={handleConfirmSessionSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#566a7f] mb-1.5">
                    Mức độ hài lòng:
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRatingScore(star)}
                        className="p-1 cursor-pointer transition-transform hover:scale-125 focus:outline-none"
                      >
                        <Star
                          size={28}
                          className={`${
                            star <= ratingScore
                              ? 'text-[#ffab00] fill-[#ffab00]'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-[#ffab00] ml-2">
                      {ratingScore === 5
                        ? 'Rất hài lòng ★★★★★'
                        : ratingScore === 4
                        ? 'Hài lòng ★★★★'
                        : ratingScore === 3
                        ? 'Bình thường ★★★'
                        : ratingScore === 2
                        ? 'Chưa đạt ★★'
                        : 'Không hài lòng ★'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#566a7f] mb-1">
                    Nhận xét cho Gia sư (tùy chọn):
                  </label>
                  <textarea
                    rows={3}
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Ví dụ: Thầy giảng bài rất dễ hiểu, bé tiến bộ rõ rệt..."
                    className="w-full p-2.5 bg-[#f5f5f9] border border-[#d9dee3] rounded-lg text-xs text-[#566a7f] focus:outline-none focus:border-[#696cff]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReviewingSession(null)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-[#697a8d] text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={reviewSubmitting}
                    className="px-5 py-2 bg-[#696cff] hover:bg-[#5f61e6] disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-md cursor-pointer transition-colors flex items-center gap-1.5"
                  >
                    {reviewSubmitting ? (
                      <>
                        <RefreshCw size={13} className="animate-spin" /> Đang xử lý...
                      </>
                    ) : (
                      <>
                        <Check size={14} /> Duyệt Buổi Học
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Sub-modal: Dispute */}
        {disputingSession && (
          <div className="fixed inset-0 z-60 bg-[#233446]/60 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 text-left shadow-2xl border border-gray-100 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <h4 className="text-base font-bold text-[#ff3e1d] flex items-center gap-2">
                  <AlertTriangle size={18} /> Khiếu Nại Buổi Học
                </h4>
                <button
                  onClick={() => setDisputingSession(null)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="text-xs text-[#697a8d]">
                Buổi học ngày:{' '}
                <strong className="text-[#566a7f]">
                  {new Date(disputingSession.scheduledTime).toLocaleDateString('vi-VN')}
                </strong>
                . Hãy cung cấp lý do khiếu nại (gia sư đến muộn, nghỉ không phép, nội dung dạy không phù hợp...) để trung tâm giải quyết.
              </p>

              <form onSubmit={handleDisputeSessionSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#566a7f] mb-1">
                    Lý do khiếu nại <span className="text-red-500">*</span>:
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={disputeReasonText}
                    onChange={(e) => setDisputeReasonText(e.target.value)}
                    placeholder="Mô tả cụ thể vấn đề bạn gặp phải..."
                    className="w-full p-2.5 bg-[#f5f5f9] border border-[#d9dee3] rounded-lg text-xs text-[#566a7f] focus:outline-none focus:border-[#ff3e1d]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setDisputingSession(null)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-[#697a8d] text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={disputeSubmitting || !disputeReasonText.trim()}
                    className="px-5 py-2 bg-[#ff3e1d] hover:bg-[#e6381a] disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-md cursor-pointer transition-colors flex items-center gap-1.5"
                  >
                    {disputeSubmitting ? (
                      <>
                        <RefreshCw size={13} className="animate-spin" /> Đang gửi...
                      </>
                    ) : (
                      'Gửi Khiếu Nại'
                    )}
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
