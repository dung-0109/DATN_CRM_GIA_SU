import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { getProfilesForCurrentPortal, setProfilesForCurrentPortal } from '../../services/sessionStore';
import { ArrowLeft, Users, Plus, Pencil, Trash2, Loader, X } from 'lucide-react';

interface Student {
  id: string;
  fullName: string;
  gender: string;
  dateOfBirth: string;
  school: string | null;
  grade: string | null;
  notes: string | null;
}

const EMPTY_FORM = {
  fullName: '',
  gender: 'MALE',
  dateOfBirth: '',
  school: '',
  grade: '',
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

  // Đồng bộ danh sách con vào phiên của cổng Client để các trang khác (RequestTutor) dùng ngay không cần đăng nhập lại
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
      /* bỏ qua lỗi đọc phiên */
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
      dateOfBirth: s.dateOfBirth.slice(0, 10),
      school: s.school || '',
      grade: s.grade || '',
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
      setError(
        err.response?.data?.message ||
          (typeof err.response?.data === 'string' ? err.response.data : '') ||
          'Có lỗi xảy ra khi lưu hồ sơ học sinh',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa hồ sơ học sinh này?')) return;
    setDeletingId(id);
    setError(null);
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
    <div className="w-full min-h-screen bg-slate-950 text-white p-6 relative overflow-hidden flex flex-col">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/5 blur-[120px]" />

      <header className="flex justify-between items-center pb-6 border-b border-indigo-900/30 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500" />
          <h1 className="text-xl font-bold tracking-tight">Con của tôi</h1>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/client"
            className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors inline-flex items-center gap-1.5"
          >
            <ArrowLeft size={14} /> Cổng Portal
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col relative z-10 max-w-4xl mx-auto w-full py-10">
        {error && !modalOpen && (
          <div className="mb-6 p-4 bg-red-950/40 border border-red-800/40 rounded-xl text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <p className="text-sm text-slate-400">
            Quản lý hồ sơ học sinh của gia đình bạn
          </p>
          <button
            onClick={openAddModal}
            className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer inline-flex items-center gap-2 shadow-lg shadow-cyan-600/20"
          >
            <Plus size={15} /> Thêm con
          </button>
        </div>

        {loading ? (
          <div className="text-center py-16 text-slate-500 text-sm flex flex-col items-center gap-3">
            <Loader size={24} className="animate-spin text-cyan-500" />
            Đang tải danh sách...
          </div>
        ) : students.length === 0 ? (
          <div className="py-16 text-center bg-slate-900/60 border border-slate-800 rounded-3xl backdrop-blur-md">
            <Users size={44} className="mx-auto mb-4 text-slate-600" />
            <p className="text-base font-semibold text-slate-300">Chưa có hồ sơ học sinh nào</p>
            <p className="mt-2 text-xs text-slate-500 max-w-xs mx-auto">
              Thêm thông tin con để bắt đầu đăng ký tìm Gia sư phù hợp.
            </p>
            <button
              onClick={openAddModal}
              className="mt-6 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <Plus size={15} /> Thêm con ngay
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {students.map((s) => (
              <div
                key={s.id}
                className="p-5 bg-slate-900/60 border border-slate-800 rounded-3xl backdrop-blur-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-white">{s.fullName}</h3>
                      <p className="text-xs text-slate-400 mt-1">
                        {genderLabel(s.gender)} · {calcAge(s.dateOfBirth)} tuổi
                        ({new Date(s.dateOfBirth).toLocaleDateString('vi-VN')})
                      </p>
                    </div>
                    <span className="text-2xl shrink-0">
                      {s.gender === 'MALE' ? '👦' : s.gender === 'FEMALE' ? '👧' : '🧑'}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {s.grade && (
                      <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300">
                        {s.grade}
                      </span>
                    )}
                    {s.school && (
                      <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-slate-800 border border-slate-700 text-slate-300 truncate max-w-[200px]">
                        {s.school}
                      </span>
                    )}
                  </div>
                  {s.notes && (
                    <p className="mt-3 text-xs text-slate-500 italic line-clamp-2">"{s.notes}"</p>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-800 flex gap-2 justify-end">
                  <button
                    onClick={() => openEditModal(s)}
                    className="px-3 py-2 bg-slate-950 border border-slate-800 hover:border-indigo-600 text-slate-400 hover:text-white rounded-xl text-xs font-semibold cursor-pointer inline-flex items-center gap-1.5 transition-all"
                  >
                    <Pencil size={13} /> Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(s.id)}
                    disabled={deletingId === s.id}
                    className="px-3 py-2 bg-slate-950 border border-red-900/50 hover:border-red-500 text-red-400 hover:text-red-300 rounded-xl text-xs font-semibold cursor-pointer inline-flex items-center gap-1.5 transition-all disabled:opacity-50"
                  >
                    {deletingId === s.id ? (
                      <Loader size={13} className="animate-spin" />
                    ) : (
                      <Trash2 size={13} />
                    )}
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal thêm / sửa học sinh */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white cursor-pointer transition-colors"
            >
              <X size={18} />
            </button>
            <h3 className="text-lg font-bold mb-1">
              {editingId ? 'Cập nhật hồ sơ học sinh' : 'Thêm hồ sơ học sinh'}
            </h3>
            <p className="text-slate-400 text-xs mb-5">
              Điền thông tin cơ bản của con bạn
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-950/40 border border-red-800/40 rounded-xl text-xs text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Họ và tên *
                </label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  placeholder="Nguyễn Văn A"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Giới tính *
                  </label>
                  <select
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500 appearance-none cursor-pointer"
                  >
                    <option value="MALE" className="bg-slate-900">Nam</option>
                    <option value="FEMALE" className="bg-slate-900">Nữ</option>
                    <option value="OTHER" className="bg-slate-900">Khác</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Ngày sinh *
                  </label>
                  <input
                    type="date"
                    required
                    value={form.dateOfBirth}
                    onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500 transition-all [color-scheme:dark]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Trường đang học
                  </label>
                  <input
                    type="text"
                    maxLength={150}
                    placeholder="THCS Chu Văn An"
                    value={form.school}
                    onChange={(e) => setForm({ ...form, school: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Lớp hiện tại
                  </label>
                  <input
                    type="text"
                    maxLength={20}
                    placeholder="Lớp 9"
                    value={form.grade}
                    onChange={(e) => setForm({ ...form, grade: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Ghi chú
                </label>
                <textarea
                  rows={2}
                  maxLength={500}
                  placeholder="Ví dụ: Cần kèm cặp môn Toán..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-all resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-950/60 border border-slate-800 hover:border-slate-700 font-semibold rounded-xl text-sm cursor-pointer transition-all text-slate-400 hover:text-white"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-800 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm cursor-pointer"
                >
                  {submitting ? (
                    <Loader size={16} className="animate-spin" />
                  ) : editingId ? (
                    'Lưu thay đổi'
                  ) : (
                    'Thêm mới'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
