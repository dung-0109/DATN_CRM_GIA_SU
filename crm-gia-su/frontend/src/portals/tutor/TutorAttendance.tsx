import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { ArrowLeft, Loader, CheckCircle, Calendar, Plus, RefreshCw, AlertCircle } from 'lucide-react';

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

  const navigate = useNavigate();

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

  // Tự định dạng dd/mm/yyyy khi gõ số (24082026 -> 24/08/2026)
  const handleDateChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 8);
    if (digits.length <= 2) return setSessionDate(digits);
    if (digits.length <= 4) return setSessionDate(`${digits.slice(0, 2)}/${digits.slice(2)}`);
    setSessionDate(`${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`);
  };

  // Tự định dạng HH:MM khi gõ số
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
      return { error: 'Ngày không tồn tại (ví dụ 31/02). Vui lòng kiểm tra lại.' };
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
    <div className="w-full min-h-screen bg-slate-950 text-white p-6 relative overflow-hidden flex flex-col">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-amber-600/5 blur-[120px]" />

      <header className="flex justify-between items-center pb-6 border-b border-amber-900/30 relative z-10 max-w-5xl mx-auto w-full">
        <button
          onClick={() => navigate('/tutor')}
          className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} /> Quay lại Tutor Portal
        </button>
        <span className="text-sm font-semibold px-3 py-1 rounded-full bg-amber-950/40 border border-amber-900/50 text-amber-400">
          Điểm Danh Buổi Học
        </span>
      </header>

      <main className="flex-1 relative z-10 max-w-5xl mx-auto w-full py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-3 text-center py-12">
            <Loader size={36} className="animate-spin text-amber-500 mx-auto" />
            <p className="mt-4 text-slate-400">Đang tải danh sách lớp học của bạn...</p>
          </div>
        ) : classes.length === 0 ? (
          <div className="col-span-3 p-12 bg-slate-900/40 border border-slate-800 rounded-3xl text-center text-slate-500">
            Bạn chưa có lớp học nào được phân công.
          </div>
        ) : (
          <>
            {/* Form điểm danh (Col 1) */}
            <div className="lg:col-span-1 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-md h-fit">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Plus className="text-amber-500" size={20} /> Tạo buổi điểm danh
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

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-350 mb-1.5">Chọn Lớp học</label>
                  <select
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-white text-xs cursor-pointer focus:outline-none focus:border-amber-500"
                  >
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id} className="bg-slate-900">
                        {cls.student?.fullName || 'Học viên'} (ID: {cls.id.slice(0, 8)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-355 mb-1.5">Ngày dạy</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="dd/mm/yyyy"
                    value={sessionDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-355 mb-1.5">Giờ bắt đầu</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="HH:MM"
                      value={startTimeHM}
                      onChange={(e) => handleTimeChange(e.target.value, setStartTimeHM)}
                      className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-355 mb-1.5">Giờ kết thúc</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="HH:MM"
                      value={endTimeHM}
                      onChange={(e) => handleTimeChange(e.target.value, setEndTimeHM)}
                      className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-355 mb-1.5">Nội dung bài học / Ghi chú</label>
                  <textarea
                    rows={3}
                    placeholder="Ghi nhận bài học hôm nay..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-white text-xs resize-none focus:outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 disabled:bg-amber-700 text-slate-950 font-bold rounded-xl transition-all text-xs cursor-pointer"
                >
                  {submitting ? 'Đang gửi...' : 'Ghi điểm danh'}
                </button>
              </form>
            </div>

            {/* Danh sách buổi dạy (Col 2 & 3) */}
            <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-md">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Calendar className="text-amber-500" size={20} /> Lịch sử điểm danh buổi học
                </h3>
                <button
                  onClick={() => fetchSessions(selectedClassId)}
                  className="p-1.5 bg-slate-950 border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer"
                >
                  <RefreshCw size={14} />
                </button>
              </div>

              {sessionLoading ? (
                <div className="text-center py-8">
                  <Loader size={24} className="animate-spin text-amber-500 mx-auto" />
                  <p className="mt-2 text-slate-500 text-xs">Đang tải lịch sử học...</p>
                </div>
              ) : sessions.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  Chưa có buổi học nào được ghi nhận cho lớp này.
                </div>
              ) : (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                  {sessions.map((ses) => (
                    <div
                      key={ses.id}
                      className="p-4 bg-slate-950/60 border border-slate-850 rounded-2xl flex justify-between items-center gap-4"
                    >
                      <div>
                        <h4 className="font-bold text-white text-xs">
                          {new Date(ses.startTime).toLocaleString()} - {new Date(ses.endTime).toLocaleTimeString()}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-1 italic">
                          "{ses.description}"
                        </p>
                      </div>
                      <div>
                        <span
                          className={`px-2.5 py-1 text-[10px] font-semibold rounded-full flex items-center gap-1 ${
                            ses.status === 'CONFIRMED'
                              ? 'bg-emerald-950 border border-emerald-800 text-emerald-400'
                              : ses.status === 'DISPUTED'
                              ? 'bg-red-950 border border-red-800 text-red-400'
                              : 'bg-amber-950 border border-amber-800 text-amber-400'
                          }`}
                        >
                          {ses.status === 'CONFIRMED' ? (
                            <>
                              <CheckCircle size={10} /> Đã Duyệt
                            </>
                          ) : ses.status === 'DISPUTED' ? (
                            <>
                              <AlertCircle size={10} /> Khiếu Nại
                            </>
                          ) : (
                            <>
                              <Loader size={10} className="animate-pulse" /> Chờ Duyệt
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
