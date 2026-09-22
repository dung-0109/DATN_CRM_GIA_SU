import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { getProfilesForCurrentPortal } from '../../services/sessionStore';
import { BookOpen, User, Calendar, DollarSign, Send, ArrowLeft, Loader } from 'lucide-react';

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
    // Lấy danh sách học sinh (con) của phụ huynh từ phiên của cổng Client
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

      setSuccess('Gửi yêu cầu tìm Gia sư thành công! Đội ngũ Sales sẽ duyệt tin và liên hệ.');
      setTimeout(() => {
        navigate('/client');
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi tạo yêu cầu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-white p-6 relative overflow-hidden flex flex-col">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/5 blur-[120px]" />

      <header className="flex justify-between items-center pb-6 border-b border-indigo-900/30 relative z-10 max-w-4xl mx-auto w-full">
        <button
          onClick={() => navigate('/client')}
          className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} /> Quay lại Client Portal
        </button>
        <span className="text-sm font-semibold px-3 py-1 rounded-full bg-indigo-950 border border-indigo-800 text-indigo-400">
          Tạo Đơn Tuyển
        </span>
      </header>

      <main className="flex-1 flex justify-center items-center relative z-10 max-w-2xl mx-auto w-full py-12">
        <div className="w-full bg-slate-900/60 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
          <h2 className="text-2xl font-extrabold mb-6 tracking-tight flex items-center gap-3">
            <BookOpen className="text-indigo-400" /> Đăng ký tìm Gia sư dạy kèm
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-red-950/40 border border-red-800/40 rounded-xl text-sm text-red-400">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-emerald-950/40 border border-emerald-800/40 rounded-xl text-sm text-emerald-400">
              {success}
            </div>
          )}

          {fetchLoading ? (
            <div className="text-center py-8 text-slate-500">Đang tải biểu mẫu...</div>
          ) : students.length === 0 ? (
            <div className="py-10 text-center">
              <User size={40} className="mx-auto mb-4 text-slate-600" />
              <p className="text-sm font-semibold text-slate-300">Bạn chưa có hồ sơ học sinh nào</p>
              <p className="mt-2 text-xs text-slate-500 max-w-xs mx-auto">
                Thêm thông tin con trước khi tạo yêu cầu tìm Gia sư.
              </p>
              <div className="mt-6 flex gap-2 justify-center">
                <button
                  onClick={() => navigate('/client/children')}
                  className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Thêm hồ sơ học sinh
                </button>
                <button
                  onClick={() => navigate('/client')}
                  className="px-5 py-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  Quay lại trang chủ
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Chọn học sinh */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Chọn con học bài
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500">
                    <User size={18} />
                  </span>
                  <select
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition-all text-sm appearance-none cursor-pointer"
                  >
                    <option value="" disabled className="bg-slate-900">
                      -- Chọn con --
                    </option>
                    {students.map((std) => (
                      <option key={std.id} value={std.id} className="bg-slate-900">
                        {std.fullName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Grid Môn học & Cấp học */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Môn học
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Toán học, Vật lý"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Cấp lớp
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Lớp 10, Lớp 12"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition-all text-sm"
                  />
                </div>
              </div>

              {/* Lịch học & Số buổi */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Số buổi / tuần
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={7}
                    value={sessionsPerWeek}
                    onChange={(e) => setSessionsPerWeek(parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Học phí mong muốn / buổi
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500">
                      <DollarSign size={16} />
                    </span>
                    <input
                      type="number"
                      required
                      min={50000}
                      step={10000}
                      value={budgetPerSession}
                      onChange={(e) => setBudgetPerSession(parseInt(e.target.value))}
                      className="w-full pl-11 pr-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition-all text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Ghi chú lịch rảnh */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Lịch rảnh đề xuất (Ghi rõ ngày giờ)
                </label>
                <div className="relative">
                  <span className="absolute top-3.5 left-4 text-slate-500">
                    <Calendar size={18} />
                  </span>
                  <textarea
                    required
                    rows={3}
                    placeholder="Ví dụ: Tối Thứ 2, Thứ 4 từ 19:00 - 21:00"
                    value={scheduleNotes}
                    onChange={(e) => setScheduleNotes(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition-all text-sm resize-none"
                  />
                </div>
              </div>

              {/* Yêu cầu giới tính */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Yêu cầu giới tính Gia sư
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {['ANY', 'MALE', 'FEMALE'].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setTutorGenderPref(g)}
                      className={`py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        tutorGenderPref === g
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {g === 'ANY' ? 'Không yêu cầu' : g === 'MALE' ? 'Nam' : 'Nữ'}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:bg-indigo-800 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm cursor-pointer shadow-lg shadow-indigo-600/20"
              >
                {loading ? (
                  <Loader size={18} className="animate-spin" />
                ) : (
                  <>
                    Gửi yêu cầu <Send size={14} />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
