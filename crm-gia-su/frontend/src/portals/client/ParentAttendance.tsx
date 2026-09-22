import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { ArrowLeft, Loader, CheckCircle2, AlertTriangle, Calendar, ShieldAlert, Key } from 'lucide-react';

export default function ParentAttendance() {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [sessions, setSessions] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [sessionLoading, setSessionLoading] = useState(false);

  // States cho modal PIN
  const [confirmingSession, setConfirmingSession] = useState<any | null>(null);
  const [pin, setPin] = useState('');
  const [submittingConfirm, setSubmittingConfirm] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  // States cho modal Dispute
  const [disputingSession, setDisputingSession] = useState<any | null>(null);
  const [reason, setReason] = useState('');
  const [submittingDispute, setSubmittingDispute] = useState(false);
  const [disputeError, setDisputeError] = useState<string | null>(null);

  const navigate = useNavigate();

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/v1/classes');
      setClasses(res.data);
      if (res.data.length > 0) {
        setSelectedClassId(res.data[0].id);
      }
    } catch (err) {
      console.error('Lỗi tải danh sách lớp học', err);
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

  const handleOpenConfirm = (session: any) => {
    setConfirmingSession(session);
    setPin('');
    setConfirmError(null);
  };

  const handleConfirmSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmingSession) return;

    setSubmittingConfirm(true);
    setConfirmError(null);

    try {
      const res = await api.post(`/api/v1/sessions/${confirmingSession.id}/resolve`, {
        action: 'CONFIRM',
        pin,
      });

      alert(res.data.message);
      setConfirmingSession(null);
      fetchSessions(selectedClassId);
    } catch (err: any) {
      setConfirmError(err.response?.data?.message || 'Xác nhận mã PIN thất bại');
    } finally {
      setSubmittingConfirm(false);
    }
  };

  const handleOpenDispute = (session: any) => {
    setDisputingSession(session);
    setReason('');
    setDisputeError(null);
  };

  const handleDisputeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputingSession) return;

    setSubmittingDispute(true);
    setDisputeError(null);

    try {
      const res = await api.post(`/api/v1/sessions/${disputingSession.id}/resolve`, {
        action: 'DISPUTE',
        reason,
      });

      alert(res.data.message);
      setDisputingSession(null);
      fetchSessions(selectedClassId);
    } catch (err: any) {
      setDisputeError(err.response?.data?.message || 'Gửi khiếu nại thất bại');
    } finally {
      setSubmittingDispute(false);
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
          Duyệt Điểm Danh
        </span>
      </header>

      <main className="flex-1 relative z-10 max-w-4xl mx-auto w-full py-12">
        {loading ? (
          <div className="text-center py-12">
            <Loader size={36} className="animate-spin text-cyan-550 mx-auto" />
            <p className="mt-4 text-slate-400">Đang tải danh sách lớp học của các con...</p>
          </div>
        ) : classes.length === 0 ? (
          <div className="p-12 bg-slate-900/40 border border-slate-800 rounded-3xl text-center text-slate-500">
            Hiện tại các con chưa có lớp học nào đang hoạt động.
          </div>
        ) : (
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl shadow-2xl space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Calendar className="text-cyan-400" /> Quản lý duyệt buổi học
              </h2>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-white text-xs cursor-pointer focus:outline-none focus:border-cyan-550"
              >
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id} className="bg-slate-900">
                    Học sinh: {cls.student?.fullName || 'Học viên'} (Gia sư: {cls.tutor?.fullName || 'Chưa rõ'})
                  </option>
                ))}
              </select>
            </div>

            {/* Danh sách các buổi */}
            {sessionLoading ? (
              <div className="text-center py-12 text-slate-500 text-xs">Đang tải danh sách buổi học...</div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                Chưa có buổi học nào được ghi nhận cho lớp này.
              </div>
            ) : (
              <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                {sessions.map((ses) => (
                  <div
                    key={ses.id}
                    className="p-5 bg-slate-950/60 border border-slate-850 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                  >
                    <div>
                      <h4 className="font-bold text-white text-xs">
                        {new Date(ses.startTime).toLocaleString()} - {new Date(ses.endTime).toLocaleTimeString()}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Nội dung bài học: <strong className="text-slate-350 font-normal">"{ses.description}"</strong>
                      </p>
                      <div className="mt-2">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                            ses.status === 'CONFIRMED'
                              ? 'bg-emerald-950 border border-emerald-800 text-emerald-450'
                              : ses.status === 'DISPUTED'
                              ? 'bg-red-950 border border-red-800 text-red-450'
                              : 'bg-amber-950 border border-amber-800 text-amber-450'
                          }`}
                        >
                          {ses.status === 'CONFIRMED' ? 'Đã duyệt & Đối soát xong' : ses.status === 'DISPUTED' ? 'Tranh chấp / Khiếu nại' : 'Chờ Phụ huynh duyệt'}
                        </span>
                      </div>
                    </div>

                    {ses.status === 'ATTENDED' && (
                      <div className="flex gap-2 w-full md:w-auto">
                        <button
                          onClick={() => handleOpenDispute(ses)}
                          className="flex-1 md:flex-none px-3.5 py-1.5 bg-red-650 hover:bg-red-550 active:bg-red-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-all inline-flex items-center justify-center gap-1"
                        >
                          Khiếu nại <AlertTriangle size={12} />
                        </button>
                        <button
                          onClick={() => handleOpenConfirm(ses)}
                          className="flex-1 md:flex-none px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 text-xs font-extrabold rounded-lg cursor-pointer transition-all inline-flex items-center justify-center gap-1"
                        >
                          Phê duyệt <CheckCircle2 size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal nhập mã PIN để xác nhận (Netflix PIN Switcher Style) */}
      {confirmingSession && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 text-left shadow-2xl relative">
            <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
              <Key className="text-emerald-450 animate-pulse" size={20} /> Xác thực Phê Duyệt
            </h3>
            <p className="text-slate-400 text-xs mb-6 leading-relaxed">
              Bạn đang duyệt buổi học giá <strong className="text-white">{(confirmingSession.class ? parseInt(confirmingSession.class.hourlyRate).toLocaleString() : '---')}đ</strong>. Hãy nhập mã PIN Phụ huynh để ký duyệt đối soát.
            </p>

            {confirmError && (
              <div className="mb-4 p-3 bg-red-950/40 border border-red-800/40 rounded-xl text-xs text-red-400">
                {confirmError}
              </div>
            )}

            <form onSubmit={handleConfirmSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">Mã PIN bảo mật (4 chữ số)</label>
                <input
                  type="password"
                  maxLength={4}
                  required
                  placeholder="• • • •"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center tracking-[1.5em] px-4 py-3 bg-slate-950 border border-slate-850 rounded-xl text-white font-extrabold focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setConfirmingSession(null)}
                  className="flex-1 py-2 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-xl text-xs cursor-pointer"
                >
                  Huỷ bỏ
                </button>
                <button
                  type="submit"
                  disabled={submittingConfirm}
                  className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs cursor-pointer"
                >
                  {submittingConfirm ? 'Đang duyệt...' : 'Xác nhận ký'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal gửi khiếu nại (Dispute) */}
      {disputingSession && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 text-left shadow-2xl relative">
            <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
              <ShieldAlert className="text-red-400" size={20} /> Khiếu nại Buổi học
            </h3>
            <p className="text-slate-400 text-xs mb-6">
              Vui lòng nêu rõ lý do bạn khiếu nại buổi học này để học vụ tiến hành điều tra đối soát.
            </p>

            {disputeError && (
              <div className="mb-4 p-3 bg-red-950/40 border border-red-800/40 rounded-xl text-xs text-red-400">
                {disputeError}
              </div>
            )}

            <form onSubmit={handleDisputeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">Lý do khiếu nại</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Gia sư nghỉ dạy đột xuất không báo trước / Gia sư đi trễ 30 phút..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-850 rounded-xl text-white text-xs placeholder-slate-600 focus:outline-none focus:border-red-500 transition-all resize-none"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setDisputingSession(null)}
                  className="flex-1 py-2 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-xl text-xs cursor-pointer"
                >
                  Huỷ bỏ
                </button>
                <button
                  type="submit"
                  disabled={submittingDispute}
                  className="flex-1 py-2 bg-red-650 hover:bg-red-550 text-white font-bold rounded-xl text-xs cursor-pointer"
                >
                  {submittingDispute ? 'Đang gửi...' : 'Gửi yêu cầu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
