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
            className="px-4 py-2 bg-[#696cff] hover:bg-[#5f61e6] active:bg-[#595cd9] text-white text-xs font-bold rounded-lg transition-all cursor-pointer inline-flex items-center gap-2 shadow-[0_2px_4px_0_rgba(105,108,255,0.4)]"
          >
            <Plus size={16} /> Thêm con
          </button>
        </div>

        {globalError && !modalOpen && (
          <div className="p-4 bg-[#ffe0db] border border-[#ff3e1d]/40 rounded-xl text-xs font-semibold text-[#ff3e1d] flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{globalError}</span>
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
              const age = calculateAge(s.dateOfBirth);

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
                          {genderLabel(s.gender)} · {age !== null ? `${age} tuổi` : ''} {s.grade ? `· ${s.grade}` : ''}{' '}
                          {s.school ? `- ${s.school}` : ''}
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
                          <span className="px-2 py-0.5 rounded font-bold text-[11px] bg-[#ffe0db] text-[#ff3e1d]">
                            Mất gốc / Yếu
                          </span>
                        ) : s.academicLevel === 'GOOD' ? (
                          <span className="px-2 py-0.5 rounded font-bold text-[11px] bg-[#e8fadf] text-[#71dd37]">
                            Học lực Khá
                          </span>
                        ) : s.academicLevel === 'EXCELLENT' ? (
                          <span className="px-2 py-0.5 rounded font-bold text-[11px] bg-[#e7e7ff] text-[#696cff]">
                            Giỏi / Xuất sắc
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded font-bold text-[11px] bg-[#fff8e1] text-[#ffab00]">
                            Học lực Trung bình
                          </span>
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

        {/* Modal Form Thêm / Cập nhật học sinh */}
        {modalOpen && (
          <div
            className="fixed inset-0 z-50 bg-[#233446]/40 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in"
            onClick={(e) => {
              if (e.target === e.currentTarget) handleRequestClose();
            }}
          >
            <div className="bg-white border-0 rounded-2xl max-w-xl w-full p-6 text-left shadow-2xl relative max-h-[92vh] overflow-y-auto custom-scrollbar">
              <button
                type="button"
                onClick={handleRequestClose}
                className="absolute top-4 right-4 text-[#a1acb8] hover:text-[#566a7f] cursor-pointer p-1 rounded-lg hover:bg-gray-100 transition-colors"
                title="Đóng biểu mẫu"
              >
                <X size={20} />
              </button>

              <div className="flex items-start justify-between pr-8 mb-4">
                <div>
                  <h3 className="text-xl font-bold text-[#566a7f]">
                    {editingId ? 'Cập nhật hồ sơ học sinh' : 'Thêm hồ sơ học sinh mới'}
                  </h3>
                  <p className="text-[#a1acb8] text-xs mt-1">
                    Thông tin càng chi tiết giúp hệ thống ghép nối gia sư phù hợp nhất cho bé.
                  </p>
                </div>
              </div>

              {/* Chú thích thông tin bắt buộc */}
              <div className="mb-4 pb-2 border-b border-gray-100 flex items-center justify-between text-[11px]">
                <span className="text-[#a1acb8] italic">
                  <span className="text-[#ff3e1d] font-bold">*</span> Thông tin bắt buộc phải điền
                </span>
                {isDirty && (
                  <span className="text-[#ffab00] font-medium bg-[#fff2d6] px-2 py-0.5 rounded-full text-[10px]">
                    Có thay đổi chưa lưu
                  </span>
                )}
              </div>

              {globalError && (
                <div className="mb-4 p-3 bg-[#ffe0db] border border-[#ff3e1d]/40 rounded-lg text-xs font-semibold text-[#ff3e1d] flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{globalError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* I. THÔNG TIN CƠ BẢN */}
                <div>
                  <h4 className="text-xs font-bold text-[#696cff] uppercase mb-3 flex items-center gap-1.5 pb-1 border-b border-gray-100">
                    <span className="w-1.5 h-3.5 bg-[#696cff] rounded-full inline-block"></span>
                    I. Thông tin cơ bản
                  </h4>

                  <div className="space-y-3.5">
                    {/* Họ và tên */}
                    <div>
                      <label className="block text-xs font-semibold text-[#566a7f] mb-1">
                        Họ và tên của bé <span className="text-[#ff3e1d] font-bold">*</span>
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
                        className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm text-[#566a7f] focus:outline-none transition-all ${
                          errors.fullName && touched.fullName
                            ? 'border-[#ff3e1d] focus:border-[#ff3e1d] focus:ring-1 focus:ring-[#ff3e1d]'
                            : 'border-[#d9dee3] focus:border-[#696cff] focus:ring-1 focus:ring-[#696cff]'
                        }`}
                      />
                      {errors.fullName && touched.fullName && (
                        <p className="text-[11px] text-[#ff3e1d] font-medium mt-1 flex items-center gap-1">
                          <AlertCircle size={12} /> {errors.fullName}
                        </p>
                      )}
                    </div>

                    {/* Giới tính & Ngày sinh */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs font-semibold text-[#566a7f] mb-1">
                          Giới tính <span className="text-[#ff3e1d] font-bold">*</span>
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
                          className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm text-[#566a7f] focus:outline-none transition-all ${
                            errors.gender && touched.gender
                              ? 'border-[#ff3e1d] focus:border-[#ff3e1d]'
                              : 'border-[#d9dee3] focus:border-[#696cff]'
                          }`}
                        >
                          <option value="MALE">Nam</option>
                          <option value="FEMALE">Nữ</option>
                          <option value="OTHER">Khác</option>
                        </select>
                        {errors.gender && touched.gender && (
                          <p className="text-[11px] text-[#ff3e1d] font-medium mt-1 flex items-center gap-1">
                            <AlertCircle size={12} /> {errors.gender}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#566a7f] mb-1">
                          Ngày sinh <span className="text-[#ff3e1d] font-bold">*</span>
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
                          className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm text-[#566a7f] focus:outline-none transition-all ${
                            errors.dateOfBirth && touched.dateOfBirth
                              ? 'border-[#ff3e1d] focus:border-[#ff3e1d] focus:ring-1 focus:ring-[#ff3e1d]'
                              : 'border-[#d9dee3] focus:border-[#696cff] focus:ring-1 focus:ring-[#696cff]'
                          }`}
                        />

                        {/* Hiển thị tính tuổi tự động và cảnh báo */}
                        {form.dateOfBirth && (
                          <div className="mt-1">
                            {currentDobAge !== null && currentDobAge >= 4 && currentDobAge <= 25 ? (
                              <span className="text-[11px] font-semibold text-[#696cff] bg-[#e7e7ff] px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                                🎂 Tuổi hiện tại: <strong>{currentDobAge} tuổi</strong>
                              </span>
                            ) : null}
                          </div>
                        )}

                        {errors.dateOfBirth && touched.dateOfBirth && (
                          <p className="text-[11px] text-[#ff3e1d] font-medium mt-1 flex items-center gap-1">
                            <AlertCircle size={12} /> {errors.dateOfBirth}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Trường & Lớp */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs font-semibold text-[#566a7f] mb-1">
                          Trường đang học <span className="text-[#a1acb8] font-normal">(Tùy chọn)</span>
                        </label>
                        <input
                          type="text"
                          maxLength={150}
                          placeholder="Ví dụ: THCS Cầu Giấy..."
                          value={form.school}
                          onChange={(e) => setForm({ ...form, school: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-white border border-[#d9dee3] rounded-xl text-sm text-[#566a7f] focus:outline-none focus:border-[#696cff]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#566a7f] mb-1">
                          Lớp hiện tại <span className="text-[#a1acb8] font-normal">(Tùy chọn)</span>
                        </label>
                        <input
                          type="text"
                          maxLength={20}
                          placeholder="Ví dụ: Lớp 5, Lớp 9, Lớp 12..."
                          value={form.grade}
                          onChange={(e) => setForm({ ...form, grade: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-white border border-[#d9dee3] rounded-xl text-sm text-[#566a7f] focus:outline-none focus:border-[#696cff]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* II. THÔNG TIN HỌC TẬP & MATCHING */}
                <div>
                  <h4 className="text-xs font-bold text-[#696cff] uppercase mb-3 flex items-center gap-1.5 pb-1 border-b border-gray-100">
                    <span className="w-1.5 h-3.5 bg-[#696cff] rounded-full inline-block"></span>
                    II. Thông tin học tập & Tiêu chí Matching
                  </h4>

                  <div className="space-y-3.5">
                    {/* Học lực */}
                    <div>
                      <label className="block text-xs font-semibold text-[#566a7f] mb-1">
                        Học lực hiện tại của bé
                      </label>
                      <select
                        value={form.academicLevel}
                        onChange={(e) => setForm({ ...form, academicLevel: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white border border-[#d9dee3] rounded-xl text-sm text-[#566a7f] focus:outline-none focus:border-[#696cff]"
                      >
                        <option value="WEAK">Mất gốc / Yếu kém (cần kèm sát từ đầu)</option>
                        <option value="AVERAGE">Trung bình (cần củng cố kiến thức cơ bản)</option>
                        <option value="GOOD">Khá (cần rèn luyện phương pháp nâng cao)</option>
                        <option value="EXCELLENT">Giỏi / Luyện thi HSG, Chuyên</option>
                      </select>
                    </div>

                    {/* Chọn môn học dạng Tags */}
                    <div>
                      <label className="block text-xs font-semibold text-[#566a7f] mb-1.5 flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <Tag size={14} className="text-[#696cff]" /> Môn học cần kèm (chọn tags)
                        </span>
                        <span className="text-[11px] text-[#a1acb8] font-normal">
                          Đã chọn: {selectedSubjects.length} môn
                        </span>
                      </label>

                      {/* Các tag đã chọn */}
                      {selectedSubjects.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-2.5 p-2 bg-[#f5f5f9] rounded-xl border border-dashed border-[#d9dee3]">
                          {selectedSubjects.map((sub) => (
                            <span
                              key={sub}
                              className="inline-flex items-center gap-1 bg-[#696cff] text-white text-xs font-semibold px-2.5 py-1 rounded-lg shadow-sm"
                            >
                              <span>{sub}</span>
                              <button
                                type="button"
                                onClick={() => removeSubject(sub)}
                                className="hover:bg-white/20 rounded-full p-0.5 cursor-pointer transition-colors"
                              >
                                <X size={12} />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Gợi ý tags phổ biến */}
                      <div className="space-y-1.5">
                        <p className="text-[11px] text-[#a1acb8]">Môn học phổ biến (bấm để chọn nhanh):</p>
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
                                    ? 'bg-[#696cff]/15 border-[#696cff] text-[#696cff] font-bold'
                                    : 'bg-white border-[#d9dee3] text-[#697a8d] hover:border-[#696cff]/60 hover:text-[#696cff]'
                                }`}
                              >
                                {isSelected && <Check size={12} />}
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
                          className="flex-1 px-3 py-1.5 text-xs bg-white border border-[#d9dee3] rounded-lg text-[#566a7f] focus:outline-none focus:border-[#696cff]"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddCustomSubject()}
                          className="px-3 py-1.5 bg-[#f5f5f9] hover:bg-gray-200 text-[#566a7f] font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                        >
                          + Thêm
                        </button>
                      </div>
                    </div>

                    {/* Mục tiêu học tập + Gợi ý */}
                    <div>
                      <label className="block text-xs font-semibold text-[#566a7f] mb-1">
                        Mục tiêu học tập cụ thể
                      </label>
                      <input
                        type="text"
                        maxLength={255}
                        placeholder="Ví dụ: Thi vào 10 chuyên, Luyện thi THPTQG, Lấy lại gốc cấp tốc..."
                        value={form.targetGoal}
                        onChange={(e) => setForm({ ...form, targetGoal: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white border border-[#d9dee3] rounded-xl text-sm text-[#566a7f] focus:outline-none focus:border-[#696cff]"
                      />
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        <span className="text-[10px] text-[#a1acb8] mr-1 self-center">Gợi ý:</span>
                        {GOAL_SUGGESTIONS.map((g) => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => handleSelectGoalSuggestion(g)}
                            className="text-[10px] px-2 py-0.5 bg-gray-100 hover:bg-[#696cff]/10 hover:text-[#696cff] text-[#697a8d] rounded-md transition-colors cursor-pointer"
                          >
                            + {g}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Đặc điểm tính cách / Tâm lý + Gợi ý */}
                    <div>
                      <label className="block text-xs font-semibold text-[#566a7f] mb-1">
                        Đặc điểm tính cách & Tâm lý của con
                      </label>
                      <input
                        type="text"
                        maxLength={255}
                        placeholder="Ví dụ: Nhút nhát ngại hỏi, Hiếu động, Cần gia sư kiên nhẫn..."
                        value={form.personalityTraits}
                        onChange={(e) => setForm({ ...form, personalityTraits: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white border border-[#d9dee3] rounded-xl text-sm text-[#566a7f] focus:outline-none focus:border-[#696cff]"
                      />
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        <span className="text-[10px] text-[#a1acb8] mr-1 self-center">Gợi ý:</span>
                        {PERSONALITY_SUGGESTIONS.map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => handleSelectPersonalitySuggestion(p)}
                            className="text-[10px] px-2 py-0.5 bg-gray-100 hover:bg-[#696cff]/10 hover:text-[#696cff] text-[#697a8d] rounded-md transition-colors cursor-pointer"
                          >
                            + {p}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Ghi chú thêm cho Giáo vụ */}
                    <div>
                      <label className="block text-xs font-semibold text-[#566a7f] mb-1">
                        Ghi chú thêm cho Giáo vụ / Tư vấn viên
                      </label>
                      <textarea
                        rows={2}
                        maxLength={500}
                        placeholder="Yêu cầu riêng về phong cách dạy, thời gian rảnh, dặn dò khác..."
                        value={form.notes}
                        onChange={(e) => setForm({ ...form, notes: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white border border-[#d9dee3] rounded-xl text-sm text-[#566a7f] focus:outline-none focus:border-[#696cff] resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex gap-3 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={handleRequestClose}
                    className="flex-1 py-2.5 bg-[#f5f5f9] hover:bg-gray-200 text-[#697a8d] rounded-xl text-sm font-semibold cursor-pointer transition-colors"
                  >
                    Hủy bỏ
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-2.5 bg-[#696cff] hover:bg-[#5f61e6] active:bg-[#595cd9] disabled:opacity-50 text-white font-bold rounded-xl text-sm cursor-pointer shadow-[0_2px_4px_0_rgba(105,108,255,0.4)] transition-all flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader size={16} className="animate-spin" />
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
          </div>
        )}

        {/* POPUP 1: XÁC NHẬN THOÁT KHI CHƯA LƯU */}
        {showUnsavedExitModal && (
          <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl border border-gray-100 space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#ffab00]/15 text-[#ffab00] mx-auto flex items-center justify-center">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h4 className="text-base font-bold text-[#566a7f]">Bạn có chắc muốn thoát?</h4>
                <p className="text-xs text-[#a1acb8] mt-2 leading-relaxed">
                  Thông tin bạn vừa nhập chưa được lưu. Nếu thoát ngay, các thay đổi sẽ bị mất.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUnsavedExitModal(false)}
                  className="py-2.5 px-3 rounded-xl border border-gray-200 text-[#566a7f] hover:bg-gray-50 text-xs font-bold transition-all cursor-pointer"
                >
                  Tiếp tục chỉnh sửa
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowUnsavedExitModal(false);
                    setModalOpen(false);
                  }}
                  className="py-2.5 px-3 rounded-xl bg-[#ff3e1d] hover:bg-[#e6381a] text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
                >
                  Thoát không lưu
                </button>
              </div>
            </div>
          </div>
        )}

        {/* POPUP 3: XÁC NHẬN LƯU HỒ SƠ THÀNH CÔNG & ĐĂNG KÝ GIA SƯ */}
        {showSuccessModal && createdStudentInfo && (
          <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl border border-gray-100 space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#71dd37]/15 text-[#71dd37] mx-auto flex items-center justify-center shadow-sm">
                <CheckCircle2 size={32} />
              </div>
              <div>
                <h4 className="text-lg font-bold text-[#566a7f]">Thêm hồ sơ thành công! 🎉</h4>
                <p className="text-xs text-[#697a8d] mt-2 leading-relaxed">
                  Hồ sơ của bé <strong className="text-[#696cff]">{createdStudentInfo.fullName}</strong> đã được lưu.
                  Bạn có muốn đăng ký gia sư cho bé ngay bây giờ không?
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowSuccessModal(false);
                    setCreatedStudentInfo(null);
                  }}
                  className="py-2.5 px-3 rounded-xl border border-gray-200 text-[#697a8d] hover:bg-gray-50 text-xs font-bold transition-all cursor-pointer"
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
                  className="py-2.5 px-3 rounded-xl bg-[#696cff] hover:bg-[#5f61e6] text-white text-xs font-bold transition-all cursor-pointer shadow-[0_2px_4px_0_rgba(105,108,255,0.4)] flex items-center justify-center gap-1.5"
                >
                  <Sparkles size={14} /> Đăng ký gia sư
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageTemplate>
  );
}
