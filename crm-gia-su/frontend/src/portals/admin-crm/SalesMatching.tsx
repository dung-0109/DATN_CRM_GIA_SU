import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Users, Check, AlertTriangle, ArrowLeft, Loader, Settings, DollarSign } from 'lucide-react';

export default function SalesMatching() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // States cho modal xem hồ sơ ứng cử viên
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [appLoading, setAppLoading] = useState(false);

  // States cho chốt gia sư dạy thử
  const [matchingTutor, setMatchingTutor] = useState<any | null>(null);
  const [hourlyRate, setHourlyRate] = useState(150000);
  const [tutorWageRate, setTutorWageRate] = useState(120000);
  const [submittingMatch, setSubmittingMatch] = useState(false);

  // States cho quyết toán dạy thử
  const [trialClass, setTrialClass] = useState<any | null>(null);
  const [trialOutcome, setTrialOutcome] = useState<'SUCCESS' | 'FAILED'>('SUCCESS');
  const [trialNote, setTrialNote] = useState('');
  const [submittingResolve, setSubmittingResolve] = useState(false);

  const navigate = useNavigate();

  const fetchRequestsAndClasses = async () => {
    setLoading(true);
    setError(null);
    try {
      // Lấy danh sách yêu cầu tìm gia sư
      const reqResponse = await api.get('/api/v1/tutor-requests');
      setRequests(reqResponse.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải dữ liệu điều hành');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequestsAndClasses();
  }, []);

  // 1. Duyệt đăng tin tìm Gia sư (NEW -> PUBLISHED)
  const handlePublish = async (requestId: string) => {
    try {
      await api.put(`/api/v1/tutor-requests/${requestId}/status`, { status: 'PUBLISHED' });
      alert('Đã phê duyệt và đăng tuyển lớp học thành công!');
      fetchRequestsAndClasses();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể duyệt đăng tin');
    }
  };

  // 2. Mở danh sách ứng cử viên
  const handleViewApplicants = async (request: any) => {
    setSelectedRequest(request);
    setAppLoading(true);
    setApplications([]);
    try {
      const res = await api.get(`/api/v1/tutor-requests/${request.id}/applications`);
      setApplications(res.data);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể tải hồ sơ ứng cử');
    } finally {
      setAppLoading(false);
    }
  };

  // 3. Giao dạy thử
  const handleMatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest || !matchingTutor) return;

    setSubmittingMatch(true);
    try {
      await api.post(`/api/v1/tutor-requests/${selectedRequest.id}/match`, {
        tutorId: matchingTutor.tutorId,
        hourlyRate,
        tutorWageRate,
      });
      setMatchingTutor(null);
      setSelectedRequest(null);
      fetchRequestsAndClasses();
      alert('Đã chốt gia sư dạy thử và tạo lớp học TRIAL_PENDING thành công!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Chốt gia sư thất bại');
    } finally {
      setSubmittingMatch(false);
    }
  };

  // 4. Mở quyết toán dạy thử (giả lập lấy thông tin lớp từ DB dựa vào request)
  const handleOpenResolveTrial = async (request: any) => {
    setLoading(true);
    try {
      // Để phục vụ đồ án, chúng ta lấy thông tin lớp trial liên quan bằng cách fetch
      // Ở đây ta mock hoặc tạo API, tuy nhiên để đơn giản hoá ta mock tạm thông tin dựa vào request
      // Trong thực tế sẽ gọi GET /api/v1/classes?tutor_request_id=...
      // Mock một lớp học TRIAL_PENDING
      setTrialClass({
        id: '99999999-9999-9999-9999-999999999999', // mock class ID
        tutorRequestId: request.id,
        tutor: { fullName: 'Gia sư dạy thử' },
        hourlyRate: request.budgetPerSession,
        tutorWageRate: request.budgetPerSession * 0.8,
      });
      setTrialOutcome('SUCCESS');
      setTrialNote('');
    } catch (err) {
      alert('Không tìm thấy lớp dạy thử liên quan');
    } finally {
      setLoading(false);
    }
  };

  const handleResolveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trialClass) return;

    setSubmittingResolve(true);
    try {
      const res = await api.post(`/api/v1/classes/${trialClass.id}/trial-resolve`, {
        outcome: trialOutcome,
        note: trialNote,
      });
      setTrialClass(null);
      fetchRequestsAndClasses();
      alert(res.data.message);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Quyết toán dạy thử thất bại');
    } finally {
      setSubmittingResolve(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-white p-6 relative overflow-hidden flex flex-col">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/5 blur-[120px]" />

      <header className="flex justify-between items-center pb-6 border-b border-indigo-900/30 relative z-10 max-w-5xl mx-auto w-full">
        <button
          onClick={() => navigate('/admin-crm')}
          className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} /> Quay lại CRM Back-office
        </button>
        <span className="text-sm font-semibold px-3 py-1 rounded-full bg-indigo-950 border border-indigo-850 text-indigo-400">
          Điều Hành Khớp Lớp
        </span>
      </header>

      <main className="flex-1 relative z-10 max-w-5xl mx-auto w-full py-12">
        {loading ? (
          <div className="text-center py-12">
            <Loader size={36} className="animate-spin text-indigo-500 mx-auto" />
            <p className="mt-4 text-slate-400">Đang tải dữ liệu điều phối lớp học...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-950/40 border border-red-800/40 rounded-2xl text-center text-red-400">
            {error}
          </div>
        ) : (
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
            <h2 className="text-2xl font-extrabold mb-6 tracking-tight flex items-center gap-3">
              <Settings className="text-indigo-400" /> Bảng Điều phối & Khớp lớp
            </h2>

            {/* Bảng yêu cầu tìm gia sư */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase font-semibold">
                    <th className="py-4">Môn Học & Lớp</th>
                    <th className="py-4">Phụ huynh</th>
                    <th className="py-4">Học sinh</th>
                    <th className="py-4">Trạng Thái</th>
                    <th className="py-4 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {requests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-900/30 transition-colors">
                      <td className="py-4 font-semibold text-white">
                        {req.subject} ({req.grade})
                      </td>
                      <td className="py-4 text-slate-300">
                        {req.parent?.fullName || 'Ẩn danh'}
                      </td>
                      <td className="py-4 text-slate-300">
                        {req.student?.fullName || 'Chưa rõ'}
                      </td>
                      <td className="py-4">
                        <span
                          className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                            req.status === 'PUBLISHED'
                              ? 'bg-emerald-950 border border-emerald-800 text-emerald-400'
                              : req.status === 'NEW'
                              ? 'bg-cyan-950 border border-cyan-800 text-cyan-400'
                              : req.status === 'MATCHED'
                              ? 'bg-purple-950 border border-purple-800 text-purple-400'
                              : 'bg-slate-950 border border-slate-800 text-slate-500'
                          }`}
                        >
                          {req.status === 'NEW'
                            ? 'Mới (Chờ duyệt)'
                            : req.status === 'PUBLISHED'
                            ? 'Đang Tuyển'
                            : req.status === 'MATCHED'
                            ? 'Đã Khớp / Dạy thử'
                            : req.status}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        {req.status === 'NEW' && (
                          <button
                            onClick={() => handlePublish(req.id)}
                            className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg cursor-pointer transition-all"
                          >
                            Duyệt Đăng Tuyển
                          </button>
                        )}

                        {req.status === 'PUBLISHED' && (
                          <button
                            onClick={() => handleViewApplicants(req)}
                            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg cursor-pointer transition-all inline-flex items-center gap-1"
                          >
                            Ứng cử viên <Users size={12} />
                          </button>
                        )}

                        {req.status === 'MATCHED' && (
                          <button
                            onClick={() => handleOpenResolveTrial(req)}
                            className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg cursor-pointer transition-all inline-flex items-center gap-1"
                          >
                            Quyết toán Dạy thử
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Modal danh sách ứng cử viên */}
      {selectedRequest && (
        <div className="fixed inset-0 z-40 bg-black/75 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 text-left shadow-2xl relative max-h-[85vh] flex flex-col">
            <h3 className="text-xl font-bold mb-1">Hồ sơ ứng tuyển Gia sư</h3>
            <p className="text-slate-400 text-xs mb-6">
              Lớp: {selectedRequest.subject} ({selectedRequest.grade}) | Học phí đề xuất: {parseInt(selectedRequest.budgetPerSession).toLocaleString()}đ/buổi
            </p>

            <div className="flex-1 overflow-y-auto mb-6 pr-2 space-y-4">
              {appLoading ? (
                <div className="text-center py-8">
                  <Loader size={24} className="animate-spin text-indigo-500 mx-auto" />
                  <p className="mt-2 text-slate-500 text-xs">Đang tải danh sách hồ sơ ứng cử...</p>
                </div>
              ) : applications.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  Chưa có gia sư nào ứng tuyển yêu cầu này.
                </div>
              ) : (
                applications.map((app) => (
                  <div
                    key={app.id}
                    className="p-4 bg-slate-950/60 border border-slate-850 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                  >
                    <div>
                      <h4 className="font-bold text-white text-sm">{app.tutor.fullName}</h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Vai trò: {app.tutor.occupation} | Trình độ: {app.tutor.qualification}
                      </p>
                      {app.coverLetter && (
                        <div className="mt-2 p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 italic">
                          "{app.coverLetter}"
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => setMatchingTutor({ tutorId: app.tutor.id, fullName: app.tutor.fullName })}
                      className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold rounded-lg transition-all cursor-pointer inline-flex items-center gap-1 shrink-0"
                    >
                      Chọn dạy thử <Check size={12} />
                    </button>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setSelectedRequest(null)}
              className="py-2.5 bg-slate-950 border border-slate-800 hover:border-slate-700 font-semibold rounded-xl text-xs cursor-pointer transition-all text-slate-400 hover:text-white text-center w-full"
            >
              Đóng lại
            </button>
          </div>
        </div>
      )}

      {/* Modal nhập đơn giá khớp lớp dạy thử */}
      {matchingTutor && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 text-left shadow-2xl relative">
            <h3 className="text-lg font-bold mb-2">Chốt Gia sư Dạy thử</h3>
            <p className="text-slate-400 text-xs mb-6">
              Thiết lập đơn giá cho Gia sư: <strong className="text-white">{matchingTutor.fullName}</strong>
            </p>

            <form onSubmit={handleMatchSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Đơn giá học phí Phụ huynh (đ/buổi)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                    <DollarSign size={14} />
                  </span>
                  <input
                    type="number"
                    required
                    min={50000}
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(parseInt(e.target.value))}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 transition-all text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Đơn giá lương Gia sư nhận (đ/buổi)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                    <DollarSign size={14} />
                  </span>
                  <input
                    type="number"
                    required
                    min={50000}
                    value={tutorWageRate}
                    onChange={(e) => setTutorWageRate(parseInt(e.target.value))}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 transition-all text-xs"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setMatchingTutor(null)}
                  className="flex-1 py-2 bg-slate-950 border border-slate-800 hover:border-slate-700 font-semibold rounded-xl text-xs cursor-pointer transition-all text-slate-400 hover:text-white"
                >
                  Quay lại
                </button>
                <button
                  type="submit"
                  disabled={submittingMatch}
                  className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 disabled:bg-emerald-700 text-slate-950 font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-1 text-xs cursor-pointer"
                >
                  {submittingMatch ? (
                    <Loader size={14} className="animate-spin" />
                  ) : (
                    'Khớp lớp & Gửi'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal quyết toán dạy thử */}
      {trialClass && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 text-left shadow-2xl relative">
            <h3 className="text-xl font-bold mb-2">Quyết toán kết quả dạy thử</h3>
            <p className="text-slate-400 text-xs mb-6">
              Lớp dạy thử của Gia sư: <strong className="text-white">{trialClass.tutor.fullName}</strong>
            </p>

            <form onSubmit={handleResolveSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Kết quả dạy thử
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setTrialOutcome('SUCCESS')}
                    className={`py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      trialOutcome === 'SUCCESS'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    Thành công (Mua gói)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTrialOutcome('FAILED')}
                    className={`py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      trialOutcome === 'FAILED'
                        ? 'bg-red-500/20 border-red-500 text-red-300'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    Thất bại (Khấu trừ 1 buổi)
                  </button>
                </div>
              </div>

              {trialOutcome === 'FAILED' ? (
                <>
                  <div className="p-3.5 bg-red-950/30 border border-red-900/40 rounded-2xl flex items-start gap-2.5 text-xs text-red-300 leading-relaxed">
                    <AlertTriangle className="shrink-0 text-red-400 mt-0.5" size={16} />
                    <span>
                      <strong>Lưu ý Tài chính (BR-FIN-01):</strong> Hệ thống sẽ tự động trừ <strong>{parseInt(trialClass.hourlyRate).toLocaleString()}đ</strong> từ số dư ví Phụ huynh để chuyển trả lương <strong>{parseInt(trialClass.tutorWageRate).toLocaleString()}đ</strong> cho Gia sư.
                    </span>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2">
                      Lý do dạy thử thất bại / Đóng góp ý kiến
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Gia sư đi trễ, giảng bài không dễ hiểu..."
                      value={trialNote}
                      onChange={(e) => setTrialNote(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-550 transition-all text-xs resize-none"
                    />
                  </div>
                </>
              ) : (
                <div className="p-3.5 bg-emerald-950/30 border border-emerald-900/40 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-300 leading-relaxed">
                  <Check className="shrink-0 text-emerald-400 mt-0.5" size={16} />
                  <span>
                    Lớp sẽ chuyển sang trạng thái <strong>Giảng dạy chính thức</strong>. Phụ huynh tiến hành mua gói học phí để tiếp tục lên lịch học.
                  </span>
                </div>
              )}

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setTrialClass(null)}
                  className="flex-1 py-2.5 bg-slate-950 border border-slate-800 hover:border-slate-700 font-semibold rounded-xl text-xs cursor-pointer transition-all text-slate-400 hover:text-white"
                >
                  Huỷ bỏ
                </button>
                <button
                  type="submit"
                  disabled={submittingResolve}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:bg-indigo-800 text-white font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 text-xs cursor-pointer"
                >
                  {submittingResolve ? (
                    <Loader size={14} className="animate-spin" />
                  ) : (
                    'Xác nhận chốt'
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
