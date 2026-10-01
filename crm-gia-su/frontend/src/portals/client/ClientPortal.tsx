import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Calendar, UserCheck, Plus, MapPin, Edit3, AlertTriangle, GraduationCap, Search, PlayCircle, Star, ArrowRight, ClipboardList, Clock } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import PageTemplate from '../../components/PageTemplate';

export default function ClientPortal() {
  const { activeProfile } = useAuth();
  const isParent = activeProfile?.type === 'PARENT' && !activeProfile?.subType;

  const [classes, setClasses] = useState<any[]>([]);
  const [tutorRequests, setTutorRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileInfo, setProfileInfo] = useState<any>(null);
  const [parentStats, setParentStats] = useState<any>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profForm, setProfForm] = useState({ fullName: '', address: '', district: '', province: '' });
  const [profileLoading, setProfileLoading] = useState(false);

  const fetchWalletAndClasses = async () => {
    setLoading(true);
    try {
      if (isParent) {
        const [profRes, statsRes, clsRes, reqsRes] = await Promise.allSettled([
          api.get('/api/v1/crm/parent/profile'),
          api.get('/api/v1/crm/parent/stats'),
          api.get('/api/v1/crm/parent/classes'),
          api.get('/api/v1/tutor-requests/my'),
        ]);
        
        if (clsRes.status === 'fulfilled') setClasses(clsRes.value.data || []);
        if (profRes.status === 'fulfilled') {
          setProfileInfo(profRes.value.data);
          setProfForm({
            fullName: profRes.value.data?.fullName || '',
            address: profRes.value.data?.address || '',
            district: profRes.value.data?.district || '',
            province: profRes.value.data?.province || '',
          });
        }
        if (statsRes.status === 'fulfilled') setParentStats(statsRes.value.data);
        if (reqsRes.status === 'fulfilled') setTutorRequests(reqsRes.value.data || []);
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
                to="/client/requests"
                className="px-3.5 py-1.5 bg-[#f5f5f9] hover:bg-[#696cff]/10 text-[#697a8d] hover:text-[#696cff] text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
              >
                <ClipboardList size={14} /> Yêu cầu gia sư {tutorRequests.length > 0 && `(${tutorRequests.length})`}
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

        {/* Alert Banner for Missing Address (Full Width) */}
        {isParent && profileInfo && (!profileInfo.address || !profileInfo.district || !profileInfo.province) && (
          <div className="bg-[#fff2ec] border border-[#ffbca9] rounded-xl p-4 flex items-start gap-3 shadow-sm animate-fadeIn">
            <AlertTriangle className="text-[#ff8359] shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="text-[#ff8359] font-bold text-sm">Bạn chưa hoàn thiện địa chỉ giao dịch</h4>
              <p className="text-[#697a8d] text-xs mt-1">Cập nhật ngay địa chỉ chi tiết để hệ thống dễ dàng gợi ý và ưu tiên các gia sư ở gần khu vực của bạn nhất.</p>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left Column: Core Value / Action */}
          <div className="flex-1 w-full space-y-6">
            {/* Metric Badges - Compact Bar */}
            {isParent && parentStats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-fadeIn">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#e7e7ff] text-[#696cff] flex items-center justify-center shrink-0">
                    <GraduationCap size={20} />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-[#566a7f] leading-none">{parentStats.studentsCount}</div>
                    <div className="text-[10px] uppercase text-[#697a8d] font-bold mt-1">Học sinh</div>
                  </div>
                </div>

                <Link
                  to="/client/requests"
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 flex items-center gap-3 hover:border-[#696cff]/40 transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-full bg-[#fff2ec] text-[#ff8359] group-hover:scale-105 transition-transform flex items-center justify-center shrink-0">
                    <Search size={20} />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-[#566a7f] leading-none">{tutorRequests.length || parentStats.requestsCount || 0}</div>
                    <div className="text-[10px] uppercase text-[#697a8d] font-bold mt-1 group-hover:text-[#696cff]">Yêu cầu</div>
                  </div>
                </Link>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#e8fadf] text-[#71dd37] flex items-center justify-center shrink-0">
                    <PlayCircle size={20} />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-[#566a7f] leading-none">{parentStats.activeClassesCount}</div>
                    <div className="text-[10px] uppercase text-[#697a8d] font-bold mt-1">Lớp học</div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#fff8e1] text-[#ffab00] flex items-center justify-center shrink-0">
                    <Star size={20} />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-[#566a7f] leading-none">{parentStats.trialClassesCount}</div>
                    <div className="text-[10px] uppercase text-[#697a8d] font-bold mt-1">Dạy thử</div>
                  </div>
                </div>
              </div>
            )}

            {/* Pending Tutor Requests Banner / Section */}
            {isParent && tutorRequests.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ffab00] animate-pulse"></span>
                    <h3 className="text-base font-bold text-[#566a7f]">
                      Yêu cầu tìm Gia sư đang xử lý ({tutorRequests.length})
                    </h3>
                  </div>
                  <Link
                    to="/client/requests"
                    className="text-xs font-bold text-[#696cff] hover:underline flex items-center gap-1"
                  >
                    Xem tất cả ({tutorRequests.length}) <ArrowRight size={13} />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {tutorRequests.slice(0, 4).map((req) => (
                    <div
                      key={req.id}
                      className="bg-[#f8f9fa] rounded-xl p-3.5 border border-gray-100 flex flex-col justify-between hover:border-[#696cff]/40 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#566a7f] text-sm">
                            {req.subject} ({req.grade})
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#fff2d6] text-[#ffab00]">
                            {req.status === 'PUBLISHED' ? 'Đang tuyển' : req.status === 'MATCHED' ? 'Đã khớp' : 'Đang xử lý'}
                          </span>
                        </div>
                        <p className="text-xs text-[#a1acb8]">
                          Bé: <strong className="text-[#566a7f] font-semibold">{req.student?.fullName}</strong> • {req.sessionsPerWeek} buổi/tuần
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-gray-200 flex items-center justify-between text-xs">
                        <span className="text-[11px] text-[#696cff] font-semibold">
                          {req._count?.classApplications || req.classApplications?.length || 0} gia sư ứng tuyển
                        </span>
                        <Link
                          to="/client/requests"
                          className="text-[11px] font-bold text-[#696cff] hover:underline"
                        >
                          Xem hồ sơ &gt;
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
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
                <div className="py-6 flex flex-col items-center justify-center animate-fadeIn text-center space-y-4">
                  <div className="w-16 h-16 bg-[#f5f5f9] rounded-full flex items-center justify-center text-[#696cff] mb-1 shadow-inner">
                    <Search size={32} strokeWidth={1.5} />
                  </div>
                  <div className="max-w-md">
                    <h4 className="text-lg font-bold text-[#566a7f] mb-1">Bạn chưa có lớp học nào!</h4>
                    <p className="text-sm text-[#a1acb8]">Hệ thống chưa ghi nhận lớp học nào đang hoạt động. Hãy hoàn thành 2 bước dưới đây để bắt đầu tìm kiếm gia sư phù hợp nhất.</p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xl justify-center mt-1">
                    <div className="bg-[#f9f9fa] border border-gray-200 rounded-xl p-5 flex-1 w-full relative">
                      <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-[#696cff] text-white flex items-center justify-center font-bold text-sm shadow-md border-2 border-white">1</div>
                      <h5 className="font-bold text-[#566a7f] text-sm mb-1">Thêm hồ sơ Học sinh</h5>
                      <p className="text-xs text-[#a1acb8] mb-4">Cập nhật thông tin con cái (lớp, học lực) để trung tâm nắm bắt.</p>
                      <Link to="/client/children" className="inline-flex items-center justify-center w-full py-2 bg-white border border-[#696cff] text-[#696cff] hover:bg-[#696cff] hover:text-white rounded-lg text-xs font-bold transition-colors">
                        Thêm Học Sinh
                      </Link>
                    </div>
                    
                    <ArrowRight className="text-gray-300 hidden sm:block shrink-0" size={24} />
                    
                    <div className="bg-[#f9f9fa] border border-gray-200 rounded-xl p-5 flex-1 w-full relative">
                      <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-[#696cff] text-white flex items-center justify-center font-bold text-sm shadow-md border-2 border-white">2</div>
                      <h5 className="font-bold text-[#566a7f] text-sm mb-1">Tạo Yêu cầu Gia sư</h5>
                      <p className="text-xs text-[#a1acb8] mb-4">Chọn môn học, thời gian rảnh và mức học phí mong muốn.</p>
                      <Link to="/client/request-tutor" className="inline-flex items-center justify-center w-full py-2 bg-[#696cff] text-white hover:bg-[#5f61e6] rounded-lg text-xs font-bold shadow-md transition-colors">
                        Tìm Gia Sư Ngay
                      </Link>
                    </div>
                  </div>
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

          {/* Right Column: Sidebar */}
          <div className="w-full lg:w-[320px] shrink-0 space-y-6">
            {/* Compact Profile Widget */}
            {isParent && profileInfo && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4 relative">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[#a1acb8] text-[10px] font-bold uppercase tracking-wider">Hồ sơ Phụ huynh</span>
                    <h3 className="text-lg font-extrabold text-[#566a7f] mt-1 capitalize">{profileInfo.fullName || 'Chưa cập nhật'}</h3>
                  </div>
                  <button
                    onClick={() => setEditingProfile(!editingProfile)}
                    className="p-1.5 bg-[#f5f5f9] hover:bg-gray-200 rounded-md text-[#697a8d] hover:text-[#566a7f] transition-all cursor-pointer"
                    title={editingProfile ? 'Đóng' : 'Chỉnh sửa'}
                  >
                    <Edit3 size={14} />
                  </button>
                </div>

                {!editingProfile ? (
                  <div className="pt-2 border-t border-gray-100 space-y-3">
                    <div>
                      <span className="text-[#a1acb8] uppercase font-bold text-[10px] flex items-center gap-1 mb-1">
                        <MapPin size={11} /> Địa chỉ liên lạc
                      </span>
                      <div className="text-[#566a7f] text-xs font-semibold leading-relaxed">
                        {profileInfo.address || 'Chưa cập nhật'},<br/>
                        {profileInfo.district || 'Chưa cập nhật'}, {profileInfo.province || 'Chưa cập nhật'}
                      </div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleUpdateProfile} className="space-y-3 pt-2 border-t border-gray-100">
                    <div>
                      <label className="block text-[10px] font-semibold text-[#a1acb8] uppercase mb-1">Họ và Tên</label>
                      <input
                        type="text"
                        required
                        value={profForm.fullName}
                        onChange={(e) => setProfForm((prev) => ({ ...prev, fullName: e.target.value }))}
                        className="w-full px-2.5 py-2 bg-[#f5f5f9] border border-[#d9dee3] rounded-md text-xs text-[#566a7f] focus:outline-none focus:border-[#696cff]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-[#a1acb8] uppercase mb-1">Địa chỉ (Số nhà)</label>
                      <input
                        type="text"
                        required
                        value={profForm.address}
                        onChange={(e) => setProfForm((prev) => ({ ...prev, address: e.target.value }))}
                        className="w-full px-2.5 py-2 bg-[#f5f5f9] border border-[#d9dee3] rounded-md text-xs text-[#566a7f] focus:outline-none focus:border-[#696cff]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-semibold text-[#a1acb8] uppercase mb-1">Quận/Huyện</label>
                        <input
                          type="text"
                          required
                          value={profForm.district}
                          onChange={(e) => setProfForm((prev) => ({ ...prev, district: e.target.value }))}
                          className="w-full px-2.5 py-2 bg-[#f5f5f9] border border-[#d9dee3] rounded-md text-xs text-[#566a7f] focus:outline-none focus:border-[#696cff]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-[#a1acb8] uppercase mb-1">Tỉnh/TP</label>
                        <input
                          type="text"
                          required
                          value={profForm.province}
                          onChange={(e) => setProfForm((prev) => ({ ...prev, province: e.target.value }))}
                          className="w-full px-2.5 py-2 bg-[#f5f5f9] border border-[#d9dee3] rounded-md text-xs text-[#566a7f] focus:outline-none focus:border-[#696cff]"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={profileLoading}
                      className="w-full mt-2 py-2 bg-[#696cff] hover:bg-[#5f61e6] disabled:opacity-50 text-white font-bold text-xs rounded-md shadow-sm cursor-pointer transition-colors"
                    >
                      {profileLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                  </form>
                )}
              </div>
            )}
            
            {/* Additional Support Banner in Sidebar */}
            <div className="bg-[#f5f5f9] rounded-xl border border-dashed border-[#d9dee3] p-4 text-center space-y-2">
              <span className="text-[#a1acb8] font-bold text-xs">CẦN HỖ TRỢ?</span>
              <p className="text-xs text-[#566a7f]">Hotline Trung tâm: <strong className="text-[#696cff]">1900 1234</strong></p>
              <p className="text-xs text-[#566a7f]">Email: support@crmgiasu.vn</p>
            </div>
          </div>
        </div>
      </div>
    </PageTemplate>
  );
}
