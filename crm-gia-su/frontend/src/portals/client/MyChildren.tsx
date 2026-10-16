import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { getProfilesForCurrentPortal, setProfilesForCurrentPortal } from '../../services/sessionStore';
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  Loader,
  X,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Tag,
  Check,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
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
  academicLevel: 'AVERAGE',
  targetGoal: '',
  personalityTraits: '',
  notes: '',
};

const POPULAR_SUBJECTS = [
  'Toán',
  'Ngữ Văn',
  'Tiếng Anh',
  'Vật Lý',
  'Hóa Học',
  'Sinh Học',
  'Lịch Sử',
  'Địa Lý',
  'Tin Học',
  'Rèn chữ đẹp',
  'Tiếng Việt',
  'Khoa học tự nhiên',
];

const GOAL_SUGGESTIONS = [
  'Lấy lại kiến thức căn bản',
  'Thi vào 10 trường công lập',
  'Luyện thi Chuyên / Chọn',
  'Luyện thi Đại học / ĐGNL',
  'Bồi dưỡng Học sinh giỏi',
  'Nâng cao điểm số trên lớp',
  'Rèn luyện tính tự giác học tập',
];

const PERSONALITY_SUGGESTIONS = [
  'Nhút nhát, ngại hỏi',
  'Hiếu động, hay mất tập trung',
  'Tiếp thu nhanh nhưng hay ẩu',
  'Cần gia sư kiên nhẫn & động viên',
  'Tự giác, chăm chỉ',
  'Cần gia sư nghiêm khắc, kỷ luật',
];

export default function MyChildren() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [customSubjectInput, setCustomSubjectInput] = useState('');
  const [initialStateSnapshot, setInitialStateSnapshot] = useState<string>('');

  // Validation
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  // Operation states
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Popups
  const [showUnsavedExitModal, setShowUnsavedExitModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdStudentInfo, setCreatedStudentInfo] = useState<{ id: string; fullName: string } | null>(null);

  const navigate = useNavigate();

  // Helper tính tuổi chuẩn xác
  const calculateAge = useCallback((dob: string): number | null => {
    if (!dob) return null;
    const birth = new Date(dob);
    if (isNaN(birth.getTime())) return null;
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
    return age;
  }, []);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const minDateStr = useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 30);
    return d.toISOString().split('T')[0];
  }, []);

  // Dirty check: kiểm tra form có thay đổi so với lúc mở modal
  const isDirty = useMemo(() => {
    if (!modalOpen) return false;
    const currentSnapshot = JSON.stringify({ form, selectedSubjects });
    return currentSnapshot !== initialStateSnapshot;
  }, [modalOpen, form, selectedSubjects, initialStateSnapshot]);

  // Validation logic
  const validateField = (name: string, value: any, currentForm = form) => {
    let err = '';
    if (name === 'fullName') {
      const trimmed = (value || '').trim();
      if (!trimmed) {
        err = 'Họ và tên học sinh không được để trống';
      } else if (trimmed.length < 2) {
        err = 'Họ và tên phải có ít nhất 2 ký tự';
      } else if (trimmed.length > 100) {
        err = 'Họ và tên tối đa 100 ký tự';
      }
    }

    if (name === 'gender') {
      if (!value) {
        err = 'Vui lòng chọn giới tính của con';
      }
    }

    if (name === 'dateOfBirth') {
      if (!value) {
        err = 'Vui lòng chọn ngày sinh của con';
      } else {
        const dob = new Date(value);
        const now = new Date();
        if (dob > now) {
          err = 'Ngày sinh không được ở tương lai';
        } else {
          const age = calculateAge(value);
          if (age === null || age < 4 || age > 25) {
            err = `Độ tuổi hợp lệ của học sinh là từ 4 đến 25 tuổi (hiện tại: ${age ?? 0} tuổi)`;
          }
        }
      }
    }

    if (name === 'school' && value && value.length > 150) {
      err = 'Tên trường tối đa 150 ký tự';
    }

    if (name === 'grade' && value && value.length > 20) {
      err = 'Khối lớp tối đa 20 ký tự';
    }

    return err;
  };

  const validateAll = () => {
    const newErrors: { [key: string]: string } = {};
    const nameErr = validateField('fullName', form.fullName);
    if (nameErr) newErrors.fullName = nameErr;

    const genderErr = validateField('gender', form.gender);
    if (genderErr) newErrors.gender = genderErr;

    const dobErr = validateField('dateOfBirth', form.dateOfBirth);
    if (dobErr) newErrors.dateOfBirth = dobErr;

    const schoolErr = validateField('school', form.school);
    if (schoolErr) newErrors.school = schoolErr;

    const gradeErr = validateField('grade', form.grade);
    if (gradeErr) newErrors.grade = gradeErr;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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
      setGlobalError(err.response?.data?.message || 'Không thể tải danh sách học sinh');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const openAddModal = () => {
    setEditingId(null);
    const initialF = { ...EMPTY_FORM };
    const initialSubs: string[] = [];
    setForm(initialF);
    setSelectedSubjects(initialSubs);
    setCustomSubjectInput('');
    setErrors({});
    setTouched({});
    setGlobalError(null);
    setInitialStateSnapshot(JSON.stringify({ form: initialF, selectedSubjects: initialSubs }));
    setModalOpen(true);
  };

  const openEditModal = (s: Student) => {
    setEditingId(s.id);
    const initialF = {
      fullName: s.fullName,
      gender: s.gender,
      dateOfBirth: s.dateOfBirth ? s.dateOfBirth.slice(0, 10) : '',
      school: s.school || '',
      grade: s.grade || '',
      academicLevel: s.academicLevel || 'AVERAGE',
      targetGoal: s.targetGoal || '',
      personalityTraits: s.personalityTraits || s.learningStyle || '',
      notes: s.notes || '',
    };
    const parsedSubs = s.subjectsNeeded
      ? s.subjectsNeeded
          .split(',')
          .map((sub) => sub.trim())
          .filter(Boolean)
      : [];
    setForm(initialF);
    setSelectedSubjects(parsedSubs);
    setCustomSubjectInput('');
    setErrors({});
    setTouched({});
    setGlobalError(null);
    setInitialStateSnapshot(JSON.stringify({ form: initialF, selectedSubjects: parsedSubs }));
    setModalOpen(true);
  };

  const handleRequestClose = () => {
    if (isDirty) {
      setShowUnsavedExitModal(true);
    } else {
      setModalOpen(false);
    }
  };

  // Thao tác Tag môn học
  const toggleSubject = (sub: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(sub) ? prev.filter((item) => item !== sub) : [...prev, sub]
    );
  };

  const handleAddCustomSubject = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = customSubjectInput.trim();
    if (!trimmed) return;
    if (!selectedSubjects.includes(trimmed)) {
      setSelectedSubjects((prev) => [...prev, trimmed]);
    }
    setCustomSubjectInput('');
  };

  const removeSubject = (sub: string) => {
    setSelectedSubjects((prev) => prev.filter((item) => item !== sub));
  };

  // Gợi ý mục tiêu
  const handleSelectGoalSuggestion = (goal: string) => {
    setForm((prev) => {
      if (!prev.targetGoal) return { ...prev, targetGoal: goal };
      if (prev.targetGoal.includes(goal)) return prev;
      return { ...prev, targetGoal: `${prev.targetGoal}; ${goal}` };
    });
  };

  // Gợi ý tính cách
  const handleSelectPersonalitySuggestion = (trait: string) => {
    setForm((prev) => {
      if (!prev.personalityTraits) return { ...prev, personalityTraits: trait };
      if (prev.personalityTraits.includes(trait)) return prev;
      return { ...prev, personalityTraits: `${prev.personalityTraits}; ${trait}` };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);

    // Đánh dấu tất cả trường bắt buộc đã chạm để hiển thị lỗi
    setTouched({
      fullName: true,
      gender: true,
      dateOfBirth: true,
      school: true,
      grade: true,
    });

    if (!validateAll()) {
      toast.error('Vui lòng kiểm tra lại các trường thông tin bắt buộc');
      return;
    }

    setSubmitting(true);

    const payload = {
      fullName: form.fullName.trim(),
      gender: form.gender,
      dateOfBirth: form.dateOfBirth,
      school: form.school.trim() || undefined,
      grade: form.grade.trim() || undefined,
      subjectsNeeded: selectedSubjects.length > 0 ? selectedSubjects.join(', ') : undefined,
      learningStyle: form.personalityTraits.trim() || undefined,
      academicLevel: form.academicLevel || undefined,
      targetGoal: form.targetGoal.trim() || undefined,
      personalityTraits: form.personalityTraits.trim() || undefined,
      notes: form.notes.trim() || undefined,
    };

    try {
      if (editingId) {
        await api.put(`/api/v1/students/${editingId}`, payload);
        toast.success('Cập nhật hồ sơ học sinh thành công!');
        setModalOpen(false);
        await fetchStudents();
      } else {
        const res = await api.post('/api/v1/students', payload);
        const created = res.data?.student || { id: res.data?.id, fullName: payload.fullName };
        toast.success('Thêm hồ sơ con thành công!');
        setModalOpen(false);
        await fetchStudents();

        // Mở Popup 3: Hỏi có muốn đăng ký gia sư ngay không
        if (created?.id) {
          setCreatedStudentInfo({ id: created.id, fullName: payload.fullName });
          setShowSuccessModal(true);
        }
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Không thể lưu hồ sơ học sinh';
      setGlobalError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc muốn xóa hồ sơ của bé ${name}?`)) return;
    setDeletingId(id);
    try {
      await api.delete(`/api/v1/students/${id}`);
      toast.success(`Đã xóa hồ sơ của bé ${name}`);
      await fetchStudents();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể xóa hồ sơ học sinh');
    } finally {
      setDeletingId(null);
    }
  };

  const genderLabel = (g: string) =>
    g === 'MALE' ? 'Nam' : g === 'FEMALE' ? 'Nữ' : 'Khác';

  const currentDobAge = calculateAge(form.dateOfBirth);

  return (
    <PageTemplate
      title={modalOpen ? (editingId ? 'Cập Nhật Hồ Sơ Con' : 'Thêm Hồ Sơ Học Sinh Mới') : 'Hồ Sơ Các Con'}
      subtitle={
        modalOpen
          ? 'Thông tin chi tiết giúp trung tâm ghép nối gia sư phù hợp nhất cho bé'
          : 'Quản lý danh sách con cái và tiến độ học kèm cùng gia sư'
      }
      badge="Phụ Huynh"
    >
      <div className="w-full space-y-4 text-left font-sans text-slate-700">
        {modalOpen ? (
          /* TRANG THÊM / CẬP NHẬT HỒ SƠ CON (FULL-PAGE FORM VIEW) */
          <div className="space-y-4">
            {/* Top Navigation & Status Bar */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <button
                type="button"
                onClick={handleRequestClose}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-indigo-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200/80 shadow-2xs transition-colors cursor-pointer"
              >
                <ArrowLeft size={14} /> Quay lại danh sách con
              </button>

              <div className="flex items-center gap-3">
                <span className="text-[11px] text-slate-400 italic">
                  <span className="text-rose-500 font-bold">*</span> Thông tin bắt buộc phải điền
                </span>
                {isDirty && (
                  <span className="text-amber-700 font-medium bg-amber-50 border border-amber-200/60 px-2.5 py-0.5 rounded-md text-xs inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                    Có thay đổi chưa lưu
                  </span>
                )}
              </div>
            </div>

            {globalError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{globalError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* CỘT TRÁI (5 cols): THÔNG TIN CƠ BẢN CỦA CON */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="bg-white border border-slate-200/80 rounded-xl p-4.5 shadow-2xs space-y-3.5">
                    <div className="pb-2.5 border-b border-slate-100 flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-[11px] border border-indigo-100">
                          1
                        </span>
                        Thông Tin Cơ Bản Của Con
                      </h4>
                    </div>

                    {/* Họ và tên */}
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Họ và tên của bé <span className="text-rose-500 font-bold">*</span>
                      </label>
                      <input
                        type="text"
                        maxLength={100}
                        placeholder="Ví dụ: Nguyễn Minh Anh"
                        value={form.fullName}
                        onChange={(e) => {
                          const val = e.target.value;
                          setForm({ ...form, fullName: val });
                          if (touched.fullName) {
                            setErrors((prev) => ({
                              ...prev,
                              fullName: validateField('fullName', val),
                            }));
                          }
                        }}
                        onBlur={() => {
                          setTouched((prev) => ({ ...prev, fullName: true }));
                          setErrors((prev) => ({
                            ...prev,
                            fullName: validateField('fullName', form.fullName),
                          }));
                        }}
                        className={`w-full px-3 py-2 bg-white border rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none transition-colors ${
                          errors.fullName && touched.fullName
                            ? 'border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                            : 'border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                        }`}
                      />
                      {errors.fullName && touched.fullName && (
                        <p className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
                          <AlertCircle size={12} /> {errors.fullName}
                        </p>
                      )}
                    </div>

                    {/* Giới tính & Ngày sinh */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Giới tính <span className="text-rose-500 font-bold">*</span>
                        </label>
                        <select
                          value={form.gender}
                          onChange={(e) => {
                            const val = e.target.value;
                            setForm({ ...form, gender: val });
                            if (touched.gender) {
                              setErrors((prev) => ({
                                ...prev,
                                gender: validateField('gender', val),
                              }));
                            }
                          }}
                          onBlur={() => {
                            setTouched((prev) => ({ ...prev, gender: true }));
                            setErrors((prev) => ({
                              ...prev,
                              gender: validateField('gender', form.gender),
                            }));
                          }}
                          className={`w-full px-3 py-2 bg-white border rounded-lg text-xs text-slate-800 focus:outline-none transition-colors ${
                            errors.gender && touched.gender
                              ? 'border-rose-400 focus:border-rose-500'
                              : 'border-slate-200 focus:border-indigo-500'
                          }`}
                        >
                          <option value="MALE">Nam</option>
                          <option value="FEMALE">Nữ</option>
                          <option value="OTHER">Khác</option>
                        </select>
                        {errors.gender && touched.gender && (
                          <p className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
                            <AlertCircle size={12} /> {errors.gender}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Ngày sinh <span className="text-rose-500 font-bold">*</span>
                        </label>
                        <input
                          type="date"
                          max={todayStr}
                          min={minDateStr}
                          value={form.dateOfBirth}
                          onChange={(e) => {
                            const val = e.target.value;
                            setForm({ ...form, dateOfBirth: val });
                            if (touched.dateOfBirth) {
                              setErrors((prev) => ({
                                ...prev,
                                dateOfBirth: validateField('dateOfBirth', val),
                              }));
                            }
                          }}
                          onBlur={() => {
                            setTouched((prev) => ({ ...prev, dateOfBirth: true }));
                            setErrors((prev) => ({
                              ...prev,
                              dateOfBirth: validateField('dateOfBirth', form.dateOfBirth),
                            }));
                          }}
                          className={`w-full px-3 py-2 bg-white border rounded-lg text-xs text-slate-800 focus:outline-none transition-colors ${
                            errors.dateOfBirth && touched.dateOfBirth
                              ? 'border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                              : 'border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                          }`}
                        />
                        {/* Hiển thị tính tuổi tự động */}
                        {form.dateOfBirth && currentDobAge !== null && currentDobAge >= 4 && currentDobAge <= 25 && (
                          <div className="mt-1">
                            <span className="text-[11px] font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 inline-flex items-center gap-1">
                              🎂 <strong>{currentDobAge} tuổi</strong>
                            </span>
                          </div>
                        )}
                        {errors.dateOfBirth && touched.dateOfBirth && (
                          <p className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
                            <AlertCircle size={12} /> {errors.dateOfBirth}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Trường & Lớp */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Trường đang học <span className="text-slate-400 font-normal">(Tùy chọn)</span>
                        </label>
                        <input
                          type="text"
                          maxLength={150}
                          placeholder="Ví dụ: THCS Cầu Giấy..."
                          value={form.school}
                          onChange={(e) => setForm({ ...form, school: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Lớp hiện tại <span className="text-slate-400 font-normal">(Tùy chọn)</span>
                        </label>
                        <input
                          type="text"
                          maxLength={20}
                          placeholder="Ví dụ: Lớp 5, Lớp 9..."
                          value={form.grade}
                          onChange={(e) => setForm({ ...form, grade: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-[11px] text-slate-500 leading-relaxed">
                      💡 <strong>Gợi ý:</strong> Thông tin ngày sinh và khối lớp giúp trung tâm tự động phân loại lộ trình và lọc hồ sơ gia sư có chứng chỉ sư phạm phù hợp nhất với con.
                    </div>
                  </div>
                </div>

                {/* CỘT PHẢI (7 cols): NHU CẦU HỌC TẬP & TIÊU CHÍ GHÉP GIA SƯ */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="bg-white border border-slate-200/80 rounded-xl p-4.5 shadow-2xs space-y-3.5">
                    <div className="pb-2.5 border-b border-slate-100 flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-[11px] border border-indigo-100">
                          2
                        </span>
                        Nhu Cầu Học Tập & Tiêu Chí Ghép Gia Sư
                      </h4>
                    </div>

                    {/* Học lực hiện tại */}
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Học lực hiện tại của bé
                      </label>
                      <select
                        value={form.academicLevel}
                        onChange={(e) => setForm({ ...form, academicLevel: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="WEAK">Mất gốc / Yếu kém (cần kèm sát từ đầu)</option>
                        <option value="AVERAGE">Trung bình (cần củng cố kiến thức cơ bản)</option>
                        <option value="GOOD">Khá (cần rèn luyện phương pháp nâng cao)</option>
                        <option value="EXCELLENT">Giỏi / Luyện thi HSG, Chuyên</option>
                      </select>
                    </div>

                    {/* Chọn môn học */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                          <Tag size={13} className="text-indigo-600" /> Môn học cần kèm
                        </label>
                        <span className="text-[11px] text-slate-400">
                          Đã chọn: <strong className="text-indigo-600">{selectedSubjects.length}</strong> môn
                        </span>
                      </div>

                      {/* Các tag môn đã chọn */}
                      {selectedSubjects.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-2.5 p-2 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                          {selectedSubjects.map((sub) => (
                            <span
                              key={sub}
                              className="inline-flex items-center gap-1 bg-indigo-600 text-white text-xs font-medium px-2.5 py-0.5 rounded-md shadow-2xs"
                            >
                              <span>{sub}</span>
                              <button
                                type="button"
                                onClick={() => removeSubject(sub)}
                                className="hover:bg-white/20 rounded-full p-0.5 cursor-pointer transition-colors"
                              >
                                <X size={11} />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Môn học phổ biến bấm chọn nhanh */}
                      <div className="space-y-1.5">
                        <p className="text-[11px] text-slate-400">Bấm để chọn nhanh các môn phổ biến:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {POPULAR_SUBJECTS.map((sub) => {
                            const isSelected = selectedSubjects.includes(sub);
                            return (
                              <button
                                key={sub}
                                type="button"
                                onClick={() => toggleSubject(sub)}
                                className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer inline-flex items-center gap-1 ${
                                  isSelected
                                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-semibold'
                                    : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600'
                                }`}
                              >
                                {isSelected && <Check size={11} />}
                                {sub}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Nhập thêm môn tùy chỉnh */}
                      <div className="mt-2.5 flex gap-2">
                        <input
                          type="text"
                          placeholder="Hoặc nhập tên môn khác rồi bấm Thêm..."
                          value={customSubjectInput}
                          onChange={(e) => setCustomSubjectInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddCustomSubject();
                            }
                          }}
                          className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddCustomSubject()}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-lg transition-colors cursor-pointer"
                        >
                          + Thêm môn
                        </button>
                      </div>
                    </div>

                    {/* Mục tiêu học tập */}
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Mục tiêu học tập cụ thể
                      </label>
                      <input
                        type="text"
                        maxLength={255}
                        placeholder="Ví dụ: Thi vào 10 chuyên, Luyện thi THPTQG, Lấy lại gốc cấp tốc..."
                        value={form.targetGoal}
                        onChange={(e) => setForm({ ...form, targetGoal: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                      />
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        <span className="text-[10px] text-slate-400 mr-1 self-center">Gợi ý 1 chạm:</span>
                        {GOAL_SUGGESTIONS.map((g) => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => handleSelectGoalSuggestion(g)}
                            className="text-[10px] px-2 py-0.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 rounded transition-colors cursor-pointer"
                          >
                            + {g}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Đặc điểm tính cách */}
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Đặc điểm tính cách & Tâm lý của con
                      </label>
                      <input
                        type="text"
                        maxLength={255}
                        placeholder="Ví dụ: Nhút nhát ngại hỏi, Hiếu động, Cần gia sư kiên nhẫn..."
                        value={form.personalityTraits}
                        onChange={(e) => setForm({ ...form, personalityTraits: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                      />
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        <span className="text-[10px] text-slate-400 mr-1 self-center">Gợi ý 1 chạm:</span>
                        {PERSONALITY_SUGGESTIONS.map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => handleSelectPersonalitySuggestion(p)}
                            className="text-[10px] px-2 py-0.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 rounded transition-colors cursor-pointer"
                          >
                            + {p}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Ghi chú thêm cho Giáo vụ */}
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Ghi chú thêm cho Giáo vụ / Tư vấn viên
                      </label>
                      <textarea
                        rows={2}
                        maxLength={500}
                        placeholder="Yêu cầu riêng về phong cách dạy, thời gian rảnh, dặn dò khác..."
                        value={form.notes}
                        onChange={(e) => setForm({ ...form, notes: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ACTION FOOTER */}
              <div className="bg-white border border-slate-200/80 rounded-xl px-5 py-3.5 flex items-center justify-between shadow-2xs">
                <button
                  type="button"
                  onClick={handleRequestClose}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                >
                  Hủy bỏ / Quay lại
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer inline-flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader size={14} className="animate-spin" />
                      <span>Đang lưu hồ sơ...</span>
                    </>
                  ) : editingId ? (
                    'Cập nhật hồ sơ'
                  ) : (
                    'Lưu hồ sơ con mới'
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* DANH SÁCH CON (LIST VIEW) */
          <>
            {/* Simple Clean Header Action Bar */}
            <div className="flex justify-between items-center bg-white rounded-xl border border-slate-200/80 px-4 py-3 shadow-2xs">
              <div>
                <h2 className="text-sm font-semibold text-slate-800">
                  Danh Sách Học Sinh ({students.length})
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Thông tin chi tiết về lực học, môn cần kèm và lịch học của từng con
                </p>
              </div>

              <button
                onClick={openAddModal}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
              >
                <Plus size={14} /> Thêm Hồ Sơ Con
              </button>
            </div>

            {globalError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-medium text-rose-700 flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{globalError}</span>
              </div>
            )}

            {loading ? (
              <div className="text-center py-16 text-slate-400 text-xs flex flex-col items-center gap-2 bg-white rounded-xl border border-slate-200/80">
                <Loader size={20} className="animate-spin text-indigo-600" />
                <span>Đang tải danh sách học sinh...</span>
              </div>
            ) : students.length === 0 ? (
              <div className="py-14 text-center bg-white border border-slate-200/80 rounded-xl shadow-2xs space-y-2.5">
                <Users size={40} className="mx-auto text-slate-300" />
                <p className="text-sm font-semibold text-slate-700">Chưa có hồ sơ học sinh nào</p>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Thêm thông tin con cái để bắt đầu đăng ký tìm gia sư dạy kèm phù hợp nhất.
                </p>
                <button
                  onClick={openAddModal}
                  className="mt-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg shadow-2xs cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Plus size={14} /> Thêm con ngay
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {students.map((s) => {
                  const classCount = s.classes?.length || 0;
                  const requestCount = s.tutorRequests?.length || 0;
                  const hasClasses = classCount > 0;
                  const hasRequests = requestCount > 0;
                  const age = calculateAge(s.dateOfBirth);
                  const displayName = s.fullName.trim().replace(/\b\w/g, (c: string) => c.toUpperCase());
                  const subjectsList = s.subjectsNeeded ? s.subjectsNeeded.split(/[,;]+/).map((item: string) => item.trim()).filter(Boolean) : [];

                  return (
                    <div
                      key={s.id}
                      className="bg-white border border-slate-200/80 hover:border-slate-300 rounded-xl p-4 shadow-2xs flex flex-col justify-between space-y-3 transition-all"
                    >
                      <div className="space-y-2.5">
                        {/* Card Header: Name, Grade & Status */}
                        <div className="flex items-start justify-between gap-2.5">
                          <div className="flex items-start gap-2.5">
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                              s.gender === 'MALE' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                            }`}>
                              {displayName.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-slate-800 text-sm">
                                  {displayName}
                                </h3>
                                <span className="text-[10px] text-slate-500 font-medium px-1.5 py-0.2 rounded bg-slate-100">
                                  {genderLabel(s.gender)} {age !== null ? `• ${age} tuổi` : ''}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 mt-0.5">
                                {s.school ? `${s.school}` : 'Trường chưa cập nhật'} {s.grade ? `• ${s.grade}` : ''}
                              </p>
                            </div>
                          </div>

                          {/* Status Badge */}
                          <span className="shrink-0">
                            {hasClasses ? (
                              <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                Đang học {classCount} lớp
                              </span>
                            ) : hasRequests ? (
                              <span className="text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200/60 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                Đang tìm {requestCount} lớp
                              </span>
                            ) : (
                              <span className="text-[11px] font-medium text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                                Chưa có lớp học
                              </span>
                            )}
                          </span>
                        </div>

                        {/* Compact Details Box */}
                        <div className="p-2.5 bg-slate-50/80 rounded-lg border border-slate-100 text-xs text-slate-600 space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-slate-400 font-medium">Học lực:</span>
                            {s.academicLevel === 'WEAK' ? (
                              <span className="px-2 py-0.5 rounded font-medium text-[11px] bg-rose-50 text-rose-700 border border-rose-200/60">
                                Yếu / Cần lấy lại gốc
                              </span>
                            ) : s.academicLevel === 'GOOD' ? (
                              <span className="px-2 py-0.5 rounded font-medium text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                                Học lực Khá
                              </span>
                            ) : s.academicLevel === 'EXCELLENT' ? (
                              <span className="px-2 py-0.5 rounded font-medium text-[11px] bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                                Giỏi / Xuất sắc
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded font-medium text-[11px] bg-amber-50 text-amber-700 border border-amber-200/60">
                                Học lực Trung bình
                              </span>
                            )}
                          </div>

                          {subjectsList.length > 0 && (
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-slate-400 font-medium">Môn cần kèm:</span>
                              {subjectsList.map((sub: string, idx: number) => (
                                <span key={idx} className="px-2 py-0.5 bg-white border border-slate-200 text-indigo-600 font-medium rounded text-[11px]">
                                  {sub}
                                </span>
                              ))}
                            </div>
                          )}

                          {s.targetGoal && (
                            <div className="text-slate-600">
                              <span className="text-slate-400 font-medium">Mục tiêu: </span>
                              <span>{s.targetGoal}</span>
                            </div>
                          )}

                          {(s.personalityTraits || s.learningStyle) && (
                            <div className="text-slate-600">
                              <span className="text-slate-400 font-medium">Tính cách: </span>
                              <span>{s.personalityTraits || s.learningStyle}</span>
                            </div>
                          )}

                          {s.notes && (
                            <div className="text-[11px] text-slate-500 italic pt-0.5">
                              Lưu ý: {s.notes}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditModal(s)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Chỉnh sửa hồ sơ"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(s.id, s.fullName)}
                            disabled={deletingId === s.id}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Xóa hồ sơ"
                          >
                            {deletingId === s.id ? (
                              <Loader size={14} className="animate-spin" />
                            ) : (
                              <Trash2 size={14} />
                            )}
                          </button>
                        </div>

                        <button
                          onClick={() => {
                            navigate(`/client/request-tutor?studentId=${s.id}`);
                          }}
                          className="px-3 py-1.5 text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 font-medium text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1 border border-indigo-100"
                        >
                          <Plus size={13} /> Tìm gia sư cho con
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* POPUP 1: XÁC NHẬN THOÁT KHI CHƯA LƯU */}
        {showUnsavedExitModal && (
          <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl border border-slate-100 space-y-4">
              <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 mx-auto flex items-center justify-center border border-amber-100">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-800">Bạn có chắc muốn thoát?</h4>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Thông tin bạn vừa nhập chưa được lưu. Nếu thoát ngay, các thay đổi sẽ bị mất.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUnsavedExitModal(false)}
                  className="py-2 px-3 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium transition-colors cursor-pointer"
                >
                  Tiếp tục chỉnh sửa
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowUnsavedExitModal(false);
                    setModalOpen(false);
                  }}
                  className="py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                >
                  Thoát không lưu
                </button>
              </div>
            </div>
          </div>
        )}

        {/* POPUP 2: XÁC NHẬN LƯU HỒ SƠ THÀNH CÔNG & ĐĂNG KÝ GIA SƯ */}
        {showSuccessModal && createdStudentInfo && (
          <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl border border-slate-100 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center border border-emerald-100">
                <CheckCircle2 size={26} />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-800">Thêm hồ sơ thành công! 🎉</h4>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Hồ sơ của bé <strong className="text-indigo-600">{createdStudentInfo.fullName}</strong> đã được lưu thành công.
                  Bạn có muốn đăng ký tìm gia sư cho con ngay bây giờ không?
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowSuccessModal(false);
                    setCreatedStudentInfo(null);
                  }}
                  className="py-2 px-3 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium transition-colors cursor-pointer"
                >
                  Để sau
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const id = createdStudentInfo.id;
                    setShowSuccessModal(false);
                    setCreatedStudentInfo(null);
                    navigate(`/client/request-tutor?studentId=${id}`);
                  }}
                  className="py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors cursor-pointer shadow-2xs flex items-center justify-center gap-1.5"
                >
                  <Sparkles size={13} /> Đăng ký gia sư
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageTemplate>
  );
}
