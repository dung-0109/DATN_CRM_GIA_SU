import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { 
  ClipboardList, Plus, Clock, MapPin, DollarSign, Calendar, 
  User, CheckCircle, AlertCircle, ArrowLeft, Loader, Star, 
  GraduationCap, ShieldCheck, ChevronRight, Eye, Sparkles,
  Pencil, Ban, X, Check, AlertTriangle, RefreshCw
} from 'lucide-react';
import PageTemplate from '../../components/PageTemplate';
import toast from 'react-hot-toast';

interface TutorApplication {
  id: string;
  status: string;
  coverLetter?: string;
  tutor: {
    id: string;
    fullName: string;
    gender: string;
    tutorType: string;
    qualification: string;
    ratingAvg: any;
    karmaScore: number;
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
  _count?: {
    classApplications: number;
  };
}

const STATUS_MAP: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  PUBLISHED: {
    label: 'Đang tuyển Gia sư',
    bg: 'bg-[#fff2d6]',
    text: 'text-[#ffab00]',
    dot: 'bg-[#ffab00]',
  },
  NEW: {
    label: 'Mới gửi - Chờ duyệt',
    bg: 'bg-[#e7e7ff]',
    text: 'text-[#696cff]',
    dot: 'bg-[#696cff]',
  },
  CONSULTING: {
    label: 'Đang tư vấn điều phối',
    bg: 'bg-[#ebeef0]',
    text: 'text-[#566a7f]',
    dot: 'bg-[#566a7f]',
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

  // Modal xem danh sách gia sư ứng tuyển
  const [selectedRequest, setSelectedRequest] = useState<TutorRequest | null>(null);
  const [selectingTutorId, setSelectingTutorId] = useState<string | null>(null);

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

  // Chọn gia sư dạy thử
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
            { key: 'PUBLISHED', label: 'Đang tuyển' },
            { key: 'MATCHED', label: 'Đã khớp lớp' },
            { key: 'CONSULTING', label: 'Đang xử lý' },
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

              return (
                <div
                  key={req.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow space-y-4 flex flex-col justify-between"
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
                        <GraduationCap size={16} className={appCount > 0 ? 'text-[#696cff]' : 'text-[#a1acb8]'} />
                        <span className="text-xs font-semibold text-[#566a7f]">
                          {appCount > 0 ? (
                            <span className="text-[#696cff] font-bold">{appCount} gia sư ứng tuyển</span>
                          ) : (
                            <span className="text-[#a1acb8]">Đang chờ gia sư ứng tuyển...</span>
                          )}
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5">
                        {appCount > 0 && (
                          <button
                            onClick={() => setSelectedRequest(req)}
                            className="px-3 py-1.5 bg-[#e7e7ff] hover:bg-[#696cff] text-[#696cff] hover:text-white font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
                          >
                            <Eye size={13} /> Xem hồ sơ ({appCount})
                          </button>
                        )}

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

        {/* Modal Xem Danh Sách Gia Sư Ứng Tuyển & CHỌN DẠY THỬ */}
        {selectedRequest && (
          <div className="fixed inset-0 z-50 bg-[#233446]/40 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl max-w-2xl w-full p-6 text-left shadow-2xl relative max-h-[85vh] overflow-y-auto custom-scrollbar">
              <button
                onClick={() => setSelectedRequest(null)}
                className="absolute top-4 right-4 text-[#a1acb8] hover:text-[#566a7f] cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="mb-4 pb-3 border-b border-gray-100">
                <h3 className="text-lg font-bold text-[#566a7f]">
                  Danh sách Gia sư ứng tuyển môn {selectedRequest.subject} ({selectedRequest.grade})
                </h3>
                <p className="text-xs text-[#a1acb8] mt-0.5">
                  Học sinh: {selectedRequest.student?.fullName} • Học phí: {formatVND(Number(selectedRequest.budgetPerSession))}/buổi
                </p>
              </div>

              {(!selectedRequest.classApplications || selectedRequest.classApplications.length === 0) ? (
                <div className="py-8 text-center text-sm text-[#a1acb8]">
                  Chưa có hồ sơ gia sư nào ứng tuyển.
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedRequest.classApplications.map((app) => (
                    <div
                      key={app.id}
                      className="p-4 rounded-xl border border-gray-100 bg-[#f8f9fa] hover:bg-white hover:border-[#696cff]/40 transition-all space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-full bg-[#696cff]/10 text-[#696cff] flex items-center justify-center font-bold text-sm">
                            {app.tutor?.fullName?.charAt(0) || 'G'}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-sm font-bold text-[#566a7f]">{app.tutor?.fullName}</h4>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-semibold">
                                {app.tutor?.tutorType === 'TEACHER' ? 'Giáo viên' : 'Sinh viên'}
                              </span>
                            </div>
                            <p className="text-xs text-[#697a8d]">{app.tutor?.qualification || 'Cử nhân Đại học'}</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="flex items-center gap-1 text-xs font-bold text-[#ffab00]">
                            <Star size={13} fill="#ffab00" />
                            <span>{app.tutor?.ratingAvg ? Number(app.tutor.ratingAvg).toFixed(1) : '5.0'}</span>
                          </div>
                          <span className="text-[10px] text-[#71dd37] font-semibold">
                            Karma: {app.tutor?.karmaScore || 100} điểm
                          </span>
                        </div>
                      </div>

                      {app.coverLetter && (
                        <p className="text-xs text-[#697a8d] italic bg-white p-2.5 rounded-lg border border-gray-100">
                          "{app.coverLetter}"
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                        <span className="text-[11px] text-[#a1acb8]">
                          Trạng thái: <strong>{app.status === 'SELECTED_FOR_TRIAL' ? 'Đã chọn học thử' : 'Đang ứng tuyển'}</strong>
                        </span>

                        {app.status === 'SELECTED_FOR_TRIAL' ? (
                          <span className="px-3 py-1.5 bg-[#e8fadf] text-[#71dd37] font-bold text-xs rounded-lg inline-flex items-center gap-1">
                            <CheckCircle size={14} /> Đã chọn gia sư này
                          </span>
                        ) : selectedRequest.status === 'MATCHED' ? (
                          <span className="text-xs text-[#a1acb8] italic">Đã chốt gia sư khác</span>
                        ) : (
                          <button
                            onClick={() => handleSelectTutor(selectedRequest.id, app.tutor.id, app.tutor.fullName)}
                            disabled={selectingTutorId === app.tutor.id}
                            className="px-3 py-1.5 bg-[#696cff] hover:bg-[#5f61e6] active:bg-[#595cd9] text-white font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_2px_4px_0_rgba(105,108,255,0.4)]"
                          >
                            {selectingTutorId === app.tutor.id ? (
                              <Loader size={14} className="animate-spin" />
                            ) : (
                              <>
                                <Check size={14} /> Chọn gia sư này dạy thử
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-4 mt-4 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="px-4 py-2 bg-[#f5f5f9] hover:bg-gray-200 text-[#566a7f] text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Đóng
                </button>
              </div>
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
      </div>
    </PageTemplate>
  );
}
