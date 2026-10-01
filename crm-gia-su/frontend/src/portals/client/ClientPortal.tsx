import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Calendar, UserCheck, Plus, MapPin, Edit3 } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import PageTemplate from '../../components/PageTemplate';

export default function ClientPortal() {
  const { activeProfile } = useAuth();
  const isParent = activeProfile?.type === 'PARENT' && !activeProfile?.subType;

  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileInfo, setProfileInfo] = useState<any>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profForm, setProfForm] = useState({ fullName: '', address: '', district: '', province: '' });
  const [profileLoading, setProfileLoading] = useState(false);

  const fetchWalletAndClasses = async () => {
    setLoading(true);
    try {
      const clsRes = await api.get('/api/v1/classes');
      setClasses(clsRes.data);

      if (isParent) {
        const profRes = await api.get('/api/v1/crm/parent/profile');
        setProfileInfo(profRes.data);
        setProfForm({
          fullName: profRes.data?.fullName || '',
          address: profRes.data?.address || '',
          district: profRes.data?.district || '',
          province: profRes.data?.province || '',
        });
      }
    } catch (err) {
      console.error('Không thể tải thông tin ví/lớp học/hồ sơ', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const payload: any = {
        fullName: profForm.fullName,
        address: profForm.address,
        district: profForm.district,
        province: profForm.province,
      };
      await api.post('/api/v1/crm/parent/profile', payload);
      alert('Đã cập nhật hồ sơ phụ huynh thành công!');
      setEditingProfile(false);
      fetchWalletAndClasses();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Cập nhật thất bại');
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletAndClasses();
  }, []);

  return (
    <PageTemplate
      title="Cổng Phụ Huynh & Học Sinh"
      subtitle="Quản lý lịch học, hồ sơ con em và đăng ký tìm kiếm gia sư"
      badge="Client Portal"
    >
      <div className="w-full space-y-6 text-left font-sans text-[#566a7f]">
        {/* Quick Nav Action Ribbon */}
        {isParent && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#566a7f]">
              <span className="w-2 h-2 rounded-full bg-[#696cff]"></span>
              <span>Lối tắt quản lý:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                to="/client/children"
                className="px-3.5 py-1.5 bg-[#f5f5f9] hover:bg-[#696cff]/10 text-[#697a8d] hover:text-[#696cff] text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Users size={14} /> Con của tôi
              </Link>
              <Link
                to="/client/leaves"
                className="px-3.5 py-1.5 bg-[#f5f5f9] hover:bg-[#696cff]/10 text-[#697a8d] hover:text-[#696cff] text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Calendar size={14} /> Báo Nghỉ & Dời Lịch
              </Link>
              <Link
                to="/client/attendance"
                className="px-3.5 py-1.5 bg-[#f5f5f9] hover:bg-[#696cff]/10 text-[#697a8d] hover:text-[#696cff] text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
              >
                <UserCheck size={14} /> Đánh Giá Dạy Thử
              </Link>
              <Link
                to="/client/request-tutor"
                className="px-3.5 py-1.5 bg-[#696cff] hover:bg-[#5f61e6] text-white text-xs font-semibold rounded-lg shadow-[0_2px_4px_0_rgba(105,108,255,0.4)] transition-all flex items-center gap-1.5"
              >
                <Plus size={14} /> Đăng Ký Tìm Gia Sư
              </Link>
            </div>
          </div>
        )}

        {/* Profile Settings Section */}
        {isParent && profileInfo && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-[#566a7f]">Hồ sơ cá nhân Phụ huynh</h3>
                <p className="text-xs text-[#a1acb8] mt-0.5">
                  Cập nhật thông tin liên hệ và địa chỉ của bạn để tiện phối hợp điều phối lớp học.
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
                <div className="p-4 bg-[#f9f9fa] border border-gray-100 rounded-xl space-y-1">
                  <span className="text-[#a1acb8] uppercase font-bold text-[10px]">Họ và tên Phụ huynh</span>
                  <div className="font-bold text-[#566a7f] text-sm">{profileInfo.fullName || 'Chưa cập nhật'}</div>
                </div>

                <div className="p-4 bg-[#f9f9fa] border border-gray-100 rounded-xl space-y-1">
                  <span className="text-[#a1acb8] uppercase font-bold text-[10px] flex items-center gap-1">
                    <MapPin size={11} /> Địa chỉ liên lạc
                  </span>
                  <div className="text-[#566a7f] font-semibold">
                    {profileInfo.address || 'Chưa cập nhật'}, {profileInfo.district || 'Chưa cập nhật'}, {profileInfo.province || 'Chưa cập nhật'}
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#566a7f] mb-1.5">Địa chỉ</label>
                    <input
                      type="text"
                      required
                      placeholder="Số nhà, tên đường..."
                      value={profForm.address}
                      onChange={(e) => setProfForm((prev) => ({ ...prev, address: e.target.value }))}
                      className="w-full px-3.5 py-2.5 bg-[#f5f5f9] border border-[#d9dee3] rounded-lg text-xs text-[#566a7f] focus:outline-none focus:border-[#696cff] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#566a7f] mb-1.5">Quận / Huyện</label>
                    <input
                      type="text"
                      required
                      placeholder="Quận Cầu Giấy..."
                      value={profForm.district}
                      onChange={(e) => setProfForm((prev) => ({ ...prev, district: e.target.value }))}
                      className="w-full px-3.5 py-2.5 bg-[#f5f5f9] border border-[#d9dee3] rounded-lg text-xs text-[#566a7f] focus:outline-none focus:border-[#696cff] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#566a7f] mb-1.5">Tỉnh / Thành phố</label>
                    <input
                      type="text"
                      required
                      placeholder="Hà Nội..."
                      value={profForm.province}
                      onChange={(e) => setProfForm((prev) => ({ ...prev, province: e.target.value }))}
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
          <div className="flex justify-between items-center pb-2 border-b border-gray-100">
            <div>
              <h3 className="text-lg font-bold text-[#566a7f]">Danh sách lớp học của gia đình</h3>
              <p className="text-xs text-[#a1acb8] mt-0.5">Theo dõi trạng thái giảng dạy và tiến độ các buổi học</p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#e7e7ff] text-[#696cff]">
              {classes.length} lớp học
            </span>
          </div>

          {loading ? (
            <div className="text-center py-12 text-[#a1acb8] text-sm">Đang tải danh sách lớp học...</div>
          ) : classes.length === 0 ? (
            <div className="text-center py-12 text-[#a1acb8] text-sm">
              Chưa có lớp học nào đang hoạt động. Hãy tạo yêu cầu tìm gia sư để bắt đầu!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {classes.map((cls) => (
                <div
                  key={cls.id}
                  className="p-5 bg-[#f9f9fa] border border-gray-100 hover:border-[#696cff]/40 rounded-xl transition-all shadow-sm flex flex-col justify-between space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-[#566a7f] text-base">
                        Học sinh: {cls.student?.fullName || 'Chưa rõ'}
                      </h4>
                      <p className="text-xs text-[#a1acb8] mt-1">
                        Gia sư: <strong className="text-[#696cff]">{cls.tutor?.fullName || 'Chờ điều phối'}</strong>
                      </p>
                    </div>
                    <span
                      className={`px-2.5 py-1 text-xs font-bold rounded-md ${
                        cls.status === 'TEACHING'
                          ? 'bg-[#e8fadf] text-[#71dd37]'
                          : cls.status === 'TRIAL'
                          ? 'bg-[#fff8e1] text-[#ffab00]'
                          : 'bg-[#e7e7ff] text-[#696cff]'
                      }`}
                    >
                      {cls.status === 'TRIAL' ? 'Dạy thử' : cls.status === 'TEACHING' ? 'Đang học chính thức' : cls.status}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between text-xs">
                    <span className="text-[#697a8d]">
                      Đơn giá: <strong className="text-[#71dd37]">{parseInt(cls.hourlyRate).toLocaleString()}đ/buổi</strong>
                    </span>
                    <span className="text-[#697a8d]">
                      Số buổi còn lại: <strong className="text-[#696cff]">{cls.remainingSessions ?? 0}</strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageTemplate>
  );
}
