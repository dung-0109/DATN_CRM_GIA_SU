import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { ArrowLeft, Loader, CheckCircle, Calendar, Plus, RefreshCw, AlertCircle, Clock } from 'lucide-react';
import PageTemplate from '../../components/PageTemplate';

export default function TutorAttendance() {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [sessions, setSessions] = useState<any[]>([]);

  const [sessionDate, setSessionDate] = useState(() => {
    const d = new Date();
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  });
  const [startTimeHM, setStartTimeHM] = useState('');
  const [endTimeHM, setEndTimeHM] = useState('');
  const [description, setDescription] = useState('');

  const [loading, setLoading] = useState(true);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/v1/classes');
      setClasses(res.data);
      if (res.data.length > 0) {
        setSelectedClassId(res.data[0].id);
      }
    } catch (err: any) {
      console.error('Lỗi tải danh sách lớp', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async (classId: string) => {
    if (!classId) return;
    setSessionLoading(true);
    try {
      const res = await api.get(`/api/v1/sessions?classId=${classId}`);
      setSessions(res.data);
    } catch (err) {
      console.error('Lỗi tải danh sách buổi học', err);
    } finally {
      setSessionLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      fetchSessions(selectedClassId);
    }
  }, [selectedClassId]);

  const handleDateChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 8);
    if (digits.length <= 2) return setSessionDate(digits);
    if (digits.length <= 4) return setSessionDate(`${digits.slice(0, 2)}/${digits.slice(2)}`);
    setSessionDate(`${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`);
  };

  const handleTimeChange = (raw: string, setter: (v: string) => void) => {
    const digits = raw.replace(/\D/g, '').slice(0, 4);
    if (digits.length <= 2) return setter(digits);
    setter(`${digits.slice(0, 2)}:${digits.slice(2)}`);
  };

  const parseDateTime = (): { start: Date; end: Date } | { error: string } => {
    const dm = sessionDate.split('/');
    const t1 = startTimeHM.split(':');
    const t2 = endTimeHM.split(':');
    if (dm.length !== 3 || t1.length !== 2 || t2.length !== 2) {
      return { error: 'Vui lòng nhập đủ Ngày dạy (dd/mm/yyyy), Giờ bắt đầu và Giờ kết thúc (HH:MM).' };
    }
    const day = Number(dm[0]);
    const month = Number(dm[1]);
    const year = Number(dm[2]);
    const sh = Number(t1[0]);
    const sm = Number(t1[1]);
    const eh = Number(t2[0]);
    const em = Number(t2[1]);
    if (
      !day || !month || !year || month < 1 || month > 12 ||
      day < 1 || day > 31 || year < 2000 || year > 2100 ||
      isNaN(sh) || isNaN(sm) || isNaN(eh) || isNaN(em) ||
      sh > 23 || sm > 59 || eh > 23 || em > 59
    ) {
      return { error: 'Ngày hoặc giờ không hợp lệ. Ví dụ: 24/08/2026, 19:00.' };
    }
    const start = new Date(year, month - 1, day, sh, sm);
    const end = new Date(year, month - 1, day, eh, em);
    if (start.getDate() !== day || start.getMonth() !== month - 1) {
      return { error: 'Ngày không tồn tại. Vui lòng kiểm tra lại.' };
    }
    if (end <= start) {
      return { error: 'Giờ kết thúc phải sau giờ bắt đầu.' };
    }
    return { start, end };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassId) return;

    setError(null);
    setSuccess(null);

    const parsed = parseDateTime();
    if ('error' in parsed) {
      setError(parsed.error);
      return;
    }

    setSubmitting(true);

    try {
      await api.post('/api/v1/sessions/attendance', {
        classId: selectedClassId,
        startTime: parsed.start.toISOString(),
        endTime: parsed.end.toISOString(),
        description,
      });

      setSuccess('Ghi nhận điểm danh buổi học thành công! Chờ Phụ huynh phê duyệt.');
      setStartTimeHM('');
      setEndTimeHM('');
      setDescription('');
      fetchSessions(selectedClassId);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Điểm danh thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageTemplate
      title="Điểm Danh Buổi Học"
      subtitle="Ghi nhận giờ dạy, nội dung bài giảng để gửi Phụ huynh đối soát"
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
            Đang tải danh sách lớp học...
          </div>
        ) : classes.length === 0 ? (
          <div className="bg-[#f9f9fa] border border-dashed border-gray-200 rounded-xl p-16 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 text-[#a1acb8]">
              <Calendar size={36} />
            </div>
            <h3 className="text-lg font-bold text-[#566a7f] mb-2">Chưa có lớp học nào</h3>
            <p className="text-[#a1acb8] text-sm max-w-sm mb-6">
              Bạn cần được phân công ít nhất một lớp học đang giảng dạy để có thể thực hiện điểm danh.
            </p>
            <Link
              to="/tutor/jobs"
              className="px-5 py-2.5 bg-[#696cff] hover:bg-[#5f61e6] text-white font-bold rounded-lg transition-all text-xs shadow-sm"
            >
              Tìm lớp học ngay
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form điểm danh (Col 1) */}
            <div className="lg:col-span-1 bg-white border border-gray-100 rounded-xl p-6 shadow-sm space-y-4 h-fit">
              <h3 className="text-base font-bold text-[#566a7f] flex items-center gap-2 pb-2 border-b border-gray-100">
                <Plus className="text-[#696cff]" size={18} /> Tạo buổi điểm danh
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

              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#566a7f] mb-1">Chọn Lớp học</label>
                  <select
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#f5f5f9] border border-[#d9dee3] rounded-lg text-xs text-[#566a7f] focus:outline-none focus:border-[#696cff] cursor-pointer"
                  >
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.student?.fullName || 'Học viên'} (Mã: {cls.id.slice(0, 6)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#566a7f] mb-1">Ngày dạy (dd/mm/yyyy)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="dd/mm/yyyy"
                    value={sessionDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="w-full px-3 py-2 bg-[#f5f5f9] border border-[#d9dee3] rounded-lg text-xs text-[#566a7f] focus:outline-none focus:border-[#696cff]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#566a7f] mb-1">Giờ bắt đầu</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="19:00"
                      value={startTimeHM}
                      onChange={(e) => handleTimeChange(e.target.value, setStartTimeHM)}
                      className="w-full px-3 py-2 bg-[#f5f5f9] border border-[#d9dee3] rounded-lg text-xs text-[#566a7f] focus:outline-none focus:border-[#696cff]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#566a7f] mb-1">Giờ kết thúc</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="21:00"
                      value={endTimeHM}
                      onChange={(e) => handleTimeChange(e.target.value, setEndTimeHM)}
                      className="w-full px-3 py-2 bg-[#f5f5f9] border border-[#d9dee3] rounded-lg text-xs text-[#566a7f] focus:outline-none focus:border-[#696cff]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#566a7f] mb-1">Nội dung bài học / Ghi chú</label>
                  <textarea
                    rows={3}
                    placeholder="Ghi nhận bài học hôm nay..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-[#f5f5f9] border border-[#d9dee3] rounded-lg text-xs text-[#566a7f] focus:outline-none focus:border-[#696cff] resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 bg-[#696cff] hover:bg-[#5f61e6] active:bg-[#595cd9] disabled:opacity-50 text-white font-bold rounded-lg transition-all text-xs cursor-pointer shadow-[0_2px_4px_0_rgba(105,108,255,0.4)]"
                >
                  {submitting ? 'Đang gửi...' : 'Ghi Điểm Danh'}
                </button>
              </form>
            </div>

            {/* Danh sách buổi dạy (Col 2 & 3) */}
            <div className="lg:col-span-2 bg-white border border-gray-100 rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <h3 className="text-base font-bold text-[#566a7f] flex items-center gap-2">
                  <Calendar className="text-[#696cff]" size={18} /> Lịch sử điểm danh buổi học
                </h3>
                <button
                  onClick={() => fetchSessions(selectedClassId)}
                  className="p-1.5 bg-[#f5f5f9] hover:bg-gray-200 text-[#697a8d] rounded-lg transition-colors cursor-pointer"
                  title="Làm mới"
                >
                  <RefreshCw size={14} />
                </button>
              </div>

              {sessionLoading ? (
                <div className="text-center py-12 text-[#a1acb8] text-sm">Đang tải lịch sử học...</div>
              ) : sessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 bg-[#f9f9fa] border border-dashed border-gray-200 rounded-xl text-center">
                  <div className="text-gray-300 mb-3">
                    <Clock size={48} strokeWidth={1.5} />
                  </div>
                  <h4 className="text-[#566a7f] font-bold mb-1">Chưa có dữ liệu</h4>
                  <p className="text-xs text-[#a1acb8]">
                    Lớp này chưa có buổi học nào được ghi nhận. Hãy tạo điểm danh ở form bên trái.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                  {sessions.map((ses) => (
                    <div
                      key={ses.id}
                      className="p-4 bg-[#f9f9fa] border border-gray-100 rounded-xl flex justify-between items-center gap-4 hover:border-[#696cff]/40 transition-colors"
                    >
                      <div>
                        <h4 className="font-bold text-[#566a7f] text-xs">
                          {new Date(ses.startTime).toLocaleString('vi-VN')} - {new Date(ses.endTime).toLocaleTimeString('vi-VN')}
                        </h4>
                        <p className="text-xs text-[#697a8d] mt-1 italic">
                          "{ses.description || 'Không có ghi chú'}"
                        </p>
                      </div>
                      <div>
                        <span
                          className={`px-2.5 py-1 text-xs font-bold rounded-md flex items-center gap-1 ${
                            ses.status === 'CONFIRMED'
                              ? 'bg-[#e8fadf] text-[#71dd37]'
                              : ses.status === 'DISPUTED'
                              ? 'bg-[#ffe0db] text-[#ff3e1d]'
                              : 'bg-[#fff8e1] text-[#ffab00]'
                          }`}
                        >
                          {ses.status === 'CONFIRMED' ? (
                            <>
                              <CheckCircle size={12} /> Đã Duyệt
                            </>
                          ) : ses.status === 'DISPUTED' ? (
                            <>
                              <AlertCircle size={12} /> Khiếu Nại
                            </>
                          ) : (
                            <>
                              <Clock size={12} /> Chờ Duyệt
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </PageTemplate>
  );
}
