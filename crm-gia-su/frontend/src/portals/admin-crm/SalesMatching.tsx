import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Users, Check, AlertTriangle, Loader, Settings, DollarSign } from 'lucide-react';

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



  const fetchRequestsAndClasses = async () => {
    setLoading(true);
    setError(null);
    try {
      // Lấy danh sách yêu cầu tìm gia sư
      const reqResponse = await api.get('/api/v1/matching/requests');
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
  const handlePublish = async (_requestId: string) => {
    try {
      alert('Không có tính năng này ở bản API hiện tại');
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
      const res = await api.get(`/api/v1/matching/requests/${request.id}/suggest`);
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
      await api.post(`/api/v1/matching/requests/${selectedRequest.id}/assign`, {
        tutorId: matchingTutor.tutorId,
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
    <div className="w-full flex flex-col">

      <main className="flex-1 w-full pb-6">
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
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <h2 className="text-2xl font-extrabold mb-6 tracking-tight flex items-center gap-3 text-[#566a7f]">
              <Settings className="text-[#696cff]" /> Bảng Điều phối & Khớp lớp
            </h2>

            {/* Bảng yêu cầu tìm gia sư */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#d9dee3] text-[#a1acb8] text-xs uppercase font-semibold">
                    <th className="py-4">Môn & Lớp</th>
                    <th className="py-4">Chi tiết Yêu cầu</th>
                    <th className="py-4">Phụ huynh</th>
                    <th className="py-4">Học sinh</th>
                    <th className="py-4">Trạng Thái</th>
                    <th className="py-4 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#d9dee3]">
                  {requests.map((req) => (
                    <tr key={req.id} className="hover:bg-[#f9f9f9] transition-colors">
                      <td className="py-4">
                        <div className="font-bold text-[#696cff]">{req.subject}</div>
                        <div className="text-xs text-[#a1acb8]">Khối {req.grade}</div>
                      </td>
                      <td className="py-4 text-xs space-y-1">
                        <div className="flex items-center gap-1.5"><strong className="text-[#566a7f]">💰 Ngân sách:</strong> <span className="text-[#71dd37] font-semibold">{parseInt(req.budgetPerSession).toLocaleString()}đ/buổi</span></div>
                        <div className="flex items-center gap-1.5"><strong className="text-[#566a7f]">📅 Lịch học:</strong> <span>{req.sessionsPerWeek} buổi/tuần ({req.learningMode === 'OFFLINE' ? 'Tại nhà' : 'Online'})</span></div>
                        {req.learningMode === 'OFFLINE' && req.address && (
                          <div className="flex items-start gap-1.5"><strong className="text-[#566a7f]">📍 Khu vực:</strong> <span className="text-[#697a8d] line-clamp-1">{req.address}</span></div>
                        )}
                      </td>
                      <td className="py-4 text-[#697a8d] font-medium">
                        {req.parent?.fullName || 'Ẩn danh'}
                      </td>
                      <td className="py-4 text-[#697a8d]">
                        {req.student?.fullName || 'Chưa rõ'}
                      </td>
                      <td className="py-4">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-md ${
                            req.status === 'PUBLISHED'
                              ? 'bg-[#e8fadf] text-[#71dd37]'
                              : req.status === 'NEW'
                              ? 'bg-[#e1f0ff] text-[#03c3ec]'
                              : req.status === 'MATCHED'
                              ? 'bg-[#e7e7ff] text-[#696cff]'
                              : 'bg-[#f5f5f9] text-[#a1acb8]'
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
                            className="px-3 py-1.5 bg-[#696cff] hover:bg-[#5f61e6] text-white text-xs font-bold rounded-md cursor-pointer transition-all inline-flex items-center gap-1 shadow-sm"
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
        <div className="fixed inset-0 z-40 bg-[#233446]/40 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 text-left shadow-2xl relative max-h-[85vh] flex flex-col font-sans">
            <h3 className="text-xl font-bold mb-1 text-[#566a7f]">Hồ sơ ứng tuyển Gia sư</h3>
            <p className="text-[#a1acb8] text-xs mb-6">
              Lớp: {selectedRequest.subject} ({selectedRequest.grade}) | Học phí đề xuất: {parseInt(selectedRequest.budgetPerSession).toLocaleString()}đ/buổi
            </p>

            <div className="flex-1 overflow-y-auto mb-6 pr-2 space-y-4">
              {appLoading ? (
                <div className="text-center py-10 space-y-3">
                  <Loader size={28} className="animate-spin text-[#696cff] mx-auto" />
                  <p className="text-[#a1acb8] text-xs font-semibold uppercase tracking-wider">Đang phân tích hồ sơ ứng cử...</p>
                </div>
              ) : applications.length === 0 ? (
                <div className="text-center py-12 px-4 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                  <div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
                    <Users size={20} />
                  </div>
                  <h4 className="text-[#566a7f] font-bold text-sm mb-1">Chưa có ứng viên</h4>
                  <p className="text-[#a1acb8] text-xs">Hiện tại chưa có Gia sư nào ứng tuyển hoặc phù hợp với lớp học này.</p>
                </div>
              ) : (
                applications.map((app) => (
                  <div
                    key={app.applicationId}
                    className="p-5 bg-white border border-gray-100 shadow-[0_2px_8px_0_rgba(67,89,113,0.05)] rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-5 relative overflow-hidden group hover:border-[#696cff]/40 hover:shadow-[0_4px_12px_0_rgba(105,108,255,0.15)] transition-all duration-300"
                  >
                    <div className="absolute top-0 right-0 px-3 py-1.5 bg-gradient-to-l from-[#e8fadf] to-transparent text-[#71dd37] text-[11px] font-extrabold rounded-bl-xl shadow-sm">
                      Độ phù hợp: {app.matchScore}%
                    </div>
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#696cff] to-[#5f61e6] text-white flex items-center justify-center font-bold shadow-md shadow-[#696cff]/30 shrink-0">
                        {app.tutorName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-[#566a7f] text-base group-hover:text-[#696cff] transition-colors">{app.tutorName}</h4>
                        <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs">
                          <span className="flex items-center gap-1.5 px-2 py-1 bg-[#f5f5f9] text-[#697a8d] rounded-md font-semibold">
                            🎓 {app.qualification}
                          </span>
                          <span className="flex items-center gap-1.5 px-2 py-1 bg-[#fff8e1] text-[#ffab00] rounded-md font-bold">
                            ⭐ Karma: {app.karmaScore}
                          </span>
                        </div>
                        {app.coverLetter && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg text-xs text-[#697a8d] italic border-l-4 border-[#696cff]/60 relative">
                            <span className="absolute top-1 left-2 text-2xl text-[#696cff]/20 font-serif leading-none">"</span>
                            <span className="relative z-10 block pl-4">{app.coverLetter}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setMatchingTutor({ tutorId: app.tutorId, fullName: app.tutorName })}
                      className="w-full md:w-auto px-5 py-2.5 bg-white border-2 border-[#696cff] hover:bg-[#696cff] text-[#696cff] hover:text-white text-xs font-bold rounded-lg transition-all duration-300 cursor-pointer inline-flex justify-center items-center gap-2 shrink-0 shadow-sm"
                    >
                      Chọn Gia Sư Này <Check size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setSelectedRequest(null)}
              className="py-2.5 bg-[#f5f5f9] hover:bg-[#d9dee3] font-semibold rounded-md text-xs cursor-pointer transition-all text-[#566a7f] hover:text-[#696cff] text-center w-full"
            >
              Đóng lại
            </button>
          </div>
        </div>
      )}

      {/* Modal nhập đơn giá khớp lớp dạy thử */}
      {matchingTutor && (
        <div className="fixed inset-0 z-50 bg-[#233446]/40 flex items-center justify-center p-4 backdrop-blur-sm font-sans">
          <div className="bg-white border-0 rounded-xl max-w-sm w-full p-6 text-left shadow-2xl relative">
            <h3 className="text-lg font-bold mb-2 text-[#566a7f]">Chốt Gia sư Dạy thử</h3>
            <p className="text-[#a1acb8] text-xs mb-6">
              Thiết lập đơn giá cho Gia sư: <strong className="text-[#696cff]">{matchingTutor.fullName}</strong>
            </p>

            <form onSubmit={handleMatchSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#566a7f] mb-2">
                  Đơn giá học phí Phụ huynh (đ/buổi)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#a1acb8]">
                    <DollarSign size={14} />
                  </span>
                  <input
                    type="number"
                    required
                    min={50000}
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(parseInt(e.target.value))}
                    className="w-full pl-9 pr-4 py-2.5 bg-[#f5f5f9] border border-[#d9dee3] rounded-md text-[#566a7f] focus:outline-none focus:border-[#696cff] transition-all text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#566a7f] mb-2">
                  Đơn giá lương Gia sư nhận (đ/buổi)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#a1acb8]">
                    <DollarSign size={14} />
                  </span>
                  <input
                    type="number"
                    required
                    min={50000}
                    value={tutorWageRate}
                    onChange={(e) => setTutorWageRate(parseInt(e.target.value))}
                    className="w-full pl-9 pr-4 py-2.5 bg-[#f5f5f9] border border-[#d9dee3] rounded-md text-[#566a7f] focus:outline-none focus:border-[#696cff] transition-all text-xs"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setMatchingTutor(null)}
                  className="flex-1 py-2 bg-[#f5f5f9] hover:bg-[#d9dee3] font-semibold rounded-md text-xs cursor-pointer transition-all text-[#566a7f]"
                >
                  Quay lại
                </button>
                <button
                  type="submit"
                  disabled={submittingMatch}
                  className="flex-1 py-2 bg-[#696cff] hover:bg-[#5f61e6] active:bg-[#4d4fc4] disabled:bg-[#a1acb8] text-white font-bold rounded-md transition-all duration-200 flex items-center justify-center gap-1 text-xs cursor-pointer shadow-sm"
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
        <div className="fixed inset-0 z-50 bg-[#233446]/40 flex items-center justify-center p-4 backdrop-blur-sm font-sans">
          <div className="bg-white border-0 rounded-xl max-w-md w-full p-6 text-left shadow-2xl relative">
            <h3 className="text-xl font-bold mb-2 text-[#566a7f]">Quyết toán kết quả dạy thử</h3>
            <p className="text-[#a1acb8] text-xs mb-6">
              Lớp dạy thử của Gia sư: <strong className="text-[#696cff]">{trialClass.tutor.fullName}</strong>
            </p>

            <form onSubmit={handleResolveSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-[#566a7f] mb-2">
                  Kết quả dạy thử
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setTrialOutcome('SUCCESS')}
                    className={`py-2.5 rounded-md border text-xs font-semibold transition-all ${
                      trialOutcome === 'SUCCESS'
                        ? 'bg-[#e8fadf] border-[#71dd37] text-[#71dd37]'
                        : 'bg-[#f5f5f9] border-[#d9dee3] text-[#a1acb8] hover:border-[#696cff]'
                    }`}
                  >
                    Thành công (Mua gói)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTrialOutcome('FAILED')}
                    className={`py-2.5 rounded-md border text-xs font-semibold transition-all ${
                      trialOutcome === 'FAILED'
                        ? 'bg-[#ffe0db] border-[#ff3e1d] text-[#ff3e1d]'
                        : 'bg-[#f5f5f9] border-[#d9dee3] text-[#a1acb8] hover:border-[#696cff]'
                    }`}
                  >
                    Thất bại (Khấu trừ 1 buổi)
                  </button>
                </div>
              </div>

              {trialOutcome === 'FAILED' ? (
                <>
                  <div className="p-3.5 bg-[#ffe0db] border border-[#ff3e1d]/40 rounded-md flex items-start gap-2.5 text-xs text-[#ff3e1d] leading-relaxed">
                    <AlertTriangle className="shrink-0 text-[#ff3e1d] mt-0.5" size={16} />
                    <span>
                      <strong>Lưu ý Tài chính (BR-FIN-01):</strong> Hệ thống sẽ tự động trừ <strong>{parseInt(trialClass.hourlyRate).toLocaleString()}đ</strong> từ số dư ví Phụ huynh để chuyển trả lương <strong>{parseInt(trialClass.tutorWageRate).toLocaleString()}đ</strong> cho Gia sư.
                    </span>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#566a7f] mb-2">
                      Lý do dạy thử thất bại / Đóng góp ý kiến
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Gia sư đi trễ, giảng bài không dễ hiểu..."
                      value={trialNote}
                      onChange={(e) => setTrialNote(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#f5f5f9] border border-[#d9dee3] rounded-md text-[#566a7f] focus:outline-none focus:border-[#ff3e1d] transition-all text-xs resize-none"
                    />
                  </div>
                </>
              ) : (
                <div className="p-3.5 bg-[#e8fadf] border border-[#71dd37]/40 rounded-md flex items-start gap-2.5 text-xs text-[#71dd37] leading-relaxed">
                  <Check className="shrink-0 text-[#71dd37] mt-0.5" size={16} />
                  <span>
                    Lớp sẽ chuyển sang trạng thái <strong>Giảng dạy chính thức</strong>. Phụ huynh tiến hành mua gói học phí để tiếp tục lên lịch học.
                  </span>
                </div>
              )}

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setTrialClass(null)}
                  className="flex-1 py-2.5 bg-[#f5f5f9] hover:bg-[#d9dee3] font-semibold rounded-md text-xs cursor-pointer transition-all text-[#566a7f]"
                >
                  Huỷ bỏ
                </button>
                <button
                  type="submit"
                  disabled={submittingResolve}
                  className="flex-1 py-2.5 bg-[#696cff] hover:bg-[#5f61e6] active:bg-[#4d4fc4] disabled:bg-[#a1acb8] text-white font-bold rounded-md transition-all duration-200 flex items-center justify-center gap-1.5 text-xs cursor-pointer shadow-sm"
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
