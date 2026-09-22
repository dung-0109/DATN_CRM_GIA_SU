import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { ArrowLeft, Loader, Calendar, Plus, RefreshCw } from 'lucide-react';

export default function LeavesManager() {
  const [role, setRole] = useState('');
  const [profileType, setProfileType] = useState('');
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState('');

  // Đơn nghỉ
  const [tutorLeaves, setTutorLeaves] = useState<any[]>([]);
  const [studentLeaves, setStudentLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [reason, setReason] = useState('');
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const navigate = useNavigate();

  const getProfileData = () => {
    const userRole = localStorage.getItem('role') || '';
    const userProfileType = localStorage.getItem('profileType') || '';
    setRole(userRole);
    setProfileType(userProfileType);
  };

  const fetchLeavesAndClasses = async () => {
    setLoading(true);
    try {
      const leavesRes = await api.get('/api/v1/leaves');
      setTutorLeaves(leavesRes.data.tutorLeaves || []);
      setStudentLeaves(leavesRes.data.studentLeaves || []);

      const classesRes = await api.get('/api/v1/classes');
      setClasses(classesRes.data);
      if (classesRes.data.length > 0) {
        setSelectedClassId(classesRes.data[0].id);
      }
    } catch (err) {
      console.error('Không thể tải thông tin đơn nghỉ/lớp học', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async (classId: string) => {
    if (!classId) return;
    try {
      const res = await api.get(`/api/v1/sessions?classId=${classId}`);
      // Chỉ lấy các buổi học SCHEDULED
      const scheduledSessions = res.data.filter((s: any) => s.status === 'SCHEDULED');
      setSessions(scheduledSessions);
      if (scheduledSessions.length > 0) {
        setSelectedSessionId(scheduledSessions[0].id);
      } else {
        setSelectedSessionId('');
      }
    } catch (err) {
      console.error('Không thể tải buổi học để báo nghỉ', err);
    }
  };

  useEffect(() => {
    getProfileData();
    fetchLeavesAndClasses();
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      fetchSessions(selectedClassId);
    }
  }, [selectedClassId]);

  const handleSubmitLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSessionId || !reason || !rescheduleDate) {
      setError('Vui lòng chọn buổi học, lý do và thời gian học bù');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    const isTutor = profileType === 'TUTOR' || role === 'TUTOR';
    const endpoint = isTutor ? '/api/v1/leaves/tutor' : '/api/v1/leaves/student';
    const payload = isTutor 
      ? { sessionId: selectedSessionId, reason, rescheduleSuggested: new Date(rescheduleDate).toISOString() }
      : { sessionId: selectedSessionId, reason, rescheduledTo: new Date(rescheduleDate).toISOString() };

    try {
      await api.post(endpoint, payload);
      setSuccess(
        isTutor 
          ? 'Đã gửi đơn xin nghỉ dạy. Lịch bù đang chờ Phụ huynh phê duyệt.' 
          : 'Đã gửi đơn báo nghỉ học. Lịch bù đang chờ Gia sư phê duyệt.'
      );
      setReason('');
      setRescheduleDate('');
      fetchLeavesAndClasses();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Yêu cầu báo nghỉ thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveLeave = async (leaveId: string, type: 'TUTOR' | 'STUDENT') => {
    const endpoint = type === 'TUTOR' 
      ? `/api/v1/leaves/tutor/${leaveId}/approve`
      : `/api/v1/leaves/student/${leaveId}/approve`;

    try {
      const res = await api.post(endpoint);
      alert(res.data.message);
      fetchLeavesAndClasses();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Phê duyệt thất bại');
    }
  };

  const isTutorRole = profileType === 'TUTOR' || role === 'TUTOR';
  const isParentRole = profileType === 'PARENT' || role === 'PARENT';

  return (
    <div className="w-full min-h-screen bg-slate-950 text-white p-6 relative overflow-hidden flex flex-col">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-600/5 blur-[120px]" />

      <header className="flex justify-between items-center pb-6 border-b border-indigo-900/30 relative z-10 max-w-6xl mx-auto w-full">
        <button
          onClick={() => navigate(isTutorRole ? '/tutor' : '/client')}
          className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} /> Quay lại Portal
        </button>
        <span className="text-sm font-semibold px-3 py-1 rounded-full bg-indigo-950 border border-indigo-850 text-indigo-400">
          Xin Nghỉ & Học Bù
        </span>
      </header>

      <main className="flex-1 relative z-10 max-w-6xl mx-auto w-full py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-3 text-center py-12">
            <Loader size={36} className="animate-spin text-indigo-500 mx-auto" />
            <p className="mt-4 text-slate-400">Đang tải lịch sử báo nghỉ & dời lịch...</p>
          </div>
        ) : (
          <>
            {/* Form Xin Nghỉ (Col 1) */}
            <div className="lg:col-span-1 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-md h-fit">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Plus className="text-indigo-400" size={20} /> Tạo yêu cầu báo nghỉ
              </h3>

              {error && (
                <div className="mb-4 p-3 bg-red-950/40 border border-red-800/40 rounded-xl text-xs text-red-400">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 p-3 bg-emerald-950/40 border border-emerald-800/40 rounded-xl text-xs text-emerald-400">
                  {success}
                </div>
              )}

              {classes.length === 0 ? (
                <div className="text-slate-500 text-xs text-center py-4">Chưa có lớp để xin nghỉ.</div>
              ) : (
                <form onSubmit={handleSubmitLeave} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-350 mb-1.5">Chọn Lớp học</label>
                    <select
                      value={selectedClassId}
                      onChange={(e) => setSelectedClassId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-white text-xs cursor-pointer focus:outline-none focus:border-indigo-500"
                    >
                      {classes.map((cls) => (
                        <option key={cls.id} value={cls.id} className="bg-slate-900">
                          {isTutorRole ? `Học sinh: ${cls.student?.fullName}` : `Gia sư: ${cls.tutor?.fullName}`} (ID: {cls.id.slice(0, 8)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-350 mb-1.5">Chọn Buổi học cần nghỉ</label>
                    {sessions.length === 0 ? (
                      <span className="block p-2 bg-slate-950/60 border border-slate-850 rounded-xl text-slate-500 text-xs italic">
                        Lớp học này hiện tại không có lịch học nào sắp tới (SCHEDULED).
                      </span>
                    ) : (
                      <select
                        value={selectedSessionId}
                        onChange={(e) => setSelectedSessionId(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-white text-xs cursor-pointer focus:outline-none focus:border-indigo-500"
                      >
                        {sessions.map((s) => (
                          <option key={s.id} value={s.id} className="bg-slate-900">
                            {new Date(s.scheduledTime).toLocaleString()}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-350 mb-1.5">Lý do xin nghỉ</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Lý do nghỉ dạy / học hôm nay..."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-white text-xs resize-none focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-350 mb-1.5">Đề xuất Ngày & Giờ học bù</label>
                    <input
                      type="datetime-local"
                      required
                      value={rescheduleDate}
                      onChange={(e) => setRescheduleDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {isTutorRole ? (
                    <div className="p-3 bg-red-950/30 border border-red-900/40 rounded-xl text-[10px] text-red-300 leading-normal">
                      ⚠️ <strong>Rule BR-LEAVE-01:</strong> Gia sư phải báo trước ít nhất <strong>24 tiếng</strong>. Nếu vi phạm, đơn sẽ bị đánh dấu báo nghỉ trễ và ghi nhận cảnh cáo vi phạm hợp đồng dạy học.
                    </div>
                  ) : (
                    <div className="p-3 bg-indigo-950/30 border border-indigo-900/40 rounded-xl text-[10px] text-indigo-300 leading-normal">
                      ⚠️ <strong>Rule BR-LEAVE-02:</strong> Học sinh cần báo trước ít nhất <strong>4 tiếng</strong>. Phụ huynh duyệt đơn nghỉ học của con trước khi chuyển đến Gia sư chốt lịch dạy bù.
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting || !selectedSessionId}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:bg-indigo-800 text-white font-bold rounded-xl transition-all text-xs cursor-pointer shadow-lg shadow-indigo-600/10"
                  >
                    {submitting ? 'Đang gửi...' : 'Gửi yêu cầu nghỉ'}
                  </button>
                </form>
              )}
            </div>

            {/* Danh sách Đơn Xin Nghỉ (Col 2 & 3) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Đơn nghỉ của Gia sư */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-md font-bold flex items-center gap-2">
                    <Calendar className="text-amber-500" size={18} /> Đơn xin nghỉ của Gia sư
                  </h3>
                  <button
                    onClick={fetchLeavesAndClasses}
                    className="p-1 bg-slate-950 border border-slate-850 text-slate-400 hover:text-white rounded-lg cursor-pointer transition-all"
                  >
                    <RefreshCw size={12} />
                  </button>
                </div>

                {tutorLeaves.length === 0 ? (
                  <div className="text-center py-6 text-slate-500 text-xs">Không có đơn xin nghỉ dạy nào.</div>
                ) : (
                  <div className="space-y-4 max-h-[30vh] overflow-y-auto pr-1">
                    {tutorLeaves.map((leave) => (
                      <div key={leave.id} className="p-4 bg-slate-950/60 border border-slate-850 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-white text-xs">Gia sư: {leave.tutor?.fullName}</h4>
                            {leave.isLateLeave && (
                              <span className="px-1.5 py-0.5 text-[8px] bg-red-950 border border-red-800 text-red-400 font-bold rounded">
                                Báo nghỉ trễ (&lt;24h)
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-450 mt-1">
                            Lý do: "{leave.reason}" | Đề xuất bù: <strong className="text-indigo-400">{new Date(leave.rescheduleSuggested).toLocaleString()}</strong>
                          </p>
                          <div className="mt-2 text-[10px] text-slate-550">
                            Trạng thái: <strong className={leave.status === 'APPROVED' ? 'text-emerald-450' : 'text-amber-450'}>{leave.status}</strong>
                          </div>
                        </div>

                        {leave.status === 'PENDING' && isParentRole && (
                          <button
                            onClick={() => handleApproveLeave(leave.id, 'TUTOR')}
                            className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 text-xs font-bold rounded-lg cursor-pointer transition-all"
                          >
                            Duyệt nghỉ & bù
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Đơn nghỉ của Học sinh */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-md">
                <h3 className="text-md font-bold flex items-center gap-2 mb-4">
                  <Calendar className="text-cyan-400" size={18} /> Đơn xin nghỉ của Học sinh
                </h3>

                {studentLeaves.length === 0 ? (
                  <div className="text-center py-6 text-slate-500 text-xs">Không có đơn xin nghỉ học nào.</div>
                ) : (
                  <div className="space-y-4 max-h-[30vh] overflow-y-auto pr-1">
                    {studentLeaves.map((leave) => (
                      <div key={leave.id} className="p-4 bg-slate-950/60 border border-slate-850 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-white text-xs">Học sinh: {leave.student?.fullName}</h4>
                            {leave.isLateLeave && (
                              <span className="px-1.5 py-0.5 text-[8px] bg-red-950 border border-red-800 text-red-400 font-bold rounded">
                                Báo nghỉ trễ (&lt;4h)
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-450 mt-1">
                            Lý do: "{leave.reason}" | Đề xuất bù: <strong className="text-indigo-400">{new Date(leave.rescheduledTo).toLocaleString()}</strong>
                          </p>
                          <div className="mt-2 text-[10px] text-slate-550">
                            Trạng thái: <strong className={leave.status === 'APPROVED' ? 'text-emerald-450' : 'text-amber-450'}>{leave.status}</strong>
                          </div>
                        </div>

                        {leave.status === 'PENDING' && isTutorRole && (
                          <button
                            onClick={() => handleApproveLeave(leave.id, 'STUDENT')}
                            className="px-3 py-1 bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 text-slate-950 text-xs font-bold rounded-lg cursor-pointer transition-all"
                          >
                            Chốt dạy bù
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
