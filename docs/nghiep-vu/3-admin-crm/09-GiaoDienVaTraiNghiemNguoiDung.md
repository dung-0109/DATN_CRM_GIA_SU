# ĐẶC TẢ NGHIỆP VỤ: GIAO DIỆN VÀ TRẢI NGHIỆM NGƯỜI DÙNG (ADMIN CRM)

> **Mã phân hệ:** CRM-REF-09  
> **Phân hệ:** Cổng Quản trị Trung tâm (Admin CRM)  
> **Đối tượng:** Quản trị viên (Admin), Nhân viên Vận hành, Kế toán

---

## 1. Mục Tiêu Thiết Kế UI/UX
Giao diện Admin CRM được tối ưu hóa để quản lý số lượng lớn dữ liệu (Big Data) hàng ngày mà không làm người thao tác bị "rối mắt" (Cognitive Overload). Áp dụng các tiêu chuẩn thiết kế hiện đại, bảng màu trực quan (Sneat Dashboard Theme) và cơ chế phản hồi theo thời gian thực.

## 2. Dynamic Headers (Tiêu đề Linh hoạt)
* **Xóa bỏ sự dư thừa:** Hệ thống có cơ chế nhận diện ngữ cảnh (Context-Aware). Khi truy cập thẻ **Dashboard Tổng Quan**, hệ thống hiển thị tiêu đề lớn kèm nút bấm Auto-Confirm.
* **Tự động ẩn (Auto-hide):** Tuy nhiên, khi nhân viên chuyển sang các thẻ chi tiết (Quản lý Gia sư, Lớp học, Phụ huynh...), khu vực Header Tổng quan sẽ BỊ ẨN ĐI hoàn toàn, nhường toàn bộ không gian màn hình cho các Bảng dữ liệu. Mỗi trang lúc này chỉ tập trung vào Tiêu đề riêng (Ví dụ: "Danh sách Gia sư"). Điều này giúp giao diện trở nên vô cùng gọn gàng và hợp lý.

## 3. Hệ Thống Thông Báo Hiện Đại (Toast Notifications)
* Thay thế hoàn toàn các hộp thoại cảnh báo `alert()` gốc của trình duyệt (vốn gây chặn luồng thao tác - blocking UI).
* Tích hợp thư viện `react-hot-toast` cho 100% các thao tác thành công (Xanh lá), Thất bại/Lỗi (Đỏ) và Cảnh báo (Cam).
* **Đặc tính:** Các Toast Notifications sẽ bật lên ở góc màn hình, tự động biến mất sau 3-5 giây, mang lại trải nghiệm phần mềm cực kỳ chuyên nghiệp và mượt mà.

## 4. Bố Cục Thẻ và Bảng Dữ Liệu
* Sử dụng bóng đổ (Box-shadow) nhẹ `shadow-sm` và viền bo tròn `rounded-xl` để tạo chiều sâu (Depth).
* **Avatars Tự Sinh (Initials Avatars):** Những thực thể như Phụ huynh, Gia sư, Học sinh khi chưa có ảnh đại diện sẽ tự động hiển thị Avatar bằng chữ cái đầu tiên của tên với màu nền ngẫu nhiên tạo từ bảng HSL, giúp danh sách dữ liệu sinh động, dễ nhận diện hơn hẳn so với những dòng text khô khan.
* **Badges Trạng thái (Status Badges):** Các trạng thái (ACTIVE, PENDING, BANNED) được mã hóa bằng màu sắc đặc trưng (Ví dụ: Xanh lá cho Active, Cam cho Pending, Đỏ cho Banned) kết hợp với các chấm tròn nhỏ (dots), giúp Kế toán và Admin lướt nhanh là nhận diện được ngay vấn đề.
