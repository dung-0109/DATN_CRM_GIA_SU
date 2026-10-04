import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Briefcase, Calendar, DollarSign, ArrowLeft, Loader, Send, X } from 'lucide-react';
import PageTemplate from '../../components/PageTemplate';
import toast from 'react-hot-toast';

export default function TutorJobs() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applyingRequest, setApplyingRequest] = useState<any | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
      fetchRequests();
      toast.success('Ứng tuyển thành công! Vui lòng chờ phản hồi từ Sales.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ứng tuyển thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageTemplate
      title="Bảng Tin Tuyển Dụng"
      subtitle="Danh sách các lớp học đang mở tuyển gia sư giảng dạy"
      badge="Tutor Portal"
    >
      <div className="w-full space-y-6 text-left font-sans text-[#566a7f]">
        <div className="flex items-center justify-between">
          <Link
            to="/tutor"
            className="text-xs font-semibold text-[#697a8d] hover:text-[#696cff] bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft size={14} /> Quay lại Tutor Portal
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-16 text-[#a1acb8] text-sm flex flex-col items-center gap-3">
            <Loader size={28} className="animate-spin text-[#696cff]" />
            Đang tải danh sách lớp học tuyển dụng...
          </div>
        ) : error && !applyingRequest ? (
          <div className="p-4 bg-[#ffe0db] border border-[#ff3e1d]/40 rounded-xl text-center text-[#ff3e1d] text-xs font-semibold">
            {error}
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-12 text-center text-[#a1acb8] text-sm">
            Hiện tại chưa có lớp học nào đang đăng tin tìm Gia sư.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {requests.map((req) => (
              <div
                key={req.id}
                className="bg-white border border-gray-100 hover:border-[#696cff]/40 rounded-xl p-6 shadow-sm flex flex-col justify-between transition-all space-y-4"
              >
                <div>
                  <div className="flex justify-between items-start gap-4">
                    <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-[#e7e7ff] text-[#696cff]">
                      {req.subject}
                    </span>
                    <span
                      className={`px-2.5 py-1 text-xs font-bold rounded-md ${
                        req.status === 'PUBLISHED'
                          ? 'bg-[#e8fadf] text-[#71dd37]'
                          : req.status === 'NEW'
                          ? 'bg-[#d7f5fc] text-[#03c3ec]'
                          : 'bg-[#f5f5f9] text-[#a1acb8]'
                      }`}
                    >
                      {req.status === 'PUBLISHED'
                        ? 'Đang Tuyển'
                        : req.status === 'NEW'
                        ? 'Chờ duyệt tin'
                        : req.status}
                    </span>
                  </div>

                  <h3 className="mt-3 text-lg font-bold text-[#566a7f]">
                    {req.subject} — {req.student?.grade || req.grade}
                  </h3>

                  <p className="mt-2 text-xs text-[#697a8d] line-clamp-2">
                    <strong className="text-[#566a7f]">Lịch dạy:</strong> {req.scheduleNotes}
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-4 border-t border-gray-100 pt-3 text-xs">
                    <div>
                      <span className="text-[#a1acb8] block">Số buổi học</span>
                      <strong className="text-[#566a7f] text-sm flex items-center gap-1.5 mt-0.5">
                        <Calendar size={14} className="text-[#696cff]" /> {req.sessionsPerWeek} buổi / tuần
                      </strong>
                    </div>
                    <div>
                      <span className="text-[#a1acb8] block">Học phí đề xuất</span>
                      <strong className="text-[#71dd37] text-sm flex items-center gap-1 mt-0.5">
                        <DollarSign size={14} className="text-[#71dd37]" /> {parseInt(req.budgetPerSession).toLocaleString()}đ/b
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  {req.status === 'PUBLISHED' ? (
                    <button
                      onClick={() => handleApplyClick(req)}
                      className="w-full py-2.5 bg-[#696cff] hover:bg-[#5f61e6] active:bg-[#595cd9] text-white font-bold rounded-lg transition-all text-xs cursor-pointer shadow-[0_2px_4px_0_rgba(105,108,255,0.4)] flex items-center justify-center gap-1.5"
                    >
                      <Briefcase size={14} />
                      <span>Ứng tuyển ngay</span>
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full py-2.5 bg-[#f5f5f9] border border-gray-200 text-[#a1acb8] font-semibold rounded-lg text-xs"
                    >
                      Chưa mở tuyển dụng
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal ứng tuyển */}
        {applyingRequest && (
          <div className="fixed inset-0 z-50 bg-[#233446]/40 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white border-0 rounded-xl max-w-md w-full p-6 text-left shadow-2xl relative">
              <button
                onClick={() => setApplyingRequest(null)}
                className="absolute top-4 right-4 text-[#a1acb8] hover:text-[#566a7f] cursor-pointer"
              >
                <X size={18} />
              </button>

              <h3 className="text-lg font-bold mb-1 text-[#566a7f]">Ứng tuyển lớp học</h3>
              <p className="text-[#a1acb8] text-xs leading-relaxed mb-4">
                Bạn đang ứng tuyển dạy lớp cho học sinh <strong className="text-[#566a7f]">{applyingRequest.student?.fullName || 'Học viên'}</strong>. Vui lòng rà soát lại thông tin lớp học trước khi gửi yêu cầu.
              </p>

              <div className="bg-[#f9f9fa] border border-gray-100 p-3 rounded-lg mb-4 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#a1acb8] font-semibold">Môn học:</span>
                  <span className="font-bold text-[#696cff]">{applyingRequest.subject} - {applyingRequest.student?.grade || applyingRequest.grade}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#a1acb8] font-semibold">Thời lượng:</span>
                  <span className="font-bold text-[#566a7f]">{applyingRequest.sessionsPerWeek} buổi/tuần</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#a1acb8] font-semibold">Mức lương:</span>
                  <span className="font-bold text-[#71dd37]">{parseInt(applyingRequest.budgetPerSession).toLocaleString()}đ/buổi</span>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-[#ffe0db] border border-[#ff3e1d]/40 rounded-lg text-xs font-semibold text-[#ff3e1d]">
                  {error}
                </div>
              )}

              <form onSubmit={handleApplySubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#566a7f] mb-1.5">
                    Thư giới thiệu bản thân & kinh nghiệm (Tuỳ chọn)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Ví dụ: Tôi có 2 năm kinh nghiệm dạy môn Toán THPT, đạt giải học sinh giỏi tỉnh..."
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#f5f5f9] border border-[#d9dee3] rounded-lg text-xs text-[#566a7f] focus:outline-none focus:border-[#696cff] resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setApplyingRequest(null)}
                    className="flex-1 py-2 bg-[#f5f5f9] hover:bg-gray-200 text-[#697a8d] rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Huỷ bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-2 bg-[#696cff] hover:bg-[#5f61e6] active:bg-[#595cd9] disabled:opacity-50 text-white font-bold rounded-lg transition-all text-xs cursor-pointer shadow-[0_2px_4px_0_rgba(105,108,255,0.4)] flex items-center justify-center gap-1.5"
                  >
                    {submitting ? (
                      <Loader size={14} className="animate-spin" />
                    ) : (
                      <>
                        <span>Xác nhận ứng tuyển</span>
                        <Send size={12} />
                      </>
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
