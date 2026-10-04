import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { ArrowLeft, Loader, CheckCircle2, AlertTriangle, Calendar, Star, XCircle, TrendingDown } from 'lucide-react';
import PageTemplate from '../../components/PageTemplate';
import toast from 'react-hot-toast';

export default function ParentAttendance() {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [reviewingClass, setReviewingClass] = useState<any | null>(null);
  const [decision, setDecision] = useState<'ACCEPT' | 'REJECT_TUTOR' | 'REJECT_PARENT' | 'SCALE_DOWN'>('ACCEPT');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/v1/classes');
      setClasses(res.data.filter((c: any) => c.status === 'TRIAL'));
    } catch (err) {
      console.error('Lỗi tải danh sách lớp học', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleOpenReview = (cls: any) => {
    setReviewingClass(cls);
    setDecision('ACCEPT');
    setReason('');
    setError(null);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingClass) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await api.post(`/api/v1/sessions/class/${reviewingClass.id}/trial-review`, {
        action: decision,
        reason: decision !== 'ACCEPT' ? reason : undefined,
      });

      toast.success(res.data.message);
      setReviewingClass(null);
      fetchClasses();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đánh giá dạy thử thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageTemplate
      title="Đánh Giá Dạy Thử"
      subtitle="Xác nhận kết quả buổi học thử của Gia sư để chốt học chính thức"
      badge="Client Portal"
    >
      <div className="w-full space-y-6 text-left font-sans text-[#566a7f]">
        <div className="flex items-center justify-between">
          <Link
            to="/client"
            className="text-xs font-semibold text-[#697a8d] hover:text-[#696cff] bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft size={14} /> Quay lại Client Portal
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-16 text-[#a1acb8] text-sm flex flex-col items-center gap-3">
            <Loader size={28} className="animate-spin text-[#696cff]" />
            Đang tải danh sách lớp học dạy thử...
          </div>
        ) : classes.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-12 text-center space-y-3">
            <Star size={44} className="mx-auto text-[#a1acb8]" />
            <h4 className="text-base font-bold text-[#566a7f]">Không có lớp nào cần đánh giá</h4>
            <p className="text-xs text-[#a1acb8] max-w-sm mx-auto">
              Hiện tại không có lớp học nào đang trong giai đoạn dạy thử cần phụ huynh phản hồi.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <h3 className="text-base font-bold text-[#566a7f] flex items-center gap-2">
                <Calendar size={18} className="text-[#696cff]" /> Các lớp đang chờ đánh giá dạy thử
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#fff8e1] text-[#ffab00]">
                {classes.length} lớp chờ duyệt
              </span>
            </div>

            <div className="space-y-3 pt-2">
              {classes.map((cls) => (
                <div
                  key={cls.id}
                  className="p-4 bg-[#f9f9fa] border border-gray-100 hover:border-[#696cff]/40 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all"
                >
                  <div>
                    <h4 className="font-bold text-[#566a7f] text-sm">
                      Học sinh: {cls.student?.fullName || 'Học viên'}
                    </h4>
                    <p className="text-xs text-[#a1acb8] mt-0.5">
                      Gia sư: <strong className="text-[#696cff]">{cls.tutor?.fullName || 'Chưa rõ'}</strong>
                    </p>
                    <p className="text-xs text-[#71dd37] font-semibold mt-0.5">
                      Học phí: {Number(cls.hourlyRate).toLocaleString()}đ/buổi
                    </p>
                  </div>

                  <button
                    onClick={() => handleOpenReview(cls)}
                    className="px-4 py-2 bg-[#696cff] hover:bg-[#5f61e6] text-white text-xs font-bold rounded-lg cursor-pointer transition-all shadow-[0_2px_4px_0_rgba(105,108,255,0.4)] flex items-center gap-1.5"
                  >
                    <Star size={14} />
                    <span>Viết Đánh Giá</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal Đánh giá dạy thử */}
        {reviewingClass && (
          <div className="fixed inset-0 z-50 bg-[#233446]/40 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white border-0 rounded-xl max-w-md w-full p-6 text-left shadow-2xl relative">
              <h3 className="text-lg font-bold mb-1 text-[#566a7f]">Đánh giá kết quả dạy thử</h3>
              <p className="text-[#a1acb8] text-xs mb-4">
                Phản hồi ý kiến về buổi dạy thử của gia sư: <strong className="text-[#696cff]">{reviewingClass.tutor?.fullName}</strong>
              </p>

              {error && (
                <div className="mb-4 p-3 bg-[#ffe0db] border border-[#ff3e1d]/40 rounded-lg text-xs font-semibold text-[#ff3e1d]">
                  {error}
                </div>
              )}

              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div className="space-y-2.5">
                  <label className="block text-xs font-semibold text-[#566a7f]">Quyết định của bạn:</label>

                  <label
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
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
                        <CheckCircle2 size={14} /> Hài lòng — Chốt gia sư này
                      </div>
                      <div className="text-[11px] text-[#697a8d] mt-0.5">Tiếp tục học chính thức, gia sư nhận lương.</div>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
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
                      <div className="text-[11px] text-[#697a8d] mt-0.5">Lớp sẽ được trung tâm tìm lại gia sư mới.</div>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
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
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
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
                    className="flex-1 py-2 bg-[#f5f5f9] hover:bg-gray-200 text-[#697a8d] rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Huỷ bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-2 bg-[#696cff] hover:bg-[#5f61e6] active:bg-[#595cd9] disabled:opacity-50 text-white font-bold rounded-lg text-xs cursor-pointer shadow-[0_2px_4px_0_rgba(105,108,255,0.4)] transition-all"
                  >
                    {submitting ? 'Đang gửi...' : 'Xác nhận Đánh giá'}
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
