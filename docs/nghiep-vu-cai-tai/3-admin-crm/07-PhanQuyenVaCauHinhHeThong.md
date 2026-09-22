# ĐẶC TẢ NGHIỆP VỤ: PHÂN QUYỀN RBAC & CẤU HÌNH THAM SỐ (ADMIN CRM)

> **Mã phân hệ:** CRM-REF-07  
> **Phân hệ:** Cổng Quản trị Trung tâm (Admin CRM)  
> **Đối tượng:** Giám đốc (Admin), Trưởng phòng Tư vấn, Kế toán, Nhân viên CSKH

---

## 1. Mục Tiêu Nghiệp Vụ

Để bảo mật dữ liệu khách hàng, đảm bảo tính phân minh trong công việc và kiểm soát thất thoát tài chính:
* Áp dụng mô hình **Phân quyền theo Vai trò (RBAC - Role-Based Access Control)**.
* Cho phép Ban giám đốc tùy biến linh hoạt các **Tham số vận hành** (tiền cọc, SLA, thời hạn bảo hành) mà không cần can thiệp vào mã nguồn phần mềm.

---

## 2. Ma Trận Phân Quyền Vai Trò (RBAC Matrix)

| Vai trò người dùng | Quyền hạn chính trên hệ thống CRM |
| :--- | :--- |
| **Giám đốc / Admin** | • Toàn quyền xem và quản trị mọi dữ liệu lớp học, gia sư, phụ huynh trên hệ thống.<br>• Xem toàn bộ báo cáo doanh thu, dòng tiền cọc và KPI vận hành.<br>• Cài đặt và điều chỉnh các tham số vận hành hệ thống. |
| **Nhân viên Vận hành / CSKH** | • Thẩm định và duyệt hồ sơ năng lực gia sư (KYC CCCD, bằng cấp, thẻ sinh viên).<br>• Giám sát bảng Kanban trạng thái lớp học (OPEN, TRIAL, TEACHING, CLOSED).<br>• Tiếp nhận và xử lý các Ticket bảo hành 30 ngày (điều phối gia sư mới thay thế).<br>• Không có quyền xem hoặc chỉnh sửa số liệu tài chính của kế toán. |
| **Kế toán (Accountant)** | • Quản trị phân hệ Trọng tài & Đối soát cọc sau đợt dạy thử.<br>• Quyền bấm các nút tài chính: Duyệt doanh thu phí, Duyệt lệnh hoàn cọc 100%, Duyệt hoàn cọc 50%.<br>• Nhập mã giao dịch ngân hàng đối soát và xuất file báo cáo dòng tiền cọc. |

---

## 3. Quản Trị Cấu Hình Tham Số Vận Hành Hệ Thống

* **Mức cọc nhận lớp mặc định:** Cài đặt số tiền cọc (Ví dụ: 500,000 đ hoặc theo % học phí tháng).
* **Thời gian gia sư liên hệ phụ huynh sau cọc:** Cài đặt đồng hồ đếm ngược gia sư phải gọi điện cho phụ huynh sau khi cọc (mặc định 2 giờ).
* **Thời gian dạy thử chuẩn:** Cài đặt số buổi dạy thử theo từng nhóm đối tượng:
  * Giáo viên: Mặc định 1 buổi.
  * Sinh viên: Mặc định 2 buổi.
* **Thời hạn bảo hành đổi gia sư:** Cài đặt số ngày bảo hành miễn phí (mặc định 30 ngày).
* **Quản lý danh mục dùng chung:** Thêm/sửa/ẩn danh mục Môn học, Khối lớp và Danh sách Quận/Huyện phục vụ lọc dữ liệu và gợi ý ghép lớp.
