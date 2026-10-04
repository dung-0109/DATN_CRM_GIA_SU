# ĐẶC TẢ NGHIỆP VỤ: QUẢN LÝ NGƯỜI DÙNG (GIA SƯ & PHỤ HUYNH)

> **Mã phân hệ:** CRM-REF-08  
> **Phân hệ:** Cổng Quản trị Trung tâm (Admin CRM)  
> **Đối tượng:** Quản trị viên (Admin), Nhân viên Vận hành, CSKH

---

## 1. Tổng Quan Phân Hệ Quản Lý Người Dùng

Phân hệ quản lý tài khoản người dùng cho phép Quản trị viên và Nhân viên Vận hành giám sát, tạo mới và quản lý trạng thái của tất cả Gia sư và Phụ huynh trên hệ thống thông qua các Bảng dữ liệu (Data Table) tập trung.

## 2. Quản Lý Danh Sách & Tìm Kiếm

* **Bảng Dữ liệu Hiện đại (Data Table):** Hiển thị danh sách Phụ huynh và Gia sư một cách gọn gàng, bao gồm thông tin liên hệ (Họ tên, SĐT), trạng thái hoạt động và các dữ liệu liên kết khác.
* **Tìm kiếm thời gian thực (Real-time Search):** Hỗ trợ thanh tìm kiếm đa trường. Quản trị viên có thể nhập Tên hoặc Số điện thoại để tìm ra hồ sơ chính xác ngay lập tức.
* **Bộ lọc Trạng thái (Filters):** Lọc danh sách theo trạng thái tài khoản:
  * `ALL` (Tất cả trạng thái)
  * `ACTIVE` (Đang hoạt động)
  * `BANNED` (Bị khóa)
* **Phân trang dữ liệu (Pagination):** Giới hạn số lượng bản ghi hiển thị trên mỗi trang (ví dụ: 10 bản ghi/trang). Tính năng này kết hợp với thuật toán xử lý Front-end tối ưu, đảm bảo tốc độ phản hồi siêu mượt ngay cả khi số lượng hồ sơ lên tới hàng nghìn.

## 3. Tạo Mới Người Dùng Thủ Công (Manual User Registration)

Bên cạnh luồng người dùng tự đăng ký trên Website, Admin CRM hỗ trợ nhân viên tư vấn tạo tài khoản thay cho khách hàng thông qua **cửa sổ Add User Modal**:
* **Giao diện Popup trực quan:** Quản trị viên nhập thông tin cần thiết:
  * `Họ và tên`
  * `Số điện thoại`
  * `Mật khẩu khởi tạo`
* **Tự động liên kết hệ thống (Auto-Profile Provisioning):** Ngay sau khi khởi tạo thành công tài khoản bảo mật (`users`), hệ thống tự động gọi ngầm xuống Database để khởi tạo các Profile hồ sơ tương ứng (`parent_profiles` hoặc `tutor_profiles`). Người dùng có thể dùng số điện thoại đó đăng nhập vào Web ngay lập tức.
* **Thông báo Toast (Toast Notifications):** Thông báo kết quả Thêm thành công (hoặc báo lỗi trùng Số điện thoại) được hiển thị qua dạng Popup nổi góc màn hình (hiệu ứng Toast hiện đại), thay thế hoàn toàn cho các `alert()` mặc định của trình duyệt để không làm gián đoạn luồng công việc.

## 4. Quản Trị Trạng Thái Tài Khoản (Block/Unblock)

* **Tương tác 1 chạm:** Mỗi bản ghi trong danh sách đều đi kèm với một nút thao tác nhanh (Khóa TK / Mở Khóa).
* **Đóng băng hoạt động:** Khi bị khóa (BANNED), người dùng (đặc biệt là Gia sư) sẽ không thể đăng nhập vào Web hoặc không thể nhận được thông báo lớp mới từ hệ thống Smart Matching.
