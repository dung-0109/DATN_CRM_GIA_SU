import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { ArrowLeft, Loader, ShieldAlert, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

export default function AcademicDisputes() {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const navigate = useNavigate();

  const fetchDisputes = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/api/v1/disputes');
      setDisputes(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải danh sách khiếu nại');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  const handleResolve = async (disputeId: string, outcome: 'RESOLVED_CONFIRM' | 'RESOLVED_CANCEL') => {
    setResolvingId(disputeId);
    try {
      const res = await api.post(`/api/v1/disputes/${disputeId}/resolve`, {
        outcome,
        note: `Học vụ xử lý tranh chấp: Chốt ${outcome === 'RESOLVED_CONFIRM' ? 'Buổi học hợp lệ' : 'Huỷ buổi học'}`,
      });
      alert(res.data.message);
      fetchDisputes();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Xử lý khiếu nại thất bại');
    } finally {
      setResolvingId(null);
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
        <span className="text-sm font-semibold px-3 py-1 rounded-full bg-red-950 border border-red-850 text-red-400">
          Trung Tâm Khiếu Nại
        </span>
      </header>

      <main className="flex-1 relative z-10 max-w-4xl mx-auto w-full py-12">
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl shadow-2xl space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-extrabold flex items-center gap-2">
              <ShieldAlert className="text-red-400" /> Hồ sơ khiếu nại cần đối soát
            </h2>
            <button
              onClick={fetchDisputes}
              className="p-2 bg-slate-950 border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer"
            >
              <RefreshCw size={14} />
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <Loader size={36} className="animate-spin text-red-500 mx-auto" />
              <p className="mt-4 text-slate-450 text-sm">Đang tải danh sách hồ sơ khiếu nại...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-950/40 border border-red-800/40 rounded-xl text-center text-red-400 text-xs">
              {error}
            </div>
          ) : disputes.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm border border-dashed border-slate-800 rounded-2xl">
              Tuyệt vời! Hiện tại không có khiếu nại nào đang chờ đối soát.
            </div>
          ) : (
            <div className="space-y-6">
              {disputes.map((dis) => (
                <div
                  key={dis.id}
                  className="p-6 bg-slate-955 border border-slate-850 rounded-2xl space-y-4 shadow-md"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-b border-slate-800/50 pb-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-red-400 tracking-wider">Hồ sơ: {dis.id.slice(0, 8)}</span>
                      <h4 className="font-bold text-white text-xs mt-0.5">
                        Lớp học: {dis.session?.class?.student?.fullName} - Gia sư: {dis.session?.class?.tutor?.fullName}
                      </h4>
                    </div>
                    <span className="text-[10px] text-slate-500">
                      Gửi lúc: {new Date(dis.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-500 block">Thời gian buổi dạy bị khiếu nại:</span>
                      <strong className="text-white mt-1 block">
                        {new Date(dis.session?.startTime).toLocaleString()} - {new Date(dis.session?.endTime).toLocaleTimeString()}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Người gửi khiếu nại (Phụ huynh):</span>
                      <strong className="text-white mt-1 block">{dis.parent?.fullName}</strong>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Lý do từ Phụ huynh:</span>
                    <p className="text-xs text-red-300 italic mt-1.5 leading-relaxed">
                      "{dis.reason}"
                    </p>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      disabled={resolvingId !== null}
                      onClick={() => handleResolve(dis.id, 'RESOLVED_CANCEL')}
                      className="px-4 py-2 bg-red-650 hover:bg-red-550 active:bg-red-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-all inline-flex items-center gap-1.5"
                    >
                      <XCircle size={14} /> Hủy buổi dạy
                    </button>
                    <button
                      disabled={resolvingId !== null}
                      onClick={() => handleResolve(dis.id, 'RESOLVED_CONFIRM')}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-450 active:bg-emerald-600 text-slate-950 text-xs font-extrabold rounded-lg cursor-pointer transition-all inline-flex items-center gap-1.5"
                    >
                      <CheckCircle size={14} /> Phê duyệt dạy hợp lệ
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
