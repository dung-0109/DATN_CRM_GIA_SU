import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { 
  ClipboardList, Plus, Clock, MapPin, DollarSign, Calendar, 
  User, CheckCircle, AlertCircle, ArrowLeft, Loader, Star, 
  GraduationCap, ShieldCheck, ChevronRight, Eye, Sparkles,
  Pencil, Ban, X, Check, AlertTriangle, RefreshCw,
  Award, BookOpen, Shield, HeartHandshake, Briefcase, FileCheck, CheckCircle2,
  Phone, Info, ListChecks, TrendingDown
} from 'lucide-react';
import PageTemplate from '../../components/PageTemplate';
import toast from 'react-hot-toast';

interface TutorSubjectItem {
  subject: string;
  grade: string;
  isVerified: boolean;
}

interface TutorApplication {
  id: string;
  status: string;
  coverLetter?: string;
  note?: string;
  matchScore?: number;
  tutor: {
    id: string;
    fullName: string;
    gender: string;
    dateOfBirth?: string;
    tutorType: string;
    qualification: string;
    occupation?: string;
    ratingAvg: any;
    karmaScore: number;
    certificatesJson?: any;
    publicProfile?: any;
    tutorSubjects?: TutorSubjectItem[];
    _count?: {
      classes?: number;
      reviews?: number;
    };
  };
}

interface TutorRequest {
  id: string;
  subject: string;
  grade: string;
  scheduleNotes: string;
  sessionsPerWeek: number;
  budgetPerSession: number;
  tutorGenderPref: string;
  learningMode?: string;
  address?: string;
  tutorTypePref?: string;
  requirements?: string;
  status: string;
  createdAt: string;
  student: {
    fullName: string;
    grade?: string;
  };
  classApplications?: TutorApplication[];
  classes?: Array<{
    id: string;
    status: string;
    tutorId: string;
    hourlyRate: number;
    remainingSessions: number;
    cancelReason?: string;
    classSchedules?: Array<{ dayOfWeek: number; slotStart: string; slotEnd: string; isActive: boolean }>;
    sessions?: Array<{ id: string; scheduledTime: string; status: string }>;
  }>;
  _count?: {
    classApplications: number;
  };
}

const STATUS_MAP: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  CONSULTING: {
    label: 'Đã tuyển chọn - Chờ duyệt',
    bg: 'bg-[#fff2d6]',
    text: 'text-[#ffab00]',
    dot: 'bg-[#ffab00]',
  },
  PUBLISHED: {
    label: 'Đang tuyển Gia sư',
    bg: 'bg-[#e7e7ff]',
    text: 'text-[#696cff]',
    dot: 'bg-[#696cff]',
  },
  NEW: {
    label: 'Mới gửi - Chờ duyệt',
    bg: 'bg-[#e1f0ff]',
    text: 'text-[#03c3ec]',
    dot: 'bg-[#03c3ec]',
  },
  MATCHED: {
    label: 'Đã khớp lớp & Dạy thử',
    bg: 'bg-[#e8fadf]',
    text: 'text-[#71dd37]',
    dot: 'bg-[#71dd37]',
  },
  CANCELLED: {
    label: 'Đã hủy',
    bg: 'bg-[#ffe0db]',
    text: 'text-[#ff3e1d]',
    dot: 'bg-[#ff3e1d]',
  },
};

export default function MyRequests() {
  const [requests, setRequests] = useState<TutorRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Modal xem hồ sơ gia sư ứng tuyển
  const [selectedRequest, setSelectedRequest] = useState<TutorRequest | null>(null);
  const [selectingTutorId, setSelectingTutorId] = useState<string | null>(null);

  // Modal theo dõi tiến độ tuyển chọn & ghép lớp
  const [viewingProgressRequest, setViewingProgressRequest] = useState<TutorRequest | null>(null);

  // Modal Đánh giá dạy thử & Chốt lịch chính thức
  const [evaluatingRequest, setEvaluatingRequest] = useState<TutorRequest | null>(null);
  const [evalDecision, setEvalDecision] = useState<'ACCEPT' | 'REJECT_TUTOR' | 'REJECT_PARENT' | 'SCALE_DOWN'>('ACCEPT');
  const [evalReason, setEvalReason] = useState<string>('');
  const [evalSelectedSlots, setEvalSelectedSlots] = useState<string[]>([]);
  const [evalStartDate, setEvalStartDate] = useState<string>('');
  const [evalNotes, setEvalNotes] = useState<string>('');
  const [submittingEval, setSubmittingEval] = useState(false);

  // Modal Phê duyệt gia sư & Chốt lịch dạy thử
  const [approvingRequest, setApprovingRequest] = useState<TutorRequest | null>(null);
  const [selectedTrialSlot, setSelectedTrialSlot] = useState<string>('');
  const [selectedTrialDate, setSelectedTrialDate] = useState<string>('');
  const [trialNote, setTrialNote] = useState<string>('');
  const [submittingApprove, setSubmittingApprove] = useState(false);

  // Modal Yêu cầu đổi gia sư khác
  const [rejectingRequest, setRejectingRequest] = useState<TutorRequest | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('Không phù hợp lịch học mong muốn');
  const [customRejectReason, setCustomRejectReason] = useState<string>('');
  const [submittingReject, setSubmittingReject] = useState(false);

  // Modal chỉnh sửa yêu cầu
  const [editingRequest, setEditingRequest] = useState<TutorRequest | null>(null);
  const [editForm, setEditForm] = useState({
    subject: '',
    grade: '',
    budgetPerSession: 200000,
    sessionsPerWeek: 2,
    scheduleNotes: '',
    learningMode: 'OFFLINE',
    address: '',
    requirements: '',
  });
  const [submittingEdit, setSubmittingEdit] = useState(false);

  // Trạng thái hủy
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const navigate = useNavigate();

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/v1/tutor-requests/my');
      setRequests(res.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải danh sách yêu cầu tìm gia sư');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
  };

  // Helper tách ca rảnh từ scheduleNotes
  const parseAvailableSlots = (scheduleNotes?: string): string[] => {
    if (!scheduleNotes) return ['Tối Thứ 2 (19:30 - 21:00)', 'Tối Thứ 4 (19:30 - 21:00)', 'Tối Thứ 6 (19:30 - 21:00)'];
    const clean = scheduleNotes.replace(/^Ca rảnh:\s*/i, '');
    const parts = clean.split(';').map((s) => s.trim()).filter(Boolean);
    return parts.length > 0 ? parts : [scheduleNotes];
  };

  // Mở modal duyệt chốt dạy thử
  const openApproveModal = (req: TutorRequest) => {
    const slots = parseAvailableSlots(req.scheduleNotes);
    setApprovingRequest(req);
    setSelectedTrialSlot(slots[0] || 'Tối Thứ 2 (19:30 - 21:00)');
    // Gợi ý ngày dạy thử cách 2 ngày
    const suggestDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    setSelectedTrialDate(suggestDate.toISOString().split('T')[0]);
    setTrialNote('');
  };

  // Mở modal yêu cầu đổi gia sư
  const openRejectModal = (req: TutorRequest) => {
    setRejectingRequest(req);
    setRejectReason('Không phù hợp lịch học mong muốn');
    setCustomRejectReason('');
  };

  // Xử lý gửi duyệt gia sư & chốt lịch dạy thử
  const handleApproveProposedTutor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!approvingRequest) return;
    if (!selectedTrialSlot) {
      toast.error('Vui lòng chọn 1 khung giờ cho buổi dạy thử');
      return;
    }
    setSubmittingApprove(true);
    try {
      const fullTrialSchedule = `${selectedTrialSlot} (Ngày: ${selectedTrialDate})${trialNote ? ` - Ghi chú: ${trialNote}` : ''}`;
      const res = await api.post(`/api/v1/tutor-requests/${approvingRequest.id}/approve-proposed-tutor`, {
        trialSchedule: fullTrialSchedule,
        trialDate: selectedTrialDate || undefined,
      });
      toast.success(res.data?.message || 'Đã duyệt gia sư & xếp lịch dạy thử thành công!');
      setApprovingRequest(null);
      setSelectedRequest(null);
      await fetchRequests();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể chốt gia sư dạy thử');
    } finally {
      setSubmittingApprove(false);
    }
  };

  // Xử lý gửi yêu cầu đổi gia sư khác
  const handleRejectProposedTutor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingRequest) return;
    setSubmittingReject(true);
    try {
      const finalReason = rejectReason === 'OTHER' ? customRejectReason : rejectReason;
      const res = await api.post(`/api/v1/tutor-requests/${rejectingRequest.id}/reject-proposed-tutor`, {
        reason: finalReason || 'Phụ huynh yêu cầu đổi gia sư khác phù hợp hơn',
      });
      toast.success(res.data?.message || 'Đã gửi yêu cầu đổi gia sư tới chuyên viên điều phối!');
      setRejectingRequest(null);
      setRejectReason('Không phù hợp lịch học mong muốn');
      setCustomRejectReason('');
      setSelectedRequest(null);
      await fetchRequests();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể gửi yêu cầu đổi gia sư');
    } finally {
      setSubmittingReject(false);
    }
  };

  // Mở modal Đánh giá dạy thử & Chốt lịch dạy chính thức
  const openTrialEvalModal = (req: TutorRequest) => {
    setEvaluatingRequest(req);
    setEvalDecision('ACCEPT');
    setEvalReason('');
    const slots = parseAvailableSlots(req.scheduleNotes);
    setEvalSelectedSlots(slots.slice(0, req.sessionsPerWeek || 2));
    const nextDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    setEvalStartDate(nextDate.toISOString().split('T')[0]);
    setEvalNotes('');
  };

  // Xử lý gửi Đánh giá dạy thử & Chốt lịch chính thức
  const handleTrialEvalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evaluatingRequest) return;
    const targetClass = evaluatingRequest.classes?.[0];
    if (!targetClass?.id) {
      toast.error('Không tìm thấy thông tin lớp học liên kết');
      return;
    }

    if (evalDecision === 'ACCEPT') {
      if (evalSelectedSlots.length === 0) {
        toast.error('Vui lòng chọn ít nhất 1 ca học cố định trong tuần');
        return;
      }
    } else {
      if (!evalReason.trim()) {
        toast.error('Vui lòng nhập lý do cụ thể cho quyết định này');
        return;
      }
    }

    setSubmittingEval(true);
    try {
      const schedulesPayload = evalSelectedSlots.map((slotStr) => {
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

      const res = await api.post(`/api/v1/sessions/class/${targetClass.id}/trial-review`, {
        action: evalDecision,
        reason: evalDecision !== 'ACCEPT' ? evalReason : undefined,
        schedules: evalDecision === 'ACCEPT' ? schedulesPayload : undefined,
        startDate: evalDecision === 'ACCEPT' ? evalStartDate : undefined,
        notes: evalNotes || undefined,
      });

      toast.success(res.data?.message || 'Đã gửi đánh giá thành công!');
      setEvaluatingRequest(null);
      await fetchRequests();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Đánh giá dạy thử thất bại');
    } finally {
      setSubmittingEval(false);
    }
  };

  // Mở modal sửa yêu cầu
  const openEditModal = (req: TutorRequest) => {
    setEditingRequest(req);
    setEditForm({
      subject: req.subject,
      grade: req.grade,
      budgetPerSession: Number(req.budgetPerSession),
      sessionsPerWeek: req.sessionsPerWeek,
      scheduleNotes: req.scheduleNotes || '',
      learningMode: req.learningMode || 'OFFLINE',
      address: req.address || '',
      requirements: req.requirements || '',
    });
  };

  // Lưu chỉnh sửa yêu cầu
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRequest) return;
    setSubmittingEdit(true);
    try {
      await api.put(`/api/v1/tutor-requests/${editingRequest.id}`, {
        ...editForm,
        budgetPerSession: Number(editForm.budgetPerSession),
        sessionsPerWeek: Number(editForm.sessionsPerWeek),
      });
      setEditingRequest(null);
      await fetchRequests();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Cập nhật yêu cầu thất bại');
    } finally {
      setSubmittingEdit(false);
    }
  };

  // Hủy yêu cầu
  const handleCancelRequest = async (req: TutorRequest) => {
    if (!confirm(`Bạn có chắc chắn muốn hủy yêu cầu tìm gia sư môn ${req.subject} cho bé ${req.student?.fullName}?`)) {
      return;
    }
    setCancellingId(req.id);
    try {
      await api.post(`/api/v1/tutor-requests/${req.id}/cancel`);
      await fetchRequests();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Hủy yêu cầu thất bại');
    } finally {
      setCancellingId(null);
    }
  };

  // Chọn trực tiếp (fallback nếu cần)
  const handleSelectTutor = async (requestId: string, tutorId: string, tutorName: string) => {
    if (!confirm(`Xác nhận chọn Gia sư "${tutorName}" dạy thử cho bé? Hệ thống sẽ tạo lớp học để bắt đầu.`)) {
      return;
    }
    setSelectingTutorId(tutorId);
    try {
      await api.post(`/api/v1/tutor-requests/${requestId}/select-tutor`, { tutorId });
      toast.success(`Đã chọn Gia sư "${tutorName}" dạy thử thành công! Lớp học đã được tạo.`);
      setSelectedRequest(null);
      await fetchRequests();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể chọn gia sư');
    } finally {
      setSelectingTutorId(null);
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (filterStatus === 'ALL') return true;
    return r.status === filterStatus;
  });

  return (
    <PageTemplate
      title="Yêu Cầu Tìm Gia Sư Của Tôi"
      subtitle="Theo dõi tiến độ so khớp, chỉnh sửa yêu cầu và chọn gia sư dạy thử cho con"
      badge="Client Portal"
    >
      <div className="w-full space-y-6 text-left font-sans text-[#566a7f]">
        {/* Navigation & Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Link
            to="/client"
            className="text-xs font-semibold text-[#697a8d] hover:text-[#696cff] bg-white border border-gray-200 px-3.5 py-1.5 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft size={14} /> Quay lại Client Portal
          </Link>

          <Link
            to="/client/request-tutor"
            className="px-4 py-2 bg-[#696cff] hover:bg-[#5f61e6] text-white text-xs font-bold rounded-lg transition-all shadow-[0_2px_4px_0_rgba(105,108,255,0.4)] flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={16} /> Đăng ký tìm Gia sư mới
          </Link>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { key: 'ALL', label: `Tất cả (${requests.length})` },
            { key: 'CONSULTING', label: 'Chờ duyệt gia sư' },
            { key: 'PUBLISHED', label: 'Đang tuyển' },
            { key: 'MATCHED', label: 'Đã khớp lớp' },
            { key: 'CANCELLED', label: 'Đã hủy' },
          ].map((pill) => (
            <button
              key={pill.key}
              onClick={() => setFilterStatus(pill.key)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterStatus === pill.key
                  ? 'bg-[#696cff] text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-[#697a8d] hover:border-gray-300'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="p-4 bg-[#ffe0db] border border-[#ff3e1d]/40 rounded-xl text-xs font-semibold text-[#ff3e1d]">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-16 text-[#a1acb8] text-sm flex flex-col items-center gap-3">
            <Loader size={28} className="animate-spin text-[#696cff]" />
            Đang tải danh sách yêu cầu tìm gia sư...
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="py-16 text-center bg-white border border-gray-100 rounded-xl shadow-sm space-y-3">
            <ClipboardList size={48} className="mx-auto text-[#a1acb8]" />
            <p className="text-base font-bold text-[#566a7f]">
              {filterStatus === 'ALL' ? 'Bạn chưa gửi yêu cầu tìm gia sư nào' : 'Không có yêu cầu nào theo bộ lọc này'}
            </p>
            <p className="text-xs text-[#a1acb8] max-w-sm mx-auto">
              Gửi thông tin nhu cầu học tập của con, hệ thống sẽ kết nối đội ngũ gia sư tài năng phù hợp nhất.
            </p>
            <div className="pt-2">
              <Link
                to="/client/request-tutor"
                className="px-5 py-2.5 bg-[#696cff] hover:bg-[#5f61e6] text-white text-xs font-bold rounded-lg shadow-[0_2px_4px_0_rgba(105,108,255,0.4)] inline-flex items-center gap-2"
              >
                <Plus size={15} /> Tạo yêu cầu tìm Gia sư ngay
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredRequests.map((req) => {
              const statusCfg = STATUS_MAP[req.status] || STATUS_MAP.NEW;
              const appCount = req._count?.classApplications || req.classApplications?.length || 0;
              const isMatched = req.status === 'MATCHED';
              const isCancelled = req.status === 'CANCELLED';

              const proposedApp = req.classApplications?.find((a) => a.status === 'SHORTLISTED');
              const matchedApp = req.classApplications?.find((a) => a.status === 'SELECTED_FOR_TRIAL');

              return (
                <div
                  key={req.id}
                  className={`bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition-shadow space-y-4 flex flex-col justify-between ${
                    proposedApp
                      ? 'border-[#ffab00]/60 ring-2 ring-[#ffab00]/10'
                      : 'border-gray-100'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header: Student Name + Status Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-[#566a7f]">
                            {req.subject}
                          </span>
                          <span className="text-xs font-semibold text-[#696cff] bg-[#e7e7ff] px-2 py-0.5 rounded">
                            {req.grade}
                          </span>
                        </div>
                        <p className="text-xs text-[#a1acb8] mt-0.5 flex items-center gap-1.5">
                          <span>Học sinh:</span>
                          <strong className="text-[#566a7f] font-semibold">{req.student?.fullName}</strong>
                        </p>
                      </div>

                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 shrink-0 ${statusCfg.bg} ${statusCfg.text}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`}></span>
                        {statusCfg.label}
                      </span>
                    </div>

                    {/* Banner nếu có Gia sư do Chuyên viên tuyển chọn đề xuất */}
                    {proposedApp && (
                      <div className="p-3.5 bg-gradient-to-r from-[#fff4e5] to-[#fffbf0] border border-[#ffab00]/40 rounded-xl space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-extrabold uppercase text-[#ffab00] flex items-center gap-1.5">
                            <Sparkles size={14} className="text-[#ffab00]" /> Đã chọn được Gia sư phù hợp
                          </span>
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#ffab00] text-white animate-pulse">
                            Cần bạn duyệt
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ffab00] to-[#ff8f00] text-white font-bold flex items-center justify-center text-sm shadow-sm">
                            {proposedApp.tutor?.fullName?.charAt(0) || 'G'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-[#566a7f] truncate">{proposedApp.tutor?.fullName}</div>
                            <div className="text-xs text-[#697a8d] flex items-center gap-2 mt-0.5">
                              <span>{proposedApp.tutor?.qualification || 'Cử nhân'}</span>
                              <span>•</span>
                              <span className="text-[#ffab00] font-bold flex items-center gap-0.5">
                                <Star size={11} fill="#ffab00" />
                                {proposedApp.tutor?.ratingAvg ? Number(proposedApp.tutor.ratingAvg).toFixed(1) : '5.0'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedRequest(req)}
                          className="w-full py-2 bg-[#ffab00] hover:bg-[#e69a00] text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <Eye size={14} /> Xem hồ sơ & Duyệt dạy thử ngay
                        </button>
                      </div>
                    )}

                    {/* Banner nếu đã chốt dạy thử hoặc đang học chính thức */}
                    {matchedApp && (() => {
                      const targetCls = req.classes?.[0];
                      const isTeaching = targetCls?.status === 'TEACHING';
                      const trialSession = targetCls?.sessions?.[0];
                      const isTrialAttended = trialSession?.status === 'ATTENDED' || trialSession?.status === 'COMPLETED';
                      const trialDatePassed = trialSession?.scheduledTime && new Date(trialSession.scheduledTime).getTime() < Date.now();
                      const trialScheduleText = targetCls?.cancelReason || req.scheduleNotes || '';

                      return (
                        <div
                          className={`p-3.5 rounded-xl border flex flex-col gap-2.5 transition-all ${
                            isTeaching
                              ? 'bg-[#e7e7ff]/70 border-[#696cff]/40 shadow-xs'
                              : 'bg-gradient-to-r from-[#edfcf2] to-[#f4fdf7] border-[#71dd37]/50 shadow-xs'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-2 text-xs font-bold">
                              {isTeaching ? (
                                <>
                                  <CheckCircle2 size={17} className="text-[#696cff]" />
                                  <span className="text-[#696cff] text-sm">
                                    Đang học chính thức: <strong>{matchedApp.tutor?.fullName}</strong>
                                  </span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle size={17} className="text-[#71dd37]" />
                                  <span className="text-[#71dd37] text-sm">
                                    Đã chốt Gia sư: <strong>{matchedApp.tutor?.fullName}</strong> (Dạy thử)
                                  </span>
                                </>
                              )}
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <button
                                onClick={() => setSelectedRequest(req)}
                                className="px-2.5 py-1 text-xs font-bold text-[#566a7f] hover:text-[#696cff] bg-white border border-gray-200 hover:border-[#696cff] rounded-lg transition-colors cursor-pointer"
                              >
                                Xem hồ sơ gia sư
                              </button>
                              {!isTeaching && (
                                <button
                                  onClick={() => openTrialEvalModal(req)}
                                  className="px-3 py-1 bg-gradient-to-r from-[#696cff] to-[#5f61e6] hover:opacity-95 text-white font-bold text-xs rounded-lg transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                                  title="Đánh giá kết quả dạy thử để chốt lịch học chính thức"
                                >
                                  <Star size={13} fill="currentColor" /> ⭐ Đánh giá & Chốt dạy chính thức
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Chi tiết tiến độ buổi dạy thử */}
                          {!isTeaching ? (
                            <div className="p-2.5 bg-white/80 rounded-lg border border-[#71dd37]/30 text-xs text-[#566a7f] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <Calendar size={14} className="text-[#71dd37] shrink-0" />
                                <span>
                                  <strong className="text-[#697a8d]">Lịch hẹn dạy thử:</strong> {trialScheduleText || 'Đang cập nhật'}
                                </span>
                              </div>
                              <div>
                                {targetCls?.status === 'DEPOSIT' ? (
                                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#fff8e1] text-[#ffab00]">
                                    ⏳ Chờ gia sư nộp cọc 500k
                                  </span>
                                ) : isTrialAttended || trialDatePassed ? (
                                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#e8fadf] text-[#71dd37]">
                                    ✅ Đã hoàn thành buổi dạy thử!
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#e7e7ff] text-[#696cff]">
                                    🕒 Sắp diễn ra buổi dạy thử
                                  </span>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="p-2.5 bg-white/90 rounded-lg border border-[#696cff]/20 text-xs text-[#697a8d] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span>Số buổi còn lại chu kỳ: <strong className="text-[#696cff]">{targetCls?.remainingSessions ?? 8} buổi</strong></span>
                                {typeof targetCls?.remainingSessions === 'number' && targetCls.remainingSessions <= 2 && (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#ffe0db] text-[#ff3e1d] animate-pulse">
                                    ⚠️ Sắp hết buổi
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-bold text-[#71dd37] hidden md:inline">
                                  🎉 Đã kích hoạt chính thức
                                </span>
                                <Link
                                  to="/client/attendance"
                                  className="px-2.5 py-1 text-[11px] font-bold text-[#696cff] bg-[#e7e7ff] hover:bg-[#696cff] hover:text-white rounded-lg transition-all shadow-2xs"
                                >
                                  Quản lý lớp, Tái tục & Bảo hành &rarr;
                                </Link>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}


                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs bg-[#f8f9fa] p-3 rounded-lg border border-gray-100">
                      <div>
                        <span className="text-[11px] text-[#a1acb8] block">Học phí đề xuất:</span>
                        <strong className="text-[#696cff] font-bold">{formatVND(Number(req.budgetPerSession))}</strong>
                        <span className="text-[10px] text-[#a1acb8]"> / buổi</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-[#a1acb8] block">Thời lượng:</span>
                        <strong className="text-[#566a7f] font-semibold">{req.sessionsPerWeek} buổi / tuần</strong>
                      </div>
                      <div className="col-span-2 pt-1 border-t border-gray-200">
                        <span className="text-[11px] text-[#a1acb8] block">Hình thức & Địa điểm:</span>
                        <div className="text-[#566a7f] font-medium flex items-center gap-1.5 mt-0.5">
                          {req.learningMode === 'ONLINE' ? (
                            <span>💻 Học Online qua Zoom/Meet</span>
                          ) : (
                            <span className="truncate">🏠 Tại nhà: {req.address || 'Theo địa chỉ phụ huynh'}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Schedule Notes */}
                    <div className="text-xs text-[#566a7f] space-y-1">
                      <div className="flex items-start gap-1.5">
                        <Clock size={14} className="text-[#a1acb8] shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-[#697a8d]">Lịch học rảnh: </span>
                          <span>{req.scheduleNotes}</span>
                        </div>
                      </div>

                      {req.requirements && (
                        <div className="flex items-start gap-1.5 pt-1">
                          <Sparkles size={14} className="text-[#ffab00] shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-[#697a8d]">Yêu cầu riêng: </span>
                            <span className="italic text-[#566a7f]">{req.requirements}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer & Actions */}
                  <div className="pt-3 border-t border-gray-100 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {isMatched ? (
                          <span className="text-xs font-bold text-[#71dd37] flex items-center gap-1.5">
                            <CheckCircle2 size={16} className="text-[#71dd37]" />
                            Đã chốt gia sư dạy thử
                          </span>
                        ) : proposedApp ? (
                          <span className="text-xs font-bold text-[#ffab00] flex items-center gap-1.5">
                            <Sparkles size={16} className="text-[#ffab00]" />
                            1 gia sư được chọn cho bạn
                          </span>
                        ) : appCount > 0 ? (
                          <span className="text-xs font-bold text-[#696cff] flex items-center gap-1.5">
                            <GraduationCap size={16} className="text-[#696cff]" />
                            {appCount} gia sư đã nộp hồ sơ
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-[#a1acb8] flex items-center gap-1.5">
                            <Clock size={16} className="text-[#a1acb8]" />
                            Đang tìm kiếm gia sư...
                          </span>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setViewingProgressRequest(req)}
                          className="px-3 py-1.5 bg-[#f0f1ff] hover:bg-[#696cff] text-[#696cff] hover:text-white font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                          title="Xem toàn bộ tiến trình xử lý và thẩm định của yêu cầu này"
                        >
                          <Clock size={13} /> Tiến độ {appCount > 0 && !isMatched ? `(${appCount})` : ''}
                        </button>

                        {!isMatched && !isCancelled && (
                          <>
                            <button
                              onClick={() => openEditModal(req)}
                              className="p-1.5 text-[#697a8d] hover:text-[#696cff] hover:bg-[#f5f5f9] rounded-lg transition-colors cursor-pointer"
                              title="Chỉnh sửa yêu cầu"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              onClick={() => handleCancelRequest(req)}
                              disabled={cancellingId === req.id}
                              className="p-1.5 text-[#a1acb8] hover:text-[#ff3e1d] hover:bg-[#ffe0db]/40 rounded-lg transition-colors cursor-pointer"
                              title="Hủy yêu cầu"
                            >
                              {cancellingId === req.id ? (
                                <Loader size={15} className="animate-spin" />
                              ) : (
                                <Ban size={15} />
                              )}
                            </button>
                          </>
                        )}

                        {isCancelled && (
                          <button
                            onClick={() => navigate(`/client/request-tutor?studentId=${req.student?.fullName}`)}
                            className="px-2.5 py-1 text-xs font-semibold text-[#696cff] hover:bg-[#696cff]/10 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <RefreshCw size={12} /> Đăng lại
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal Xem Hồ Sơ Gia Sư & DUYỆT / ĐỔI GIA SƯ */}
        {selectedRequest && (() => {
          const proposedApp = selectedRequest.classApplications?.find((a) => a.status === 'SHORTLISTED');
          const matchedApp = selectedRequest.classApplications?.find((a) => a.status === 'SELECTED_FOR_TRIAL');
          const app = proposedApp || matchedApp;
          const tutor = app?.tutor;

          const birthYear = tutor?.dateOfBirth ? new Date(tutor.dateOfBirth).getFullYear() : null;
          const age = birthYear && birthYear > 1950 ? new Date().getFullYear() - birthYear : null;
          const genderText = tutor?.gender === 'MALE' ? 'Nam' : tutor?.gender === 'FEMALE' ? 'Nữ' : (tutor?.gender || 'Nam');

          const tutorTypeDisplay = tutor?.tutorType === 'TEACHER' 
            ? { title: 'Giáo viên Chuyên nghiệp', tag: 'Giáo viên đứng lớp', badge: 'bg-[#e7e7ff] text-[#696cff] border-[#696cff]/30', exp: '3+ năm giảng dạy' }
            : { title: 'Sinh viên Giỏi / ĐH Sư Phạm Top đầu', tag: 'Sinh viên xuất sắc', badge: 'bg-[#e8fadf] text-[#71dd37] border-[#71dd37]/30', exp: '2+ năm gia sư kèm cặp' };

          const ratingVal = tutor?.ratingAvg ? Number(tutor.ratingAvg).toFixed(1) : '5.0';
          const karmaVal = tutor?.karmaScore || 100;
          const reviewCount = tutor?._count?.reviews || 8;
          const classesCount = tutor?._count?.classes || 6;

          return (
            <div className="fixed inset-0 z-50 bg-[#233446]/50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-sm font-sans animate-fadeIn">
              <div className="bg-white rounded-2xl max-w-3xl w-full text-left shadow-2xl relative max-h-[92vh] flex flex-col overflow-hidden border border-gray-100">
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 via-white to-gray-50 shrink-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-[#e7e7ff] text-[#696cff] flex items-center gap-1.5 uppercase tracking-wide shadow-sm">
                      <Sparkles size={13} className="text-[#696cff]" /> Ban Chuyên Môn Đề Xuất
                    </span>
                    {proposedApp && (
                      <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-[#fff2d6] text-[#ffab00] border border-[#ffab00]/40 flex items-center gap-1">
                        <Clock size={12} /> Chờ bạn xét duyệt
                      </span>
                    )}
                    {matchedApp && (
                      <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-[#e8fadf] text-[#71dd37] border border-[#71dd37]/40 flex items-center gap-1">
                        <CheckCircle size={12} /> Đã chốt dạy thử
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedRequest(null)}
                    className="text-[#a1acb8] hover:text-[#566a7f] hover:bg-gray-100 p-1.5 rounded-xl transition-colors cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Modal Scrollable Body */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 custom-scrollbar">
                  {/* Subtitle Request Summary */}
                  <div className="p-3.5 bg-gradient-to-r from-[#f8f9ff] to-[#f4f5fa] rounded-xl border border-[#696cff]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="text-xs text-[#a1acb8] font-bold uppercase tracking-wider">Lớp học yêu cầu</div>
                      <div className="text-base font-extrabold text-[#566a7f] flex items-center gap-2">
                        <span>Môn {selectedRequest.subject} ({selectedRequest.grade})</span>
                        <span className="text-xs font-semibold text-[#697a8d]">cho bé {selectedRequest.student?.fullName}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-semibold text-[#697a8d] shrink-0">
                      <div>
                        <span className="text-[#a1acb8] block text-[10px]">Học phí đề xuất</span>
                        <strong className="text-[#696cff] text-sm font-bold">{formatVND(Number(selectedRequest.budgetPerSession))}/buổi</strong>
                      </div>
                      <div className="w-px h-7 bg-gray-200"></div>
                      <div>
                        <span className="text-[#a1acb8] block text-[10px]">Thời lượng</span>
                        <strong className="text-[#566a7f] text-sm">{selectedRequest.sessionsPerWeek} buổi / tuần</strong>
                      </div>
                    </div>
                  </div>

                  {app && tutor ? (
                    <div className="space-y-6">
                      {/* 1. Hero Card: Thông tin cơ bản & Học vị */}
                      <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-[#696cff]/10 to-transparent rounded-bl-full pointer-events-none"></div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 relative z-10">
                          {/* Avatar */}
                          <div className="relative shrink-0">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#696cff] via-[#5f61e6] to-[#4338ca] text-white flex items-center justify-center font-black text-3xl shadow-lg shadow-[#696cff]/30 ring-4 ring-white">
                              {tutor.fullName?.charAt(0)?.toUpperCase() || 'G'}
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-[#71dd37] text-white p-1 rounded-full shadow-md" title="Đã xác minh danh tính và bằng cấp">
                              <ShieldCheck size={16} />
                            </div>
                          </div>

                          {/* Profile Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <h3 className="text-xl font-black text-[#566a7f]">{tutor.fullName}</h3>
                              <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-md border ${tutorTypeDisplay.badge}`}>
                                {tutorTypeDisplay.tag}
                              </span>
                              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#f5f5f9] text-[#697a8d]">
                                {genderText}
                              </span>
                              {age && (
                                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#f5f5f9] text-[#697a8d]">
                                  {age} tuổi (Sinh năm {birthYear})
                                </span>
                              )}
                            </div>

                            {/* Qualification & Occupation */}
                            <div className="mt-2.5 space-y-1 text-xs">
                              <div className="flex items-center gap-2 text-[#566a7f] font-semibold">
                                <GraduationCap size={15} className="text-[#696cff] shrink-0" />
                                <span>{tutor.qualification || 'Cử nhân Đại học Sư phạm'}</span>
                              </div>
                              <div className="flex items-center gap-2 text-[#697a8d]">
                                <Briefcase size={14} className="text-[#ffab00] shrink-0" />
                                <span>{tutor.occupation || (tutor.tutorType === 'TEACHER' ? 'Giáo viên trường THCS / THPT' : 'Sinh viên các trường Đại học Top đầu')}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Verified Ribbon */}
                        <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-1.5 text-[#71dd37] font-bold">
                            <CheckCircle2 size={15} />
                            <span>Đã xác minh CCCD, Bằng cấp đại học & Phỏng vấn chuyên môn 1-1</span>
                          </div>
                          {app.matchScore && (
                            <div className="px-2.5 py-1 rounded-lg bg-[#e8fadf] text-[#71dd37] font-extrabold text-[11px]">
                              Độ phù hợp: {app.matchScore}%
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 2. Thống kê năng lực & Uy tín (KPI 4 Cột) */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-3.5 bg-white rounded-xl border border-gray-200 text-center shadow-xs">
                          <div className="flex items-center justify-center gap-1 text-[#ffab00] font-black text-lg">
                            <Star size={18} fill="#ffab00" />
                            <span>{ratingVal}</span>
                            <span className="text-xs text-[#a1acb8] font-normal">/ 5.0</span>
                          </div>
                          <div className="text-[11px] text-[#697a8d] font-semibold mt-0.5">
                            {reviewCount} đánh giá từ PH
                          </div>
                        </div>

                        <div className="p-3.5 bg-white rounded-xl border border-gray-200 text-center shadow-xs">
                          <div className="flex items-center justify-center gap-1 text-[#696cff] font-black text-lg">
                            <Shield size={18} />
                            <span>{karmaVal}</span>
                            <span className="text-xs text-[#a1acb8] font-normal">/ 100</span>
                          </div>
                          <div className="text-[11px] text-[#697a8d] font-semibold mt-0.5">
                            Điểm uy tín Karma
                          </div>
                        </div>

                        <div className="p-3.5 bg-white rounded-xl border border-gray-200 text-center shadow-xs">
                          <div className="flex items-center justify-center gap-1 text-[#71dd37] font-black text-lg">
                            <Award size={18} />
                            <span>{classesCount}</span>
                          </div>
                          <div className="text-[11px] text-[#697a8d] font-semibold mt-0.5">
                            Lớp đã hoàn thành
                          </div>
                        </div>

                        <div className="p-3.5 bg-white rounded-xl border border-gray-200 text-center shadow-xs">
                          <div className="flex items-center justify-center gap-1 text-[#03c3ec] font-black text-lg">
                            <Clock size={18} />
                            <span>{tutorTypeDisplay.exp.split(' ')[0]}</span>
                          </div>
                          <div className="text-[11px] text-[#697a8d] font-semibold mt-0.5">
                            Thâm niên giảng dạy
                          </div>
                        </div>
                      </div>

                      {/* 3. Môn thế mạnh & Khối lớp đã được trung tâm xác thực */}
                      <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-[#566a7f] flex items-center gap-2">
                            <BookOpen size={16} className="text-[#696cff]" /> Các môn giảng dạy đã được kiểm định chuyên môn
                          </h4>
                          <span className="text-[11px] text-[#71dd37] font-semibold flex items-center gap-1">
                            <CheckCircle size={12} /> Đạt chuẩn sư phạm
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2 pt-1">
                          {tutor.tutorSubjects && tutor.tutorSubjects.length > 0 ? (
                            tutor.tutorSubjects.map((ts, idx) => {
                              const isCurrentSubject = ts.subject.toLowerCase().includes(selectedRequest.subject.toLowerCase()) ||
                                                       selectedRequest.subject.toLowerCase().includes(ts.subject.toLowerCase());
                              return (
                                <div
                                  key={idx}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                                    isCurrentSubject
                                      ? 'bg-[#696cff] text-white shadow-md shadow-[#696cff]/20 ring-2 ring-[#696cff]/20'
                                      : 'bg-[#f5f5f9] text-[#566a7f] border border-gray-200'
                                  }`}
                                >
                                  <span>{ts.subject} (Khối {ts.grade})</span>
                                  {ts.isVerified && (
                                    <CheckCircle size={13} className={isCurrentSubject ? 'text-white' : 'text-[#71dd37]'} />
                                  )}
                                </div>
                              );
                            })
                          ) : (
                            <>
                              <div className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#696cff] text-white shadow-md shadow-[#696cff]/20 flex items-center gap-1.5">
                                <span>{selectedRequest.subject} (Khối {selectedRequest.grade})</span>
                                <CheckCircle size={13} className="text-white" />
                              </div>
                              <div className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#f5f5f9] text-[#566a7f] border border-gray-200 flex items-center gap-1.5">
                                <span>Toán & Khoa học Tự nhiên</span>
                                <CheckCircle size={13} className="text-[#71dd37]" />
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* 4. Phương pháp giảng dạy & Triết lý sư phạm */}
                      <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-sm space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#566a7f] flex items-center gap-2">
                          <Sparkles size={16} className="text-[#ffab00]" /> Phương pháp sư phạm & Cam kết đồng hành
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                          <div className="p-3 bg-[#f8f9fa] rounded-xl border border-gray-100 space-y-1">
                            <div className="text-xs font-bold text-[#696cff] flex items-center gap-1.5">
                              <span>🧠</span> Tư duy Sơ đồ (Mindmap)
                            </div>
                            <p className="text-[11px] text-[#697a8d] leading-relaxed">
                              Truyền đạt bản chất lý thuyết, sơ đồ hóa kiến thức giúp học sinh hiểu sâu, không học vẹt.
                            </p>
                          </div>

                          <div className="p-3 bg-[#f8f9fa] rounded-xl border border-gray-100 space-y-1">
                            <div className="text-xs font-bold text-[#71dd37] flex items-center gap-1.5">
                              <span>🎯</span> Lộ trình cá nhân hóa
                            </div>
                            <p className="text-[11px] text-[#697a8d] leading-relaxed">
                              Kiểm tra năng lực buổi đầu, bù đắp lỗ hổng căn bản trước khi bồi dưỡng kỹ năng nâng cao.
                            </p>
                          </div>

                          <div className="p-3 bg-[#f8f9fa] rounded-xl border border-gray-100 space-y-1">
                            <div className="text-xs font-bold text-[#03c3ec] flex items-center gap-1.5">
                              <span>📊</span> Báo cáo định kỳ minh bạch
                            </div>
                            <p className="text-[11px] text-[#697a8d] leading-relaxed">
                              Ghi chép nhận xét sau từng buổi dạy trên CRM, phụ huynh dễ dàng nắm bắt sự tiến bộ của con.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* 5. Thư ngỏ từ Gia sư */}
                      <div className="p-4 bg-[#fffdf5] rounded-2xl border border-[#ffab00]/30 shadow-xs space-y-2 relative">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#ffab00] flex items-center gap-1.5">
                          <FileCheck size={14} /> Thư ngỏ cam kết từ Gia sư
                        </span>
                        <p className="text-xs text-[#566a7f] italic leading-relaxed pl-3 border-l-2 border-[#ffab00]">
                          "{app.coverLetter || 'Kính chào Phụ huynh, tôi rất vinh dự được nhận đề xuất giảng dạy cho em. Với kinh nghiệm sư phạm và sự kiên nhẫn, tôi cam kết sẽ tận tâm đồng hành, tạo không khí học tập tích cực, giúp em lấy lại hứng thú môn học và cải thiện kết quả rõ rệt sau 8 - 10 buổi.'}"
                        </p>
                      </div>

                      {/* 6. Chính sách Bảo chứng từ Trung tâm */}
                      <div className="p-4 bg-gradient-to-br from-[#f8f9ff] to-[#f0f2ff] rounded-2xl border border-[#696cff]/20 space-y-2.5">
                        <span className="text-xs font-bold text-[#696cff] flex items-center gap-1.5 uppercase tracking-wide">
                          <HeartHandshake size={15} /> 3 Đặc quyền bảo chứng từ Trung tâm Gia sư
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-[#697a8d]">
                          <div className="flex items-start gap-1.5">
                            <CheckCircle size={14} className="text-[#71dd37] shrink-0 mt-0.5" />
                            <span><strong>01 Buổi học thử:</strong> Đánh giá mức độ hòa hợp trước khi ký hợp đồng dài hạn.</span>
                          </div>
                          <div className="flex items-start gap-1.5">
                            <CheckCircle size={14} className="text-[#71dd37] shrink-0 mt-0.5" />
                            <span><strong>Bảo hành đổi người:</strong> Đổi gia sư miễn phí trong 30 ngày nếu không hợp phong cách.</span>
                          </div>
                          <div className="flex items-start gap-1.5">
                            <CheckCircle size={14} className="text-[#71dd37] shrink-0 mt-0.5" />
                            <span><strong>An toàn học phí:</strong> Trung tâm giám sát học phí, thanh toán minh bạch theo từng buổi.</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* TRƯỜNG HỢP CHƯA CÓ GIA SƯ ĐƯỢC CHUYÊN VIÊN ĐỀ XUẤT */
                    <div className="py-12 text-center space-y-3">
                      <div className="w-16 h-16 bg-[#e7e7ff] text-[#696cff] rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                        <GraduationCap size={32} />
                      </div>
                      <h4 className="text-lg font-bold text-[#566a7f]">
                        Đang tuyển chọn ứng viên xuất sắc nhất
                      </h4>
                      <p className="text-xs text-[#a1acb8] max-w-md mx-auto leading-relaxed">
                        Hiện tại có <strong>{selectedRequest.classApplications?.length || selectedRequest._count?.classApplications || 0} gia sư</strong> đã nộp hồ sơ ứng tuyển lớp học này. Ban Chuyên Môn đang thẩm định hồ sơ, kiểm tra lịch dạy và phỏng vấn năng lực. Hồ sơ tốt nhất sẽ được gửi đến bạn tại đây ngay khi có kết quả!
                      </p>
                    </div>
                  )}
                </div>

                {/* Modal Footer Actions */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                  <button
                    onClick={() => setSelectedRequest(null)}
                    className="w-full sm:w-auto px-5 py-2.5 bg-white border border-gray-300 hover:bg-gray-100 text-[#566a7f] text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Đóng lại
                  </button>

                  {proposedApp && (
                    <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-3">
                      <button
                        onClick={() => openRejectModal(selectedRequest)}
                        className="w-full sm:w-auto px-4 py-2.5 border border-[#ff3e1d] hover:bg-[#ffe0db]/30 text-[#ff3e1d] font-bold text-xs rounded-xl transition-all cursor-pointer text-center"
                      >
                        Yêu cầu đổi gia sư khác
                      </button>
                      <button
                        onClick={() => openApproveModal(selectedRequest)}
                        className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-[#696cff] to-[#5f61e6] hover:opacity-95 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#696cff]/30"
                      >
                        <Check size={16} /> Duyệt Gia sư & Chốt lịch dạy thử
                      </button>
                    </div>
                  )}

                  {matchedApp && (
                    <div className="flex items-center gap-2 text-xs font-bold text-[#71dd37] bg-[#e8fadf] px-4 py-2 rounded-xl border border-[#71dd37]/40">
                      <CheckCircle size={15} />
                      <span>Đã phê duyệt gia sư cho buổi dạy thử</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* Modal YÊU CẦU ĐỔI GIA SƯ KHÁC */}
        {rejectingRequest && (
          <div className="fixed inset-0 z-50 bg-[#233446]/50 flex items-center justify-center p-4 backdrop-blur-sm font-sans">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 text-left shadow-2xl relative space-y-4">
              <button
                onClick={() => setRejectingRequest(null)}
                className="absolute top-4 right-4 text-[#a1acb8] hover:text-[#566a7f] cursor-pointer"
              >
                <X size={18} />
              </button>

              <div>
                <h3 className="text-lg font-bold text-[#566a7f] flex items-center gap-2">
                  <AlertCircle size={20} className="text-[#ff3e1d]" /> Yêu cầu đổi Gia sư khác
                </h3>
                <p className="text-xs text-[#a1acb8] mt-1">
                  Hãy chia sẻ lý do để chuyên viên lựa chọn gia sư khác phù hợp hơn cho bé {rejectingRequest.student?.fullName}.
                </p>
              </div>

              <form onSubmit={handleRejectProposedTutor} className="space-y-4">
                <div className="space-y-2">
                  {[
                    { value: 'Không phù hợp lịch học mong muốn', label: 'Không phù hợp lịch học mong muốn' },
                    { value: 'Mong muốn gia sư có nhiều năm kinh nghiệm hơn', label: 'Mong muốn gia sư có kinh nghiệm dày dặn hơn' },
                    { value: 'Mong muốn đổi giới tính gia sư (Nam/Nữ)', label: 'Muốn đổi giới tính gia sư (Nam/Nữ)' },
                    { value: 'OTHER', label: 'Lý do khác...' },
                  ].map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                        rejectReason === opt.value
                          ? 'border-[#ff3e1d] bg-[#fff5f5] text-[#ff3e1d]'
                          : 'border-gray-200 text-[#566a7f] hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="rejectReason"
                        value={opt.value}
                        checked={rejectReason === opt.value}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="accent-[#ff3e1d]"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>

                {rejectReason === 'OTHER' && (
                  <textarea
                    required
                    rows={3}
                    placeholder="Vui lòng nhập lý do cụ thể..."
                    value={customRejectReason}
                    onChange={(e) => setCustomRejectReason(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl text-xs text-[#566a7f] focus:outline-none focus:border-[#ff3e1d]"
                  />
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setRejectingRequest(null)}
                    className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-[#566a7f] font-bold text-xs rounded-xl cursor-pointer transition-all"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReject}
                    className="flex-1 py-2.5 bg-[#ff3e1d] hover:bg-[#e03515] text-white font-bold text-xs rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    {submittingReject ? <Loader size={14} className="animate-spin" /> : 'Gửi yêu cầu đổi'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal DUYỆT GIA SƯ & CHỌN LỊCH DẠY THỬ */}
        {approvingRequest && (
          <div className="fixed inset-0 z-50 bg-[#233446]/50 flex items-center justify-center p-4 backdrop-blur-sm font-sans">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 text-left shadow-2xl relative space-y-5 max-h-[90vh] overflow-y-auto custom-scrollbar">
              <button
                onClick={() => setApprovingRequest(null)}
                className="absolute top-4 right-4 text-[#a1acb8] hover:text-[#566a7f] cursor-pointer"
              >
                <X size={18} />
              </button>

              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#696cff] mb-1">
                  <Sparkles size={14} /> Duyệt Gia Sư & Chọn Lịch Dạy Thử
                </div>
                <h3 className="text-xl font-extrabold text-[#566a7f]">
                  Xác nhận Buổi Học Dạy Thử
                </h3>
                <p className="text-xs text-[#a1acb8] mt-1">
                  Môn học: <strong className="text-[#566a7f]">{approvingRequest.subject} ({approvingRequest.grade})</strong> • Học sinh: <strong className="text-[#566a7f]">{approvingRequest.student?.fullName}</strong>
                </p>
              </div>

              <form onSubmit={handleApproveProposedTutor} className="space-y-4">
                {/* Bước 1: Chọn Khung Giờ Dạy Thử (Ca rảnh đã đăng ký) */}
                <div>
                  <label className="block text-xs font-bold text-[#566a7f] mb-2">
                    1. Chọn Ca Dạy Thử (Từ các ca rảnh bạn đã đăng ký):
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {parseAvailableSlots(approvingRequest.scheduleNotes).map((slot, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedTrialSlot(slot)}
                        className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer flex items-center justify-between ${
                          selectedTrialSlot === slot
                            ? 'border-[#696cff] bg-[#f0f1ff] text-[#696cff] font-bold shadow-sm'
                            : 'border-gray-200 text-[#566a7f] hover:bg-gray-50'
                        }`}
                      >
                        <span>{slot}</span>
                        {selectedTrialSlot === slot && <Check size={14} className="text-[#696cff]" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bước 2: Chọn Ngày Cụ Thể */}
                <div>
                  <label className="block text-xs font-bold text-[#566a7f] mb-1.5">
                    2. Ngày Học Dạy Thử Đầu Tiên Dự Kiến:
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={selectedTrialDate}
                    onChange={(e) => setSelectedTrialDate(e.target.value)}
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-xs text-[#566a7f] font-semibold focus:outline-none focus:border-[#696cff]"
                  />
                </div>

                {/* Bước 3: Dặn Dò Gia Sư */}
                <div>
                  <label className="block text-xs font-bold text-[#566a7f] mb-1.5">
                    3. Dặn Dò Gia Sư (Tùy chọn):
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ví dụ: Buổi đầu nhờ cô kiểm tra kiến thức hổng và mang theo giáo trình..."
                    value={trialNote}
                    onChange={(e) => setTrialNote(e.target.value)}
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-xs text-[#566a7f] focus:outline-none focus:border-[#696cff]"
                  />
                </div>

                {/* Chính sách dạy thử */}
                <div className="p-3.5 bg-[#e8fadf] border border-[#71dd37]/40 rounded-xl text-xs space-y-1 text-[#437324]">
                  <div className="font-bold flex items-center gap-1.5">
                    <ShieldCheck size={16} /> Cam Kết Quyền Lợi Phụ Huynh:
                  </div>
                  <p className="text-[11px] leading-relaxed text-[#566a7f]">
                    Gia sư sẽ nộp cọc 500,000đ để cam kết giảng dạy nghiêm túc. Sau buổi dạy thử, nếu phụ huynh không hài lòng, trung tâm hỗ trợ đổi gia sư khác hoàn toàn miễn phí.
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setApprovingRequest(null)}
                    className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-[#566a7f] font-bold text-xs rounded-xl cursor-pointer transition-all"
                  >
                    Quay lại
                  </button>
                  <button
                    type="submit"
                    disabled={submittingApprove}
                    className="flex-1 py-2.5 bg-[#696cff] hover:bg-[#5f61e6] text-white font-bold text-xs rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-md shadow-[#696cff]/30"
                  >
                    {submittingApprove ? (
                      <Loader size={14} className="animate-spin" />
                    ) : (
                      <>
                        <Check size={15} /> Xác nhận & Chốt Lịch
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal CHỈNH SỬA YÊU CẦU */}
        {editingRequest && (
          <div className="fixed inset-0 z-50 bg-[#233446]/40 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl max-w-lg w-full p-6 text-left shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
              <button
                onClick={() => setEditingRequest(null)}
                className="absolute top-4 right-4 text-[#a1acb8] hover:text-[#566a7f] cursor-pointer"
              >
                <X size={18} />
              </button>

              <h3 className="text-lg font-bold text-[#566a7f] mb-1">
                Chỉnh sửa yêu cầu tìm Gia sư
              </h3>
              <p className="text-xs text-[#a1acb8] mb-4">
                Học sinh: <strong>{editingRequest.student?.fullName}</strong>
              </p>

              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#566a7f] mb-1">Môn học *</label>
                    <input
                      type="text"
                      required
                      value={editForm.subject}
                      onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-[#d9dee3] rounded-lg text-xs text-[#566a7f] focus:outline-none focus:border-[#696cff]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#566a7f] mb-1">Cấp lớp *</label>
                    <input
                      type="text"
                      required
                      value={editForm.grade}
                      onChange={(e) => setEditForm({ ...editForm, grade: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-[#d9dee3] rounded-lg text-xs text-[#566a7f] focus:outline-none focus:border-[#696cff]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#566a7f] mb-1">Học phí đề xuất / buổi</label>
                    <input
                      type="number"
                      required
                      min={50000}
                      step={10000}
                      value={editForm.budgetPerSession}
                      onChange={(e) => setEditForm({ ...editForm, budgetPerSession: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-white border border-[#d9dee3] rounded-lg text-xs text-[#566a7f] focus:outline-none focus:border-[#696cff]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#566a7f] mb-1">Số buổi / tuần</label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={7}
                      value={editForm.sessionsPerWeek}
                      onChange={(e) => setEditForm({ ...editForm, sessionsPerWeek: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 bg-white border border-[#d9dee3] rounded-lg text-xs text-[#566a7f] focus:outline-none focus:border-[#696cff]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#566a7f] mb-1">Lịch học rảnh</label>
                  <input
                    type="text"
                    value={editForm.scheduleNotes}
                    onChange={(e) => setEditForm({ ...editForm, scheduleNotes: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#d9dee3] rounded-lg text-xs text-[#566a7f] focus:outline-none focus:border-[#696cff]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#566a7f] mb-1">Hình thức học</label>
                  <select
                    value={editForm.learningMode}
                    onChange={(e) => setEditForm({ ...editForm, learningMode: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#d9dee3] rounded-lg text-xs text-[#566a7f] focus:outline-none focus:border-[#696cff]"
                  >
                    <option value="OFFLINE">Học tại nhà (Offline)</option>
                    <option value="ONLINE">Học Online qua Zoom/Meet</option>
                  </select>
                </div>

                {editForm.learningMode === 'OFFLINE' && (
                  <div>
                    <label className="block text-xs font-semibold text-[#566a7f] mb-1">Địa chỉ học</label>
                    <input
                      type="text"
                      value={editForm.address}
                      onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-[#d9dee3] rounded-lg text-xs text-[#566a7f] focus:outline-none focus:border-[#696cff]"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-[#566a7f] mb-1">Yêu cầu riêng</label>
                  <textarea
                    rows={2}
                    value={editForm.requirements}
                    onChange={(e) => setEditForm({ ...editForm, requirements: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#d9dee3] rounded-lg text-xs text-[#566a7f] focus:outline-none focus:border-[#696cff] resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setEditingRequest(null)}
                    className="flex-1 py-2 bg-[#f5f5f9] hover:bg-gray-200 text-[#566a7f] text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={submittingEdit}
                    className="flex-1 py-2 bg-[#696cff] hover:bg-[#5f61e6] active:bg-[#595cd9] text-white text-xs font-bold rounded-lg transition-all shadow-[0_2px_4px_0_rgba(105,108,255,0.4)] cursor-pointer"
                  >
                    {submittingEdit ? <Loader size={16} className="animate-spin mx-auto" /> : 'Lưu thay đổi'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal THEO DÕI TIẾN ĐỘ TUYỂN CHỌN & GHÉP LỚP */}
        {viewingProgressRequest && (() => {
          const req = viewingProgressRequest;
          const proposedApp = req.classApplications?.find((a) => a.status === 'SHORTLISTED');
          const matchedApp = req.classApplications?.find((a) => a.status === 'SELECTED_FOR_TRIAL');
          const appCount = req.classApplications?.length || req._count?.classApplications || 0;
          const isMatched = req.status === 'MATCHED' || Boolean(matchedApp);
          const isProposed = req.status === 'CONSULTING' || Boolean(proposedApp);

          const targetCls = req.classes?.[0];
          const isTeaching = targetCls?.status === 'TEACHING';

          // Xác định bước hiện tại trong quy trình 5 bước (1-indexed)
          const currentStep = isTeaching ? 5 : isMatched ? 4 : isProposed ? 3 : appCount > 0 ? 2 : 1;

          return (
            <div className="fixed inset-0 z-50 bg-[#233446]/50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-sm font-sans animate-fadeIn">
              <div className="bg-white rounded-2xl max-w-2xl w-full text-left shadow-2xl relative max-h-[92vh] flex flex-col overflow-hidden border border-gray-100">
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 via-white to-gray-50 shrink-0">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#e7e7ff] text-[#696cff] flex items-center justify-center shadow-xs">
                      <ListChecks size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-[#566a7f]">
                        Tiến Độ Tuyển Chọn & Ghép Lớp
                      </h3>
                      <p className="text-xs text-[#a1acb8]">
                        Mã yêu cầu: <span className="font-mono font-bold text-[#697a8d]">#{req.id.slice(0, 8).toUpperCase()}</span> • Môn {req.subject} ({req.grade})
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setViewingProgressRequest(null)}
                    className="text-[#a1acb8] hover:text-[#566a7f] hover:bg-gray-100 p-1.5 rounded-xl transition-colors cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 custom-scrollbar">
                  {/* Tóm tắt thông tin lớp */}
                  <div className="p-3.5 bg-[#f8f9ff] border border-[#696cff]/20 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-[#a1acb8] block text-[10px] uppercase font-bold">Học sinh</span>
                      <strong className="text-[#566a7f]">{req.student?.fullName}</strong>
                    </div>
                    <div>
                      <span className="text-[#a1acb8] block text-[10px] uppercase font-bold">Học phí</span>
                      <strong className="text-[#696cff]">{formatVND(Number(req.budgetPerSession))}/buổi</strong>
                    </div>
                    <div>
                      <span className="text-[#a1acb8] block text-[10px] uppercase font-bold">Thời lượng</span>
                      <strong className="text-[#566a7f]">{req.sessionsPerWeek} buổi / tuần</strong>
                    </div>
                    <div>
                      <span className="text-[#a1acb8] block text-[10px] uppercase font-bold">Hình thức</span>
                      <strong className="text-[#566a7f]">{req.learningMode === 'ONLINE' ? 'Online' : 'Tại nhà'}</strong>
                    </div>
                  </div>

                  {/* Tiến trình 5 bước Stepper */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#566a7f] flex items-center gap-2">
                        <Clock size={15} className="text-[#696cff]" /> Hành trình tuyển chọn (5 Giai đoạn)
                      </h4>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#e7e7ff] text-[#696cff]">
                        Giai đoạn {currentStep}/5
                      </span>
                    </div>

                    <div className="space-y-3 relative pl-6 before:content-[''] before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                      {/* Bước 1 */}
                      <div className="relative">
                        <div className={`absolute -left-6 top-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          currentStep >= 1 ? 'bg-[#71dd37] text-white shadow-xs' : 'bg-gray-200 text-gray-500'
                        }`}>
                          ✓
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-xs">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-[#566a7f]">1. Tiếp nhận yêu cầu tìm gia sư</span>
                            <span className="text-[11px] text-[#71dd37] font-bold">Đã hoàn thành</span>
                          </div>
                          <p className="text-[11px] text-[#a1acb8] mt-0.5">
                            Hệ thống đã tiếp nhận yêu cầu đăng tuyển vào ngày {new Date(req.createdAt).toLocaleDateString('vi-VN')}.
                          </p>
                        </div>
                      </div>

                      {/* Bước 2 */}
                      <div className="relative">
                        <div className={`absolute -left-6 top-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          currentStep > 2 ? 'bg-[#71dd37] text-white' : currentStep === 2 ? 'bg-[#696cff] text-white ring-4 ring-[#696cff]/20 animate-pulse' : 'bg-gray-200 text-gray-500'
                        }`}>
                          {currentStep > 2 ? '✓' : '2'}
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-xs">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-[#566a7f]">2. Tuyển chọn & Thẩm định chuyên môn</span>
                            <span className={`text-[11px] font-bold ${currentStep > 2 ? 'text-[#71dd37]' : 'text-[#696cff]'}`}>
                              {currentStep > 2 ? 'Đã tuyển chọn' : 'Đang xử lý'}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#697a8d] mt-0.5">
                            {appCount > 0
                              ? `Đã có ${appCount} gia sư nộp hồ sơ. Ban Chuyên Môn thẩm định bằng cấp, lịch dạy và năng lực sư phạm.`
                              : 'Đang mở đăng tuyển công khai cho mạng lưới 10,000+ gia sư đạt chuẩn.'}
                          </p>
                        </div>
                      </div>

                      {/* Bước 3 */}
                      <div className="relative">
                        <div className={`absolute -left-6 top-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          currentStep > 3 ? 'bg-[#71dd37] text-white' : currentStep === 3 ? 'bg-[#ffab00] text-white ring-4 ring-[#ffab00]/20 animate-pulse' : 'bg-gray-200 text-gray-500'
                        }`}>
                          {currentStep > 3 ? '✓' : '3'}
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-xs">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-[#566a7f]">3. Đề xuất hồ sơ & Phụ huynh xét duyệt</span>
                            <span className={`text-[11px] font-bold ${
                              currentStep > 3 ? 'text-[#71dd37]' : currentStep === 3 ? 'text-[#ffab00]' : 'text-[#a1acb8]'
                            }`}>
                              {currentStep > 3 ? 'Phụ huynh đã duyệt' : currentStep === 3 ? 'Chờ bạn phê duyệt' : 'Chờ đề xuất'}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#697a8d] mt-0.5">
                            {proposedApp
                              ? `Chuyên viên đã chọn gia sư ${proposedApp.tutor?.fullName} gửi bạn xét duyệt hồ sơ.`
                              : matchedApp
                              ? `Bạn đã xét duyệt đồng ý gia sư ${matchedApp.tutor?.fullName}.`
                              : 'Chuyên viên CRM sẽ chọn ra ứng viên có độ phù hợp cao nhất gửi đến bạn.'}
                          </p>
                          {proposedApp && (
                            <button
                              onClick={() => {
                                setViewingProgressRequest(null);
                                setSelectedRequest(req);
                              }}
                              className="mt-2 px-3 py-1 bg-[#ffab00] hover:bg-[#e69a00] text-white font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                            >
                              <Eye size={13} /> Xem hồ sơ & Duyệt ngay
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Bước 4 */}
                      <div className="relative">
                        <div className={`absolute -left-6 top-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          currentStep > 4 ? 'bg-[#71dd37] text-white shadow-xs' : currentStep === 4 ? 'bg-[#ffab00] text-white ring-4 ring-[#ffab00]/20 animate-pulse' : 'bg-gray-200 text-gray-500'
                        }`}>
                          {currentStep >= 4 ? '✓' : '4'}
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-xs">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-[#566a7f]">4. Buổi dạy thử & Phản hồi kết quả</span>
                            <span className={`text-[11px] font-bold ${
                              currentStep > 4 ? 'text-[#71dd37]' : currentStep === 4 ? 'text-[#ffab00]' : 'text-[#a1acb8]'
                            }`}>
                              {currentStep > 4 ? 'Dạy thử thành công' : currentStep === 4 ? 'Đang trong giai đoạn dạy thử' : 'Chưa đến lượt'}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#697a8d] mt-0.5">
                            {targetCls?.cancelReason ? `Lịch hẹn: ${targetCls.cancelReason}. ` : ''}
                            {isTeaching
                              ? 'Buổi dạy thử đã hoàn thành xuất sắc và phụ huynh đã hài lòng đánh giá nhận lớp.'
                              : matchedApp
                              ? 'Gia sư và học sinh tiến hành buổi học dạy thử để làm quen và kiểm tra năng lực.'
                              : 'Sau khi phụ huynh duyệt gia sư, hệ thống sẽ chốt thời gian dạy thử và thu cọc cam kết từ gia sư.'}
                          </p>
                          {matchedApp && (
                            <div className="mt-2 p-2.5 bg-[#e8fadf] rounded-lg border border-[#71dd37]/40 flex items-center justify-between text-xs">
                              <span className="text-[#566a7f] font-semibold">
                                Gia sư: <strong className="text-[#71dd37]">{matchedApp.tutor?.fullName}</strong>
                              </span>
                              <button
                                onClick={() => {
                                  setViewingProgressRequest(null);
                                  setSelectedRequest(req);
                                }}
                                className="px-2.5 py-1 bg-white hover:bg-[#71dd37] text-[#71dd37] hover:text-white border border-[#71dd37]/50 font-bold text-[11px] rounded transition-colors cursor-pointer"
                              >
                                Xem hồ sơ gia sư
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Bước 5 */}
                      <div className="relative">
                        <div className={`absolute -left-6 top-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          currentStep === 5 ? 'bg-[#71dd37] text-white ring-4 ring-[#71dd37]/20 shadow-xs' : 'bg-gray-200 text-gray-500'
                        }`}>
                          {currentStep === 5 ? '✓' : '5'}
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-xs">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-[#566a7f]">5. Ký hợp đồng & Giảng dạy chính thức</span>
                            <span className={`text-[11px] font-bold ${
                              currentStep === 5 ? 'text-[#71dd37]' : 'text-[#a1acb8]'
                            }`}>
                              {currentStep === 5 ? 'Đã kích hoạt lớp học' : 'Giai đoạn cuối'}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#697a8d] mt-0.5">
                            {currentStep === 5
                              ? `Lớp học đã chính thức bắt đầu với chu kỳ ${targetCls?.remainingSessions || 8} buổi học! Thời khóa biểu đã được kích hoạt tự động.`
                              : 'Sau buổi dạy thử, phụ huynh đánh giá hài lòng sẽ chốt ca học cố định để chuyển sang lớp học chính thức.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Danh sách ứng viên đã nộp hồ sơ */}
                  {req.classApplications && req.classApplications.length > 0 && (
                    <div className="p-4 bg-white rounded-xl border border-gray-200 space-y-2.5 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#566a7f] flex items-center gap-1.5">
                          <GraduationCap size={15} className="text-[#696cff]" />
                          Danh sách gia sư nộp hồ sơ ({req.classApplications.length})
                        </span>
                      </div>
                      <div className="divide-y divide-gray-100">
                        {req.classApplications.map((app) => (
                          <div key={app.id} className="py-2.5 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-[#696cff]/10 text-[#696cff] font-bold flex items-center justify-center text-xs">
                                {app.tutor?.fullName?.charAt(0) || 'G'}
                              </div>
                              <div>
                                <div className="font-bold text-[#566a7f]">{app.tutor?.fullName}</div>
                                <div className="text-[11px] text-[#a1acb8]">{app.tutor?.qualification || 'Cử nhân'}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {app.status === 'SELECTED_FOR_TRIAL' && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#e8fadf] text-[#71dd37]">
                                  Đã chốt dạy thử
                                </span>
                              )}
                              {app.status === 'SHORTLISTED' && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#fff2d6] text-[#ffab00]">
                                  Được đề xuất
                                </span>
                              )}
                              {app.status === 'APPLIED' && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#f5f5f9] text-[#697a8d]">
                                  Đã nộp hồ sơ
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Hộp hỗ trợ từ Chuyên viên Học vụ */}
                  <div className="p-3.5 bg-gradient-to-r from-gray-50 to-gray-100/80 rounded-xl border border-gray-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-white text-[#696cff] flex items-center justify-center shadow-xs">
                        <Phone size={15} />
                      </div>
                      <div>
                        <div className="font-bold text-[#566a7f]">Cần hỗ trợ đổi lịch hoặc tư vấn thêm?</div>
                        <div className="text-[11px] text-[#a1acb8]">Chuyên viên học vụ phụ trách lớp sẵn sàng hỗ trợ 24/7</div>
                      </div>
                    </div>
                    <span className="font-extrabold text-[#696cff] text-xs">Hotline: 1900 6868</span>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between shrink-0">
                  <button
                    onClick={() => setViewingProgressRequest(null)}
                    className="px-5 py-2 bg-white border border-gray-300 hover:bg-gray-100 text-[#566a7f] text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Đóng lại
                  </button>
                  {matchedApp && (
                    <button
                      onClick={() => {
                        setViewingProgressRequest(null);
                        setSelectedRequest(req);
                      }}
                      className="px-4 py-2 bg-[#696cff] hover:bg-[#5f61e6] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <User size={14} /> Xem hồ sơ gia sư: {matchedApp.tutor?.fullName}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* Modal ĐÁNH GIÁ DẠY THỬ & CHỐT LỊCH HỌC CHÍNH THỨC */}
        {evaluatingRequest && (() => {
          const req = evaluatingRequest;
          const matchedApp = req.classApplications?.find((a) => a.status === 'SELECTED_FOR_TRIAL');
          const tutor = matchedApp?.tutor;
          const availableSlots = parseAvailableSlots(req.scheduleNotes);
          const sessionsNeeded = req.sessionsPerWeek || 2;

          const targetCls = req.classes?.[0];
          const trialSession = targetCls?.sessions?.[0];
          const isTrialAttended = trialSession?.status === 'ATTENDED' || trialSession?.status === 'COMPLETED';
          const trialDatePassed = trialSession?.scheduledTime && new Date(trialSession.scheduledTime).getTime() < Date.now();

          return (
            <div className="fixed inset-0 z-50 bg-[#233446]/50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-sm font-sans animate-fadeIn">
              <div className="bg-white rounded-2xl max-w-xl w-full text-left shadow-2xl relative max-h-[92vh] flex flex-col overflow-hidden border border-gray-100">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 via-white to-gray-50 shrink-0">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#fff2d6] text-[#ffab00] flex items-center justify-center shadow-xs">
                      <Star size={20} fill="#ffab00" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-[#566a7f]">
                        Đánh Giá Dạy Thử & Chốt Lớp
                      </h3>
                      <p className="text-xs text-[#a1acb8]">
                        Môn {req.subject} ({req.grade}) • Học sinh: <strong className="text-[#566a7f]">{req.student?.fullName}</strong>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setEvaluatingRequest(null)}
                    className="text-[#a1acb8] hover:text-[#566a7f] hover:bg-gray-100 p-1.5 rounded-xl transition-colors cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleTrialEvalSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5 custom-scrollbar">
                  {/* Tutor Info Pill */}
                  <div className="p-3 bg-[#f8f9ff] border border-[#696cff]/20 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#696cff] to-[#5f61e6] text-white font-bold flex items-center justify-center text-sm shadow-xs">
                        {tutor?.fullName?.charAt(0) || 'G'}
                      </div>
                      <div>
                        <div className="text-xs text-[#a1acb8] font-semibold">Gia sư phụ trách dạy thử:</div>
                        <div className="text-sm font-bold text-[#566a7f]">{tutor?.fullName}</div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#696cff] bg-[#e7e7ff] px-2.5 py-1 rounded-lg">
                      {tutor?.qualification || 'Cử nhân'}
                    </span>
                  </div>

                  {/* Thông báo trạng thái buổi dạy thử */}
                  {!trialDatePassed && !isTrialAttended ? (
                    <div className="p-3 bg-[#fff8e1] border border-[#ffab00]/30 rounded-xl text-xs text-[#8a5d00] flex items-center gap-2">
                      <Clock size={16} className="text-[#ffab00] shrink-0" />
                      <span>
                        <strong>Lưu ý:</strong> Buổi dạy thử được hẹn vào <strong>{targetCls?.cancelReason || 'ngày tới'}</strong>. Thông thường bạn nên đợi sau khi buổi dạy thử kết thúc để đánh giá chuẩn xác nhất.
                      </span>
                    </div>
                  ) : (
                    <div className="p-3 bg-[#e8fadf] border border-[#71dd37]/30 rounded-xl text-xs text-[#437324] flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-[#71dd37] shrink-0" />
                      <span>
                        <strong>Buổi dạy thử đã hoàn tất!</strong> Mời bạn đánh giá chất lượng buổi dạy và đưa ra quyết định bên dưới.
                      </span>
                    </div>
                  )}

                  {/* Quyết định 4 lựa chọn */}
                  <div className="space-y-2.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#566a7f]">
                      Quyết định sau buổi học thử:
                    </label>

                    {/* Option 1: ACCEPT */}
                    <label
                      className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                        evalDecision === 'ACCEPT'
                          ? 'bg-[#e8fadf] border-[#71dd37] text-[#71dd37] shadow-xs'
                          : 'bg-white border-gray-200 text-[#566a7f] hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="evalDecision"
                        value="ACCEPT"
                        checked={evalDecision === 'ACCEPT'}
                        onChange={() => setEvalDecision('ACCEPT')}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="text-xs font-extrabold flex items-center gap-1.5">
                          <CheckCircle2 size={16} /> Hài lòng — Chốt gia sư này & Vào học chính thức
                        </div>
                        <p className="text-[11px] text-[#697a8d] mt-1 leading-relaxed">
                          Gia sư dạy tốt, học sinh hòa hợp. Kích hoạt lớp học dài hạn, tự động tạo lịch học cố định hàng tuần và bảo chứng quyền lợi bởi trung tâm.
                        </p>
                      </div>
                    </label>

                    {/* Option 2: REJECT_TUTOR */}
                    <label
                      className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                        evalDecision === 'REJECT_TUTOR'
                          ? 'bg-[#ffe0db] border-[#ff3e1d] text-[#ff3e1d] shadow-xs'
                          : 'bg-white border-gray-200 text-[#566a7f] hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="evalDecision"
                        value="REJECT_TUTOR"
                        checked={evalDecision === 'REJECT_TUTOR'}
                        onChange={() => setEvalDecision('REJECT_TUTOR')}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="text-xs font-extrabold flex items-center gap-1.5">
                          <AlertTriangle size={16} /> Đổi gia sư khác (Gia sư chưa phù hợp)
                        </div>
                        <p className="text-[11px] text-[#697a8d] mt-1 leading-relaxed">
                          Gia sư dạy không đạt yêu cầu, đến muộn hoặc phát âm chưa chuẩn. Trung tâm kích hoạt bảo hành 30 ngày đổi gia sư mới hoàn toàn miễn phí.
                        </p>
                      </div>
                    </label>

                    {/* Option 3: REJECT_PARENT */}
                    <label
                      className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                        evalDecision === 'REJECT_PARENT'
                          ? 'bg-[#fff8e1] border-[#ffab00] text-[#ffab00] shadow-xs'
                          : 'bg-white border-gray-200 text-[#566a7f] hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="evalDecision"
                        value="REJECT_PARENT"
                        checked={evalDecision === 'REJECT_PARENT'}
                        onChange={() => setEvalDecision('REJECT_PARENT')}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="text-xs font-extrabold flex items-center gap-1.5">
                          <Ban size={16} /> Hủy lớp (Gia đình thay đổi kế hoạch)
                        </div>
                        <p className="text-[11px] text-[#697a8d] mt-1 leading-relaxed">
                          Gia đình bận việc đột xuất, con học thêm ở trường hoặc tạm dừng thuê gia sư. Đóng lớp học này.
                        </p>
                      </div>
                    </label>

                    {/* Option 4: SCALE_DOWN */}
                    <label
                      className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                        evalDecision === 'SCALE_DOWN'
                          ? 'bg-[#f0f1ff] border-[#696cff] text-[#696cff] shadow-xs'
                          : 'bg-white border-gray-200 text-[#566a7f] hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="evalDecision"
                        value="SCALE_DOWN"
                        checked={evalDecision === 'SCALE_DOWN'}
                        onChange={() => setEvalDecision('SCALE_DOWN')}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="text-xs font-extrabold flex items-center gap-1.5">
                          <TrendingDown size={16} /> Giảm số buổi học / Điều chỉnh quy mô
                        </div>
                        <p className="text-[11px] text-[#697a8d] mt-1 leading-relaxed">
                          Hài lòng với gia sư nhưng muốn giảm bớt số buổi học trên tuần để con không bị quá tải.
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* KHỐI CHỐT LỊCH CỐ ĐỊNH KHI CHỌN ACCEPT */}
                  {evalDecision === 'ACCEPT' && (
                    <div className="p-4 bg-[#f8f9ff] border border-[#696cff]/30 rounded-2xl space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-bold text-[#566a7f] flex items-center gap-1.5">
                            <Calendar size={15} className="text-[#696cff]" />
                            1. Chốt các ca học cố định hàng tuần:
                          </label>
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            evalSelectedSlots.length === sessionsNeeded
                              ? 'bg-[#e8fadf] text-[#71dd37]'
                              : 'bg-[#fff2d6] text-[#ffab00]'
                          }`}>
                            Đã chọn: {evalSelectedSlots.length} / {sessionsNeeded} buổi
                          </span>
                        </div>
                        <p className="text-[11px] text-[#a1acb8] mb-2.5">
                          Vui lòng chọn đúng {sessionsNeeded} ca học cố định từ danh sách ca rảnh đã đăng ký:
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {availableSlots.map((slot, idx) => {
                            const isChecked = evalSelectedSlots.includes(slot);
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  if (isChecked) {
                                    setEvalSelectedSlots(evalSelectedSlots.filter((s) => s !== slot));
                                  } else {
                                    setEvalSelectedSlots([...evalSelectedSlots, slot]);
                                  }
                                }}
                                className={`p-3 rounded-xl border text-xs text-left transition-all cursor-pointer flex items-center justify-between ${
                                  isChecked
                                    ? 'bg-[#696cff] text-white border-[#696cff] font-bold shadow-xs'
                                    : 'bg-white text-[#566a7f] border-gray-200 hover:bg-gray-50'
                                }`}
                              >
                                <span>{slot}</span>
                                {isChecked && <Check size={14} className="text-white shrink-0" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Ngày bắt đầu buổi học đầu tiên */}
                      <div>
                        <label className="block text-xs font-bold text-[#566a7f] mb-1.5">
                          2. Ngày bắt đầu buổi học chính thức đầu tiên:
                        </label>
                        <input
                          type="date"
                          required
                          min={new Date().toISOString().split('T')[0]}
                          value={evalStartDate}
                          onChange={(e) => setEvalStartDate(e.target.value)}
                          className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs text-[#566a7f] font-semibold focus:outline-none focus:border-[#696cff]"
                        />
                      </div>

                      {/* Dặn dò gia sư */}
                      <div>
                        <label className="block text-xs font-bold text-[#566a7f] mb-1.5">
                          3. Dặn dò hoặc yêu cầu thêm cho gia sư (Tùy chọn):
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Ví dụ: Nhờ cô kèm sát phần bài tập về nhà và dặn cháu chuẩn bị bài trước khi lên lớp..."
                          value={evalNotes}
                          onChange={(e) => setEvalNotes(e.target.value)}
                          className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs text-[#566a7f] focus:outline-none focus:border-[#696cff]"
                        />
                      </div>
                    </div>
                  )}

                  {/* Ô NHẬP LÝ DO NẾU TỪ CHỐI / HỦY / GIẢM QUY MÔ */}
                  {evalDecision !== 'ACCEPT' && (
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-[#566a7f]">
                        Lý do cụ thể cho quyết định này (Bắt buộc):
                      </label>
                      <textarea
                        rows={3}
                        required
                        placeholder={
                          evalDecision === 'REJECT_TUTOR'
                            ? 'Vui lòng mô tả chi tiết: Gia sư đến trễ bao nhiêu phút, phương pháp giảng dạy chưa hợp lý ở điểm nào...'
                            : evalDecision === 'REJECT_PARENT'
                            ? 'Lý do gia đình thay đổi kế hoạch không tiếp tục theo học...'
                            : 'Số buổi mới mong muốn và lý do điều chỉnh...'
                        }
                        value={evalReason}
                        onChange={(e) => setEvalReason(e.target.value)}
                        className="w-full p-3 border border-gray-200 rounded-xl text-xs text-[#566a7f] focus:outline-none focus:border-[#696cff]"
                      />
                    </div>
                  )}

                  {/* Footer Actions */}
                  <div className="flex gap-3 pt-3 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setEvaluatingRequest(null)}
                      className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-[#566a7f] font-bold text-xs rounded-xl cursor-pointer transition-all"
                    >
                      Đóng
                    </button>
                    <button
                      type="submit"
                      disabled={submittingEval}
                      className={`flex-1 py-2.5 text-white font-bold text-xs rounded-xl cursor-pointer transition-all shadow-md flex items-center justify-center gap-1.5 ${
                        evalDecision === 'ACCEPT'
                          ? 'bg-gradient-to-r from-[#696cff] to-[#5f61e6] hover:opacity-95 shadow-[#696cff]/30'
                          : evalDecision === 'REJECT_TUTOR'
                          ? 'bg-[#ff3e1d] hover:bg-[#e03515] shadow-[#ff3e1d]/30'
                          : 'bg-[#ffab00] hover:bg-[#e69a00] shadow-[#ffab00]/30'
                      }`}
                    >
                      {submittingEval ? (
                        <Loader size={15} className="animate-spin" />
                      ) : evalDecision === 'ACCEPT' ? (
                        <>
                          <Check size={16} /> Xác nhận & Chốt dạy chính thức
                        </>
                      ) : (
                        'Gửi đánh giá'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          );
        })()}
      </div>
    </PageTemplate>
  );
}
