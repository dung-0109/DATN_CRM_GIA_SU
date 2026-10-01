import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { ArrowLeft, Loader, Calendar, Plus, RefreshCw } from 'lucide-react';
import PageTemplate from '../../components/PageTemplate';

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
    const endpoint =
      type === 'TUTOR'
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
    <PageTemplate
      title="Báo Nghỉ & Học Bù"
      subtitle="Quản lý các yêu cầu hoãn lịch học và phối hợp sắp xếp lịch học bù"
      badge={isTutorRole ? 'Tutor Portal' : 'Client Portal'}
    >
      <div className="w-full space-y-6 text-left font-sans text-[#566a7f]">
        <div className="flex items-center justify-between">
          <Link
            to={isTutorRole ? '/tutor' : '/client'}
            className="text-xs font-semibold text-[#697a8d] hover:text-[#696cff] bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft size={14} /> Quay lại {isTutorRole ? 'Tutor Portal' : 'Client Portal'}
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-16 text-[#a1acb8] text-sm flex flex-col items-center gap-3">
            <Loader size={28} className="animate-spin text-[#696cff]" />
            Đang tải dữ liệu đơn nghỉ...
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form Xin Nghỉ (Col 1) */}
            <div className="lg:col-span-1 bg-white border border-gray-100 rounded-xl p-6 shadow-sm space-y-4 h-fit">
              <h3 className="text-base font-bold text-[#566a7f] flex items-center gap-2 pb-2 border-b border-gray-100">
                <Plus className="text-[#696cff]" size={18} /> Tạo yêu cầu báo nghỉ
              </h3>

              {error && (
                <div className="p-3 bg-[#ffe0db] border border-[#ff3e1d]/40 rounded-lg text-xs font-semibold text-[#ff3e1d]">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 bg-[#e8fadf] border border-[#71dd37]/40 rounded-lg text-xs font-semibold text-[#71dd37]">
                  {success}
                </div>
              )}

              {classes.length === 0 ? (
                <div className="text-[#a1acb8] text-xs text-center py-6">Chưa có lớp học nào để xin nghỉ.</div>
              ) : (
                <form onSubmit={handleSubmitLeave} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-[#566a7f] mb-1">Chọn Lớp học</label>
                    <select
                      value={selectedClassId}
                      onChange={(e) => setSelectedClassId(e.target.value)}
                      className="w-full px-3 py-2 bg-[#f5f5f9] border border-[#d9dee3] rounded-lg text-xs text-[#566a7f] focus:outline-none focus:border-[#696cff] cursor-pointer"
                    >
                      {classes.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          {isTutorRole ? `Học sinh: ${cls.student?.fullName}` : `Gia sư: ${cls.tutor?.fullName}`} (Mã: {cls.id.slice(0, 6)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#566a7f] mb-1">Buổi học cần nghỉ</label>
                    {sessions.length === 0 ? (
                      <span className="block p-2 bg-[#fff8e1] border border-[#ffab00]/30 rounded-lg text-[#ffab00] text-xs font-medium">
                        Lớp học này hiện không có lịch học sắp tới.
                      </span>
                    ) : (
                      <select
                        value={selectedSessionId}
                        onChange={(e) => setSelectedSessionId(e.target.value)}
                        className="w-full px-3 py-2 bg-[#f5f5f9] border border-[#d9dee3] rounded-lg text-xs text-[#566a7f] focus:outline-none focus:border-[#696cff] cursor-pointer"
                      >
                        {sessions.map((s) => (
                          <option key={s.id} value={s.id}>
                            {new Date(s.scheduledTime).toLocaleString('vi-VN')}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#566a7f] mb-1">Lý do xin nghỉ</label>
                    <textarea
                      rows={2}
                      required
                      placeholder="Lý do nghỉ buổi học..."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full px-3 py-2 bg-[#f5f5f9] border border-[#d9dee3] rounded-lg text-xs text-[#566a7f] focus:outline-none focus:border-[#696cff] resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#566a7f] mb-1">Đề xuất Ngày & Giờ học bù</label>
                    <input
                      type="datetime-local"
                      required
                      value={rescheduleDate}
                      onChange={(e) => setRescheduleDate(e.target.value)}
                      className="w-full px-3 py-2 bg-[#f5f5f9] border border-[#d9dee3] rounded-lg text-xs text-[#566a7f] focus:outline-none focus:border-[#696cff]"
                    />
                  </div>

                  {isTutorRole ? (
                    <div className="p-3 bg-[#ffe0db]/60 border border-[#ff3e1d]/30 rounded-lg text-xs text-[#ff3e1d]">
                      ⚠️ <strong>Quy định:</strong> Gia sư cần báo trước ít nhất <strong>24 tiếng</strong> để đảm bảo không bị cảnh cáo.
                    </div>
                  ) : (
                    <div className="p-3 bg-[#e7e7ff] border border-[#696cff]/30 rounded-lg text-xs text-[#696cff]">
                      ⚠️ <strong>Quy định:</strong> Học sinh cần báo trước ít nhất <strong>4 tiếng</strong> để gia sư chủ động lịch.
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting || !selectedSessionId}
                    className="w-full py-2.5 bg-[#696cff] hover:bg-[#5f61e6] active:bg-[#595cd9] disabled:opacity-50 text-white font-bold rounded-lg transition-all text-xs cursor-pointer shadow-[0_2px_4px_0_rgba(105,108,255,0.4)]"
                  >
                    {submitting ? 'Đang gửi...' : 'Gửi Yêu Cầu Báo Nghỉ'}
                  </button>
                </form>
              )}
            </div>

            {/* Danh sách Đơn Xin Nghỉ (Col 2 & 3) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Đơn nghỉ của Gia sư */}
              <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <h3 className="text-base font-bold text-[#566a7f] flex items-center gap-2">
                    <Calendar className="text-[#ffab00]" size={18} /> Đơn xin nghỉ của Gia sư
                  </h3>
                  <button
                    onClick={fetchLeavesAndClasses}
                    className="p-1.5 bg-[#f5f5f9] hover:bg-gray-200 text-[#697a8d] rounded-lg cursor-pointer transition-colors"
                    title="Làm mới"
                  >
                    <RefreshCw size={13} />
                  </button>
                </div>

                {tutorLeaves.length === 0 ? (
                  <div className="text-center py-6 text-[#a1acb8] text-xs">Không có đơn xin nghỉ dạy nào.</div>
                ) : (
                  <div className="space-y-3 max-h-[30vh] overflow-y-auto pr-1">
                    {tutorLeaves.map((leave) => (
                      <div
                        key={leave.id}
                        className="p-4 bg-[#f9f9fa] border border-gray-100 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-3 hover:border-[#696cff]/40 transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-[#566a7f] text-xs">Gia sư: {leave.tutor?.fullName}</h4>
                            {leave.isLateLeave && (
                              <span className="px-1.5 py-0.5 text-[10px] bg-[#ffe0db] text-[#ff3e1d] font-bold rounded">
                                Báo trễ (&lt;24h)
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#697a8d] mt-1">
                            Lý do: "{leave.reason}" | Đề xuất bù:{' '}
                            <strong className="text-[#696cff]">
                              {new Date(leave.rescheduleSuggested).toLocaleString('vi-VN')}
                            </strong>
                          </p>
                          <div className="mt-1 text-xs text-[#a1acb8]">
                            Trạng thái:{' '}
                            <strong
                              className={leave.status === 'APPROVED' ? 'text-[#71dd37]' : 'text-[#ffab00]'}
                            >
                              {leave.status === 'APPROVED' ? 'Đã duyệt' : 'Chờ duyệt'}
                            </strong>
                          </div>
                        </div>

                        {leave.status === 'PENDING' && isParentRole && (
                          <button
                            onClick={() => handleApproveLeave(leave.id, 'TUTOR')}
                            className="px-3.5 py-1.5 bg-[#71dd37] hover:bg-[#65c731] text-white text-xs font-bold rounded-lg cursor-pointer transition-all shadow-sm"
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
              <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-[#566a7f] flex items-center gap-2 pb-2 border-b border-gray-100">
                  <Calendar className="text-[#03c3ec]" size={18} /> Đơn xin nghỉ của Học sinh
                </h3>

                {studentLeaves.length === 0 ? (
                  <div className="text-center py-6 text-[#a1acb8] text-xs">Không có đơn xin nghỉ học nào.</div>
                ) : (
                  <div className="space-y-3 max-h-[30vh] overflow-y-auto pr-1">
                    {studentLeaves.map((leave) => (
                      <div
                        key={leave.id}
                        className="p-4 bg-[#f9f9fa] border border-gray-100 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-3 hover:border-[#696cff]/40 transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-[#566a7f] text-xs">Học sinh: {leave.student?.fullName}</h4>
                            {leave.isLateLeave && (
                              <span className="px-1.5 py-0.5 text-[10px] bg-[#ffe0db] text-[#ff3e1d] font-bold rounded">
                                Báo trễ (&lt;4h)
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#697a8d] mt-1">
                            Lý do: "{leave.reason}" | Đề xuất bù:{' '}
                            <strong className="text-[#696cff]">
                              {new Date(leave.rescheduledTo).toLocaleString('vi-VN')}
                            </strong>
                          </p>
                          <div className="mt-1 text-xs text-[#a1acb8]">
                            Trạng thái:{' '}
                            <strong
                              className={leave.status === 'APPROVED' ? 'text-[#71dd37]' : 'text-[#ffab00]'}
                            >
                              {leave.status === 'APPROVED' ? 'Đã duyệt' : 'Chờ duyệt'}
                            </strong>
                          </div>
                        </div>

                        {leave.status === 'PENDING' && isTutorRole && (
                          <button
                            onClick={() => handleApproveLeave(leave.id, 'STUDENT')}
                            className="px-3.5 py-1.5 bg-[#696cff] hover:bg-[#5f61e6] text-white text-xs font-bold rounded-lg cursor-pointer transition-all shadow-sm"
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
          </div>
        )}
      </div>
    </PageTemplate>
  );
}
