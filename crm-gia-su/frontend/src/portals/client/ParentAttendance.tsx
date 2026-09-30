import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { ArrowLeft, Loader, CheckCircle2, AlertTriangle, Calendar, Star, XCircle, TrendingDown } from 'lucide-react';

export default function ParentAttendance() {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [reviewingClass, setReviewingClass] = useState<any | null>(null);
  const [decision, setDecision] = useState<'ACCEPT' | 'REJECT_TUTOR' | 'REJECT_PARENT' | 'SCALE_DOWN'>('ACCEPT');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/v1/classes');
      // Only show classes in TRIAL status for review
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

      alert(res.data.message);
      setReviewingClass(null);
      fetchClasses();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đánh giá dạy thử thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-white p-6 relative overflow-hidden flex flex-col">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-600/5 blur-[120px]" />

      <header className="flex justify-between items-center pb-6 border-b border-cyan-900/30 relative z-10 max-w-5xl mx-auto w-full">
        <button
          onClick={() => navigate('/client')}
          className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} /> Quay lại Client Portal
        </button>
        <span className="text-sm font-semibold px-3 py-1 rounded-full bg-cyan-950 border border-cyan-850 text-cyan-400">
          Đánh Giá Dạy Thử
        </span>
      </header>

      <main className="flex-1 relative z-10 max-w-4xl mx-auto w-full py-12">
        {loading ? (
          <div className="text-center py-12">
            <Loader size={36} className="animate-spin text-cyan-550 mx-auto" />
            <p className="mt-4 text-slate-400">Đang tải danh sách lớp học dạy thử...</p>
          </div>
        ) : classes.length === 0 ? (
          <div className="p-12 bg-slate-900/40 border border-slate-800 rounded-3xl text-center text-slate-500 flex flex-col items-center">
            <Star size={48} className="text-slate-700 mb-4" />
            <p className="text-lg">Hiện tại không có lớp học nào đang trong giai đoạn dạy thử cần đánh giá.</p>
          </div>
        ) : (
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl shadow-2xl space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
              <Calendar className="text-cyan-400" /> Các lớp đang chờ đánh giá dạy thử
            </h2>

            <div className="space-y-4">
              {classes.map((cls) => (
                <div
                  key={cls.id}
                  className="p-5 bg-slate-950/60 border border-slate-850 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                >
                  <div>
                    <h4 className="font-bold text-white text-sm">
                      Học sinh: {cls.student?.fullName || 'Học viên'}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Gia sư dạy thử: <strong className="text-cyan-400">{cls.tutor?.fullName || 'Chưa rõ'}</strong>
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Mức phí: {(cls.hourlyRate).toLocaleString()}đ/buổi
                    </p>
                  </div>

                  <button
                    onClick={() => handleOpenReview(cls)}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg cursor-pointer transition-all inline-flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/20"
                  >
                    Viết Đánh Giá <Star size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Modal Đánh giá dạy thử */}
      {reviewingClass && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 text-left shadow-2xl relative">
            <h3 className="text-xl font-bold mb-2 text-white">Đánh giá kết quả dạy thử</h3>
            <p className="text-slate-400 text-xs mb-6 leading-relaxed">
              Vui lòng cho biết quyết định của Phụ huynh sau buổi dạy thử của gia sư <strong className="text-cyan-400">{reviewingClass.tutor?.fullName}</strong>.
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-950/40 border border-red-800/40 rounded-xl text-xs text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleReviewSubmit} className="space-y-5">
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-300">Quyết định của bạn:</label>
                
                <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${decision === 'ACCEPT' ? 'bg-emerald-950/30 border-emerald-500/50' : 'bg-slate-950 border-slate-800'}`}>
                  <input type="radio" name="decision" value="ACCEPT" checked={decision === 'ACCEPT'} onChange={() => setDecision('ACCEPT')} className="mt-1" />
                  <div>
                    <div className="text-sm font-bold text-emerald-400 flex items-center gap-1"><CheckCircle2 size={14}/> Chốt gia sư này</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Tiếp tục học chính thức. Tiền cọc sẽ được chuyển cho gia sư.</div>
                  </div>
                </label>

                <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${decision === 'REJECT_TUTOR' ? 'bg-red-950/30 border-red-500/50' : 'bg-slate-950 border-slate-800'}`}>
                  <input type="radio" name="decision" value="REJECT_TUTOR" checked={decision === 'REJECT_TUTOR'} onChange={() => setDecision('REJECT_TUTOR')} className="mt-1" />
                  <div>
                    <div className="text-sm font-bold text-red-400 flex items-center gap-1"><AlertTriangle size={14}/> Đổi gia sư khác (Lỗi do gia sư)</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Gia sư dạy không đạt yêu cầu. Lớp sẽ được tuyển lại gia sư mới.</div>
                  </div>
                </label>

                <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${decision === 'REJECT_PARENT' ? 'bg-amber-950/30 border-amber-500/50' : 'bg-slate-950 border-slate-800'}`}>
                  <input type="radio" name="decision" value="REJECT_PARENT" checked={decision === 'REJECT_PARENT'} onChange={() => setDecision('REJECT_PARENT')} className="mt-1" />
                  <div>
                    <div className="text-sm font-bold text-amber-400 flex items-center gap-1"><XCircle size={14}/> Huỷ lớp (Từ phía Phụ huynh)</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Phụ huynh đổi ý không muốn học nữa. Gia sư bị mất công.</div>
                  </div>
                </label>

                <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${decision === 'SCALE_DOWN' ? 'bg-indigo-950/30 border-indigo-500/50' : 'bg-slate-950 border-slate-800'}`}>
                  <input type="radio" name="decision" value="SCALE_DOWN" checked={decision === 'SCALE_DOWN'} onChange={() => setDecision('SCALE_DOWN')} className="mt-1" />
                  <div>
                    <div className="text-sm font-bold text-indigo-400 flex items-center gap-1"><TrendingDown size={14}/> Giảm quy mô lớp</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Gia sư không đáp ứng đủ số buổi, cần tìm gia sư khác thay thế.</div>
                  </div>
                </label>
              </div>

              {decision !== 'ACCEPT' && (
                <div className="animate-fadeIn">
                  <label className="block text-xs font-semibold text-slate-300 mb-2">Lý do chi tiết (Bắt buộc):</label>
                  <textarea
                    required
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Vui lòng cho biết lý do cụ thể..."
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
                    rows={3}
                  />
                </div>
              )}

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewingClass(null)}
                  className="flex-1 py-2.5 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-xl text-sm font-semibold cursor-pointer"
                >
                  Huỷ bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-800 text-white font-bold rounded-xl text-sm cursor-pointer shadow-lg shadow-cyan-600/20"
                >
                  {submitting ? 'Đang gửi...' : 'Xác nhận Đánh giá'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
