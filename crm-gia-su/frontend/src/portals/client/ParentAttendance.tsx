import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { 
  ArrowLeft, Loader, CheckCircle2, AlertTriangle, Calendar, 
  Star, XCircle, TrendingDown, Clock, MessageSquare, Check, 
  X, RefreshCw, BookOpen, AlertCircle, Shield, RefreshCcw, QrCode, CreditCard
} from 'lucide-react';
import PageTemplate from '../../components/PageTemplate';
import toast from 'react-hot-toast';

export default function ParentAttendance() {
  const [activeMainTab, setActiveMainTab] = useState<'TEACHING' | 'TRIAL'>('TEACHING');

  // Lớp chính thức & Buổi học
  const [teachingClasses, setTeachingClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [sessions, setSessions] = useState<any[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionTab, setSessionTab] = useState<'ALL' | 'ATTENDED' | 'CONFIRMED' | 'SCHEDULED'>('ALL');

  // Modal Xác nhận buổi học & Chấm sao
  const [reviewingSession, setReviewingSession] = useState<any | null>(null);
  const [ratingScore, setRatingScore] = useState<number>(5);
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // Modal Khiếu nại buổi học
  const [disputingSession, setDisputingSession] = useState<any | null>(null);
  const [disputeReasonText, setDisputeReasonText] = useState<string>('');
  const [disputeSubmitting, setDisputeSubmitting] = useState(false);

  // Modal Tái tục / Gia hạn gói học
  const [renewModalOpen, setRenewModalOpen] = useState(false);
  const [renewClass, setRenewClass] = useState<any | null>(null);
  const [renewSessionsCount, setRenewSessionsCount] = useState<number>(8);
  const [renewSubmitting, setRenewSubmitting] = useState(false);

  // Modal Bảo hành Đổi gia sư 30 ngày
  const [warrantyModalOpen, setWarrantyModalOpen] = useState(false);
  const [warrantyClass, setWarrantyClass] = useState<any | null>(null);
  const [warrantyReason, setWarrantyReason] = useState<string>('Phương pháp dạy chưa phù hợp với lực học của con');
  const [warrantyNotes, setWarrantyNotes] = useState<string>('');
  const [warrantySubmitting, setWarrantySubmitting] = useState(false);

  // Lớp dạy thử
  const [trialClasses, setTrialClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Đánh giá dạy thử
  const [reviewingClass, setReviewingClass] = useState<any | null>(null);
  const [decision, setDecision] = useState<'ACCEPT' | 'REJECT_TUTOR' | 'REJECT_PARENT' | 'SCALE_DOWN'>('ACCEPT');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<string>('');


  const fetchAllData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/v1/classes');
      const allCls = res.data || [];
      const trials = allCls.filter((c: any) => c.status === 'TRIAL' || c.status === 'DEPOSIT');
      const teachings = allCls.filter((c: any) => c.status === 'TEACHING');

      setTrialClasses(trials);
      setTeachingClasses(teachings);

      if (teachings.length > 0) {
        setSelectedClassId((prev) => (prev && teachings.some((c: any) => c.id === prev) ? prev : teachings[0].id));
        setActiveMainTab('TEACHING');
      } else if (trials.length > 0) {
        setActiveMainTab('TRIAL');
      }
    } catch (err) {
      console.error('Lỗi tải danh sách lớp học', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSessionsForClass = async (classId: string) => {
    if (!classId) return;
    setSessionsLoading(true);
    try {
      const res = await api.get(`/api/v1/sessions?classId=${classId}`);
      setSessions(res.data || []);
    } catch (err) {
      console.error('Lỗi tải danh sách buổi học', err);
    } finally {
      setSessionsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      fetchSessionsForClass(selectedClassId);
    }
  }, [selectedClassId]);

  // Xử lý Phụ huynh duyệt buổi học chính thức
  const handleConfirmSessionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingSession) return;
    setReviewSubmitting(true);
    try {
      const res = await api.post(`/api/v1/sessions/${reviewingSession.id}/confirm`, {
        rating: ratingScore,
        feedback: feedbackText || undefined,
      });
      toast.success(res.data?.message || 'Xác nhận buổi học và giải ngân thù lao cho gia sư thành công!');
      setReviewingSession(null);
      if (selectedClassId) fetchSessionsForClass(selectedClassId);
      fetchAllData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể xác nhận buổi học');
    } finally {
      setReviewSubmitting(false);
    }
  };

  // Xử lý Khiếu nại buổi học
  const handleDisputeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputingSession) return;
    if (!disputeReasonText.trim()) {
      toast.error('Vui lòng nhập lý do khiếu nại cụ thể');
      return;
    }
    setDisputeSubmitting(true);
    try {
      const res = await api.post(`/api/v1/sessions/${disputingSession.id}/dispute`, {
        reason: disputeReasonText,
      });
      toast.success(res.data?.message || 'Đã gửi khiếu nại tới bộ phận Học Vụ trung tâm!');
      setDisputingSession(null);
      if (selectedClassId) fetchSessionsForClass(selectedClassId);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể gửi khiếu nại');
    } finally {
      setDisputeSubmitting(false);
    }
  };

  // Xử lý mở Modal đánh giá dạy thử
  const handleOpenReview = (cls: any) => {
    setReviewingClass(cls);
    setDecision('ACCEPT');
    setReason('');
    setError(null);
    const rawNotes = cls.tutorRequest?.scheduleNotes || cls.cancelReason || '';
    const clean = rawNotes.replace(/^Lịch dạy thử:\s*|^Ca rảnh:\s*/i, '');
    const parts = clean.split(';').map((s: string) => s.trim()).filter(Boolean);
    setSelectedSlots(parts.slice(0, cls.tutorRequest?.sessionsPerWeek || 2));
    const nextDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    setStartDate(nextDate.toISOString().split('T')[0]);
  };

  // Xử lý submit đánh giá dạy thử
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingClass) return;
    setSubmitting(true);
    setError(null);

    try {
      const schedulesPayload = selectedSlots.map((slotStr) => {
        let dayOfWeek = 2;
        const dayMatch = slotStr.match(/Thứ\s*(\d)/i);
        if (dayMatch) {
          dayOfWeek = parseInt(dayMatch[1], 10);
        } else if (/Chủ\s*Nhật/i.test(slotStr)) {
          dayOfWeek = 8;
        }

        const timeMatch = slotStr.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
        const slotStart = timeMatch ? timeMatch[1] : '19:30';
        const slotEnd = timeMatch ? timeMatch[2] : '21:00';

        return { dayOfWeek, slotStart, slotEnd };
      });

      const res = await api.post(`/api/v1/sessions/class/${reviewingClass.id}/trial-review`, {
        action: decision,
        reason: decision !== 'ACCEPT' ? reason : undefined,
        schedules: decision === 'ACCEPT' ? schedulesPayload : undefined,
        startDate: decision === 'ACCEPT' ? startDate : undefined,
      });

      toast.success(res.data.message);
      setReviewingClass(null);
      await fetchAllData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đánh giá dạy thử thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRenewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renewClass) return;
    const rate = Number(renewClass.hourlyRate) || 200000;
    let discount = 0;
    if (renewSessionsCount === 12) discount = 0.05;
    if (renewSessionsCount === 16) discount = 0.1;
    const total = Math.round(renewSessionsCount * rate * (1 - discount));

    setRenewSubmitting(true);
    try {
      const res = await api.post(`/api/v1/finance/class/${renewClass.id}/renew`, {
        sessionsCount: renewSessionsCount,
        amount: total,
      });
      toast.success(res.data.message || 'Tái tục gói học thành công!');
      setRenewModalOpen(false);
      setRenewClass(null);
      await fetchAllData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gia hạn gói học thất bại');
    } finally {
      setRenewSubmitting(false);
    }
  };

  const handleWarrantySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!warrantyClass) return;
    if (!warrantyReason) {
      toast.error('Vui lòng chọn lý do đổi gia sư');
      return;
    }

    setWarrantySubmitting(true);
    try {
      const res = await api.post(`/api/v1/finance/class/${warrantyClass.id}/warranty-claim`, {
        reason: warrantyReason,
        notes: warrantyNotes,
      });
      toast.success(res.data.message || 'Đã gửi yêu cầu bảo hành đổi gia sư!');
      setWarrantyModalOpen(false);
      setWarrantyClass(null);
      setWarrantyNotes('');
      await fetchAllData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gửi yêu cầu thất bại');
    } finally {
      setWarrantySubmitting(false);
    }
  };

  const currentTeachingClass = teachingClasses.find((c) => c.id === selectedClassId);


  return (
    <PageTemplate
      title="Sổ Nhật Ký & Điểm Danh Buổi Học"
      subtitle="Theo dõi tiến độ buổi dạy, nhật ký gia sư, phê duyệt thù lao và quản lý đợt dạy thử"
      badge="Client Portal"
    >
      <div className="w-full space-y-6 text-left font-sans text-[#566a7f]">
        {/* Navigation & Action Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/client"
            className="text-xs font-semibold text-[#697a8d] hover:text-[#696cff] bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft size={14} /> Quay lại Client Portal
          </Link>

          <div className="flex items-center gap-2">
            <Link
              to="/client/leaves"
              className="text-xs font-bold text-[#696cff] hover:text-[#5f61e6] bg-[#e7e7ff]/70 hover:bg-[#e7e7ff] border border-[#696cff]/30 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Calendar size={14} /> Báo Nghỉ / Lên Lịch Học Bù
            </Link>
          </div>
        </div>

        {/* Main Tabs Selection */}
        <div className="flex border-b border-gray-200 gap-2">
          <button
            onClick={() => setActiveMainTab('TEACHING')}
            className={`pb-3 px-4 text-xs font-bold transition-all relative flex items-center gap-2 cursor-pointer ${
              activeMainTab === 'TEACHING'
                ? 'text-[#696cff] border-b-2 border-[#696cff]'
                : 'text-[#697a8d] hover:text-[#566a7f]'
            }`}
          >
            <BookOpen size={16} /> Lớp Học Chính Thức ({teachingClasses.length})
          </button>
          <button
            onClick={() => setActiveMainTab('TRIAL')}
            className={`pb-3 px-4 text-xs font-bold transition-all relative flex items-center gap-2 cursor-pointer ${
              activeMainTab === 'TRIAL'
                ? 'text-[#ffab00] border-b-2 border-[#ffab00]'
                : 'text-[#697a8d] hover:text-[#566a7f]'
            }`}
          >
            <Star size={16} /> Đánh Giá Dạy Thử ({trialClasses.length})
            {trialClasses.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-[#ffab00] animate-pulse"></span>
            )}
          </button>
        </div>

        {loading ? (
          <div className="text-center py-16 text-[#a1acb8] text-sm flex flex-col items-center gap-3">
            <Loader size={28} className="animate-spin text-[#696cff]" />
            Đang tải dữ liệu lớp học và buổi học...
          </div>
        ) : activeMainTab === 'TEACHING' ? (
          /* ======================================================== */
          /* TAB 1: LỚP HỌC CHÍNH THỨC & DUYỆT BUỔI HỌC               */
          /* ======================================================== */
          <div className="space-y-6">
            {teachingClasses.length === 0 ? (
              <div className="bg-white border border-gray-100 rounded-2xl shadow-xs p-12 text-center space-y-3">
                <BookOpen size={48} className="mx-auto text-[#a1acb8]" />
                <h4 className="text-base font-bold text-[#566a7f]">Chưa có lớp học chính thức nào</h4>
                <p className="text-xs text-[#a1acb8] max-w-sm mx-auto">
                  Sau khi gia sư dạy thử đạt yêu cầu và bạn bấm xác nhận chốt hợp đồng, lớp học sẽ hiển thị tại đây để bạn theo dõi từng buổi.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setActiveMainTab('TRIAL')}
                    className="px-4 py-2 bg-[#696cff] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#5f61e6] transition-colors"
                  >
                    Xem lớp đang dạy thử ({trialClasses.length}) &rarr;
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Lựa chọn lớp học chính thức */}
                <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-5 space-y-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-[#566a7f] flex items-center gap-2">
                        <BookOpen size={16} className="text-[#696cff]" /> Chọn Lớp Học Của Con:
                      </h4>
                      <p className="text-xs text-[#a1acb8]">Bấm chọn lớp học để kiểm tra nhật ký giảng dạy</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {teachingClasses.map((cls) => (
                        <button
                          key={cls.id}
                          onClick={() => setSelectedClassId(cls.id)}
                          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-2 ${
                            selectedClassId === cls.id
                              ? 'bg-[#696cff] text-white border-[#696cff] shadow-xs'
                              : 'bg-[#f5f5f9] text-[#566a7f] border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          <span>{cls.tutorRequest?.subject || 'Môn học'} - {cls.student?.fullName}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                            selectedClassId === cls.id ? 'bg-white/20 text-white' : 'bg-gray-200 text-[#566a7f]'
                          }`}>
                            Gia sư: {cls.tutor?.fullName || 'Chưa rõ'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Thông tin nhanh lớp đang chọn */}
                  {currentTeachingClass && (
                    <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-[#f8f9ff] p-3 rounded-xl">
                        <div>
                          <span className="text-[#a1acb8] block text-[10px] font-bold uppercase">Học sinh</span>
                          <strong className="text-[#566a7f]">{currentTeachingClass.student?.fullName}</strong>
                        </div>
                        <div>
                          <span className="text-[#a1acb8] block text-[10px] font-bold uppercase">Gia sư phụ trách</span>
                          <strong className="text-[#696cff]">{currentTeachingClass.tutor?.fullName}</strong>
                        </div>
                        <div>
                          <span className="text-[#a1acb8] block text-[10px] font-bold uppercase">Thù lao mỗi buổi</span>
                          <strong className="text-[#71dd37]">{Number(currentTeachingClass.hourlyRate).toLocaleString()} đ/buổi</strong>
                        </div>
                        <div>
                          <span className="text-[#a1acb8] block text-[10px] font-bold uppercase">Số buổi còn lại chu kỳ</span>
                          <strong className={currentTeachingClass.remainingSessions <= 2 ? 'text-[#ff3e1d] font-black' : 'text-[#ffab00]'}>
                            {currentTeachingClass.remainingSessions ?? 8} buổi
                          </strong>
                        </div>
                      </div>

                      {/* Cảnh báo gói học sắp hết */}
                      {currentTeachingClass.remainingSessions <= 2 && (
                        <div className="p-3 bg-[#fff8e1] border border-[#ffab00]/40 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs text-[#ffab00]">
                          <div className="flex items-center gap-2">
                            <AlertTriangle size={16} className="text-[#ffab00] shrink-0" />
                            <span>
                              <strong>Gói học của con sắp hết:</strong> Hiện chỉ còn <strong>{currentTeachingClass.remainingSessions} buổi</strong>. Hãy gia hạn ngay để tiến độ học tập của con không bị gián đoạn.
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              setRenewClass(currentTeachingClass);
                              setRenewModalOpen(true);
                            }}
                            className="px-3.5 py-1.5 bg-[#ffab00] hover:bg-[#e09600] text-white text-xs font-bold rounded-lg shadow-xs transition-colors shrink-0 cursor-pointer flex items-center gap-1.5"
                          >
                            <RefreshCcw size={13} /> Gia Hạn Ngay
                          </button>
                        </div>
                      )}

                      {/* Thanh công cụ bảo hành & tái tục */}
                      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 bg-[#e8fadf] text-[#71dd37] text-[11px] font-bold rounded-lg flex items-center gap-1.5">
                            <Shield size={13} /> Bảo hành 30 ngày (Được kích hoạt)
                          </span>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Nút Tái tục / Gia hạn */}
                          <button
                            onClick={() => {
                              setRenewClass(currentTeachingClass);
                              setRenewModalOpen(true);
                            }}
                            className="px-3.5 py-1.5 bg-[#e7e7ff] hover:bg-[#696cff] text-[#696cff] hover:text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                          >
                            <RefreshCcw size={13} /> 🔄 Tái Tục / Gia Hạn Gói Học
                          </button>

                          {/* Nút Bảo hành Đổi gia sư */}
                          {currentTeachingClass.cancelReason?.includes('[BẢO HÀNH ĐỔI GIA SƯ') ? (
                            <span className="px-3 py-1.5 bg-[#fff8e1] text-[#ffab00] font-bold text-xs rounded-xl border border-[#ffab00]/30 flex items-center gap-1.5">
                              <Clock size={13} /> ⏳ Đang chờ học vụ xử lý đổi gia sư
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                setWarrantyClass(currentTeachingClass);
                                setWarrantyModalOpen(true);
                              }}
                              className="px-3.5 py-1.5 bg-white hover:bg-[#ffe0db]/40 text-[#ff3e1d] hover:text-[#d63317] border border-[#ff3e1d]/30 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                              title="Đổi gia sư miễn phí 100% nếu chưa hài lòng"
                            >
                              <Shield size={13} /> 🛡️ Đổi Gia Sư (Bảo Hành 30 Ngày)
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>


                {/* Sổ nhật ký & Danh sách buổi học */}
                <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-6 space-y-5">
                  {/* Thanh thống kê 4 ô */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="bg-[#f5f5f9] p-3 rounded-xl border border-gray-100">
                      <div className="text-xl font-extrabold text-[#566a7f]">{sessions.length}</div>
                      <div className="text-[11px] font-bold text-[#a1acb8] uppercase">Tổng buổi học</div>
                    </div>
                    <div className="bg-[#fff8e1] p-3 rounded-xl border border-[#ffecb3]">
                      <div className="text-xl font-extrabold text-[#ffab00]">
                        {sessions.filter((s) => s.status === 'ATTENDED').length}
                      </div>
                      <div className="text-[11px] font-bold text-[#ffab00] uppercase">Chờ bạn duyệt</div>
                    </div>
                    <div className="bg-[#e8fadf] p-3 rounded-xl border border-[#d2f4c5]">
                      <div className="text-xl font-extrabold text-[#71dd37]">
                        {sessions.filter((s) => s.status === 'CONFIRMED').length}
                      </div>
                      <div className="text-[11px] font-bold text-[#71dd37] uppercase">Đã hoàn thành</div>
                    </div>
                    <div className="bg-[#e7e7ff] p-3 rounded-xl border border-[#d2d3fe]">
                      <div className="text-xl font-extrabold text-[#696cff]">
                        {sessions.filter((s) => s.status === 'SCHEDULED').length}
                      </div>
                      <div className="text-[11px] font-bold text-[#696cff] uppercase">Lịch sắp tới</div>
                    </div>
                  </div>

                  {/* Filter Tabs */}
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
                                ? 'bg-[#696cff] text-white shadow-xs'
                                : 'bg-gray-100 text-[#697a8d] hover:bg-gray-200'
                            }`}
                          >
                            {labels[tab]} ({count})
                          </button>
                        );
                      })}
                    </div>

                    <span className="text-xs text-[#a1acb8]">
                      Tự động duyệt sau 48h nếu phụ huynh không khiếu nại
                    </span>
                  </div>

                  {/* Danh sách các buổi học */}
                  {sessionsLoading ? (
                    <div className="py-12 text-center text-[#a1acb8] text-xs flex flex-col items-center gap-2">
                      <RefreshCw size={24} className="animate-spin text-[#696cff]" />
                      Đang tải danh sách các buổi học...
                    </div>
                  ) : sessions.length === 0 ? (
                    <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200 space-y-2">
                      <Clock size={36} className="mx-auto text-gray-400" />
                      <h5 className="font-bold text-sm text-[#566a7f]">Chưa có buổi học nào được lên lịch</h5>
                      <p className="text-xs text-[#a1acb8] max-w-sm mx-auto">
                        Thời khóa biểu sẽ hiển thị các buổi học định kỳ do gia đình và gia sư đã thống nhất.
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
                                  ? 'bg-[#fffcf4] border-[#ffecb3] shadow-xs ring-2 ring-[#ffab00]/30'
                                  : isConfirmed
                                  ? 'bg-white border-gray-100 hover:border-gray-200'
                                  : isDisputed
                                  ? 'bg-[#fff5f5] border-[#ffccd2]'
                                  : 'bg-[#f8f9fa] border-gray-100'
                              }`}
                            >
                              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                                <div className="flex items-center gap-2.5">
                                  <span className="w-7 h-7 rounded-full bg-gray-100 text-[#566a7f] flex items-center justify-center font-bold text-xs shrink-0">
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
                                    <span className="px-2.5 py-1 bg-[#fff8e1] text-[#ffab00] border border-[#ffe599] rounded-full text-xs font-bold flex items-center gap-1.5">
                                      <Clock size={13} className="animate-spin" /> Chờ bạn duyệt
                                    </span>
                                  )}
                                  {isConfirmed && (
                                    <span className="px-2.5 py-1 bg-[#e8fadf] text-[#71dd37] border border-[#c2f3aa] rounded-full text-xs font-bold flex items-center gap-1.5">
                                      <CheckCircle2 size={13} /> Đã hoàn thành
                                    </span>
                                  )}
                                  {isScheduled && (
                                    <span className="px-2.5 py-1 bg-[#e7e7ff] text-[#696cff] border border-[#d2d3fe] rounded-full text-xs font-bold flex items-center gap-1.5">
                                      <Calendar size={13} /> Lịch sắp tới
                                    </span>
                                  )}
                                  {isDisputed && (
                                    <span className="px-2.5 py-1 bg-[#ffe0db] text-[#ff3e1d] border border-[#ffb3a7] rounded-full text-xs font-bold flex items-center gap-1.5">
                                      <AlertTriangle size={13} /> Đang khiếu nại
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Ghi chú & Nhật ký của Gia sư */}
                              <div className="mt-3 bg-[#f5f5f9] rounded-xl p-3 text-xs space-y-1">
                                <div className="flex items-center gap-1.5 text-[#697a8d] font-bold text-[11px] uppercase">
                                  <MessageSquare size={13} className="text-[#696cff]" /> Nhật ký buổi học của Gia sư:
                                </div>
                                <p className="text-[#566a7f] italic pl-4">
                                  {session.tutorNotes || '(Gia sư chưa ghi nhật ký chi tiết cho buổi học này)'}
                                </p>
                              </div>

                              {/* Đánh giá của Phụ huynh nếu đã hoàn thành */}
                              {isConfirmed && (session.parentRating || session.parentFeedback) && (
                                <div className="mt-2.5 bg-[#f0fbf0] rounded-xl p-3 text-xs border border-[#d2f4c5] flex items-start gap-2">
                                  <Star size={15} className="text-[#ffab00] fill-[#ffab00] shrink-0 mt-0.5" />
                                  <div>
                                    <div className="flex items-center gap-1.5">
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

                              {/* Cảnh báo khiếu nại */}
                              {isDisputed && (
                                <div className="mt-2.5 bg-[#fff0ed] rounded-xl p-3 text-xs border border-[#ffbca9] text-[#ff3e1d] flex items-start gap-2">
                                  <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                                  <div>
                                    <strong>Lý do khiếu nại:</strong> {session.disputeReason}
                                    <p className="text-[#697a8d] text-[11px] mt-0.5">
                                      Học Vụ trung tâm đã đóng băng thù lao và đang liên hệ hai bên để giải quyết trong 24 giờ.
                                    </p>
                                  </div>
                                </div>
                              )}

                              {/* Hàng nút hành động khi buổi học ATTENDED (Chờ duyệt) */}
                              {isAttended && (
                                <div className="mt-3 pt-3 border-t border-[#ffecb3] flex flex-wrap items-center justify-between gap-3">
                                  <div className="text-xs text-[#a1acb8] flex items-center gap-1">
                                    <Clock size={13} className="text-[#ffab00]" />
                                    <span>Gia sư đã dạy xong và điểm danh. Mời bạn duyệt để giải ngân thù lao.</span>
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
                                      <Check size={14} /> Duyệt Buổi Học & Chấm Sao
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
              </>
            )}
          </div>
        ) : (
          /* ======================================================== */
          /* TAB 2: CÁC LỚP CHỜ ĐÁNH GIÁ DẠY THỬ (TRIAL / DEPOSIT)    */
          /* ======================================================== */
          <div className="space-y-4">
            {trialClasses.length === 0 ? (
              <div className="bg-white border border-gray-100 rounded-2xl shadow-xs p-12 text-center space-y-3">
                <Star size={44} className="mx-auto text-[#a1acb8]" />
                <h4 className="text-base font-bold text-[#566a7f]">Không có lớp nào chờ đánh giá dạy thử</h4>
                <p className="text-xs text-[#a1acb8] max-w-sm mx-auto">
                  Hiện tại không có lớp học nào đang trong giai đoạn dạy thử cần phản hồi.
                </p>
              </div>
            ) : (
              <div className="bg-white border border-gray-100 rounded-2xl shadow-xs p-6 space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <h3 className="text-base font-bold text-[#566a7f] flex items-center gap-2">
                    <Calendar size={18} className="text-[#ffab00]" /> Các lớp đang chờ đánh giá dạy thử
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#fff8e1] text-[#ffab00]">
                    {trialClasses.length} lớp chờ duyệt
                  </span>
                </div>

                <div className="space-y-3 pt-2">
                  {trialClasses.map((cls) => (
                    <div
                      key={cls.id}
                      className="p-4 bg-[#f9f9fa] border border-gray-100 hover:border-[#696cff]/40 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all"
                    >
                      <div>
                        <h4 className="font-bold text-[#566a7f] text-sm">
                          Học sinh: {cls.student?.fullName || 'Học viên'} - Môn {cls.tutorRequest?.subject || ''}
                        </h4>
                        <p className="text-xs text-[#a1acb8] mt-0.5">
                          Gia sư: <strong className="text-[#696cff]">{cls.tutor?.fullName || 'Chưa rõ'}</strong>
                        </p>
                        <p className="text-xs text-[#71dd37] font-semibold mt-0.5">
                          Học phí: {Number(cls.hourlyRate).toLocaleString()} đ/buổi
                        </p>
                        {cls.cancelReason && (
                          <p className="text-[11px] text-[#ffab00] font-semibold mt-1">
                            📅 {cls.cancelReason}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => handleOpenReview(cls)}
                        className="px-4 py-2 bg-[#696cff] hover:bg-[#5f61e6] text-white text-xs font-bold rounded-lg cursor-pointer transition-all shadow-[0_2px_4px_0_rgba(105,108,255,0.4)] flex items-center gap-1.5"
                      >
                        <Star size={14} />
                        <span>⭐ Đánh Giá & Chốt Dạy Chính Thức</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* SUB-MODAL 1: XÁC NHẬN BUỔI HỌC & CHẤM SAO (CONFIRM)      */}
        {/* ======================================================== */}
        {reviewingSession && (
          <div className="fixed inset-0 z-60 bg-[#233446]/60 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 text-left shadow-2xl border border-gray-100 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <h4 className="text-base font-bold text-[#566a7f] flex items-center gap-2">
                  <Star size={18} className="text-[#ffab00]" /> Duyệt Buổi Học & Chấm Điểm
                </h4>
                <button
                  onClick={() => setReviewingSession(null)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-3 bg-[#f8f9ff] rounded-xl border border-[#696cff]/20 text-xs text-[#566a7f] space-y-1">
                <div>Buổi học ngày: <strong>{new Date(reviewingSession.scheduledTime).toLocaleDateString('vi-VN')}</strong></div>
                {reviewingSession.tutorNotes && (
                  <p className="italic text-[#697a8d]">Nhật ký gia sư: "{reviewingSession.tutorNotes}"</p>
                )}
                <p className="text-[11px] text-[#71dd37] font-semibold pt-1">
                  💰 Khi bạn duyệt, hệ thống sẽ tự động chuyển thù lao vào ví của Gia sư ngay lập tức.
                </p>
              </div>

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
                    placeholder="Ví dụ: Thầy giảng bài rất dễ hiểu, bé tiếp thu tốt và tự giác làm bài tập..."
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
                    className="px-5 py-2 bg-[#71dd37] hover:bg-[#65c731] disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-md cursor-pointer transition-colors flex items-center gap-1.5"
                  >
                    {reviewSubmitting ? (
                      <>
                        <RefreshCw size={13} className="animate-spin" /> Đang duyệt...
                      </>
                    ) : (
                      <>
                        <Check size={14} /> Xác Nhận Duyệt Lương
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* SUB-MODAL 2: KHIẾU NẠI BUỔI HỌC (DISPUTE)                 */}
        {/* ======================================================== */}
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
                . Khi khiếu nại, hệ thống sẽ tạm giữ tiền thù lao buổi dạy này và chuyển hồ sơ lên Chuyên viên Học Vụ để xác minh.
              </p>

              <form onSubmit={handleDisputeSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#566a7f] mb-1">
                    Lý do khiếu nại (bắt buộc):
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={disputeReasonText}
                    onChange={(e) => setDisputeReasonText(e.target.value)}
                    placeholder="Ví dụ: Gia sư không đến dạy nhưng vẫn bấm điểm danh, hoặc gia sư về sớm 45 phút..."
                    className="w-full p-2.5 bg-[#f5f5f9] border border-[#d9dee3] rounded-lg text-xs text-[#566a7f] focus:outline-none focus:border-[#ff3e1d]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setDisputingSession(null)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-[#697a8d] text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Đóng
                  </button>
                  <button
                    type="submit"
                    disabled={disputeSubmitting}
                    className="px-5 py-2 bg-[#ff3e1d] hover:bg-[#e03515] disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-md cursor-pointer transition-colors flex items-center gap-1.5"
                  >
                    {disputeSubmitting ? 'Đang gửi...' : 'Gửi Khiếu Nại'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* SUB-MODAL 3: ĐÁNH GIÁ DẠY THỬ & CHỐT CHÍNH THỨC           */}
        {/* ======================================================== */}
        {reviewingClass && (
          <div className="fixed inset-0 z-50 bg-[#233446]/40 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white border-0 rounded-2xl max-w-lg w-full p-6 text-left shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
              <h3 className="text-lg font-bold mb-1 text-[#566a7f]">Đánh giá kết quả dạy thử & Chốt lớp</h3>
              <p className="text-[#a1acb8] text-xs mb-4">
                Phản hồi ý kiến về buổi dạy thử của gia sư: <strong className="text-[#696cff]">{reviewingClass.tutor?.fullName}</strong>
              </p>

              {error && (
                <div className="mb-4 p-3 bg-[#ffe0db] border border-[#ff3e1d]/40 rounded-xl text-xs font-semibold text-[#ff3e1d]">
                  {error}
                </div>
              )}

              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div className="space-y-2.5">
                  <label className="block text-xs font-semibold text-[#566a7f]">Quyết định của bạn:</label>

                  <label
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      decision === 'ACCEPT'
                        ? 'bg-[#e8fadf] border-[#71dd37] text-[#71dd37]'
                        : 'bg-[#f5f5f9] border-[#d9dee3] text-[#566a7f]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="decision"
                      value="ACCEPT"
                      checked={decision === 'ACCEPT'}
                      onChange={() => setDecision('ACCEPT')}
                      className="mt-0.5"
                    />
                    <div>
                      <div className="text-xs font-bold flex items-center gap-1">
                        <CheckCircle2 size={14} /> Hài lòng — Chốt gia sư này & Vào học chính thức
                      </div>
                      <div className="text-[11px] text-[#697a8d] mt-0.5">Tiếp tục học chính thức, kích hoạt thời khóa biểu cố định.</div>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      decision === 'REJECT_TUTOR'
                        ? 'bg-[#ffe0db] border-[#ff3e1d] text-[#ff3e1d]'
                        : 'bg-[#f5f5f9] border-[#d9dee3] text-[#566a7f]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="decision"
                      value="REJECT_TUTOR"
                      checked={decision === 'REJECT_TUTOR'}
                      onChange={() => setDecision('REJECT_TUTOR')}
                      className="mt-0.5"
                    />
                    <div>
                      <div className="text-xs font-bold flex items-center gap-1">
                        <AlertTriangle size={14} /> Đổi gia sư khác (Do gia sư chưa phù hợp)
                      </div>
                      <div className="text-[11px] text-[#697a8d] mt-0.5">Lớp sẽ được trung tâm tìm lại gia sư mới hoàn toàn miễn phí.</div>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      decision === 'REJECT_PARENT'
                        ? 'bg-[#fff8e1] border-[#ffab00] text-[#ffab00]'
                        : 'bg-[#f5f5f9] border-[#d9dee3] text-[#566a7f]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="decision"
                      value="REJECT_PARENT"
                      checked={decision === 'REJECT_PARENT'}
                      onChange={() => setDecision('REJECT_PARENT')}
                      className="mt-0.5"
                    />
                    <div>
                      <div className="text-xs font-bold flex items-center gap-1">
                        <XCircle size={14} /> Hủy lớp (Gia đình thay đổi kế hoạch)
                      </div>
                      <div className="text-[11px] text-[#697a8d] mt-0.5">Đóng lớp học và ngừng tìm kiếm gia sư.</div>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      decision === 'SCALE_DOWN'
                        ? 'bg-[#e7e7ff] border-[#696cff] text-[#696cff]'
                        : 'bg-[#f5f5f9] border-[#d9dee3] text-[#566a7f]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="decision"
                      value="SCALE_DOWN"
                      checked={decision === 'SCALE_DOWN'}
                      onChange={() => setDecision('SCALE_DOWN')}
                      className="mt-0.5"
                    />
                    <div>
                      <div className="text-xs font-bold flex items-center gap-1">
                        <TrendingDown size={14} /> Giảm quy mô lớp học
                      </div>
                      <div className="text-[11px] text-[#697a8d] mt-0.5">Điều chỉnh số buổi học trên tuần.</div>
                    </div>
                  </label>
                </div>

                {/* Khi ACCEPT: Chọn ca học cố định & ngày bắt đầu */}
                {decision === 'ACCEPT' && (
                  <div className="p-3.5 bg-[#f8f9ff] rounded-xl border border-[#696cff]/20 space-y-3">
                    <label className="block text-xs font-bold text-[#566a7f]">
                      Chọn {reviewingClass.tutorRequest?.sessionsPerWeek || 2} ca học cố định trong tuần:
                    </label>
                    <div className="space-y-1.5 max-h-32 overflow-y-auto">
                      {(reviewingClass.tutorRequest?.scheduleNotes || 'Tối Thứ 2 (19:30 - 21:00); Tối Thứ 4 (19:30 - 21:00)')
                        .replace(/^Ca rảnh:\s*/i, '')
                        .split(';')
                        .map((slot: string) => slot.trim())
                        .filter(Boolean)
                        .map((slotStr: string, idx: number) => {
                          const isSelected = selectedSlots.includes(slotStr);
                          return (
                            <label
                              key={idx}
                              className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                                isSelected ? 'bg-white border-[#696cff] text-[#696cff] font-bold shadow-xs' : 'bg-white border-gray-200 text-[#566a7f]'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedSlots([...selectedSlots, slotStr]);
                                  } else {
                                    setSelectedSlots(selectedSlots.filter((s) => s !== slotStr));
                                  }
                                }}
                              />
                              <span>{slotStr}</span>
                            </label>
                          );
                        })}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#566a7f] mb-1">
                        Ngày bắt đầu buổi học đầu tiên:
                      </label>
                      <input
                        type="date"
                        required
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full p-2 bg-white border border-[#d9dee3] rounded-lg text-xs text-[#566a7f] focus:outline-none focus:border-[#696cff]"
                      />
                    </div>
                  </div>
                )}

                {decision !== 'ACCEPT' && (
                  <div>
                    <label className="block text-xs font-semibold text-[#566a7f] mb-1">
                      Lý do chi tiết (Bắt buộc):
                    </label>
                    <textarea
                      required
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Cho biết lý do cụ thể để trung tâm cải thiện..."
                      className="w-full p-3 bg-[#f5f5f9] border border-[#d9dee3] rounded-lg text-xs text-[#566a7f] focus:outline-none focus:border-[#696cff] resize-none"
                      rows={3}
                    />
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setReviewingClass(null)}
                    className="flex-1 py-2.5 bg-[#f5f5f9] hover:bg-gray-200 text-[#697a8d] rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Huỷ bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-2.5 bg-[#696cff] hover:bg-[#5f61e6] active:bg-[#595cd9] disabled:opacity-50 text-white font-bold rounded-xl text-xs cursor-pointer shadow-[0_2px_4px_0_rgba(105,108,255,0.4)] transition-all"
                  >
                    {submitting ? 'Đang gửi...' : 'Xác nhận Đánh giá'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 1: TÁI TỤC / GIA HẠN GÓI HỌC */}
        {renewModalOpen && renewClass && (() => {
          const rate = Number(renewClass.hourlyRate) || 200000;
          let discount = 0;
          if (renewSessionsCount === 12) discount = 0.05;
          if (renewSessionsCount === 16) discount = 0.1;
          const totalAmount = Math.round(renewSessionsCount * rate * (1 - discount));
          const qrUrl = `https://img.vietqr.io/image/970468-000037805179-compact.png?amount=${totalAmount}&addInfo=TT%20${renewClass.id.slice(0, 8)}&accountName=NGUYEN%20VAN%20DUNG`;

          return (
            <div className="fixed inset-0 z-50 bg-[#233446]/50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-sm font-sans animate-fadeIn">
              <div className="bg-white rounded-2xl max-w-lg w-full text-left shadow-2xl relative overflow-hidden border border-gray-100 max-h-[92vh] flex flex-col">
                {/* Header */}
                <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-[#f8f9ff] to-white">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#e7e7ff] text-[#696cff] flex items-center justify-center">
                      <RefreshCcw size={18} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#566a7f]">Tái Tục & Gia Hạn Gói Học</h3>
                      <p className="text-xs text-[#a1acb8]">Nạp thêm chu kỳ học phí mới cho học sinh {renewClass.student?.fullName}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setRenewModalOpen(false); setRenewClass(null); }}
                    className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleRenewSubmit} className="p-5 space-y-4 overflow-y-auto">
                  {/* Chọn gói */}
                  <div>
                    <label className="block text-xs font-bold text-[#566a7f] mb-2">Chọn gói học tái tục:</label>
                    <div className="grid grid-cols-3 gap-2.5">
                      {[
                        { sessions: 8, label: 'Gói 8 buổi', desc: '1 tháng', disc: 0 },
                        { sessions: 12, label: 'Gói 12 buổi', desc: '1.5 tháng (-5%)', disc: 0.05 },
                        { sessions: 16, label: 'Gói 16 buổi', desc: '2 tháng (-10%)', disc: 0.1 },
                      ].map((pkg) => {
                        const isSel = renewSessionsCount === pkg.sessions;
                        const pkgTotal = Math.round(pkg.sessions * rate * (1 - pkg.disc));
                        return (
                          <button
                            key={pkg.sessions}
                            type="button"
                            onClick={() => setRenewSessionsCount(pkg.sessions)}
                            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                              isSel
                                ? 'bg-[#e7e7ff]/60 border-[#696cff] shadow-xs'
                                : 'bg-white border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className={`text-xs font-bold ${isSel ? 'text-[#696cff]' : 'text-[#566a7f]'}`}>
                              {pkg.label}
                            </div>
                            <div className="text-[10px] text-[#a1acb8] mt-0.5">{pkg.desc}</div>
                            <div className="text-xs font-bold text-[#71dd37] mt-1.5 font-mono">
                              {(pkgTotal / 1000).toLocaleString()}k
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Chi tiết thanh toán & QR Code */}
                  <div className="p-4 bg-[#f8f9ff] border border-[#696cff]/20 rounded-xl space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#a1acb8] font-bold uppercase text-[10px]">Đơn giá mỗi buổi</span>
                      <span className="font-semibold text-[#566a7f]">{rate.toLocaleString()} đ</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#a1acb8] font-bold uppercase text-[10px]">Số buổi gia hạn</span>
                      <span className="font-bold text-[#696cff]">+{renewSessionsCount} buổi</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[#71dd37] font-bold uppercase text-[10px]">Ưu đãi giảm giá</span>
                        <span className="font-bold text-[#71dd37]">-{discount * 100}%</span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-gray-200 flex justify-between items-center">
                      <span className="text-xs font-bold text-[#566a7f]">Tổng học phí cần thanh toán:</span>
                      <span className="text-lg font-extrabold text-[#696cff] font-mono">{totalAmount.toLocaleString()} đ</span>
                    </div>

                    {/* VietQR */}
                    <div className="pt-2 flex flex-col items-center gap-2 bg-white p-3 rounded-xl border border-gray-100">
                      <img
                        src={qrUrl}
                        alt="VietQR ReNew"
                        className="w-40 h-40 object-contain rounded-lg border border-gray-100 shadow-xs"
                      />
                      <div className="text-center text-[11px] text-[#566a7f]">
                        <div>Ngân hàng: <strong>SeABank</strong> - STK: <strong className="font-mono text-[#696cff]">000037805179</strong></div>
                        <div>Chủ TK: <strong>NGUYEN VAN DUNG</strong> - Cú pháp: <strong className="font-mono text-[#ffab00]">TT {renewClass.id.slice(0, 8)}</strong></div>
                      </div>
                    </div>
                  </div>

                  {/* Submit */}
                  <div className="flex items-center justify-end gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => { setRenewModalOpen(false); setRenewClass(null); }}
                      className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-[#566a7f] text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      disabled={renewSubmitting}
                      className="px-5 py-2.5 bg-gradient-to-r from-[#696cff] to-[#5f61e6] hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
                    >
                      {renewSubmitting ? 'Đang kích hoạt...' : 'Xác Nhận Đã Chuyển Khoản & Kích Hoạt'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          );
        })()}

        {/* MODAL 2: BẢO HÀNH ĐỔI GIA SƯ 30 NGÀY */}
        {warrantyModalOpen && warrantyClass && (
          <div className="fixed inset-0 z-50 bg-[#233446]/50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-sm font-sans animate-fadeIn">
            <div className="bg-white rounded-2xl max-w-lg w-full text-left shadow-2xl relative overflow-hidden border border-gray-100">
              {/* Header */}
              <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-[#fff5f5] to-white">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#ffe0db] text-[#ff3e1d] flex items-center justify-center">
                    <Shield size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#566a7f]">Bảo Hành Đổi Gia Sư (30 Ngày)</h3>
                    <p className="text-xs text-[#a1acb8]">Chính sách đổi gia sư miễn phí 100% của trung tâm</p>
                  </div>
                </div>
                <button
                  onClick={() => { setWarrantyModalOpen(false); setWarrantyClass(null); }}
                  className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Body */}
              <form onSubmit={handleWarrantySubmit} className="p-5 space-y-4">
                {/* Cam kết của trung tâm */}
                <div className="p-3.5 bg-[#e8fadf]/60 border border-[#71dd37]/40 rounded-xl text-xs text-[#566a7f] space-y-1.5">
                  <div className="font-bold text-[#71dd37] flex items-center gap-1.5">
                    <CheckCircle2 size={15} /> Quyền lợi bảo hành của Phụ huynh:
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-[11px] text-[#697a8d]">
                    <li>Miễn phí 100% đổi gia sư mới trong 30 ngày đầu giảng dạy.</li>
                    <li>Bảo lưu nguyên vẹn toàn bộ số buổi học còn lại (<strong>{warrantyClass.remainingSessions ?? 8} buổi</strong>).</li>
                    <li>Chuyên viên học vụ sẽ liên hệ trong 24h và gửi hồ sơ 3 gia sư phù hợp nhất để gia đình lựa chọn.</li>
                  </ul>
                </div>

                <div>
                  <span className="text-xs font-semibold text-[#a1acb8] block">Gia sư hiện tại phụ trách:</span>
                  <div className="font-bold text-[#566a7f] text-sm mt-0.5">{warrantyClass.tutor?.fullName || 'Chưa rõ'}</div>
                </div>

                {/* Chọn lý do đổi gia sư */}
                <div>
                  <label className="block text-xs font-bold text-[#566a7f] mb-1.5">
                    Lý do bạn muốn đổi gia sư: <span className="text-[#ff3e1d]">*</span>
                  </label>
                  <select
                    value={warrantyReason}
                    onChange={(e) => setWarrantyReason(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#d9dee3] rounded-xl text-xs font-semibold text-[#566a7f] focus:outline-none focus:border-[#696cff]"
                  >
                    <option value="Phương pháp dạy chưa phù hợp với lực học của con">Phương pháp dạy chưa phù hợp với lực học của con</option>
                    <option value="Con chưa hiểu bài / không có sự tiến bộ rõ rệt">Con chưa hiểu bài / không có sự tiến bộ rõ rệt</option>
                    <option value="Gia sư thường xuyên đi trễ hoặc xin nghỉ đột xuất">Gia sư thường xuyên đi trễ hoặc xin nghỉ đột xuất</option>
                    <option value="Tác phong hoặc tính cách chưa hòa hợp với gia đình">Tác phong hoặc tính cách chưa hòa hợp với gia đình</option>
                    <option value="Lý do cá nhân khác">Lý do cá nhân khác</option>
                  </select>
                </div>

                {/* Ghi chú mong muốn về gia sư mới */}
                <div>
                  <label className="block text-xs font-bold text-[#566a7f] mb-1.5">
                    Yêu cầu mong muốn về gia sư thay thế:
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Ví dụ: Mong muốn gia sư nữ kiên nhẫn hơn, luyện nhiều bài tập cơ bản..."
                    value={warrantyNotes}
                    onChange={(e) => setWarrantyNotes(e.target.value)}
                    className="w-full p-3 bg-white border border-[#d9dee3] rounded-xl text-xs text-[#566a7f] focus:outline-none focus:border-[#696cff] resize-none"
                  />
                </div>

                {/* Submit */}
                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => { setWarrantyModalOpen(false); setWarrantyClass(null); }}
                    className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-[#566a7f] text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={warrantySubmitting}
                    className="px-5 py-2.5 bg-[#ff3e1d] hover:bg-[#d63317] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
                  >
                    {warrantySubmitting ? 'Đang gửi...' : 'Gửi Yêu Cầu Đổi Gia Sư'}
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
