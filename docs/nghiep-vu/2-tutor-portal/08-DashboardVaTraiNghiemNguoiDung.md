# ĐẶC TẢ NGHIỆP VỤ: DASHBOARD & CẬP NHẬT HỒ SƠ CÁ NHÂN (TUTOR PORTAL)

> **Mã phân hệ:** TUT-REF-08  
> **Phân hệ:** Cổng Đối tác Gia sư (Tutor Portal)  
> **Đối tượng:** Gia sư (Tutor)

---

## 1. Mục Tiêu Nghiệp Vụ
Dashboard của Gia sư là trung tâm điều khiển (Command Center), giúp gia sư dễ dàng theo dõi các thông tin quan trọng nhất:
* Cập nhật và chỉnh sửa hồ sơ chuyên môn (Identity, Bằng cấp).
* Tóm tắt nhanh số lượng lớp đang nhận và lịch rảnh.
* Các cảnh báo quan trọng nếu hồ sơ chưa đủ điều kiện để nhận lớp.

## 2. Quản Lý Hồ Sơ Cá Nhân (Profile Card)
Gia sư có thể trực tiếp xem và chỉnh sửa các thông tin chuyên môn của mình tại mục **Hồ sơ cá nhân Gia sư**:
* **Thông tin cá nhân cơ bản:** Họ và tên, Giới tính, Ngày sinh.
* **Xác minh danh tính (KYC):** Số CCCD/CMND. Thông tin này rất quan trọng để hệ thống đánh giá uy tín (Karma).
* **Năng lực chuyên môn:** Học vị/Trình độ (Sinh viên, Cử nhân, Thạc sĩ, v.v.), Nghề nghiệp hiện tại.
* **Trạng thái kiểm duyệt:** 
  * `Chờ kiểm duyệt`: Hồ sơ mới tạo hoặc đang chờ Admin phê duyệt.
  * `Đã kích hoạt`: Tài khoản đã đủ điều kiện để quét lớp trên Sàn hoặc nhận thông báo Smart Matching.
* **Chế độ Chỉnh sửa trực tiếp (Inline Edit):** Bấm nút "Chỉnh sửa" để mở form điền liệu thay vì chuyển trang, giúp UX mượt mà và trực quan.

## 3. Cảnh Báo Thông Minh (Smart Alerts)
Nhằm tăng tính chủ động cho gia sư, hệ thống tích hợp các cảnh báo tự động:
* **Cảnh báo thiếu Số CCCD/CMND:** Nếu hồ sơ thiếu thông tin định danh, một Alert Banner sẽ hiện lên nhắc nhở gia sư cập nhật. CCCD là yếu tố bắt buộc để đảm bảo an toàn cho phụ huynh khi gia sư đến nhà.

## 4. Bảng Thống Kê (Metric Badges)
Giúp gia sư nhìn nhận nhanh hiệu suất hoạt động:
* **Lớp đang nhận (Active Classes):** Tổng số lượng lớp học mà gia sư đang phụ trách (bao gồm cả dạy thử và dạy chính thức).
* **Điểm Karma (Uy tín):** Thước đo sự tin cậy. Điểm càng cao, cơ hội nhận lớp càng lớn.

## 5. Cải Tiến Trải Nghiệm Người Dùng (UX)
* **Toast Notifications:** Các thao tác như Cập nhật hồ sơ, Nộp nhật ký buổi học, hoặc Báo nghỉ đều trả về kết quả thông qua **Toast Notifications** (`react-hot-toast`). Thông báo hiển thị ở góc màn hình, tự động biến mất và hoàn toàn không gây gián đoạn luồng công việc như hàm `alert()` thông thường.
* **Form Nhập Liệu Chuẩn Hóa:** Các ô input được thiết kế đồng bộ với padding/margin tiêu chuẩn, viền focus màu xanh tím (`#696cff`), mang lại trải nghiệm chuyên nghiệp và đồng nhất với tổng thể CRM.
