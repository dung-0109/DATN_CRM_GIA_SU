import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  BookOpen, User, Calendar, CheckCircle, ArrowLeft, Clock, 
  Sparkles, DollarSign, Phone, ShieldCheck, Loader, X, 
  ExternalLink, MessageSquare, AlertCircle 
} from 'lucide-react';
import api from '../../services/api';
import PageTemplate from '../../components/PageTemplate';
import toast from 'react-hot-toast';

export default function TutorClassDetails() {
  const { id } = useParams<{ id: string }>();
  const [classData, setClassData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [submittingDeposit, setSubmittingDeposit] = useState(false);

  const fetchClassDetails = async () => {
    try {
      const res = await api.get(`/api/v1/classes/${id}`);
      setClassData(res.data);
    } catch (err) {
      console.error('Lỗi khi tải thông tin chi tiết lớp', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchClassDetails();
  }, [id]);

  const handleDepositSubmit = async () => {
    if (!classData) return;
    setSubmittingDeposit(true);
    try {
      const res = await api.post('/api/v1/finance/deposit', {
        classId: classData.id,
        amount: 500000,
      });
      toast.success(res.data?.message || 'Nộp cọc thành công! Đã mở khóa thông tin liên hệ phụ huynh.');
      setShowDepositModal(false);
      await fetchClassDetails();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi khi xử lý nộp cọc');
    } finally {
      setSubmittingDeposit(false);
    }
  };

  if (loading) {
    return (
      <PageTemplate title="Chi tiết Lớp học" subtitle="Đang tải dữ liệu..." badge="Class Details">
        <div className="text-center py-16 text-[#a1acb8] text-sm flex flex-col items-center gap-3">
          <Loader size={28} className="animate-spin text-[#696cff]" />
          Đang tải chi tiết lớp học...
        </div>
      </PageTemplate>
    );
  }

  if (!classData) {
    return (
      <PageTemplate title="Chi tiết Lớp học" subtitle="Lỗi" badge="Class Details">
        <div className="text-center py-12 text-[#ff3e1d] text-sm">Không tìm thấy thông tin lớp học này.</div>
      </PageTemplate>
    );
  }

  const req = classData.tutorRequest;
  const student = classData.student;
  const parent = classData.parent;
  const parentPhone = parent?.user?.phone;
  const qrTransferContent = `COC LOP ${classData.id.slice(0, 8).toUpperCase()}`;
  const vietQrUrl = `https://img.vietqr.io/image/MB-0987654321-compact2.png?amount=500000&addInfo=${encodeURIComponent(qrTransferContent)}&accountName=${encodeURIComponent('TRUNG TAM GIA SU CRM')}`;

  return (
    <PageTemplate
      title={`Lớp học: ${req?.subject || 'Không rõ'}`}
      subtitle={`Học sinh: ${student?.fullName || 'Không rõ'} - Lớp ${req?.grade || student?.grade}`}
      badge="Class Details"
    >
      <div className="mb-4">
        <Link to="/tutor" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#696cff] hover:text-[#5f61e6] transition-colors">
          <ArrowLeft size={14} /> Quay lại danh sách lớp học
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 w-full text-left font-sans text-[#566a7f]">
        {/* Left Column: General Info & Roadmap */}
        <div className="flex-1 space-y-6">

          {/* BANNER 1: LỚP Ở TRẠNG THÁI DEPOSIT (CHỜ NỘP CỌC) */}
          {classData.status === 'DEPOSIT' && (
            <div className="p-5 bg-gradient-to-r from-[#fff4e5] to-[#fffbf0] rounded-2xl border-2 border-[#ffab00]/50 shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-[#ffab00] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={16} /> Phụ huynh đã chọn bạn dạy thử!
                </span>
                <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-[#ffab00] text-white shadow-sm animate-pulse">
                  Chờ nộp cọc 500,000đ
                </span>
              </div>

              {classData.cancelReason && (
                <div className="p-3.5 bg-white rounded-xl border border-[#ffab00]/30 shadow-sm space-y-1">
                  <span className="text-[11px] font-bold text-[#a1acb8] uppercase block">
                    Lịch dạy thử do Phụ huynh đã chốt:
                  </span>
                  <p className="text-sm font-bold text-[#566a7f] flex items-center gap-1.5">
                    <Calendar size={15} className="text-[#ffab00]" />
                    {classData.cancelReason}
                  </p>
                </div>
              )}

              <p className="text-xs text-[#566a7f] leading-relaxed">
                Để đảm bảo tính chuyên nghiệp và quyền lợi nhận lớp, vui lòng hoàn tất nộp cọc <strong>500,000 VNĐ</strong>. Hệ thống sẽ mở khóa số điện thoại và địa chỉ nhà phụ huynh ngay sau khi hoàn tất.
              </p>

              <div className="pt-1">
                <button
                  onClick={() => setShowDepositModal(true)}
                  className="px-6 py-2.5 bg-[#ffab00] hover:bg-[#e69a00] active:scale-95 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-[#ffab00]/30"
                >
                  <DollarSign size={16} /> Quét mã VietQR Nộp Cọc Nhận Lớp (500,000đ)
                </button>
              </div>
            </div>
          )}

          {/* BANNER 2: LỚP Ở TRẠNG THÁI TRIAL (ĐÃ NỘP CỌC - ĐANG DẠY THỬ) */}
          {classData.status === 'TRIAL' && (
            <div className="p-4 bg-gradient-to-r from-[#edfcf2] to-[#f4fdf7] rounded-2xl border border-[#71dd37]/50 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-[#71dd37] uppercase tracking-wide flex items-center gap-1.5">
                  <CheckCircle size={16} /> Đã nộp cọc thành công - Giai đoạn Dạy Thử
                </span>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#e8fadf] text-[#71dd37]">
                  Đã mở khóa liên hệ
                </span>
              </div>
              {classData.cancelReason && (
                <p className="text-xs font-semibold text-[#566a7f]">
                  📌 {classData.cancelReason}
                </p>
              )}
              <p className="text-[11px] text-[#697a8d]">
                Vui lòng chủ động gọi điện cho phụ huynh trước 24h để chào hỏi và xác nhận tài liệu chuẩn bị cho buổi dạy thử.
              </p>
            </div>
          )}

          {/* BANNER 3: LỚP Ở TRẠNG THÁI TEACHING (ĐANG GIẢNG DẠY CHÍNH THỨC) */}
          {classData.status === 'TEACHING' && (
            <div className="p-4 bg-gradient-to-r from-[#e8fadf] to-[#f4fdf7] rounded-2xl border border-[#71dd37]/60 shadow-sm space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-[#71dd37] uppercase tracking-wide flex items-center gap-1.5">
                  <CheckCircle size={16} /> Lớp Học Chính Thức
                </span>
                <span className="text-[11px] font-bold px-3 py-0.5 rounded-full bg-[#71dd37] text-white shadow-xs">
                  🟢 Đang hoạt động
                </span>
              </div>
              <p className="text-xs font-semibold text-[#566a7f]">
                🎉 Chúc mừng! Phụ huynh đã hài lòng với buổi dạy thử và chốt hợp đồng giảng dạy chính thức.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-[#697a8d]">
                <div className="bg-white px-3 py-1.5 rounded-lg border border-[#71dd37]/30 shadow-xs flex items-center gap-1.5">
                  <span className="text-[#a1acb8]">Số buổi còn lại chu kỳ:</span>
                  <strong className="text-[#696cff]">{classData.remainingSessions ?? 8} buổi</strong>
                </div>
                <Link
                  to="/tutor/attendance"
                  className="px-3 py-1.5 bg-[#696cff] hover:bg-[#5f61e6] text-white font-bold rounded-lg transition-all shadow-xs flex items-center gap-1"
                >
                  <Clock size={13} /> Điểm danh buổi học
                </Link>
              </div>
            </div>
          )}

          {/* Card Thông tin Lớp & Lộ trình */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <BookOpen size={18} className="text-[#696cff]" /> Thông tin Lớp & Lộ trình
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="p-4 bg-[#f9f9fa] rounded-xl border border-gray-100">
                <div className="text-xs text-[#a1acb8] font-bold uppercase mb-1">Môn học & Khối lớp</div>
                <div className="font-semibold">{req?.subject} - Lớp {req?.grade}</div>
              </div>
              <div className="p-4 bg-[#f9f9fa] rounded-xl border border-gray-100">
                <div className="text-xs text-[#a1acb8] font-bold uppercase mb-1">Hình thức học</div>
                <div className="font-semibold">{req?.learningMode === 'ONLINE' ? '💻 Học Trực tuyến (Zoom/Meet)' : '🏠 Học Tại nhà'}</div>
              </div>
              <div className="p-4 bg-[#f9f9fa] rounded-xl border border-gray-100 md:col-span-2">
                <div className="text-xs text-[#a1acb8] font-bold uppercase mb-1">Địa chỉ (Nếu học Offline)</div>
                <div className="font-semibold">
                  {classData.status === 'DEPOSIT' ? (
                    <span className="text-[#ffab00] italic">Khu vực: {req?.address || parent?.district || 'Hà Nội'} (Địa chỉ nhà chi tiết sẽ mở sau khi nộp cọc)</span>
                  ) : (
                    <span>{req?.address || parent?.address || 'Theo địa chỉ phụ huynh'}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-gray-100 pt-6">
              <h4 className="text-sm font-bold mb-3 text-[#566a7f]">Học lực & Mục tiêu của học sinh</h4>
              <div className="space-y-4">
                <div className="bg-[#fdfdff] p-4 rounded-lg border border-[#e7e7ff]">
                  <span className="text-xs font-bold text-[#696cff] uppercase block mb-1">Học lực hiện tại</span>
                  <p className="text-sm">{student?.academicLevel || 'Chưa đánh giá chi tiết'}</p>
                </div>
                <div className="bg-[#fff8e1] p-4 rounded-lg border border-[#ffab00]/30">
                  <span className="text-xs font-bold text-[#ffab00] uppercase block mb-1">Mục tiêu mong muốn</span>
                  <p className="text-sm">{student?.targetGoal || req?.studentNeeds || 'Lấy lại kiến thức căn bản & cải thiện điểm số'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Lịch học trong tuần */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Calendar size={18} className="text-[#71dd37]" /> Lịch học trong tuần
            </h3>
            {classData.classSchedules?.length > 0 ? (
              <div className="space-y-2">
                {classData.classSchedules.map((sched: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-[#f9f9fa] rounded-lg border border-gray-100">
                    <div className="font-semibold">Thứ {sched.dayOfWeek === 8 ? 'Chủ Nhật' : sched.dayOfWeek}</div>
                    <div className="text-[#696cff] font-mono font-bold text-sm bg-[#e7e7ff] px-2 py-1 rounded">
                      {sched.slotStart} - {sched.slotEnd}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-[#566a7f] p-4 bg-[#f9f9fa] rounded-lg border border-gray-100">
                <span className="font-bold text-[#697a8d]">Lịch học rảnh của phụ huynh: </span>
                <span>{req?.scheduleNotes || 'Theo thỏa thuận'}</span>
              </div>
            )}
          </div>

          {/* Danh sách các buổi học được sinh tự động / ghi nhận */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Clock size={18} className="text-[#696cff]" /> Lịch Buổi học ({classData.sessions?.length || 0})
              </h3>
              <Link
                to="/tutor/attendance"
                className="text-xs font-bold text-[#696cff] hover:text-[#5f61e6] flex items-center gap-1"
              >
                Ghi điểm danh &rarr;
              </Link>
            </div>

            {(!classData.sessions || classData.sessions.length === 0) ? (
              <div className="text-sm text-[#a1acb8] text-center py-6 bg-[#f9f9fa] rounded-xl border border-gray-100">
                Chưa có buổi học nào được lên lịch.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {classData.sessions.map((sess: any, idx: number) => {
                  const sDate = new Date(sess.scheduledTime);
                  const isPast = sDate.getTime() < Date.now();
                  const dateStr = sDate.toLocaleDateString('vi-VN', {
                    weekday: 'short',
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  });
                  const timeStr = sDate.toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <div
                      key={sess.id || idx}
                      className="p-3 bg-[#f9f9fa] hover:bg-[#f5f5f9] border border-gray-100 rounded-xl flex items-center justify-between gap-3 transition-colors"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#566a7f]">
                            Buổi #{classData.sessions.length - idx}
                          </span>
                          <span className="text-xs text-[#697a8d] font-semibold">
                            📅 {dateStr} lúc {timeStr}
                          </span>
                        </div>
                        {sess.tutorNotes && (
                          <p className="text-[11px] text-[#a1acb8] line-clamp-1">
                            {sess.tutorNotes}
                          </p>
                        )}
                      </div>

                      <div className="shrink-0">
                        {sess.status === 'COMPLETED' ? (
                          <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-[#e8fadf] text-[#71dd37]">
                            Đã dạy
                          </span>
                        ) : sess.status === 'CANCELLED' ? (
                          <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-[#ffebe6] text-[#ff3e1d]">
                            Đã hủy
                          </span>
                        ) : sess.status === 'DISPUTED' ? (
                          <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-[#fff8e1] text-[#ffab00]">
                            Khiếu nại
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-[#e7e7ff] text-[#696cff]">
                            {isPast ? 'Chờ điểm danh' : 'Lên lịch'}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Contact & Session Summary */}
        <div className="w-full lg:w-80 shrink-0 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-base font-bold mb-4 flex items-center gap-2">
              <User size={16} className="text-[#ffab00]" /> Thông tin Liên hệ
            </h3>
            
            <div className="space-y-4">
              <div>
                <span className="text-[10px] text-[#a1acb8] font-bold uppercase block">Học sinh</span>
                <div className="font-semibold text-sm">{student?.fullName}</div>
                <div className="text-xs text-[#697a8d] mt-0.5">Tính cách: {student?.personalityTraits || 'Chăm ngoan'}</div>
              </div>
              <div className="w-full h-px bg-gray-100"></div>

              {classData.status === 'DEPOSIT' ? (
                <div className="p-3.5 bg-[#fff8e1] rounded-xl border border-[#ffab00]/30 text-xs space-y-2">
                  <div className="text-[#ffab00] font-bold flex items-center gap-1.5">
                    <AlertCircle size={15} /> Số điện thoại đang khóa
                  </div>
                  <p className="text-[11px] text-[#566a7f] leading-relaxed">
                    Hoàn tất nộp cọc 500k để xem số điện thoại và gọi điện trực tiếp cho phụ huynh.
                  </p>
                  <button
                    onClick={() => setShowDepositModal(true)}
                    className="w-full py-2 bg-[#ffab00] hover:bg-[#e69a00] text-white font-bold text-xs rounded-lg transition-all cursor-pointer shadow-sm text-center"
                  >
                    Nộp cọc ngay
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] text-[#a1acb8] font-bold uppercase block">Phụ huynh</span>
                    <div className="font-semibold text-sm">{parent?.fullName}</div>
                    <div className="text-sm font-mono font-bold text-[#696cff] mt-0.5">{parentPhone || 'Chưa cập nhật SĐT'}</div>
                  </div>

                  {parentPhone && (
                    <div className="flex gap-2 pt-1">
                      <a
                        href={`tel:${parentPhone}`}
                        className="flex-1 py-2 bg-[#e7e7ff] hover:bg-[#696cff] text-[#696cff] hover:text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1"
                      >
                        <Phone size={13} /> Gọi điện
                      </a>
                      <a
                        href={`https://zalo.me/${parentPhone}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 py-2 bg-[#e8fadf] hover:bg-[#71dd37] text-[#71dd37] hover:text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1"
                      >
                        <MessageSquare size={13} /> Zalo
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-base font-bold mb-4 flex items-center gap-2">
              <Clock size={16} className="text-[#696cff]" /> Thù lao giảng dạy
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center p-3 bg-[#f8f9fa] rounded-lg">
                <span className="text-[#697a8d]">Lương nhận mỗi buổi:</span>
                <strong className="text-[#71dd37] text-sm">
                  {parseInt(classData.tutorWageRate || classData.hourlyRate || 150000).toLocaleString()} đ
                </strong>
              </div>
              <div className="flex justify-between items-center p-3 bg-[#f8f9fa] rounded-lg">
                <span className="text-[#697a8d]">Trạng thái lớp:</span>
                <span className="font-bold text-[#566a7f]">
                  {classData.status === 'DEPOSIT' ? 'Chờ cọc' : classData.status === 'TRIAL' ? 'Đang dạy thử' : 'Đang giảng dạy'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Quét Mã VietQR Nộp Cọc */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 bg-[#233446]/50 flex items-center justify-center p-4 backdrop-blur-sm font-sans">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-left shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button
              onClick={() => setShowDepositModal(false)}
              className="absolute top-4 right-4 text-[#a1acb8] hover:text-[#566a7f] cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="text-center pb-2 border-b border-gray-100">
              <span className="text-[11px] font-extrabold uppercase text-[#ffab00] tracking-wider block mb-1">
                Thanh Toán Tiền Cọc Nhận Lớp
              </span>
              <h3 className="text-xl font-extrabold text-[#566a7f]">500,000 VNĐ</h3>
              <p className="text-xs text-[#a1acb8] mt-0.5">Lớp: {req?.subject} - Bé {student?.fullName}</p>
            </div>

            {/* Mã VietQR */}
            <div className="p-4 bg-[#f8f9fa] rounded-2xl border border-gray-200 flex flex-col items-center text-center space-y-3">
              <img
                src={vietQrUrl}
                alt="Mã VietQR nộp cọc"
                className="w-48 h-48 object-contain rounded-xl shadow-sm border border-gray-100 bg-white p-2"
              />
              <div className="space-y-1 text-xs w-full">
                <div className="flex justify-between py-1 border-b border-gray-200">
                  <span className="text-[#a1acb8]">Ngân hàng:</span>
                  <strong className="text-[#566a7f]">MB Bank (Quân Đội)</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-200">
                  <span className="text-[#a1acb8]">Số tài khoản:</span>
                  <strong className="text-[#696cff] font-mono font-bold">0987654321</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-200">
                  <span className="text-[#a1acb8]">Chủ tài khoản:</span>
                  <strong className="text-[#566a7f]">TRUNG TAM GIA SU CRM</strong>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#a1acb8]">Nội dung CK:</span>
                  <strong className="text-[#ffab00] font-mono font-bold">{qrTransferContent}</strong>
                </div>
              </div>
            </div>

            {/* Cam kết hoàn cọc */}
            <div className="p-3 bg-[#e8fadf] rounded-xl border border-[#71dd37]/40 text-xs text-[#437324] space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <ShieldCheck size={15} /> Cam Kết Hoàn Cọc Minh Bạch:
              </div>
              <p className="text-[11px] text-[#566a7f] leading-relaxed">
                Tiền cọc được giữ an toàn tại tài khoản bảo chứng của trung tâm và hoàn lại 100% cho gia sư theo quy định sau khi kết thúc hợp đồng hoặc quyết toán dạy thử.
              </p>
            </div>

            {/* Nút hành động */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDepositModal(false)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-[#566a7f] font-bold text-xs rounded-xl cursor-pointer transition-all"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={handleDepositSubmit}
                disabled={submittingDeposit}
                className="flex-1 py-2.5 bg-[#ffab00] hover:bg-[#e69a00] text-white font-bold text-xs rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-md shadow-[#ffab00]/30"
              >
                {submittingDeposit ? (
                  <Loader size={14} className="animate-spin" />
                ) : (
                  <>
                    <CheckCircle size={15} /> Xác nhận đã chuyển khoản
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageTemplate>
  );
}
