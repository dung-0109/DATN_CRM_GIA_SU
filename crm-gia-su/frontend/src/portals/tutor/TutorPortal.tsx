import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, Award, Edit3 } from 'lucide-react';
import api from '../../services/api';
import PageTemplate from '../../components/PageTemplate';

export default function TutorPortal() {
  const [classes, setClasses] = useState<any[]>([]);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Bank Form State
  const [newBank, setNewBank] = useState({ bankName: '', accountNumber: '', accountHolder: '' });
  const [bankError, setBankError] = useState('');

  // Schedule Form State
  const [newSched, setNewSched] = useState({ dayOfWeek: 2, slotStart: '08:00', slotEnd: '10:00' });

  // Tutor Profile state
  const [profileInfo, setProfileInfo] = useState<any>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profForm, setProfForm] = useState({
    fullName: '',
    gender: 'Nam',
    dateOfBirth: '2000-01-01',
    identityNumber: '',
    occupation: '',
    qualification: '',
  });
  const [profileLoading, setProfileLoading] = useState(false);

  const fetchTutorData = async () => {
    setLoading(true);
    try {
      const clsRes = await api.get('/api/v1/classes');
      setClasses(clsRes.data);

      const bankRes = await api.get('/api/v1/crm/tutor/bank-accounts');
      setBankAccounts(bankRes.data);

      const schedRes = await api.get('/api/v1/crm/tutor/schedules');
      setSchedules(schedRes.data);

      const profRes = await api.get('/api/v1/crm/tutor/profile');
      setProfileInfo(profRes.data);
      setProfForm({
        fullName: profRes.data?.fullName || '',
        gender: profRes.data?.gender || 'Nam',
        dateOfBirth: profRes.data?.dateOfBirth ? new Date(profRes.data.dateOfBirth).toISOString().split('T')[0] : '2000-01-01',
        identityNumber: profRes.data?.identityNumber || '',
        occupation: profRes.data?.occupation || '',
        qualification: profRes.data?.qualification || '',
      });
    } catch (err) {
      console.error('Không thể tải thông tin ví/lớp học gia sư/hồ sơ', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      await api.post('/api/v1/crm/tutor/profile', profForm);
      alert('Đã cập nhật hồ sơ gia sư thành công!');
      setEditingProfile(false);
      fetchTutorData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Cập nhật thất bại');
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    fetchTutorData();
  }, []);

  const handleAddBank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBank.bankName || !newBank.accountNumber || !newBank.accountHolder) {
      setBankError('Vui lòng điền đầy đủ thông tin tài khoản.');
      return;
    }
    try {
      setBankError('');
      await api.post('/api/v1/crm/tutor/bank-accounts', newBank);
      setNewBank({ bankName: '', accountNumber: '', accountHolder: '' });
      const bankRes = await api.get('/api/v1/crm/tutor/bank-accounts');
      setBankAccounts(bankRes.data);
      alert('Đã liên kết tài khoản ngân hàng thành công!');
    } catch (err: any) {
      setBankError(err.response?.data?.message || err.message || 'Thất bại');
    }
  };

  const handleDeleteBank = async (id: string) => {
    if (!confirm('Bạn có chắc muốn huỷ liên kết tài khoản ngân hàng này?')) return;
    try {
      await api.delete(`/api/v1/crm/tutor/bank-accounts/${id}`);
      const bankRes = await api.get('/api/v1/crm/tutor/bank-accounts');
      setBankAccounts(bankRes.data);
      alert('Đã huỷ liên kết tài khoản ngân hàng!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Thất bại');
    }
  };

  const handleAddSchedSlot = () => {
    const exists = schedules.some(
      (s) =>
        s.dayOfWeek === Number(newSched.dayOfWeek) &&
        s.slotStart === newSched.slotStart &&
        s.slotEnd === newSched.slotEnd
    );
    if (exists) {
      alert('Khung giờ này đã tồn tại trong lịch đề xuất!');
      return;
    }
    setSchedules((prev) =>
      [
        ...prev,
        {
          dayOfWeek: Number(newSched.dayOfWeek),
          slotStart: newSched.slotStart,
          slotEnd: newSched.slotEnd,
        },
      ].sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.slotStart.localeCompare(b.slotStart))
    );
  };

  const handleRemoveSchedSlot = (index: number) => {
    setSchedules((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveSchedules = async () => {
    try {
      const res = await api.post('/api/v1/crm/tutor/schedules', { schedules });
      setSchedules(res.data);
      alert('Đã lưu cấu hình lịch rảnh giảng dạy thành công!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lưu lịch rảnh thất bại');
    }
  };

  const getDayName = (day: number) => {
    if (day === 8) return 'Chủ Nhật';
    return `Thứ ${day}`;
  };

  return (
    <PageTemplate
      title="Cổng Gia Sư & Giáo Viên"
      subtitle="Quản lý lịch rảnh, hồ sơ chuyên môn và đối soát thu nhập giảng dạy"
      badge="Tutor Portal"
    >
      <div className="flex flex-col lg:flex-row gap-6 w-full text-left items-start font-sans text-[#566a7f]">
        {/* Left Column: Profile, Classes, Schedules */}
        <div className="flex-1 w-full space-y-6">
          {/* Profile Card */}
          {profileInfo && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-[#566a7f]">Hồ sơ cá nhân Gia sư</h3>
                  <p className="text-xs text-[#a1acb8] mt-0.5">
                    Cấu hình thông tin giảng dạy, học vị và CCCD xác minh với trung tâm.
                  </p>
                </div>
                <button
                  onClick={() => setEditingProfile(!editingProfile)}
                  className="px-3.5 py-1.5 bg-[#f5f5f9] hover:bg-gray-200 rounded-lg text-xs font-semibold text-[#697a8d] hover:text-[#566a7f] transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Edit3 size={13} />
                  <span>{editingProfile ? 'Đóng' : 'Chỉnh sửa'}</span>
                </button>
              </div>

              {!editingProfile ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
                  <div className="p-4 bg-[#f9f9fa] border border-gray-100 rounded-xl space-y-2">
                    <div>
                      <span className="text-[#a1acb8] uppercase font-bold text-[10px]">Họ và tên Gia sư</span>
                      <div className="font-bold text-[#566a7f] text-sm mt-0.5">{profileInfo.fullName}</div>
                    </div>
                    <div>
                      <span className="text-[#a1acb8] uppercase font-bold text-[10px]">Số CCCD / CMND</span>
                      <div className="text-[#566a7f] mt-0.5 font-mono">{profileInfo.identityNumber || 'Chưa cập nhật'}</div>
                    </div>
                    <div>
                      <span className="text-[#a1acb8] uppercase font-bold text-[10px]">Giới tính / Ngày sinh</span>
                      <div className="text-[#697a8d] mt-0.5">
                        {profileInfo.gender} | {profileInfo.dateOfBirth ? new Date(profileInfo.dateOfBirth).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-[#f9f9fa] border border-gray-100 rounded-xl space-y-2">
                    <div>
                      <span className="text-[#a1acb8] uppercase font-bold text-[10px]">Học vị / Trình độ</span>
                      <div className="text-[#566a7f] mt-0.5 font-semibold">{profileInfo.qualification || 'Chưa cập nhật'}</div>
                    </div>
                    <div>
                      <span className="text-[#a1acb8] uppercase font-bold text-[10px]">Nghề nghiệp hiện tại</span>
                      <div className="text-[#566a7f] mt-0.5">{profileInfo.occupation || 'Chưa cập nhật'}</div>
                    </div>
                    <div>
                      <span className="text-[#a1acb8] uppercase font-bold text-[10px]">Trạng thái kiểm duyệt</span>
                      <div className="mt-1">
                        <span
                          className={`px-2 py-0.5 text-xs font-bold rounded-md ${
                            profileInfo.status === 'ACTIVE'
                              ? 'bg-[#e8fadf] text-[#71dd37]'
                              : 'bg-[#fff8e1] text-[#ffab00]'
                          }`}
                        >
                          {profileInfo.status === 'ACTIVE' ? 'Đã kích hoạt' : 'Chờ kiểm duyệt'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleUpdateProfile} className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#566a7f] mb-1.5">Họ và Tên</label>
                      <input
                        type="text"
                        required
                        value={profForm.fullName}
                        onChange={(e) => setProfForm((prev) => ({ ...prev, fullName: e.target.value }))}
                        className="w-full px-3.5 py-2.5 bg-[#f5f5f9] border border-[#d9dee3] rounded-lg text-xs text-[#566a7f] focus:outline-none focus:border-[#696cff] transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#566a7f] mb-1.5">Số CCCD / CMND</label>
                      <input
                        type="text"
                        required
                        placeholder="Số CCCD..."
                        value={profForm.identityNumber}
                        onChange={(e) => setProfForm((prev) => ({ ...prev, identityNumber: e.target.value }))}
                        className="w-full px-3.5 py-2.5 bg-[#f5f5f9] border border-[#d9dee3] rounded-lg text-xs text-[#566a7f] focus:outline-none focus:border-[#696cff] transition-all font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#566a7f] mb-1.5">Giới tính</label>
                      <select
                        value={profForm.gender}
                        onChange={(e) => setProfForm((prev) => ({ ...prev, gender: e.target.value }))}
                        className="w-full px-3.5 py-2.5 bg-[#f5f5f9] border border-[#d9dee3] rounded-lg text-xs text-[#566a7f] focus:outline-none focus:border-[#696cff] transition-all"
                      >
                        <option value="Nam">Nam</option>
                        <option value="Nữ">Nữ</option>
                        <option value="Khác">Khác</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#566a7f] mb-1.5">Ngày sinh</label>
                      <input
                        type="date"
                        required
                        value={profForm.dateOfBirth}
                        onChange={(e) => setProfForm((prev) => ({ ...prev, dateOfBirth: e.target.value }))}
                        className="w-full px-3.5 py-2.5 bg-[#f5f5f9] border border-[#d9dee3] rounded-lg text-xs text-[#566a7f] focus:outline-none focus:border-[#696cff] transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#566a7f] mb-1.5">Nghề nghiệp hiện tại</label>
                      <input
                        type="text"
                        required
                        placeholder="Sinh viên ĐH Sư Phạm, Giáo viên..."
                        value={profForm.occupation}
                        onChange={(e) => setProfForm((prev) => ({ ...prev, occupation: e.target.value }))}
                        className="w-full px-3.5 py-2.5 bg-[#f5f5f9] border border-[#d9dee3] rounded-lg text-xs text-[#566a7f] focus:outline-none focus:border-[#696cff] transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#566a7f] mb-1.5">Trình độ / Học vị</label>
                      <input
                        type="text"
                        required
                        placeholder="Cử nhân Sư Phạm, Thạc sĩ..."
                        value={profForm.qualification}
                        onChange={(e) => setProfForm((prev) => ({ ...prev, qualification: e.target.value }))}
                        className="w-full px-3.5 py-2.5 bg-[#f5f5f9] border border-[#d9dee3] rounded-lg text-xs text-[#566a7f] focus:outline-none focus:border-[#696cff] transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingProfile(false)}
                      className="px-4 py-2 bg-[#f5f5f9] hover:bg-gray-200 text-[#697a8d] rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                    >
                      Huỷ
                    </button>
                    <button
                      type="submit"
                      disabled={profileLoading}
                      className="px-4 py-2 bg-[#696cff] hover:bg-[#5f61e6] disabled:opacity-50 text-white font-bold text-xs rounded-lg shadow-sm cursor-pointer transition-colors"
                    >
                      {profileLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Classes List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-2 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-[#566a7f]">Danh sách lớp học đang dạy</h3>
                <p className="text-xs text-[#a1acb8] mt-0.5">Tiến độ và hợp đồng các lớp đang đảm nhiệm</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  to="/tutor/leaves"
                  className="px-3 py-1.5 bg-[#f5f5f9] hover:bg-[#696cff]/10 text-[#697a8d] hover:text-[#696cff] rounded-lg text-xs font-semibold transition-colors"
                >
                  Báo Nghỉ & Dời Lịch
                </Link>
                <Link
                  to="/tutor/attendance"
                  className="px-3 py-1.5 bg-[#f5f5f9] hover:bg-[#696cff]/10 text-[#697a8d] hover:text-[#696cff] rounded-lg text-xs font-semibold transition-colors"
                >
                  Ghi Điểm Danh
                </Link>
                <Link
                  to="/tutor/jobs"
                  className="px-3 py-1.5 bg-[#696cff] hover:bg-[#5f61e6] text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
                >
                  Xem Lớp Tuyển Dụng
                </Link>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8 text-[#a1acb8] text-sm">Đang tải danh sách lớp học...</div>
            ) : classes.length === 0 ? (
              <div className="text-center py-8 text-[#a1acb8] text-sm">
                Bạn chưa nhận lớp nào. Hãy xem bảng tin Tuyển dụng để ứng tuyển!
              </div>
            ) : (
              <div className="space-y-3">
                {classes.map((cls) => (
                  <div
                    key={cls.id}
                    className="p-4 bg-[#f9f9fa] border border-gray-100 rounded-xl flex flex-col gap-2 hover:border-[#696cff]/40 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-[#566a7f] text-sm">
                          Học sinh: {cls.student?.fullName || 'Chưa rõ'}
                        </h4>
                        <p className="text-xs text-[#a1acb8] mt-0.5">
                          Lương nhận: <strong className="text-[#71dd37]">{parseInt(cls.tutorWageRate || cls.hourlyRate).toLocaleString()}đ/buổi</strong>
                        </p>
                      </div>
                      <span
                        className={`px-2.5 py-1 text-xs font-bold rounded-md ${
                          cls.status === 'DEPOSIT'
                            ? 'bg-[#fff8e1] text-[#ffab00]'
                            : cls.status === 'TRIAL'
                            ? 'bg-[#e7e7ff] text-[#696cff]'
                            : 'bg-[#e8fadf] text-[#71dd37]'
                        }`}
                      >
                        {cls.status === 'DEPOSIT' ? 'Chờ Nộp Cọc' : cls.status === 'TRIAL' ? 'Đang Dạy Thử' : 'Đang Giảng Dạy'}
                      </span>
                    </div>

                    {cls.status === 'DEPOSIT' && (
                      <div className="mt-2 p-3 bg-[#fff8e1] border border-[#ffab00]/30 rounded-lg flex items-center justify-between">
                        <span className="text-xs text-[#ffab00] font-semibold">
                          Bạn cần nộp 500,000đ tiền cọc nhận lớp.
                        </span>
                        <button
                          onClick={() => {
                            api.post('/api/v1/finance/deposit', { classId: cls.id, amount: 500000 })
                              .then(() => {
                                alert('Đã nộp cọc giả lập thành công!');
                                fetchTutorData();
                              })
                              .catch((err) => alert(err.response?.data?.message || 'Lỗi nộp cọc'));
                          }}
                          className="px-3 py-1.5 bg-[#ffab00] hover:bg-[#e69a00] text-white font-bold rounded-md text-xs cursor-pointer shadow-sm transition-all"
                        >
                          Quét mã QR nộp cọc
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Schedules Setting */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
            <div>
              <h3 className="text-lg font-bold text-[#566a7f]">Đăng ký Lịch rảnh trong tuần</h3>
              <p className="text-xs text-[#a1acb8] mt-0.5">
                Cấu hình các khung giờ rảnh để hệ thống tự động ghép lớp phù hợp với bạn.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end p-4 bg-[#f9f9fa] border border-gray-100 rounded-xl">
              <div>
                <label className="block text-xs font-semibold text-[#566a7f] mb-1.5">Ngày trong tuần</label>
                <select
                  value={newSched.dayOfWeek}
                  onChange={(e) => setNewSched((prev) => ({ ...prev, dayOfWeek: Number(e.target.value) }))}
                  className="w-full px-3 py-2 bg-white border border-[#d9dee3] rounded-lg text-xs text-[#566a7f] focus:outline-none focus:border-[#696cff]"
                >
                  <option value={2}>Thứ 2</option>
                  <option value={3}>Thứ 3</option>
                  <option value={4}>Thứ 4</option>
                  <option value={5}>Thứ 5</option>
                  <option value={6}>Thứ 6</option>
                  <option value={7}>Thứ 7</option>
                  <option value={8}>Chủ Nhật</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#566a7f] mb-1.5">Giờ bắt đầu</label>
                <input
                  type="time"
                  value={newSched.slotStart}
                  onChange={(e) => setNewSched((prev) => ({ ...prev, slotStart: e.target.value }))}
                  className="w-full px-3 py-2 bg-white border border-[#d9dee3] rounded-lg text-xs text-[#566a7f] focus:outline-none focus:border-[#696cff]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#566a7f] mb-1.5">Giờ kết thúc</label>
                <input
                  type="time"
                  value={newSched.slotEnd}
                  onChange={(e) => setNewSched((prev) => ({ ...prev, slotEnd: e.target.value }))}
                  className="w-full px-3 py-2 bg-white border border-[#d9dee3] rounded-lg text-xs text-[#566a7f] focus:outline-none focus:border-[#696cff]"
                />
              </div>

              <button
                type="button"
                onClick={handleAddSchedSlot}
                className="w-full py-2 bg-[#696cff] hover:bg-[#5f61e6] text-white font-bold text-xs rounded-lg cursor-pointer transition-all shadow-sm"
              >
                + Thêm khung giờ
              </button>
            </div>

            {schedules.length === 0 ? (
              <div className="text-center py-6 text-[#a1acb8] text-xs italic border border-dashed border-gray-200 rounded-xl">
                Chưa có khung giờ rảnh nào. Hãy thêm khung giờ ở trên.
              </div>
            ) : (
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {schedules.map((s, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-[#f9f9fa] border border-gray-100 rounded-lg flex justify-between items-center"
                  >
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 bg-[#e7e7ff] text-[#696cff] font-bold rounded text-xs">
                        {getDayName(s.dayOfWeek)}
                      </span>
                      <span className="text-xs text-[#566a7f] font-semibold font-mono">
                        {s.slotStart} - {s.slotEnd}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveSchedSlot(idx)}
                      className="text-xs font-semibold text-[#ff3e1d] hover:text-[#d63317] cursor-pointer"
                    >
                      Xoá
                    </button>
                  </div>
                ))}
              </div>
            )}

            {schedules.length > 0 && (
              <button
                onClick={handleSaveSchedules}
                className="px-4 py-2 bg-[#71dd37] hover:bg-[#65c731] text-white font-bold text-xs rounded-lg shadow-sm cursor-pointer transition-all"
              >
                Lưu lịch rảnh giảng dạy
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Karma & Linked Bank Accounts */}
        <div className="w-full lg:w-80 shrink-0 space-y-6">
          {/* Karma Score Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex justify-between items-center relative overflow-hidden">
            <div>
              <span className="text-[#a1acb8] text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Award size={14} className="text-[#71dd37]" /> Điểm Uy Tín (Karma)
              </span>
              <div className="flex items-end gap-2 mt-2">
                <h2 className="text-4xl font-extrabold text-[#71dd37]">{profileInfo?.karmaScore || 0}</h2>
                <span className="text-[#a1acb8] font-bold mb-1 text-sm">/ 100</span>
              </div>
            </div>
            <button
              onClick={fetchTutorData}
              className="p-2.5 bg-[#f5f5f9] hover:bg-gray-200 text-[#697a8d] rounded-lg transition-colors cursor-pointer"
              title="Làm mới"
            >
              <RefreshCw size={16} />
            </button>
          </div>

          {/* Linked Bank Accounts */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
            <div>
              <h3 className="text-base font-bold text-[#566a7f]">Tài khoản Ngân hàng (Ví)</h3>
              <p className="text-xs text-[#a1acb8] mt-0.5">
                Nhận tiền lương giảng dạy và hoàn tiền cọc sau quá trình dạy.
              </p>
            </div>

            <div className="space-y-2.5">
              {bankAccounts.length === 0 ? (
                <div className="text-center py-4 text-[#a1acb8] text-xs italic">
                  Chưa liên kết tài khoản ngân hàng nào.
                </div>
              ) : (
                bankAccounts.map((acc) => (
                  <div key={acc.id} className="p-3 bg-[#f9f9fa] border border-gray-100 rounded-lg space-y-1 relative">
                    <button
                      onClick={() => handleDeleteBank(acc.id)}
                      className="absolute top-3 right-3 text-xs text-[#ff3e1d] hover:text-[#d63317] font-semibold cursor-pointer"
                    >
                      Xoá
                    </button>
                    <div className="text-xs font-bold text-[#566a7f]">{acc.bankName}</div>
                    <div className="text-xs font-mono text-[#696cff]">{acc.accountNumber}</div>
                    <div className="text-[10px] uppercase font-semibold text-[#a1acb8]">{acc.accountHolder}</div>
                    {acc.isDefault && (
                      <span className="inline-block mt-1 px-1.5 py-0.5 bg-[#e8fadf] text-[#71dd37] font-bold text-[10px] rounded">
                        Mặc định
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>

            {bankAccounts.length < 3 && (
              <form onSubmit={handleAddBank} className="pt-3 border-t border-gray-100 space-y-2.5">
                <span className="text-xs font-bold text-[#566a7f] block">Liên kết tài khoản mới</span>

                {bankError && (
                  <div className="text-xs text-[#ff3e1d] bg-[#ffe0db] p-2 rounded-lg">{bankError}</div>
                )}

                <div>
                  <input
                    type="text"
                    placeholder="Tên Ngân hàng (Vietcombank...)"
                    value={newBank.bankName}
                    onChange={(e) => setNewBank((prev) => ({ ...prev, bankName: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#f5f5f9] border border-[#d9dee3] rounded-lg text-xs text-[#566a7f] focus:outline-none focus:border-[#696cff]"
                  />
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Số tài khoản"
                    value={newBank.accountNumber}
                    onChange={(e) => setNewBank((prev) => ({ ...prev, accountNumber: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#f5f5f9] border border-[#d9dee3] rounded-lg text-xs text-[#566a7f] focus:outline-none focus:border-[#696cff] font-mono"
                  />
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Tên chủ tài khoản"
                    value={newBank.accountHolder}
                    onChange={(e) => setNewBank((prev) => ({ ...prev, accountHolder: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#f5f5f9] border border-[#d9dee3] rounded-lg text-xs text-[#566a7f] focus:outline-none focus:border-[#696cff] uppercase"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-[#696cff] hover:bg-[#5f61e6] text-white font-bold text-xs rounded-lg cursor-pointer transition-all shadow-sm"
                >
                  Liên kết tài khoản
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </PageTemplate>
  );
}
