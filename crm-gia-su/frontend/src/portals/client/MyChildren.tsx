import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
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
            {students.map((s) => (
              <div
                key={s.id}
                className="p-5 bg-white border border-gray-100 hover:border-[#696cff]/40 rounded-xl shadow-sm flex flex-col justify-between space-y-4 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-[#566a7f] text-base">{s.fullName}</h3>
                      <p className="text-xs text-[#a1acb8] mt-0.5">
                        {genderLabel(s.gender)} · {calcAge(s.dateOfBirth)} tuổi (
                        {new Date(s.dateOfBirth).toLocaleDateString('vi-VN')})
                      </p>
                    </div>
                    <span className="text-3xl shrink-0">
                      {s.gender === 'MALE' ? '👦' : s.gender === 'FEMALE' ? '👧' : '🧑'}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {s.grade && (
                      <span className="px-2.5 py-0.5 text-xs font-bold rounded-md bg-[#e7e7ff] text-[#696cff]">
                        {s.grade}
                      </span>
                    )}
                    {s.school && (
                      <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-[#f5f5f9] text-[#697a8d]">
                        {s.school}
                      </span>
                    )}
                  </div>

                  {s.notes && (
                    <p className="mt-3 text-xs text-[#697a8d] italic bg-[#f9f9fa] p-2.5 rounded-lg border-l-2 border-[#696cff]">
                      "{s.notes}"
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => openEditModal(s)}
                    className="p-2 text-[#697a8d] hover:text-[#696cff] hover:bg-[#f5f5f9] rounded-lg transition-colors cursor-pointer"
                    title="Chỉnh sửa"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(s.id, s.fullName)}
                    disabled={deletingId === s.id}
                    className="p-2 text-[#a1acb8] hover:text-[#ff3e1d] hover:bg-[#ffe0db]/40 rounded-lg transition-colors cursor-pointer"
                    title="Xóa hồ sơ"
                  >
                    {deletingId === s.id ? (
                      <Loader size={15} className="animate-spin" />
                    ) : (
                      <Trash2 size={15} />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Form */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 bg-[#233446]/40 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white border-0 rounded-xl max-w-md w-full p-6 text-left shadow-2xl relative">
              <button
                onClick={() => setModalOpen(false)}
                className="absolute top-4 right-4 text-[#a1acb8] hover:text-[#566a7f] cursor-pointer"
              >
                <X size={18} />
              </button>

              <h3 className="text-lg font-bold mb-1 text-[#566a7f]">
                {editingId ? 'Cập nhật hồ sơ học sinh' : 'Thêm hồ sơ học sinh'}
              </h3>
              <p className="text-[#a1acb8] text-xs mb-4">Điền thông tin cơ bản của con bạn</p>

              {error && (
                <div className="mb-4 p-3 bg-[#ffe0db] border border-[#ff3e1d]/40 rounded-lg text-xs font-semibold text-[#ff3e1d]">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#566a7f] mb-1">Họ và tên *</label>
                  <input
                    type="text"
                    required
                    maxLength={100}
                    placeholder="Nguyễn Văn A"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    className="w-full px-3.5 py-2 bg-[#f5f5f9] border border-[#d9dee3] rounded-lg text-xs text-[#566a7f] focus:outline-none focus:border-[#696cff]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#566a7f] mb-1">Giới tính *</label>
                    <select
                      value={form.gender}
                      onChange={(e) => setForm({ ...form, gender: e.target.value })}
                      className="w-full px-3.5 py-2 bg-[#f5f5f9] border border-[#d9dee3] rounded-lg text-xs text-[#566a7f] focus:outline-none focus:border-[#696cff]"
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
                      className="w-full px-3.5 py-2 bg-[#f5f5f9] border border-[#d9dee3] rounded-lg text-xs text-[#566a7f] focus:outline-none focus:border-[#696cff]"
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
                      className="w-full px-3.5 py-2 bg-[#f5f5f9] border border-[#d9dee3] rounded-lg text-xs text-[#566a7f] focus:outline-none focus:border-[#696cff]"
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
                      className="w-full px-3.5 py-2 bg-[#f5f5f9] border border-[#d9dee3] rounded-lg text-xs text-[#566a7f] focus:outline-none focus:border-[#696cff]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#566a7f] mb-1">Ghi chú</label>
                  <textarea
                    rows={2}
                    maxLength={500}
                    placeholder="Ví dụ: Cần kèm môn Toán hình, học lực khá..."
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="w-full px-3.5 py-2 bg-[#f5f5f9] border border-[#d9dee3] rounded-lg text-xs text-[#566a7f] focus:outline-none focus:border-[#696cff] resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="flex-1 py-2 bg-[#f5f5f9] hover:bg-gray-200 text-[#697a8d] rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-2 bg-[#696cff] hover:bg-[#5f61e6] active:bg-[#595cd9] disabled:opacity-50 text-white font-bold rounded-lg text-xs cursor-pointer shadow-[0_2px_4px_0_rgba(105,108,255,0.4)] transition-all"
                  >
                    {submitting ? (
                      <Loader size={16} className="animate-spin mx-auto" />
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
    </PageTemplate>
  );
}
