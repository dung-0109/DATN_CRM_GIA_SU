import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { getProfilesForCurrentPortal } from '../../services/sessionStore';
import { BookOpen, User, Calendar, DollarSign, Send, ArrowLeft, Loader } from 'lucide-react';
import PageTemplate from '../../components/PageTemplate';

export default function RequestTutor() {
  const [students, setStudents] = useState<any[]>([]);
  const [studentId, setStudentId] = useState('');
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('');
  const [scheduleNotes, setScheduleNotes] = useState('');
  const [sessionsPerWeek, setSessionsPerWeek] = useState(2);
  const [budgetPerSession, setBudgetPerSession] = useState(200000);
  const [tutorGenderPref, setTutorGenderPref] = useState('ANY');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudents = () => {
      try {
        const userProfiles = getProfilesForCurrentPortal();
        const studentProfiles = userProfiles.filter((p: any) => p.subType === 'STUDENT');
        setStudents(studentProfiles.map((p: any) => ({ id: p.id, fullName: p.name })));
      } catch (err) {
        console.error('Không thể lấy danh sách học sinh', err);
      } finally {
        setFetchLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!studentId) {
      setError('Vui lòng chọn con sẽ học bài');
      return;
    }

    setLoading(true);

    try {
      await api.post('/api/v1/tutor-requests', {
        studentId,
        subject,
        grade,
        scheduleNotes,
        sessionsPerWeek,
        budgetPerSession,
        tutorGenderPref,
      });

      setSuccess('Gửi yêu cầu tìm Gia sư thành công! Đội ngũ Sales sẽ duyệt tin và điều phối.');
      setTimeout(() => {
        navigate('/client');
      }, 2500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi tạo yêu cầu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTemplate
      title="Đăng Ký Tìm Gia Sư"
      subtitle="Tạo yêu cầu tìm gia sư dạy kèm theo nhu cầu học tập của con"
      badge="Client Portal"
    >
      <div className="max-w-2xl mx-auto w-full space-y-6 text-left font-sans text-[#566a7f]">
        <div className="flex items-center justify-between">
          <Link
            to="/client"
            className="text-xs font-semibold text-[#697a8d] hover:text-[#696cff] bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft size={14} /> Quay lại Client Portal
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-[#e7e7ff] text-[#696cff] flex items-center justify-center font-bold">
              <BookOpen size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#566a7f]">Đăng ký tìm Gia sư dạy kèm</h2>
              <p className="text-xs text-[#a1acb8]">Trung tâm sẽ tiếp nhận và tiến hành so khớp gia sư phù hợp</p>
            </div>
          </div>

          {error && (
            <div className="p-3.5 bg-[#ffe0db] border border-[#ff3e1d]/40 rounded-lg text-xs font-semibold text-[#ff3e1d]">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3.5 bg-[#e8fadf] border border-[#71dd37]/40 rounded-lg text-xs font-semibold text-[#71dd37]">
              {success}
            </div>
          )}

          {fetchLoading ? (
            <div className="text-center py-12 text-[#a1acb8] text-sm">Đang tải biểu mẫu...</div>
          ) : students.length === 0 ? (
            <div className="py-10 text-center space-y-3">
              <User size={40} className="mx-auto text-[#a1acb8]" />
              <p className="text-sm font-bold text-[#566a7f]">Bạn chưa có hồ sơ học sinh nào</p>
              <p className="text-xs text-[#a1acb8] max-w-xs mx-auto">
                Thêm thông tin con trước khi tạo yêu cầu tìm Gia sư.
              </p>
              <div className="pt-2 flex gap-3 justify-center">
                <button
                  onClick={() => navigate('/client/children')}
                  className="px-4 py-2 bg-[#696cff] hover:bg-[#5f61e6] text-white rounded-lg text-xs font-bold transition-all shadow-[0_2px_4px_0_rgba(105,108,255,0.4)] cursor-pointer"
                >
                  Thêm hồ sơ học sinh
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#566a7f] mb-1.5">
                  Chọn con học bài *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#a1acb8]">
                    <User size={16} />
                  </span>
                  <select
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#f5f5f9] border border-[#d9dee3] rounded-lg text-xs text-[#566a7f] focus:outline-none focus:border-[#696cff] cursor-pointer"
                  >
                    <option value="" disabled>
                      -- Chọn con --
                    </option>
                    {students.map((std) => (
                      <option key={std.id} value={std.id}>
                        {std.fullName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#566a7f] mb-1.5">Môn học *</label>
                  <input
                    type="text"
                    required
                    placeholder="Toán học, Tiếng Anh..."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#f5f5f9] border border-[#d9dee3] rounded-lg text-xs text-[#566a7f] focus:outline-none focus:border-[#696cff]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#566a7f] mb-1.5">Cấp lớp *</label>
                  <input
                    type="text"
                    required
                    placeholder="Lớp 9, Lớp 12..."
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#f5f5f9] border border-[#d9dee3] rounded-lg text-xs text-[#566a7f] focus:outline-none focus:border-[#696cff]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#566a7f] mb-1.5">Số buổi / tuần</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={7}
                    value={sessionsPerWeek}
                    onChange={(e) => setSessionsPerWeek(parseInt(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#f5f5f9] border border-[#d9dee3] rounded-lg text-xs text-[#566a7f] focus:outline-none focus:border-[#696cff]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#566a7f] mb-1.5">Học phí đề xuất / buổi</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#a1acb8]">
                      <DollarSign size={15} />
                    </span>
                    <input
                      type="number"
                      required
                      min={50000}
                      step={10000}
                      value={budgetPerSession}
                      onChange={(e) => setBudgetPerSession(parseInt(e.target.value))}
                      className="w-full pl-9 pr-4 py-2.5 bg-[#f5f5f9] border border-[#d9dee3] rounded-lg text-xs text-[#566a7f] focus:outline-none focus:border-[#696cff]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#566a7f] mb-1.5">
                  Lịch rảnh đề xuất (Ngày và giờ) *
                </label>
                <div className="relative">
                  <span className="absolute top-3 left-3.5 text-[#a1acb8]">
                    <Calendar size={16} />
                  </span>
                  <textarea
                    required
                    rows={2}
                    placeholder="Ví dụ: Tối Thứ 3, Thứ 6 từ 19:30 - 21:00..."
                    value={scheduleNotes}
                    onChange={(e) => setScheduleNotes(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-[#f5f5f9] border border-[#d9dee3] rounded-lg text-xs text-[#566a7f] focus:outline-none focus:border-[#696cff] resize-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#566a7f] mb-1.5">
                  Yêu cầu giới tính Gia sư
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { val: 'ANY', label: 'Không yêu cầu' },
                    { val: 'MALE', label: 'Nam' },
                    { val: 'FEMALE', label: 'Nữ' },
                  ].map((g) => (
                    <button
                      key={g.val}
                      type="button"
                      onClick={() => setTutorGenderPref(g.val)}
                      className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                        tutorGenderPref === g.val
                          ? 'bg-[#696cff]/10 border-[#696cff] text-[#696cff]'
                          : 'bg-[#f5f5f9] border-[#d9dee3] text-[#697a8d] hover:border-gray-400'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-[#696cff] hover:bg-[#5f61e6] active:bg-[#595cd9] disabled:opacity-50 text-white font-bold rounded-lg shadow-[0_2px_4px_0_rgba(105,108,255,0.4)] transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
                >
                  {loading ? (
                    <Loader size={18} className="animate-spin" />
                  ) : (
                    <>
                      <span>Gửi Yêu Cầu Tìm Gia Sư</span>
                      <Send size={14} />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </PageTemplate>
  );
}
