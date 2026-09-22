import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Briefcase, Calendar, DollarSign, ArrowLeft, Loader, Send } from 'lucide-react';

export default function TutorJobs() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applyingRequest, setApplyingRequest] = useState<any | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/api/v1/tutor-requests');
      setRequests(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải danh sách lớp tuyển');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApplyClick = (request: any) => {
    setApplyingRequest(request);
    setCoverLetter('');
    setError(null);
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyingRequest) return;

    setSubmitting(true);
    setError(null);

    try {
      await api.post(`/api/v1/tutor-requests/${applyingRequest.id}/apply`, {
        coverLetter,
      });
      setApplyingRequest(null);
      // Reload danh sách
      fetchRequests();
      alert('Ứng tuyển thành công! Vui lòng chờ phản hồi từ Sales.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ứng tuyển thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-white p-6 relative overflow-hidden flex flex-col">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/5 blur-[120px]" />

      <header className="flex justify-between items-center pb-6 border-b border-indigo-900/30 relative z-10 max-w-5xl mx-auto w-full">
        <button
          onClick={() => navigate('/tutor')}
          className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} /> Quay lại Tutor Portal
        </button>
        <span className="text-sm font-semibold px-3 py-1 rounded-full bg-amber-950/40 border border-amber-900/50 text-amber-400">
          Danh Sách Lớp Đang Tuyển
        </span>
      </header>

      <main className="flex-1 relative z-10 max-w-5xl mx-auto w-full py-12">
        {loading ? (
          <div className="text-center py-12">
            <Loader size={36} className="animate-spin text-amber-500 mx-auto" />
            <p className="mt-4 text-slate-400">Đang tải danh sách lớp học tuyển dụng...</p>
          </div>
        ) : error && !applyingRequest ? (
          <div className="p-4 bg-red-950/40 border border-red-800/40 rounded-2xl text-center text-red-400">
            {error}
          </div>
        ) : requests.length === 0 ? (
          <div className="p-12 bg-slate-900/40 border border-slate-800 rounded-3xl text-center text-slate-500">
            Hiện tại chưa có lớp học nào đang đăng tin tìm Gia sư.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {requests.map((req) => (
              <div
                key={req.id}
                className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start gap-4">
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-950 border border-indigo-800 text-indigo-400">
                      {req.subject}
                    </span>
                    <span
                      className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                        req.status === 'PUBLISHED'
                          ? 'bg-emerald-950 border border-emerald-800 text-emerald-400'
                          : req.status === 'NEW'
                          ? 'bg-cyan-950 border border-cyan-800 text-cyan-400'
                          : 'bg-slate-950 border border-slate-800 text-slate-500'
                      }`}
                    >
                      {req.status === 'PUBLISHED'
                        ? 'Đang Tuyển'
                        : req.status === 'NEW'
                        ? 'Chờ duyệt tin'
                        : req.status}
                    </span>
                  </div>

                  <h3 className="mt-4 text-lg font-bold text-white">
                    {req.subject} - {req.student?.grade || req.grade}
                  </h3>

                  <p className="mt-3 text-xs text-slate-400 line-clamp-2">
                    <strong className="text-slate-300">Lịch dạy:</strong> {req.scheduleNotes}
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-800 pt-4 text-xs">
                    <div>
                      <span className="text-slate-500 block">Số buổi học</span>
                      <strong className="text-white text-sm flex items-center gap-1.5 mt-1">
                        <Calendar size={14} className="text-amber-500" /> {req.sessionsPerWeek} buổi / tuần
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Học phí đề xuất</span>
                      <strong className="text-white text-sm flex items-center gap-1 mt-1">
                        <DollarSign size={14} className="text-emerald-500" /> {parseInt(req.budgetPerSession).toLocaleString()}đ
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  {req.status === 'PUBLISHED' ? (
                    <button
                      onClick={() => handleApplyClick(req)}
                      className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold rounded-xl transition-all text-xs cursor-pointer shadow-lg shadow-amber-500/10 flex items-center justify-center gap-1"
                    >
                      Ứng tuyển ngay <Briefcase size={12} />
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full py-2.5 bg-slate-950 border border-slate-800 text-slate-500 font-semibold rounded-xl text-xs"
                    >
                      Chưa mở tuyển dụng
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal ứng tuyển (Netflix Style) */}
      {applyingRequest && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 text-left shadow-2xl relative">
            <h3 className="text-xl font-bold mb-2">Ứng tuyển lớp học</h3>
            <p className="text-slate-400 text-xs leading-relaxed mb-6">
              Bạn đang đăng ký dạy lớp <strong className="text-white">{applyingRequest.subject}</strong> cho học sinh <strong className="text-white">{applyingRequest.student?.fullName || 'Học viên'}</strong>.
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-950/40 border border-red-800/40 rounded-xl text-xs text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleApplySubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Thư giới thiệu bản thân & kinh nghiệm (Tuỳ chọn)
                </label>
                <textarea
                  rows={4}
                  placeholder="Ví dụ: Tôi có 2 năm kinh nghiệm dạy môn Toán THPT, đạt giải học sinh giỏi tỉnh..."
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-all text-xs resize-none"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setApplyingRequest(null)}
                  className="flex-1 py-2.5 bg-slate-950 border border-slate-800 hover:border-slate-700 font-semibold rounded-xl text-xs cursor-pointer transition-all text-slate-400 hover:text-white text-center"
                >
                  Huỷ bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 disabled:bg-amber-700 text-slate-950 font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 text-xs cursor-pointer"
                >
                  {submitting ? (
                    <Loader size={14} className="animate-spin" />
                  ) : (
                    <>
                      Xác nhận ứng tuyển <Send size={12} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
