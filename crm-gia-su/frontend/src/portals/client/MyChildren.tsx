import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { getProfilesForCurrentPortal, setProfilesForCurrentPortal } from '../../services/sessionStore';
import { Users, Plus, Pencil, Trash2, Loader, X, ArrowLeft } from 'lucide-react';
import PageTemplate from '../../components/PageTemplate';

interface Student {
  id: string;
  fullName: string;
  gender: string;
  dateOfBirth: string;
  school: string | null;
  grade: string | null;
  subjectsNeeded: string | null;
  learningStyle: string | null;
  academicLevel: string | null;
  targetGoal: string | null;
  personalityTraits: string | null;
  notes: string | null;
  classes?: any[];
  tutorRequests?: any[];
}

const EMPTY_FORM = {
  fullName: '',
  gender: 'MALE',
  dateOfBirth: '',
  school: '',
  grade: '',
  subjectsNeeded: '',
  learningStyle: '',
  academicLevel: 'AVERAGE',
  targetGoal: '',
  personalityTraits: '',
  notes: '',
};

export default function MyChildren() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const syncProfiles = (list: Student[]) => {
    try {
      const profiles = getProfilesForCurrentPortal();
      const nonStudents = profiles.filter((p: any) => p.subType !== 'STUDENT');
      const studentProfiles = list.map((s) => ({
        id: s.id,
        name: `${s.fullName} (Học sinh)`,
        type: 'PARENT',
        subType: 'STUDENT',
      }));
      setProfilesForCurrentPortal([...nonStudents, ...studentProfiles]);
    } catch {
      /* ignore */
    }
  };

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/v1/students');
      const list: Student[] = res.data ?? [];
      setStudents(list);
      syncProfiles(list);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải danh sách học sinh');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const openAddModal = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setError(null);
    setModalOpen(true);
  };

  const openEditModal = (s: Student) => {
    setEditingId(s.id);
    setForm({
      fullName: s.fullName,
      gender: s.gender,
      dateOfBirth: s.dateOfBirth ? s.dateOfBirth.slice(0, 10) : '',
      school: s.school || '',
      grade: s.grade || '',
      subjectsNeeded: s.subjectsNeeded || '',
      learningStyle: s.learningStyle || '',
      academicLevel: s.academicLevel || 'AVERAGE',
      targetGoal: s.targetGoal || '',
      personalityTraits: s.personalityTraits || '',
      notes: s.notes || '',
    });
    setError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (editingId) {
        await api.put(`/api/v1/students/${editingId}`, form);
      } else {
        await api.post('/api/v1/students', form);
      }
      setModalOpen(false);
      await fetchStudents();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể lưu hồ sơ học sinh');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc muốn xóa hồ sơ của bé ${name}?`)) return;
    setDeletingId(id);
    try {
      await api.delete(`/api/v1/students/${id}`);
      await fetchStudents();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể xóa hồ sơ học sinh');
    } finally {
      setDeletingId(null);
    }
  };

  const calcAge = (dob: string) => {
    if (!dob) return 0;
    const birth = new Date(dob);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
    return age;
  };

  const genderLabel = (g: string) =>
    g === 'MALE' ? 'Nam' : g === 'FEMALE' ? 'Nữ' : 'Khác';

  return (
    <PageTemplate
      title="Con Của Tôi"
      subtitle="Quản lý thông tin hồ sơ học sinh của gia đình"
      badge="Client Portal"
    >
      <div className="w-full space-y-6 text-left font-sans text-[#566a7f]">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Link
            to="/client"
            className="text-xs font-semibold text-[#697a8d] hover:text-[#696cff] bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft size={14} /> Quay lại Client Portal
          </Link>

          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-[#696cff] hover:bg-[#5f61e6] text-white text-xs font-bold rounded-lg transition-all cursor-pointer inline-flex items-center gap-2 shadow-[0_2px_4px_0_rgba(105,108,255,0.4)]"
          >
            <Plus size={16} /> Thêm con
          </button>
        </div>

        {error && !modalOpen && (
          <div className="p-4 bg-[#ffe0db] border border-[#ff3e1d]/40 rounded-xl text-xs font-semibold text-[#ff3e1d]">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-16 text-[#a1acb8] text-sm flex flex-col items-center gap-3">
            <Loader size={28} className="animate-spin text-[#696cff]" />
            Đang tải danh sách học sinh...
          </div>
        ) : students.length === 0 ? (
          <div className="py-16 text-center bg-white border border-gray-100 rounded-xl shadow-sm space-y-3">
            <Users size={48} className="mx-auto text-[#a1acb8]" />
            <p className="text-base font-bold text-[#566a7f]">Chưa có hồ sơ học sinh nào</p>
            <p className="text-xs text-[#a1acb8] max-w-xs mx-auto">
              Thêm thông tin con để bắt đầu đăng ký tìm Gia sư phù hợp.
            </p>
            <button
              onClick={openAddModal}
              className="mt-2 px-5 py-2.5 bg-[#696cff] hover:bg-[#5f61e6] text-white text-xs font-bold rounded-lg shadow-[0_2px_4px_0_rgba(105,108,255,0.4)] cursor-pointer inline-flex items-center gap-2"
            >
              <Plus size={15} /> Thêm con ngay
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {students.map((s) => {
              const classCount = s.classes?.length || 0;
              const requestCount = s.tutorRequests?.length || 0;
              const hasClasses = classCount > 0;
              const hasRequests = requestCount > 0;

              return (
                <div
                  key={s.id}
                  className="p-5 bg-white border border-gray-100 hover:border-[#696cff]/40 rounded-xl shadow-sm flex flex-col justify-between space-y-4 transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-[#566a7f] text-base uppercase">{s.fullName}</h3>
                        <p className="text-xs text-[#a1acb8] mt-0.5">
                          {genderLabel(s.gender)} · {calcAge(s.dateOfBirth)} tuổi {s.grade ? `· ${s.grade}` : ''} {s.school ? `- ${s.school}` : ''}
                        </p>
                        
                        {/* Status Badge */}
                        <div className="mt-2">
                          {hasClasses ? (
                            <span className="text-[11px] font-bold text-[#71dd37] bg-[#e8fadf] px-2 py-1 rounded shadow-sm inline-flex items-center">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#71dd37] mr-1.5 animate-pulse"></span>
                              Đang học {classCount} lớp
                            </span>
                          ) : hasRequests ? (
                            <span className="text-[11px] font-bold text-[#ffab00] bg-[#fff2d6] px-2 py-1 rounded shadow-sm inline-flex items-center">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#ffab00] mr-1.5"></span>
                              Đang chờ ghép {requestCount} yêu cầu
                            </span>
                          ) : (
                            <span className="text-[11px] font-bold text-[#8592a3] bg-[#f8f9fa] px-2 py-1 rounded shadow-sm inline-flex items-center border border-gray-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#8592a3] mr-1.5"></span>
                              Chưa đăng ký gia sư
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-4xl shrink-0 drop-shadow-sm">
                        {s.gender === 'MALE' ? '👦' : s.gender === 'FEMALE' ? '👧' : '🧑'}
                      </span>
                    </div>

                    <div className="mt-4 text-xs text-[#566a7f] space-y-1.5">
                      <p className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-[#697a8d]">Học lực: </span>
                        {s.academicLevel === 'WEAK' ? (
                          <span className="px-2 py-0.5 rounded font-bold text-[11px] bg-[#ffe0db] text-[#ff3e1d]">Mất gốc / Yếu</span>
                        ) : s.academicLevel === 'GOOD' ? (
                          <span className="px-2 py-0.5 rounded font-bold text-[11px] bg-[#e8fadf] text-[#71dd37]">Học lực Khá</span>
                        ) : s.academicLevel === 'EXCELLENT' ? (
                          <span className="px-2 py-0.5 rounded font-bold text-[11px] bg-[#e7e7ff] text-[#696cff]">Giỏi / Xuất sắc</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded font-bold text-[11px] bg-[#fff8e1] text-[#ffab00]">Học lực Trung bình</span>
                        )}
                      </p>

                      <p>
                        <span className="font-semibold text-[#697a8d]">Môn cần kèm: </span>
                        {s.subjectsNeeded ? (
                          <span className="font-bold text-[#696cff]">{s.subjectsNeeded}</span>
                        ) : (
                          <span className="text-[#a1acb8] italic">Chưa cập nhật</span>
                        )}
                      </p>

                      {s.targetGoal && (
                        <p>
                          <span className="font-semibold text-[#697a8d]">Mục tiêu: </span>
                          <span className="font-medium text-[#566a7f]">{s.targetGoal}</span>
                        </p>
                      )}

                      {(s.personalityTraits || s.learningStyle) && (
                        <p>
                          <span className="font-semibold text-[#697a8d]">Tính cách: </span>
                          <span>{s.personalityTraits || s.learningStyle}</span>
                        </p>
                      )}
                    </div>

                    {s.notes && (
                      <p className="mt-3 text-xs text-[#697a8d] italic bg-[#f5f5f9] p-2.5 rounded-lg border-l-2 border-[#8592a3]">
                        {s.notes}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(s)}
                        className="p-1.5 text-[#697a8d] hover:text-[#696cff] hover:bg-[#f5f5f9] rounded-lg transition-colors cursor-pointer"
                        title="Chỉnh sửa hồ sơ"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(s.id, s.fullName)}
                        disabled={deletingId === s.id}
                        className="p-1.5 text-[#a1acb8] hover:text-[#ff3e1d] hover:bg-[#ffe0db]/40 rounded-lg transition-colors cursor-pointer"
                        title="Xóa hồ sơ"
                      >
                        {deletingId === s.id ? (
                          <Loader size={15} className="animate-spin" />
                        ) : (
                          <Trash2 size={15} />
                        )}
                      </button>
                    </div>
                    
                    <button
                      onClick={() => {
                        navigate(`/client/request-tutor?studentId=${s.id}`);
                      }}
                      className="px-3 py-1.5 text-[#696cff] bg-[#e7e7ff] hover:bg-[#d9d9ff] font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus size={14} strokeWidth={3} /> Đăng ký gia sư
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal Form */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 bg-[#233446]/40 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white border-0 rounded-xl max-w-xl w-full p-6 text-left shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
              <button
                onClick={() => setModalOpen(false)}
                className="absolute top-4 right-4 text-[#a1acb8] hover:text-[#566a7f] cursor-pointer"
              >
                <X size={18} />
              </button>

              <h3 className="text-xl font-bold mb-1 text-[#566a7f]">
                {editingId ? 'Cập nhật hồ sơ học sinh' : 'Thêm hồ sơ học sinh'}
              </h3>
              <p className="text-[#a1acb8] text-xs mb-5">
                Thông tin càng chi tiết, trung tâm càng dễ dàng ghép nối gia sư phù hợp nhất cho bé.
              </p>

              {error && (
                <div className="mb-4 p-3 bg-[#ffe0db] border border-[#ff3e1d]/40 rounded-lg text-xs font-semibold text-[#ff3e1d]">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* THÔNG TIN CƠ BẢN */}
                <div>
                  <h4 className="text-xs font-bold text-[#696cff] uppercase mb-2 border-b border-gray-100 pb-1">I. Thông tin cơ bản</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#566a7f] mb-1">Họ và tên *</label>
                      <input
                        type="text"
                        required
                        maxLength={100}
                        placeholder="Nguyễn Văn A"
                        value={form.fullName}
                        onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                        className="w-full px-3.5 py-2 bg-white border border-[#d9dee3] rounded-lg text-sm text-[#566a7f] focus:outline-none focus:border-[#696cff] focus:ring-1 focus:ring-[#696cff]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-[#566a7f] mb-1">Giới tính *</label>
                        <select
                          value={form.gender}
                          onChange={(e) => setForm({ ...form, gender: e.target.value })}
                          className="w-full px-3.5 py-2 bg-white border border-[#d9dee3] rounded-lg text-sm text-[#566a7f] focus:outline-none focus:border-[#696cff]"
                        >
                          <option value="MALE">Nam</option>
                          <option value="FEMALE">Nữ</option>
                          <option value="OTHER">Khác</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#566a7f] mb-1">Ngày sinh *</label>
                        <input
                          type="date"
                          required
                          value={form.dateOfBirth}
                          onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                          className="w-full px-3.5 py-2 bg-white border border-[#d9dee3] rounded-lg text-sm text-[#566a7f] focus:outline-none focus:border-[#696cff]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-[#566a7f] mb-1">Trường đang học</label>
                        <input
                          type="text"
                          maxLength={150}
                          placeholder="THCS Cầu Giấy..."
                          value={form.school}
                          onChange={(e) => setForm({ ...form, school: e.target.value })}
                          className="w-full px-3.5 py-2 bg-white border border-[#d9dee3] rounded-lg text-sm text-[#566a7f] focus:outline-none focus:border-[#696cff]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#566a7f] mb-1">Lớp hiện tại</label>
                        <input
                          type="text"
                          maxLength={20}
                          placeholder="Lớp 9"
                          value={form.grade}
                          onChange={(e) => setForm({ ...form, grade: e.target.value })}
                          className="w-full px-3.5 py-2 bg-white border border-[#d9dee3] rounded-lg text-sm text-[#566a7f] focus:outline-none focus:border-[#696cff]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* THÔNG TIN HỌC TẬP ĐỂ MATCHING */}
                <div>
                  <h4 className="text-xs font-bold text-[#696cff] uppercase mb-2 border-b border-gray-100 pb-1 mt-4">II. Thông tin học tập & Tiêu chí Matching</h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-[#566a7f] mb-1">Học lực hiện tại</label>
                        <select
                          value={form.academicLevel}
                          onChange={(e) => setForm({ ...form, academicLevel: e.target.value })}
                          className="w-full px-3.5 py-2 bg-white border border-[#d9dee3] rounded-lg text-sm text-[#566a7f] focus:outline-none focus:border-[#696cff]"
                        >
                          <option value="WEAK">Mất gốc / Yếu kém</option>
                          <option value="AVERAGE">Trung bình (cần củng cố)</option>
                          <option value="GOOD">Khá (cần nâng cao)</option>
                          <option value="EXCELLENT">Giỏi / Luyện thi HSG</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#566a7f] mb-1">Môn học cần kèm (Tags)</label>
                        <input
                          type="text"
                          maxLength={255}
                          placeholder="Toán Hình, Tiếng Anh..."
                          value={form.subjectsNeeded}
                          onChange={(e) => setForm({ ...form, subjectsNeeded: e.target.value })}
                          className="w-full px-3.5 py-2 bg-white border border-[#d9dee3] rounded-lg text-sm text-[#566a7f] focus:outline-none focus:border-[#696cff]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#566a7f] mb-1">Mục tiêu học tập cụ thể</label>
                      <input
                        type="text"
                        maxLength={255}
                        placeholder="Ví dụ: Thi vào 10 chuyên, Luyện thi THPTQG, Lấy lại gốc cấp tốc..."
                        value={form.targetGoal}
                        onChange={(e) => setForm({ ...form, targetGoal: e.target.value })}
                        className="w-full px-3.5 py-2 bg-white border border-[#d9dee3] rounded-lg text-sm text-[#566a7f] focus:outline-none focus:border-[#696cff]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#566a7f] mb-1">Tính cách / Đặc điểm tâm lý</label>
                      <input
                        type="text"
                        maxLength={255}
                        placeholder="Ví dụ: Nhút nhát ngại hỏi, Hiếu động, Cần gia sư kiên nhẫn, Tự giác..."
                        value={form.personalityTraits || form.learningStyle}
                        onChange={(e) => setForm({ ...form, personalityTraits: e.target.value, learningStyle: e.target.value })}
                        className="w-full px-3.5 py-2 bg-white border border-[#d9dee3] rounded-lg text-sm text-[#566a7f] focus:outline-none focus:border-[#696cff]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#566a7f] mb-1">Ghi chú thêm cho Giáo vụ</label>
                      <textarea
                        rows={2}
                        maxLength={500}
                        placeholder="Yêu cầu riêng về phương pháp giảng dạy..."
                        value={form.notes}
                        onChange={(e) => setForm({ ...form, notes: e.target.value })}
                        className="w-full px-3.5 py-2 bg-white border border-[#d9dee3] rounded-lg text-sm text-[#566a7f] focus:outline-none focus:border-[#696cff] resize-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="flex-1 py-2.5 bg-[#f5f5f9] hover:bg-gray-200 text-[#697a8d] rounded-lg text-sm font-semibold cursor-pointer transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-2.5 bg-[#696cff] hover:bg-[#5f61e6] active:bg-[#595cd9] disabled:opacity-50 text-white font-bold rounded-lg text-sm cursor-pointer shadow-[0_2px_4px_0_rgba(105,108,255,0.4)] transition-all"
                  >
                    {submitting ? (
                      <Loader size={18} className="animate-spin mx-auto" />
                    ) : editingId ? (
                      'Lưu thay đổi'
                    ) : (
                      'Lưu hồ sơ mới'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PageTemplate>
  );
}
