import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BookOpen, User, Calendar, CheckCircle, ArrowLeft, Clock } from 'lucide-react';
import api from '../../services/api';
import PageTemplate from '../../components/PageTemplate';

export default function TutorClassDetails() {
  const { id } = useParams<{ id: string }>();
  const [classData, setClassData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    if (id) fetchClassDetails();
  }, [id]);

  if (loading) {
    return (
      <PageTemplate title="Chi tiết Lớp học" subtitle="Đang tải dữ liệu..." badge="Class Details">
        <div className="text-center py-12 text-[#a1acb8] text-sm">Đang tải chi tiết lớp học...</div>
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

  return (
    <PageTemplate
      title={`Lớp học: ${req?.subject || 'Không rõ'}`}
      subtitle={`Học sinh: ${student?.fullName || 'Không rõ'} - Lớp ${req?.grade || student?.grade}`}
      badge="Class Details"
    >
      <div className="mb-4">
        <Link to="/tutor" className="inline-flex items-center gap-1 text-xs font-semibold text-[#696cff] hover:text-[#5f61e6] transition-colors">
          <ArrowLeft size={14} /> Quay lại danh sách lớp
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 w-full text-left font-sans text-[#566a7f]">
        {/* Left Column: General Info & Roadmap */}
        <div className="flex-1 space-y-6">
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
                <div className="font-semibold">{req?.learningMode === 'ONLINE' ? 'Học Trực tuyến' : 'Học Tại nhà'}</div>
              </div>
              <div className="p-4 bg-[#f9f9fa] rounded-xl border border-gray-100 md:col-span-2">
                <div className="text-xs text-[#a1acb8] font-bold uppercase mb-1">Địa chỉ (Nếu học Offline)</div>
                <div className="font-semibold">{req?.address || parent?.address || 'Không yêu cầu'}</div>
              </div>
            </div>

            <div className="mt-6 border-t border-gray-100 pt-6">
              <h4 className="text-sm font-bold mb-3 text-[#566a7f]">Học lực & Mục tiêu</h4>
              <div className="space-y-4">
                <div className="bg-[#fdfdff] p-4 rounded-lg border border-[#e7e7ff]">
                  <span className="text-xs font-bold text-[#696cff] uppercase block mb-1">Học lực hiện tại</span>
                  <p className="text-sm">{student?.academicLevel || 'Chưa đánh giá'}</p>
                </div>
                <div className="bg-[#fff8e1] p-4 rounded-lg border border-[#ffab00]/30">
                  <span className="text-xs font-bold text-[#ffab00] uppercase block mb-1">Mục tiêu mong muốn</span>
                  <p className="text-sm">{student?.targetGoal || req?.studentNeeds || 'Đạt điểm cao trên trường'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Calendar size={18} className="text-[#71dd37]" /> Lịch học trong tuần
            </h3>
            {classData.classSchedules?.length > 0 ? (
              <div className="space-y-2">
                {classData.classSchedules.map((sched: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-[#f9f9fa] rounded-lg border border-gray-100">
                    <div className="font-semibold">Thứ {sched.dayOfWeek}</div>
                    <div className="text-[#696cff] font-mono font-bold text-sm bg-[#e7e7ff] px-2 py-1 rounded">
                      {sched.slotStart} - {sched.slotEnd}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-[#a1acb8] italic p-4 bg-[#f9f9fa] rounded-lg border border-dashed border-gray-200">
                Lớp này chưa thiết lập lịch học cố định.
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
                <div className="text-xs text-[#697a8d] mt-0.5">Tính cách: {student?.personalityTraits || 'Không rõ'}</div>
              </div>
              <div className="w-full h-px bg-gray-100"></div>
              {classData.status === 'DEPOSIT' ? (
                <div className="p-3 bg-[#fff8e1] rounded-lg border border-[#ffab00]/30 text-xs text-[#ffab00] font-semibold">
                  Hoàn thành nộp cọc để xem số điện thoại liên hệ của phụ huynh.
                </div>
              ) : (
                <div>
                  <span className="text-[10px] text-[#a1acb8] font-bold uppercase block">Phụ huynh</span>
                  <div className="font-semibold text-sm">{parent?.fullName}</div>
                  <div className="text-xs font-mono text-[#696cff] mt-0.5">{parent?.user?.phone || 'Chưa có SĐT'}</div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-base font-bold mb-4 flex items-center gap-2">
              <Clock size={16} className="text-[#696cff]" /> Tóm tắt Buổi học
            </h3>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center p-3 bg-[#e8fadf] rounded-lg border border-[#71dd37]/30">
                <span className="text-xs font-bold text-[#71dd37] flex items-center gap-1.5"><CheckCircle size={14}/> Đã hoàn thành</span>
                <span className="text-lg font-extrabold text-[#71dd37]">
                  {classData.sessions?.filter((s:any) => s.status === 'COMPLETED').length || 0}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-[#f9f9fa] rounded-lg border border-gray-100">
                <span className="text-xs font-bold text-[#697a8d]">Tổng số buổi đã lên lịch</span>
                <span className="text-base font-bold text-[#566a7f]">
                  {classData.sessions?.length || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTemplate>
  );
}
