import { useState, useEffect } from 'react';
import api from '../../services/api';
import { ShieldAlert, CheckCircle, XCircle, RefreshCw, Calendar, User, Clock, AlertCircle, Shield, Phone, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AcademicDisputes() {
  const [activeTab, setActiveTab] = useState<'DISPUTES' | 'WARRANTY'>('DISPUTES');
  const [disputes, setDisputes] = useState<any[]>([]);
  const [warranties, setWarranties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dispRes, warRes] = await Promise.all([
        api.get('/api/v1/sessions/disputes'),
        api.get('/api/v1/finance/warranty-requests'),
      ]);
      setDisputes(dispRes.data || []);
      setWarranties(warRes.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải danh sách khiếu nại & bảo hành');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleResolve = async (disputeId: string, outcome: 'RESOLVED_CONFIRM' | 'RESOLVED_CANCEL') => {
    setResolvingId(disputeId);
    try {
      const res = await api.post(`/api/v1/sessions/disputes/${disputeId}/resolve`, {
        outcome,
        note: `Học vụ xử lý tranh chấp: Chốt ${outcome === 'RESOLVED_CONFIRM' ? 'Buổi học hợp lệ' : 'Huỷ buổi học'}`,
      });
      toast.success(res.data.message);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Xử lý khiếu nại thất bại');
    } finally {
      setResolvingId(null);
    }
  };

  const handleResolveWarranty = async (classId: string, action: 'REPLACE_TUTOR' | 'DISMISS') => {
    setResolvingId(classId);
    try {
      const note = action === 'REPLACE_TUTOR'
        ? 'Học vụ phê duyệt đổi gia sư mới, bảo lưu toàn bộ số buổi học còn lại'
        : 'Học vụ đã liên hệ tư vấn và phụ huynh đồng ý tiếp tục học cùng gia sư hiện tại';

      const res = await api.post(`/api/v1/finance/class/${classId}/resolve-warranty`, {
        action,
        note,
      });
      toast.success(res.data.message);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Xử lý bảo hành thất bại');
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <div className="w-full space-y-6 animate-fadeIn font-sans text-[#566a7f]">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-[#566a7f]">Trung Tâm Khiếu Nại & Bảo Hành Học Vụ</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#ffe0db] text-[#ff3e1d]">
              {disputes.length + warranties.length} hồ sơ
            </span>
          </div>
          <p className="text-sm text-[#a1acb8] mt-1">
            Đối soát tranh chấp buổi dạy & xử lý yêu cầu đổi gia sư theo chính sách bảo hành 30 ngày
          </p>
        </div>

        <button
          onClick={fetchData}
          disabled={loading}
          className="px-4 py-2 bg-white border border-gray-200 text-[#697a8d] hover:text-[#696cff] hover:border-[#696cff] text-sm font-semibold rounded-md shadow-sm transition-all cursor-pointer flex items-center gap-2"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          <span>Làm mới</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-3">
        <button
          onClick={() => setActiveTab('DISPUTES')}
          className={`pb-3 px-3 text-xs font-bold transition-all relative flex items-center gap-2 cursor-pointer ${
            activeTab === 'DISPUTES'
              ? 'text-[#696cff] border-b-2 border-[#696cff]'
              : 'text-[#697a8d] hover:text-[#566a7f]'
          }`}
        >
          <ShieldAlert size={16} /> Khiếu Nại Buổi Học ({disputes.length})
        </button>
        <button
          onClick={() => setActiveTab('WARRANTY')}
          className={`pb-3 px-3 text-xs font-bold transition-all relative flex items-center gap-2 cursor-pointer ${
            activeTab === 'WARRANTY'
              ? 'text-[#ff3e1d] border-b-2 border-[#ff3e1d]'
              : 'text-[#697a8d] hover:text-[#566a7f]'
          }`}
        >
          <Shield size={16} /> Yêu Cầu Bảo Hành Đổi Gia Sư 30 Ngày ({warranties.length})
          {warranties.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-[#ff3e1d] animate-pulse"></span>
          )}
        </button>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-xl shadow-sm border border-[rgba(67,89,113,0.08)] p-6 space-y-6">
        {loading ? (
          <div className="text-center py-16 space-y-3">
            <RefreshCw size={32} className="animate-spin text-[#696cff] mx-auto" />
            <p className="text-[#a1acb8] text-sm">Đang tải danh sách hồ sơ khiếu nại & bảo hành...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-[#ffe0db] border border-[#ff3e1d]/40 rounded-lg text-center text-[#ff3e1d] text-sm flex items-center justify-center gap-2">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        ) : activeTab === 'DISPUTES' ? (
          /* TAB 1: KHIẾU NẠI BUỔI HỌC */
          disputes.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#e8fadf] text-[#71dd37] flex items-center justify-center">
                <CheckCircle size={32} />
              </div>
              <h4 className="text-lg font-bold text-[#566a7f]">Không có khiếu nại nào tồn đọng!</h4>
              <p className="text-sm text-[#a1acb8] max-w-md mx-auto">
                Tất cả các buổi học đều diễn ra thuận lợi hoặc các tranh chấp trước đó đã được nhân viên học vụ xử lý hoàn tất.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {disputes.map((dis) => (
                <div
                  key={dis.id}
                  className="bg-[#f9f9fa] border border-gray-200/80 rounded-xl p-5 hover:border-[#696cff]/40 transition-colors shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-gray-200 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-[#ffe0db] text-[#ff3e1d]">
                        MÃ: {dis.id.slice(0, 8).toUpperCase()}
                      </span>
                      <span className="text-sm font-bold text-[#566a7f]">
                        Lớp: {dis.session?.class?.student?.fullName || 'Học sinh'}
                      </span>
                    </div>
                    <span className="text-xs text-[#a1acb8] flex items-center gap-1">
                      <Clock size={12} />
                      Gửi: {new Date(dis.createdAt).toLocaleString('vi-VN')}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-[0_2px_4px_0_rgba(67,89,113,0.02)] space-y-1.5 transition-all hover:border-[#696cff]/30">
                      <span className="text-[#a1acb8] font-semibold flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                        <User size={12} /> Gia sư phụ trách
                      </span>
                      <div className="font-extrabold text-[#696cff] text-sm">
                        {dis.session?.class?.tutor?.fullName || 'Chưa rõ'}
                      </div>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-[0_2px_4px_0_rgba(67,89,113,0.02)] space-y-1.5 transition-all hover:border-[#ffab00]/30">
                      <span className="text-[#a1acb8] font-semibold flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                        <User size={12} /> Người gửi (Phụ huynh)
                      </span>
                      <div className="font-extrabold text-[#566a7f] text-sm">
                        {dis.parent?.fullName || 'Ẩn danh'}
                      </div>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-[0_2px_4px_0_rgba(67,89,113,0.02)] space-y-1.5 transition-all hover:border-[#71dd37]/30">
                      <span className="text-[#a1acb8] font-semibold flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                        <Calendar size={12} /> Thời gian buổi dạy
                      </span>
                      <div className="font-bold text-[#566a7f] text-sm">
                        {new Date(dis.session?.startTime || dis.scheduledTime).toLocaleString('vi-VN')}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-[#fff2ec] border border-[#ffbca9] rounded-xl relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 text-[#ff3e1d]/5">
                      <AlertCircle size={80} />
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-[#ff8359] uppercase tracking-wider mb-2 relative z-10">
                      <ShieldAlert size={16} /> Lý do khiếu nại từ Phụ huynh:
                    </div>
                    <p className="text-sm text-[#697a8d] italic leading-relaxed relative z-10 font-medium">
                      "{dis.reason}"
                    </p>
                  </div>

                  <div className="flex flex-wrap justify-end gap-3 pt-2">
                    <button
                      disabled={resolvingId !== null}
                      onClick={() => handleResolve(dis.id, 'RESOLVED_CANCEL')}
                      className="px-4 py-2 bg-[#ff3e1d] hover:bg-[#e6381a] active:bg-[#d63317] disabled:opacity-50 text-white text-xs font-bold rounded-md shadow-[0_2px_4px_0_rgba(255,62,29,0.3)] transition-all cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <XCircle size={14} />
                      <span>Hủy buổi dạy (Hoàn tiền PH)</span>
                    </button>
                    <button
                      disabled={resolvingId !== null}
                      onClick={() => handleResolve(dis.id, 'RESOLVED_CONFIRM')}
                      className="px-4 py-2 bg-[#71dd37] hover:bg-[#65c731] active:bg-[#5bb32c] disabled:opacity-50 text-white text-xs font-bold rounded-md shadow-[0_2px_4px_0_rgba(113,221,55,0.3)] transition-all cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <CheckCircle size={14} />
                      <span>Phê duyệt hợp lệ (Trả lương GS)</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* TAB 2: YÊU CẦU BẢO HÀNH ĐỔI GIA SƯ 30 NGÀY */
          warranties.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#e8fadf] text-[#71dd37] flex items-center justify-center">
                <Shield size={32} />
              </div>
              <h4 className="text-lg font-bold text-[#566a7f]">Không có yêu cầu bảo hành đổi gia sư nào!</h4>
              <p className="text-sm text-[#a1acb8] max-w-md mx-auto">
                Chính sách bảo hành 30 ngày đang hoạt động hiệu quả. Tất cả các gia đình đều hài lòng với gia sư hiện tại.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {warranties.map((war) => (
                <div
                  key={war.id}
                  className="bg-[#f9f9fa] border border-gray-200/80 rounded-xl p-5 hover:border-[#ff3e1d]/40 transition-colors shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-gray-200 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#ffe0db] text-[#ff3e1d] flex items-center justify-center">
                        <Shield size={18} />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-[#566a7f]">
                          Yêu cầu đổi gia sư: {war.student?.fullName} ({war.tutorRequest?.subject || 'Lớp học'})
                        </div>
                        <div className="text-xs text-[#a1acb8]">Mã lớp: #{war.id.slice(0, 8)}</div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-[#ffe0db] text-[#ff3e1d] uppercase tracking-wide">
                      Chờ phòng học vụ giải quyết
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 bg-white rounded-lg border border-gray-100 space-y-1">
                      <div className="text-[#a1acb8] font-bold uppercase text-[10px]">Phụ huynh yêu cầu</div>
                      <div className="font-bold text-[#566a7f] text-sm">{war.parent?.fullName}</div>
                      <div className="text-[#697a8d] flex items-center gap-1 font-mono">
                        <Phone size={12} /> {war.parent?.user?.phone || 'Liên hệ Zalo/SĐT'}
                      </div>
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-gray-100 space-y-1">
                      <div className="text-[#a1acb8] font-bold uppercase text-[10px]">Gia sư bị đề xuất đổi</div>
                      <div className="font-bold text-[#566a7f] text-sm">{war.tutor?.fullName || 'Chưa rõ'}</div>
                      <div className="text-[#697a8d] flex items-center gap-1 font-mono">
                        <Phone size={12} /> {war.tutor?.user?.phone || 'Chưa cập nhật'}
                      </div>
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-gray-100 space-y-1">
                      <div className="text-[#a1acb8] font-bold uppercase text-[10px]">Số buổi bảo lưu</div>
                      <div className="font-extrabold text-[#696cff] text-base">{war.remainingSessions ?? 8} buổi</div>
                      <div className="text-[11px] text-[#71dd37] font-semibold">Chuyển sang gia sư mới 100%</div>
                    </div>
                  </div>

                  <div className="p-3.5 bg-[#fff8e1] border border-[#ffecb3] rounded-lg text-xs space-y-1">
                    <div className="font-bold text-[#ffab00]">Chi tiết yêu cầu & lý do của phụ huynh:</div>
                    <div className="text-[#566a7f] font-medium leading-relaxed">{war.cancelReason}</div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-end gap-2 pt-1 border-t border-gray-200">
                    <button
                      onClick={() => handleResolveWarranty(war.id, 'DISMISS')}
                      disabled={resolvingId === war.id}
                      className="px-4 py-2 bg-white border border-gray-300 text-[#566a7f] hover:bg-gray-100 text-xs font-bold rounded-lg transition-all cursor-pointer"
                    >
                      🤝 Đã Hòa Giải / Giữ Lại Gia Sư
                    </button>
                    <button
                      onClick={() => handleResolveWarranty(war.id, 'REPLACE_TUTOR')}
                      disabled={resolvingId === war.id}
                      className="px-4 py-2 bg-[#ff3e1d] hover:bg-[#d63317] text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle size={15} /> Duyệt Đổi Gia Sư (Mở Lại Tuyển Mới)
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}

