import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { 
  BookOpen, User, Clock, Send, ArrowLeft, Loader, 
  MapPin, Check, X, Home, Laptop, Info, CalendarCheck, Handshake
} from 'lucide-react';
import PageTemplate from '../../components/PageTemplate';

interface Student {
  id: string;
  fullName: string;
  gender: string;
  grade?: string;
  school?: string;
  subjectsNeeded?: string;
  learningStyle?: string;
}

const DAYS = [
  { key: 'T2', short: 'T2', label: 'Thứ 2' },
  { key: 'T3', short: 'T3', label: 'Thứ 3' },
  { key: 'T4', short: 'T4', label: 'Thứ 4' },
  { key: 'T5', short: 'T5', label: 'Thứ 5' },
  { key: 'T6', short: 'T6', label: 'Thứ 6' },
  { key: 'T7', short: 'T7', label: 'Thứ 7' },
  { key: 'CN', short: 'CN', label: 'Chủ Nhật' },
];

const SHIFTS = [
  { key: 'SANG', label: 'Sáng', time: '08:00 - 11:30', icon: '🌅' },
  { key: 'CHIEU', label: 'Chiều', time: '14:00 - 17:30', icon: '☀️' },
  { key: 'TOI', label: 'Tối', time: '18:30 - 21:30', icon: '🌙' },
];

const BUDGET_PRESETS = [150000, 200000, 250000, 300000, 350000];

export default function RequestTutor() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [students, setStudents] = useState<Student[]>([]);
  const [studentId, setStudentId] = useState('');
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('');

  // Lịch học
  const [flexibleSchedule, setFlexibleSchedule] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [customScheduleNote, setCustomScheduleNote] = useState('');
  const [sessionsPerWeek, setSessionsPerWeek] = useState(2);

  // Mức phí & Tiêu chí gia sư
  const [budgetPerSession, setBudgetPerSession] = useState(200000);
  const [tutorTypePref, setTutorTypePref] = useState('ANY'); // ANY, STUDENT, TEACHER
  const [tutorGenderPref, setTutorGenderPref] = useState('ANY'); // ANY, MALE, FEMALE
  const [learningMode, setLearningMode] = useState('OFFLINE'); // OFFLINE, ONLINE
  const [address, setAddress] = useState('');
  const [requirements, setRequirements] = useState('');

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 1. Fetch Danh sách con & Hồ sơ phụ huynh (để lấy địa chỉ mặc định)
  useEffect(() => {
    const initData = async () => {
      setFetchLoading(true);
      try {
        const [studentsRes, parentRes] = await Promise.allSettled([
          api.get('/api/v1/students'),
          api.get('/api/v1/crm/parent/profile'),
        ]);

        let studentList: Student[] = [];
        if (studentsRes.status === 'fulfilled' && Array.isArray(studentsRes.value.data)) {
          studentList = studentsRes.value.data;
          setStudents(studentList);
        }

        // Lấy địa chỉ phụ huynh mặc định
        if (parentRes.status === 'fulfilled' && parentRes.value.data) {
          const p = parentRes.value.data;
          const fullAddr = [p.address, p.district, p.province].filter(Boolean).join(', ');
          if (fullAddr) setAddress(fullAddr);
        }

        // Tự động bind học sinh từ URL (?studentId=...)
        const paramStudentId = searchParams.get('studentId');
        if (paramStudentId && studentList.length > 0) {
          const matched = studentList.find((s) => s.id === paramStudentId);
          if (matched) {
            setStudentId(matched.id);
            if (matched.grade) setGrade(matched.grade);
            if (matched.subjectsNeeded) {
              setSubject(matched.subjectsNeeded.split(',')[0].trim());
            }
            if (matched.learningStyle) {
              setRequirements(`Tính cách / Phong cách học của con: ${matched.learningStyle}`);
            }
          }
        }
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu khởi tạo', err);
      } finally {
        setFetchLoading(false);
      }
    };

    initData();
  }, [searchParams]);

  // Khi người dùng đổi chọn con trong dropdown
  const handleStudentChange = (id: string) => {
    setStudentId(id);
    const chosen = students.find((s) => s.id === id);
    if (chosen) {
      if (chosen.grade) setGrade(chosen.grade);
      if (chosen.subjectsNeeded) {
        setSubject(chosen.subjectsNeeded.split(',')[0].trim());
      }
      if (chosen.learningStyle) {
        setRequirements(`Tính cách / Phong cách học của con: ${chosen.learningStyle}`);
      }
    }
  };

  // Toggle ca rảnh trong ma trận
  const toggleSlot = (slotText: string) => {
    setSelectedSlots((prev) => {
      let updated: string[];
      if (prev.includes(slotText)) {
        updated = prev.filter((s) => s !== slotText);
      } else {
        updated = [...prev, slotText];
      }
      // Tự cập nhật số buổi nếu có chọn ca
      if (updated.length > 0 && !flexibleSchedule) {
        setSessionsPerWeek(Math.min(7, Math.max(1, updated.length)));
      }
      return updated;
    });
  };

  // Nút chọn nhanh tất cả buổi tối
  const selectAllEvenings = () => {
    const eveningSlots = DAYS.map((d) => `Tối ${d.label}`);
    setSelectedSlots((prev) => Array.from(new Set([...prev, ...eveningSlots])));
  };

  // Nút chọn nhanh cuối tuần
  const selectWeekends = () => {
    const weekendSlots: string[] = [];
    ['Thứ 7', 'Chủ Nhật'].forEach((dayLabel) => {
      SHIFTS.forEach((s) => weekendSlots.push(`${s.label} ${dayLabel}`));
    });
    setSelectedSlots((prev) => Array.from(new Set([...prev, ...weekendSlots])));
  };

  // Format tiền tệ VNĐ
  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!studentId) {
      setError('Vui lòng chọn con sẽ học bài');
      return;
    }

    if (learningMode === 'OFFLINE' && !address.trim()) {
      setError('Vui lòng nhập địa chỉ học tại nhà để trung tâm điều phối gia sư gần khu vực');
      return;
    }

    // Tổng hợp lịch rảnh
    let finalScheduleNotes = '';
    if (flexibleSchedule) {
      finalScheduleNotes = 'Thỏa thuận linh hoạt với gia sư sau';
    } else if (selectedSlots.length > 0) {
      finalScheduleNotes = `Ca rảnh: ${selectedSlots.join('; ')}`;
    } else {
      finalScheduleNotes = 'Linh hoạt theo thỏa thuận';
    }

    if (customScheduleNote.trim()) {
      finalScheduleNotes += ` | Ghi chú: ${customScheduleNote.trim()}`;
    }

    setLoading(true);

    try {
      await api.post('/api/v1/tutor-requests', {
        studentId,
        subject,
        grade,
        scheduleNotes: finalScheduleNotes,
        sessionsPerWeek: Number(sessionsPerWeek),
        budgetPerSession: Number(budgetPerSession),
        tutorGenderPref,
        learningMode,
        address: learningMode === 'OFFLINE' ? address.trim() : 'Online',
        tutorTypePref,
        requirements: requirements.trim() || undefined,
      });

      setSuccess('Gửi yêu cầu tìm Gia sư thành công! Hệ thống sẽ tiến hành so khớp gia sư phù hợp nhất cho bé.');
      setTimeout(() => {
        navigate('/client/requests');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi tạo yêu cầu');
    } finally {
      setLoading(false);
    }
  };

  const selectedStudentObj = students.find((s) => s.id === studentId);

  return (
    <PageTemplate
      title="Đăng Ký Tìm Gia Sư"
      subtitle="Tạo yêu cầu tìm gia sư dạy kèm theo nhu cầu học tập của con"
      badge="Client Portal"
    >
      <div className="max-w-3xl mx-auto w-full space-y-6 text-left font-sans text-[#566a7f]">
        {/* Navigation Back */}
        <div className="flex items-center justify-between">
          <Link
            to="/client"
            className="text-xs font-semibold text-[#697a8d] hover:text-[#696cff] bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft size={14} /> Quay lại Client Portal
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className="w-11 h-11 rounded-xl bg-[#e7e7ff] text-[#696cff] flex items-center justify-center font-bold shadow-sm">
              <BookOpen size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#566a7f]">Đăng ký tìm Gia sư dạy kèm</h2>
              <p className="text-xs text-[#a1acb8]">
                Trung tâm tiếp nhận yêu cầu và chạy thuật toán Smart Matching để so khớp gia sư lý tưởng
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3.5 bg-[#ffe0db] border border-[#ff3e1d]/40 rounded-lg text-xs font-semibold text-[#ff3e1d]">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 bg-[#e8fadf] border border-[#71dd37]/40 rounded-lg text-xs font-semibold text-[#71dd37] flex items-center gap-2">
              <Check size={18} />
              <span>{success}</span>
            </div>
          )}

          {fetchLoading ? (
            <div className="text-center py-16 text-[#a1acb8] text-sm flex flex-col items-center gap-3">
              <Loader size={26} className="animate-spin text-[#696cff]" />
              Đang tải danh sách học sinh và biểu mẫu...
            </div>
          ) : students.length === 0 ? (
            <div className="py-12 text-center space-y-3 bg-[#f8f9fa] rounded-xl border border-gray-200 p-6">
              <User size={48} className="mx-auto text-[#a1acb8]" />
              <p className="text-base font-bold text-[#566a7f]">Bạn chưa có hồ sơ học sinh nào</p>
              <p className="text-xs text-[#a1acb8] max-w-sm mx-auto">
                Trước khi đăng ký tìm gia sư, vui lòng tạo hồ sơ cho bé để trung tâm nắm bắt trình độ và ghép gia sư phù hợp.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => navigate('/client/children')}
                  className="px-5 py-2.5 bg-[#696cff] hover:bg-[#5f61e6] text-white rounded-lg text-xs font-bold transition-all shadow-[0_2px_4px_0_rgba(105,108,255,0.4)] cursor-pointer inline-flex items-center gap-2"
                >
                  <User size={15} /> Thêm hồ sơ học sinh ngay
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* I. CHỌN HỌC SINH */}
              <div className="bg-[#f8f9fa] p-4 rounded-xl border border-gray-100 space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#566a7f]">
                  1. Chọn con học bài *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#a1acb8]">
                    <User size={16} />
                  </span>
                  <select
                    value={studentId}
                    onChange={(e) => handleStudentChange(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#d9dee3] rounded-lg text-sm font-medium text-[#566a7f] focus:outline-none focus:border-[#696cff] cursor-pointer shadow-sm"
                  >
                    <option value="" disabled>
                      -- Chọn con cần tìm gia sư --
                    </option>
                    {students.map((std) => (
                      <option key={std.id} value={std.id}>
                        {std.gender === 'MALE' ? '👦' : '👧'} {std.fullName} {std.grade ? `- ${std.grade}` : ''} {std.school ? `(${std.school})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                {selectedStudentObj && (
                  <div className="text-[11px] text-[#696cff] bg-[#e7e7ff]/60 px-3 py-1.5 rounded-lg flex items-center justify-between">
                    <span>
                      Đã chọn: <strong>{selectedStudentObj.fullName}</strong> 
                      {selectedStudentObj.grade ? ` • ${selectedStudentObj.grade}` : ''}
                      {selectedStudentObj.school ? ` • ${selectedStudentObj.school}` : ''}
                    </span>
                    <span className="text-[10px] text-[#a1acb8]">Tự động điền thông tin</span>
                  </div>
                )}
              </div>

              {/* II. MÔN HỌC & CẤP LỚP */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#566a7f] mb-2">
                  2. Môn học & Trình độ
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#566a7f] mb-1">Môn học cần kèm *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Toán Hình, Tiếng Anh IELTS, Hóa..."
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#d9dee3] rounded-lg text-sm text-[#566a7f] focus:outline-none focus:border-[#696cff]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#566a7f] mb-1">Cấp lớp / Khối lớp *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Lớp 10, Lớp 9 luyện thi..."
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#d9dee3] rounded-lg text-sm text-[#566a7f] focus:outline-none focus:border-[#696cff]"
                    />
                  </div>
                </div>
              </div>

              {/* III. TIÊU CHÍ GIA SƯ */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#566a7f] mb-2">
                  3. Tiêu chí chọn Gia sư
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Loại gia sư */}
                  <div>
                    <label className="block text-xs font-semibold text-[#566a7f] mb-1.5">
                      Đối tượng Gia sư mong muốn
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { val: 'STUDENT', label: 'Sinh viên', desc: 'Nhiệt tình, giá tốt' },
                        { val: 'TEACHER', label: 'Giáo viên', desc: 'Chuyên môn cao' },
                        { val: 'ANY', label: 'Bất kỳ', desc: 'Ưu tiên phù hợp' },
                      ].map((t) => (
                        <button
                          key={t.val}
                          type="button"
                          onClick={() => setTutorTypePref(t.val)}
                          className={`py-2 px-2 rounded-lg border text-center transition-all cursor-pointer ${
                            tutorTypePref === t.val
                              ? 'bg-[#696cff]/10 border-[#696cff] text-[#696cff] font-bold shadow-sm'
                              : 'bg-white border-[#d9dee3] text-[#697a8d] hover:border-gray-300'
                          }`}
                        >
                          <div className="text-xs">{t.label}</div>
                          <div className="text-[10px] text-[#a1acb8] mt-0.5">{t.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Yêu cầu giới tính */}
                  <div>
                    <label className="block text-xs font-semibold text-[#566a7f] mb-1.5">
                      Yêu cầu giới tính Gia sư
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { val: 'ANY', label: 'Không yêu cầu' },
                        { val: 'MALE', label: 'Nam' },
                        { val: 'FEMALE', label: 'Nữ' },
                      ].map((g) => (
                        <button
                          key={g.val}
                          type="button"
                          onClick={() => setTutorGenderPref(g.val)}
                          className={`py-2.5 px-3 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                            tutorGenderPref === g.val
                              ? 'bg-[#696cff]/10 border-[#696cff] text-[#696cff] shadow-sm'
                              : 'bg-white border-[#d9dee3] text-[#697a8d] hover:border-gray-300'
                          }`}
                        >
                          {g.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* IV. SỐ BUỔI & HỌC PHÍ */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#566a7f] mb-2">
                  4. Thời lượng & Mức học phí đề xuất
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#566a7f] mb-1">
                      Số buổi học / tuần
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setSessionsPerWeek(n)}
                          className={`flex-1 py-2 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                            sessionsPerWeek === n
                              ? 'bg-[#696cff] border-[#696cff] text-white shadow-sm'
                              : 'bg-white border-[#d9dee3] text-[#566a7f] hover:border-gray-300'
                          }`}
                        >
                          {n} buổi
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-[#566a7f]">
                        Học phí đề xuất / buổi
                      </label>
                      <span className="text-xs font-bold text-[#696cff]">
                        {formatVND(budgetPerSession)}
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        required
                        min={50000}
                        step={10000}
                        value={budgetPerSession}
                        onChange={(e) => setBudgetPerSession(parseInt(e.target.value) || 0)}
                        className="w-full px-3.5 py-2 bg-white border border-[#d9dee3] rounded-lg text-sm font-semibold text-[#566a7f] focus:outline-none focus:border-[#696cff]"
                      />
                    </div>
                    {/* Gợi ý học phí */}
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      <span className="text-[10px] text-[#a1acb8]">Gợi ý:</span>
                      {BUDGET_PRESETS.map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setBudgetPerSession(p)}
                          className={`text-[10px] px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                            budgetPerSession === p
                              ? 'bg-[#696cff]/10 border-[#696cff] text-[#696cff] font-bold'
                              : 'bg-gray-50 border-gray-200 text-[#697a8d] hover:bg-gray-100'
                          }`}
                        >
                          {formatVND(p)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* V. LỊCH RẢNH ĐỀ XUẤT (HYBRID: THỎA THUẬN HOẶC MA TRẬN 7 NGÀY) */}
              <div className="bg-[#f8f9fa] p-4 sm:p-5 rounded-xl border border-gray-100 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#566a7f]">
                      5. Lịch học mong muốn & Ca rảnh *
                    </label>
                    <p className="text-[11px] text-[#a1acb8] mt-0.5">
                      Khung giờ rảnh dự kiến để so khớp gia sư. Hai bên sẽ chốt Thời khóa biểu chính thức sau khi kết nối.
                    </p>
                  </div>
                </div>

                {/* 2 Lựa chọn Xếp lịch: Ma trận tuần hoặc Thỏa thuận sau */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFlexibleSchedule(false)}
                    className={`p-3 rounded-xl border flex items-center gap-3 transition-all cursor-pointer text-left ${
                      !flexibleSchedule
                        ? 'bg-white border-[#696cff] ring-2 ring-[#696cff]/20 shadow-sm'
                        : 'bg-white border-[#d9dee3] hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${!flexibleSchedule ? 'bg-[#e7e7ff] text-[#696cff]' : 'bg-gray-100 text-gray-400'}`}>
                      <CalendarCheck size={18} />
                    </div>
                    <div>
                      <div className={`text-xs font-bold ${!flexibleSchedule ? 'text-[#696cff]' : 'text-[#566a7f]'}`}>
                        Chọn khung ca rảnh (Ma trận tuần)
                      </div>
                      <div className="text-[10px] text-[#a1acb8]">
                        Chọn các buổi Sáng/Chiều/Tối bé có thể học
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFlexibleSchedule(true)}
                    className={`p-3 rounded-xl border flex items-center gap-3 transition-all cursor-pointer text-left ${
                      flexibleSchedule
                        ? 'bg-white border-[#696cff] ring-2 ring-[#696cff]/20 shadow-sm'
                        : 'bg-white border-[#d9dee3] hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${flexibleSchedule ? 'bg-[#e7e7ff] text-[#696cff]' : 'bg-gray-100 text-gray-400'}`}>
                      <Handshake size={18} />
                    </div>
                    <div>
                      <div className={`text-xs font-bold ${flexibleSchedule ? 'text-[#696cff]' : 'text-[#566a7f]'}`}>
                        Hai bên tự thỏa thuận lịch sau
                      </div>
                      <div className="text-[10px] text-[#a1acb8]">
                        Linh hoạt sắp xếp giờ khi trung tâm gửi gia sư
                      </div>
                    </div>
                  </button>
                </div>

                {/* NẾU CHỌN THỎA THUẬN SAU */}
                {flexibleSchedule ? (
                  <div className="p-3.5 bg-[#e7e7ff]/50 border border-[#696cff]/30 rounded-xl text-xs text-[#566a7f] flex items-start gap-2.5">
                    <Info size={16} className="text-[#696cff] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-[#696cff]">Đã chọn chế độ Xếp lịch linh hoạt</p>
                      <p className="text-[11px] text-[#566a7f] mt-0.5">
                        Bạn không cần chọn ca rảnh cố định. Trung tâm sẽ giới thiệu các gia sư có thời gian dạy linh hoạt để bạn và gia sư dễ dàng thống nhất sau khi trao đổi.
                      </p>
                    </div>
                  </div>
                ) : (
                  /* NẾU CHỌN MA TRẬN 7 NGÀY X 3 BUỔI */
                  <div className="space-y-3 pt-1">
                    {/* Action buttons chọn nhanh */}
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          type="button"
                          onClick={selectAllEvenings}
                          className="px-2.5 py-1 bg-white border border-[#d9dee3] hover:border-[#696cff] text-[#566a7f] hover:text-[#696cff] text-[11px] font-semibold rounded-md transition-colors cursor-pointer"
                        >
                          🌙 Chọn tất cả buổi Tối
                        </button>
                        <button
                          type="button"
                          onClick={selectWeekends}
                          className="px-2.5 py-1 bg-white border border-[#d9dee3] hover:border-[#696cff] text-[#566a7f] hover:text-[#696cff] text-[11px] font-semibold rounded-md transition-colors cursor-pointer"
                        >
                          🏖️ Chọn Cuối tuần (T7, CN)
                        </button>
                      </div>

                      {selectedSlots.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setSelectedSlots([])}
                          className="text-[11px] text-[#ff3e1d] hover:underline cursor-pointer"
                        >
                          Bỏ chọn tất cả
                        </button>
                      )}
                    </div>

                    {/* Bảng Ma trận Tuần (Weekly Matrix) */}
                    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
                      <table className="w-full text-center border-collapse min-w-[500px]">
                        <thead>
                          <tr className="bg-[#f5f5f9] border-b border-gray-200 text-[#566a7f] text-xs font-bold">
                            <th className="py-2.5 px-3 text-left w-28">Ca học</th>
                            {DAYS.map((d) => (
                              <th key={d.key} className="py-2.5 px-2">
                                <div>{d.short}</div>
                                <div className="text-[10px] font-normal text-[#a1acb8]">{d.label}</div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-xs">
                          {SHIFTS.map((shift) => (
                            <tr key={shift.key} className="hover:bg-gray-50/50 transition-colors">
                              <td className="py-2.5 px-3 text-left font-semibold text-[#566a7f] bg-[#fafafa]">
                                <div className="flex items-center gap-1.5">
                                  <span>{shift.icon}</span>
                                  <span>{shift.label}</span>
                                </div>
                                <div className="text-[10px] text-[#a1acb8]">{shift.time}</div>
                              </td>
                              {DAYS.map((day) => {
                                const slotText = `${shift.label} ${day.label}`;
                                const isSelected = selectedSlots.includes(slotText);
                                return (
                                  <td key={day.key} className="p-1.5">
                                    <button
                                      type="button"
                                      onClick={() => toggleSlot(slotText)}
                                      className={`w-full py-2 px-1 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                                        isSelected
                                          ? 'bg-[#696cff] text-white shadow-sm'
                                          : 'bg-gray-50 hover:bg-gray-100 text-[#697a8d] border border-gray-200 hover:border-[#696cff]/40'
                                      }`}
                                      title={`${shift.label} ${day.label} (${shift.time})`}
                                    >
                                      {isSelected ? (
                                        <>
                                          <Check size={12} strokeWidth={3} />
                                          <span className="text-[11px]">Chọn</span>
                                        </>
                                      ) : (
                                        <span className="text-[11px] text-gray-400">+</span>
                                      )}
                                    </button>
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Danh sách các ca đã chọn */}
                    {selectedSlots.length > 0 && (
                      <div className="pt-2">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[11px] font-bold text-[#566a7f]">
                            Đã chọn {selectedSlots.length} ca rảnh:
                          </span>
                          <span className="text-[10px] text-[#a1acb8]">
                            Hệ thống đã tự cân đối {sessionsPerWeek} buổi/tuần
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedSlots.map((s) => (
                            <span
                              key={s}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#e7e7ff] text-[#696cff]"
                            >
                              <Clock size={12} />
                              {s}
                              <button
                                type="button"
                                onClick={() => toggleSlot(s)}
                                className="hover:text-red-500 cursor-pointer ml-0.5"
                              >
                                <X size={12} />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Ghi chú thêm lịch rảnh */}
                <div className="pt-2 border-t border-gray-200">
                  <label className="block text-xs font-semibold text-[#566a7f] mb-1">
                    Ghi chú thêm về lịch học (nếu có)
                  </label>
                  <input
                    type="text"
                    maxLength={200}
                    placeholder="Ví dụ: Có thể đổi sang Tối T7 nếu gia sư bận, bắt đầu học từ tuần sau..."
                    value={customScheduleNote}
                    onChange={(e) => setCustomScheduleNote(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#d9dee3] rounded-lg text-xs text-[#566a7f] focus:outline-none focus:border-[#696cff]"
                  />
                </div>

                {/* Tooltip giải thích nghiệp vụ */}
                <div className="text-[11px] text-[#8592a3] bg-white p-2.5 rounded-lg border border-gray-200 flex items-start gap-2">
                  <Info size={14} className="shrink-0 mt-0.5 text-[#696cff]" />
                  <span>
                    <strong>Quy trình CRM:</strong> Lịch chọn ở đây là khung giờ rảnh mong muốn để tìm gia sư phù hợp. Sau khi trung tâm ghép lớp và dạy thử thành công, <strong>Phụ huynh và Gia sư sẽ chính thức chốt Thời khóa biểu cố định</strong> vào hệ thống để theo dõi và điểm danh từng buổi dạy.
                  </span>
                </div>
              </div>

              {/* VI. HÌNH THỨC HỌC & ĐỊA CHỈ */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#566a7f] mb-2">
                  6. Hình thức học & Địa điểm
                </label>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <button
                    type="button"
                    onClick={() => setLearningMode('OFFLINE')}
                    className={`py-3 px-4 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                      learningMode === 'OFFLINE'
                        ? 'bg-[#696cff]/10 border-[#696cff] text-[#696cff] shadow-sm'
                        : 'bg-white border-[#d9dee3] text-[#697a8d] hover:border-gray-300'
                    }`}
                  >
                    <Home size={16} />
                    <span>Học tại nhà (Offline)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLearningMode('ONLINE')}
                    className={`py-3 px-4 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                      learningMode === 'ONLINE'
                        ? 'bg-[#696cff]/10 border-[#696cff] text-[#696cff] shadow-sm'
                        : 'bg-white border-[#d9dee3] text-[#697a8d] hover:border-gray-300'
                    }`}
                  >
                    <Laptop size={16} />
                    <span>Học Online qua Zoom/Meet</span>
                  </button>
                </div>

                {learningMode === 'OFFLINE' && (
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[#566a7f]">
                      Địa chỉ nhà dạy kèm *
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#a1acb8]">
                        <MapPin size={16} />
                      </span>
                      <input
                        type="text"
                        required={learningMode === 'OFFLINE'}
                        maxLength={255}
                        placeholder="Số nhà, ngõ/đường, Phường/Xã, Quận/Huyện..."
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#d9dee3] rounded-lg text-xs text-[#566a7f] focus:outline-none focus:border-[#696cff]"
                      />
                    </div>
                    <p className="text-[11px] text-[#a1acb8]">
                      Địa chỉ chính xác giúp trung tâm lọc gia sư ở cự ly gần, tránh trường hợp hủy lớp do quá xa.
                    </p>
                  </div>
                )}
              </div>

              {/* VII. YÊU CẦU RIÊNG / MỤC TIÊU HỌC TẬP */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#566a7f] mb-1.5">
                  7. Mục tiêu học tập & Yêu cầu riêng
                </label>
                <textarea
                  rows={3}
                  maxLength={500}
                  placeholder="Ví dụ: Con đang bị mất gốc Hình học, cần gia sư kiên nhẫn giảng chậm, có bài kiểm tra ngắn đầu mỗi buổi..."
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#d9dee3] rounded-lg text-xs text-[#566a7f] focus:outline-none focus:border-[#696cff] resize-none"
                />
              </div>

              {/* NÚT SUBMIT */}
              <div className="pt-3 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#696cff] hover:bg-[#5f61e6] active:bg-[#595cd9] disabled:opacity-50 text-white font-bold rounded-xl shadow-[0_4px_12px_0_rgba(105,108,255,0.4)] transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
                >
                  {loading ? (
                    <Loader size={18} className="animate-spin" />
                  ) : (
                    <>
                      <span>GỬI YÊU CẦU TÌM GIA SƯ</span>
                      <Send size={16} />
                    </>
                  )}
                </button>
                <p className="text-center text-[11px] text-[#a1acb8] mt-2">
                  Sau khi gửi, trung tâm sẽ xử lý trong vòng 2-24h và gửi thông báo danh sách gia sư ứng tuyển phù hợp.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </PageTemplate>
  );
}
