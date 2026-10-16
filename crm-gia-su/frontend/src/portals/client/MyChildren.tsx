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
  Award,
  BookOpen,
  GraduationCap,
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

const GRADE_OPTIONS = [
  { value: 'Mầm non', label: 'Mầm non / Tiền tiểu học', age: 5 },
  { value: 'Lớp 1', label: 'Lớp 1 (Tiểu học)', age: 6 },
  { value: 'Lớp 2', label: 'Lớp 2 (Tiểu học)', age: 7 },
  { value: 'Lớp 3', label: 'Lớp 3 (Tiểu học)', age: 8 },
  { value: 'Lớp 4', label: 'Lớp 4 (Tiểu học)', age: 9 },
  { value: 'Lớp 5', label: 'Lớp 5 (Tiểu học)', age: 10 },
  { value: 'Lớp 6', label: 'Lớp 6 (THCS)', age: 11 },
  { value: 'Lớp 7', label: 'Lớp 7 (THCS)', age: 12 },
  { value: 'Lớp 8', label: 'Lớp 8 (THCS)', age: 13 },
  { value: 'Lớp 9', label: 'Lớp 9 (THCS - Ôn vào 10)', age: 14 },
  { value: 'Lớp 10', label: 'Lớp 10 (THPT)', age: 15 },
  { value: 'Lớp 11', label: 'Lớp 11 (THPT)', age: 16 },
  { value: 'Lớp 12', label: 'Lớp 12 (THPT - Ôn thi ĐH)', age: 17 },
  { value: 'Ôn thi Đại học', label: 'Ôn thi Đại học / ĐGNL', age: 18 },
  { value: 'Khác', label: 'Khác', age: 10 },
];

const TEXTBOOK_OPTIONS = [
  'Kết nối tri thức với cuộc sống',
  'Cánh diều',
  'Chân trời sáng tạo',
  'Song ngữ / Quốc tế',
  'Chưa xác định / Khác',
];

const PERSONALITY_TAGS = [
  'Tự giác, chăm chỉ',
  'Nhút nhát, ngại hỏi',
  'Hiếu động, mất tập trung',
  'Tiếp thu nhanh',
  'Cần kiên nhẫn & động viên',
  'Cần kỷ luật, nghiêm khắc',
];

const getTextbookDisplay = (val: string | null | undefined): string | null => {
  if (!val) return null;
  const match = TEXTBOOK_OPTIONS.find((tb) => val.includes(tb) || tb.includes(val));
  if (match) return match;
  if (
    val.toLowerCase().includes('sách') ||
    val.toLowerCase().includes('chân trời') ||
    val.toLowerCase().includes('cánh diều') ||
    val.toLowerCase().includes('tri thức') ||
    val.toLowerCase().includes('quốc tế')
  ) {
    return val;
  }
  return null;
};

const getPersonalityList = (s: Student): string[] => {
  const list: string[] = [];
  if (s.personalityTraits) {
    s.personalityTraits.split(/[,;]+/).forEach((item) => {
      const trimmed = item.trim();
      if (trimmed && !list.includes(trimmed)) list.push(trimmed);
    });
  }
  // If legacy learningStyle contained personality traits instead of a textbook
  if (s.learningStyle && !getTextbookDisplay(s.learningStyle)) {
    s.learningStyle.split(/[,;]+/).forEach((item) => {
      const trimmed = item.trim();
      if (trimmed && !list.includes(trimmed)) list.push(trimmed);
    });
  }
  return list;
};

const EMPTY_FORM = {
  fullName: '',
  gender: 'MALE',
  dateOfBirth: '',
  school: '',
  grade: 'Lớp 6',
  academicLevel: 'AVERAGE',
  learningStyle: 'Kết nối tri thức với cuộc sống',
  personalityTraits: '',
  notes: '',
  targetGoal: '',
};

export default function MyChildren() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [customPersonalityInput, setCustomPersonalityInput] = useState('');
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
    return JSON.stringify(form) !== initialStateSnapshot;
  }, [modalOpen, form, initialStateSnapshot]);

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

    if (name === 'grade') {
      if (!value) {
        err = 'Vui lòng chọn khối lớp của con';
      }
    }

    return err;
  };

  const validateAll = () => {
    const newErrors: { [key: string]: string } = {};
    const nameErr = validateField('fullName', form.fullName);
    if (nameErr) newErrors.fullName = nameErr;

    const genderErr = validateField('gender', form.gender);
    if (genderErr) newErrors.gender = genderErr;

    const gradeErr = validateField('grade', form.grade);
    if (gradeErr) newErrors.grade = gradeErr;

    const dobErr = validateField('dateOfBirth', form.dateOfBirth);
    if (dobErr) newErrors.dateOfBirth = dobErr;

    const schoolErr = validateField('school', form.school);
    if (schoolErr) newErrors.school = schoolErr;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGradeChange = (gradeVal: string) => {
    const matched = GRADE_OPTIONS.find((g) => g.value === gradeVal);
    let newDob = form.dateOfBirth;
    if (matched) {
      // Tự động suy ra năm sinh theo độ tuổi chuẩn của khối lớp
      const birthYear = new Date().getFullYear() - matched.age;
      newDob = `${birthYear}-01-01`;
    }
    setForm((prev) => ({
      ...prev,
      grade: gradeVal,
      dateOfBirth: newDob,
    }));
    if (touched.grade) {
      setErrors((prev) => ({ ...prev, grade: validateField('grade', gradeVal) }));
    }
    if (touched.dateOfBirth && newDob) {
      setErrors((prev) => ({ ...prev, dateOfBirth: validateField('dateOfBirth', newDob) }));
    }
  };

  const activeTraits = useMemo(() => {
    return form.personalityTraits
      ? form.personalityTraits.split(/[,;]+/).map((s) => s.trim()).filter(Boolean)
      : [];
  }, [form.personalityTraits]);

  const togglePersonalityTag = (tag: string) => {
    setForm((prev) => {
      const current = prev.personalityTraits
        ? prev.personalityTraits.split(/[,;]+/).map((s) => s.trim()).filter(Boolean)
        : [];
      let updated: string[];
      if (current.includes(tag)) {
        updated = current.filter((t) => t !== tag);
      } else {
        updated = [...current, tag];
      }
      return { ...prev, personalityTraits: updated.join(', ') };
    });
  };

  const handleAddCustomPersonality = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = customPersonalityInput.trim();
    if (!trimmed) return;
    setForm((prev) => {
      const current = prev.personalityTraits
        ? prev.personalityTraits.split(/[,;]+/).map((s) => s.trim()).filter(Boolean)
        : [];
      if (!current.includes(trimmed)) {
        return { ...prev, personalityTraits: [...current, trimmed].join(', ') };
      }
      return prev;
    });
    setCustomPersonalityInput('');
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
    const birthYear = new Date().getFullYear() - 11; // mặc định Lớp 6 (11 tuổi)
    const initialF = {
      ...EMPTY_FORM,
      dateOfBirth: `${birthYear}-01-01`,
    };
    setForm(initialF);
    setCustomPersonalityInput('');
    setErrors({});
    setTouched({});
    setGlobalError(null);
    setInitialStateSnapshot(JSON.stringify(initialF));
    setModalOpen(true);
  };

  const openEditModal = (s: Student) => {
    setEditingId(s.id);
    const textbook = getTextbookDisplay(s.learningStyle);
    const legacyPersonalities = !textbook ? s.learningStyle : '';
    const initialTraits = s.personalityTraits || legacyPersonalities || '';

    const initialF = {
      fullName: s.fullName,
      gender: s.gender,
      dateOfBirth: s.dateOfBirth ? s.dateOfBirth.slice(0, 10) : '',
      school: s.school || '',
      grade: s.grade || 'Lớp 6',
      academicLevel: s.academicLevel || 'AVERAGE',
      learningStyle: textbook || 'Kết nối tri thức với cuộc sống',
      personalityTraits: initialTraits,
      notes: s.notes || '',
      targetGoal: s.targetGoal || '',
    };
    setForm(initialF);
    setCustomPersonalityInput('');
    setErrors({});
    setTouched({});
    setGlobalError(null);
    setInitialStateSnapshot(JSON.stringify(initialF));
    setModalOpen(true);
  };

  const handleRequestClose = () => {
    if (isDirty) {
      setShowUnsavedExitModal(true);
    } else {
      setModalOpen(false);
    }
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
      learningStyle: form.learningStyle.trim() || undefined,
      academicLevel: form.academicLevel || undefined,
      personalityTraits: form.personalityTraits.trim() || undefined,
      notes: form.notes.trim() || undefined,
    };

    try {
      if (editingId) {
        await api.put(`/api/v1/students/${editingId}`, payload);
        toast.success('Cập nhật hồ sơ con thành công!');
        setModalOpen(false);
        await fetchStudents();
      } else {
        const res = await api.post('/api/v1/students', payload);
        const created = res.data?.student || { id: res.data?.id, fullName: payload.fullName };
        toast.success('Thêm hồ sơ con thành công!');
        setModalOpen(false);
        await fetchStudents();

        // Mở Popup: Hỏi có muốn đăng ký gia sư ngay không
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
      title={modalOpen ? (editingId ? 'Cập Nhật Hồ Sơ Con' : 'Thêm Hồ Sơ Con') : 'Hồ Sơ Các Con'}
      subtitle={modalOpen ? '' : 'Quản lý danh sách con cái và tiến độ học kèm cùng gia sư'}
      badge="Phụ Huynh"
    >
      <div className="w-full space-y-4 text-left font-sans text-slate-700">
        {modalOpen ? (
          /* TRANG THÊM / CẬP NHẬT HỒ SƠ CON - GỌN GÀNG, ĐƠN GIẢN, CHUẨN HOÁ */
          <div className="space-y-4 max-w-5xl mx-auto">
            {/* Top Navigation Bar */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleRequestClose}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-indigo-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200/80 shadow-2xs transition-colors cursor-pointer"
              >
                <ArrowLeft size={14} /> Quay lại danh sách
              </button>

              {isDirty && (
                <span className="text-amber-700 font-medium bg-amber-50 border border-amber-200/60 px-2.5 py-0.5 rounded text-[11px] inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                  Có thay đổi chưa lưu
                </span>
              )}
            </div>

            {globalError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{globalError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* CỘT 1: THÔNG TIN HỌC VẤN CỦA CON */}
                <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs space-y-3.5">
                  <div className="pb-2.5 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                      <span className="w-2 h-3.5 bg-indigo-600 rounded-sm inline-block"></span>
                      1. Thông Tin Học Sinh
                    </h3>
                    <span className="text-[11px] text-slate-400 font-normal">Hồ sơ cố định của con</span>
                  </div>

                  {/* Họ và tên */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Họ và tên con <span className="text-rose-500">*</span>
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

                  {/* Giới tính & Khối lớp */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Giới tính <span className="text-rose-500">*</span>
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
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer"
                      >
                        <option value="MALE">Nam (👦)</option>
                        <option value="FEMALE">Nữ (👧)</option>
                        <option value="OTHER">Khác</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Khối lớp <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={form.grade}
                        onChange={(e) => handleGradeChange(e.target.value)}
                        className={`w-full px-3 py-2 bg-white border rounded-lg text-xs font-medium text-slate-800 focus:outline-none cursor-pointer transition-colors ${
                          errors.grade && touched.grade
                            ? 'border-rose-400 focus:border-rose-500'
                            : 'border-slate-200 focus:border-indigo-500'
                        }`}
                      >
                        {GRADE_OPTIONS.map((g) => (
                          <option key={g.value} value={g.value}>
                            {g.label}
                          </option>
                        ))}
                      </select>
                      {errors.grade && touched.grade && (
                        <p className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
                          <AlertCircle size={12} /> {errors.grade}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Bộ sách giáo khoa */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Bộ sách giáo khoa đang học
                    </label>
                    <select
                      value={form.learningStyle}
                      onChange={(e) => setForm({ ...form, learningStyle: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      {TEXTBOOK_OPTIONS.map((tb) => (
                        <option key={tb} value={tb}>
                          {tb}
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Hỗ trợ gia sư chuẩn bị giáo án và bài tập bám sát chương trình trên lớp
                    </p>
                  </div>

                  {/* Trường học */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Trường học của con
                    </label>
                    <input
                      type="text"
                      maxLength={150}
                      placeholder="Ví dụ: THCS Cầu Giấy, Tiểu học Lê Quý Đôn..."
                      value={form.school}
                      onChange={(e) => setForm({ ...form, school: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Ngày sinh */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-medium text-slate-700">
                        Ngày sinh <span className="text-rose-500">*</span>
                      </label>
                      {form.dateOfBirth && currentDobAge !== null && currentDobAge >= 4 && currentDobAge <= 25 && (
                        <span className="text-[11px] font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                          🎂 {currentDobAge} tuổi (ước lượng theo {form.grade})
                        </span>
                      )}
                    </div>
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
                    {errors.dateOfBirth && touched.dateOfBirth && (
                      <p className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
                        <AlertCircle size={12} /> {errors.dateOfBirth}
                      </p>
                    )}
                  </div>
                </div>

                {/* CỘT 2: ĐẶC ĐIỂM & TÂM LÝ HỌC SINH */}
                <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs space-y-3.5 flex flex-col justify-between">
                  <div className="space-y-3.5">
                    <div className="pb-2.5 border-b border-slate-100 flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                        <span className="w-2 h-3.5 bg-indigo-600 rounded-sm inline-block"></span>
                        2. Đặc Điểm & Tâm Lý Học Sinh
                      </h3>
                      <span className="text-[11px] text-slate-400 font-normal">Giúp ghép gia sư phù hợp</span>
                    </div>

                    {/* Học lực hiện tại */}
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Học lực hiện tại của con
                      </label>
                      <select
                        value={form.academicLevel}
                        onChange={(e) => setForm({ ...form, academicLevel: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer font-medium"
                      >
                        <option value="AVERAGE">Học lực Trung bình (Cần củng cố căn bản)</option>
                        <option value="WEAK">Yếu / Mất gốc (Cần lấy lại kiến thức từ đầu)</option>
                        <option value="GOOD">Học lực Khá (Muốn nâng cao kiến thức)</option>
                        <option value="EXCELLENT">Học lực Giỏi / Xuất sắc (Luyện thi chuyên / Đội tuyển)</option>
                      </select>
                    </div>

                    {/* Tính cách & Thói quen học tập (1-chạm) */}
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">
                        Tính cách & Thói quen học tập (chạm để chọn)
                      </label>

                      {/* 6 tags 1-chạm */}
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {PERSONALITY_TAGS.map((tag) => {
                          const isSelected = activeTraits.includes(tag);
                          return (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => togglePersonalityTag(tag)}
                              className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer font-medium flex items-center gap-1.5 ${
                                isSelected
                                  ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-2xs font-semibold'
                                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                              }`}
                            >
                              <span className="text-[11px]">{isSelected ? '✓' : '+'}</span>
                              <span>{tag}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Custom tags (if any) */}
                      {activeTraits.filter((t) => !PERSONALITY_TAGS.includes(t)).length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {activeTraits
                            .filter((t) => !PERSONALITY_TAGS.includes(t))
                            .map((customTrait) => (
                              <span
                                key={customTrait}
                                className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-medium px-2 py-1 rounded-lg"
                              >
                                <span>{customTrait}</span>
                                <button
                                  type="button"
                                  onClick={() => togglePersonalityTag(customTrait)}
                                  className="text-indigo-400 hover:text-indigo-700 p-0.5 rounded cursor-pointer"
                                >
                                  <X size={11} />
                                </button>
                              </span>
                            ))}
                        </div>
                      )}

                      {/* Nhập thêm tính cách khác */}
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Nhập tính cách khác (nhấn Enter)..."
                          value={customPersonalityInput}
                          onChange={(e) => setCustomPersonalityInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddCustomPersonality();
                            }
                          }}
                          className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddCustomPersonality()}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-lg transition-colors cursor-pointer shrink-0"
                        >
                          Thêm
                        </button>
                      </div>
                    </div>

                    {/* Ghi chú sức khỏe / Thói quen riêng */}
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Lưu ý sức khỏe / Thói quen riêng của con
                      </label>
                      <textarea
                        rows={3}
                        maxLength={500}
                        placeholder="Ví dụ: Con cận thị cần ngồi gần bảng, tiếp thu nhanh qua sơ đồ tư duy, cần gia sư kiên nhẫn nhắc nhở..."
                        value={form.notes}
                        onChange={(e) => setForm({ ...form, notes: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 resize-none"
                      />
                    </div>
                  </div>

                  <div className="pt-2 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-center gap-2">
                    <Sparkles size={14} className="text-indigo-500 shrink-0" />
                    <span>
                      Khi cần tìm gia sư cho môn cụ thể, bạn chỉ cần bấm nút <strong>"Tìm gia sư cho con"</strong> ngoài danh sách.
                    </span>
                  </div>
                </div>
              </div>

              {/* ACTION FOOTER */}
              <div className="bg-white border border-slate-200/80 rounded-xl px-4 py-3 flex items-center justify-between shadow-2xs">
                <button
                  type="button"
                  onClick={handleRequestClose}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                >
                  Hủy bỏ
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
                    'Lưu hồ sơ con'
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* DANH SÁCH CON (LIST VIEW) */
          <>
            {/* Header Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white rounded-2xl border border-slate-200/90 px-5 py-4 shadow-2xs">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-base font-bold text-slate-800">
                    Danh Sách Các Con
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs border border-indigo-100/80">
                    {students.length} bé
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Quản lý hồ sơ học tập cố định, theo dõi tiến độ và đăng ký gia sư dạy kèm
                </p>
              </div>

              <button
                onClick={openAddModal}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer inline-flex items-center justify-center gap-2 shadow-sm hover:shadow active:scale-98"
              >
                <Plus size={15} /> Thêm Hồ Sơ Con
              </button>
            </div>

            {globalError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-medium text-rose-700 flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{globalError}</span>
              </div>
            )}

            {loading ? (
              <div className="text-center py-16 text-slate-400 text-xs flex flex-col items-center gap-2 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
                <Loader size={22} className="animate-spin text-indigo-600" />
                <span>Đang tải danh sách học sinh...</span>
              </div>
            ) : students.length === 0 ? (
              <div className="py-14 text-center bg-white border border-slate-200/90 rounded-2xl shadow-2xs space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-500 mx-auto flex items-center justify-center">
                  <Users size={32} />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-800">Chưa có hồ sơ học sinh nào</p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                    Thêm thông tin các con để dễ dàng theo dõi việc học và đăng ký tìm gia sư dạy kèm bám sát chương trình.
                  </p>
                </div>
                <button
                  onClick={openAddModal}
                  className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Plus size={14} /> Thêm con ngay
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {students.map((s) => {
                  const classCount = s.classes?.length || 0;
                  const requestCount = s.tutorRequests?.length || 0;
                  const hasClasses = classCount > 0;
                  const hasRequests = requestCount > 0;
                  const age = calculateAge(s.dateOfBirth);
                  const displayName = s.fullName.trim().replace(/\b\w/g, (c: string) => c.toUpperCase());
                  const textbook = getTextbookDisplay(s.learningStyle);
                  const traitsList = getPersonalityList(s);

                  return (
                    <div
                      key={s.id}
                      className="group relative bg-white border border-slate-200/90 hover:border-indigo-300 rounded-2xl shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden"
                    >
                      {/* Top decorative gradient bar */}
                      <div className={`h-1.5 w-full bg-gradient-to-r ${
                        s.gender === 'MALE'
                          ? 'from-blue-500 via-indigo-500 to-cyan-400'
                          : 'from-pink-500 via-rose-500 to-amber-400'
                      }`} />

                      <div className="p-5 space-y-4">
                        {/* Header: Avatar, Name, Grade & Status */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3.5">
                            {/* Avatar with subtle glow & hover animation */}
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-inner border transition-transform group-hover:scale-105 duration-200 ${
                              s.gender === 'MALE'
                                ? 'bg-gradient-to-br from-blue-50 to-indigo-100/60 border-blue-200/60 text-blue-600'
                                : 'bg-gradient-to-br from-pink-50 to-rose-100/60 border-rose-200/60 text-rose-600'
                            }`}>
                              {s.gender === 'MALE' ? '👦' : '👧'}
                            </div>

                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-bold text-slate-800 text-base group-hover:text-indigo-600 transition-colors">
                                  {displayName}
                                </h3>
                                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2.5 py-0.5 rounded-full shadow-2xs">
                                  {s.grade || 'Chưa cập nhật lớp'}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 flex-wrap">
                                <span className="font-medium text-slate-600">
                                  {genderLabel(s.gender)} {age !== null ? `• ${age} tuổi` : ''}
                                </span>
                                {s.school && (
                                  <>
                                    <span className="text-slate-300">•</span>
                                    <span className="inline-flex items-center gap-1 text-slate-500 truncate max-w-[190px]" title={s.school}>
                                      <GraduationCap size={13} className="text-indigo-500 shrink-0" />
                                      {s.school}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Status Badge */}
                          <div className="shrink-0">
                            {hasClasses ? (
                              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-full inline-flex items-center gap-1.5 shadow-2xs">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                Đang học {classCount} lớp
                              </span>
                            ) : hasRequests ? (
                              <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200/80 px-3 py-1 rounded-full inline-flex items-center gap-1.5 shadow-2xs">
                                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                                Đang tìm {requestCount} lớp
                              </span>
                            ) : (
                              <span className="text-xs font-medium text-slate-500 bg-slate-100 border border-slate-200/80 px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                                Chưa có lớp học
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Section: 2 Key Metric Cards (Học lực & Bộ sách) */}
                        <div className="grid grid-cols-2 gap-2.5">
                          {/* Box 1: Học lực */}
                          <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-2 overflow-hidden">
                              <div className="w-7 h-7 rounded-lg bg-white shadow-2xs border border-slate-200/60 flex items-center justify-center text-indigo-600 shrink-0">
                                <Award size={14} />
                              </div>
                              <div className="overflow-hidden">
                                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Học lực</div>
                                <div className="text-xs font-semibold truncate">
                                  {s.academicLevel === 'EXCELLENT' ? (
                                    <span className="text-indigo-600">Giỏi / Xuất sắc</span>
                                  ) : s.academicLevel === 'GOOD' ? (
                                    <span className="text-emerald-600">Học lực Khá</span>
                                  ) : s.academicLevel === 'WEAK' ? (
                                    <span className="text-rose-600">Cần lấy lại gốc</span>
                                  ) : (
                                    <span className="text-amber-600">Trung bình</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Box 2: Bộ sách */}
                          <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-2 overflow-hidden">
                              <div className="w-7 h-7 rounded-lg bg-white shadow-2xs border border-slate-200/60 flex items-center justify-center text-amber-600 shrink-0">
                                <BookOpen size={14} />
                              </div>
                              <div className="overflow-hidden">
                                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Bộ sách</div>
                                <div className="text-xs font-semibold text-slate-700 truncate" title={textbook || 'Chưa cập nhật'}>
                                  {textbook || <span className="text-slate-400 font-normal italic">Chưa chọn</span>}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Section: Personality & Learning Characteristics */}
                        <div className="space-y-1.5">
                          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Sparkles size={12} className="text-indigo-500" />
                            <span>Tính cách & Thói quen học tập</span>
                          </div>

                          {traitsList.length > 0 ? (
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {traitsList.map((tr: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200/70 inline-flex items-center gap-1 shadow-2xs"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                                  {tr}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <div className="text-xs text-slate-400 italic bg-slate-50/60 border border-dashed border-slate-200 rounded-lg p-2 flex items-center justify-between">
                              <span>Chưa thiết lập tính cách của bé</span>
                              <button
                                onClick={() => openEditModal(s)}
                                className="text-indigo-600 hover:text-indigo-700 font-medium text-[11px] cursor-pointer"
                              >
                                + Bổ sung
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Notes callout (if any) */}
                        {s.notes && (
                          <div className="p-2.5 bg-amber-50/60 border border-amber-200/60 rounded-xl text-xs text-amber-900 leading-relaxed flex items-start gap-2">
                            <span className="text-sm shrink-0">💡</span>
                            <div className="text-[11px]">
                              <strong className="font-semibold">Lưu ý: </strong>
                              <span>{s.notes}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Card Footer: Action Bar */}
                      <div className="px-5 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => openEditModal(s)}
                            className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-indigo-600 bg-white hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-200 rounded-lg transition-all cursor-pointer shadow-2xs inline-flex items-center gap-1.5"
                            title="Chỉnh sửa hồ sơ"
                          >
                            <Pencil size={13} />
                            <span>Sửa hồ sơ</span>
                          </button>

                          <button
                            onClick={() => handleDelete(s.id, s.fullName)}
                            disabled={deletingId === s.id}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-lg transition-all cursor-pointer"
                            title="Xóa hồ sơ"
                          >
                            {deletingId === s.id ? (
                              <Loader size={13} className="animate-spin text-rose-500" />
                            ) : (
                              <Trash2 size={13} />
                            )}
                          </button>
                        </div>

                        <button
                          onClick={() => navigate(`/client/request-tutor?studentId=${s.id}`)}
                          className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold text-xs rounded-xl transition-all shadow-sm hover:shadow cursor-pointer inline-flex items-center gap-1.5 active:scale-98"
                        >
                          <Sparkles size={13} />
                          <span>Tìm gia sư cho con</span>
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
