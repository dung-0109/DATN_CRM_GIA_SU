# Hướng dẫn sử dụng — CRM Gia sư

Dành cho **3 đối tượng**: Phụ huynh, Gia sư, Nhân viên trung tâm. Phụ huynh/Gia sư **tự đăng ký** tài khoản qua web; Nhân viên trung tâm dùng tài khoản Admin `0123456789 / admin123`, mã PIN `1234`.

---

## 🧑‍💼 Phụ huynh — `localhost:5173/client` (tự đăng ký)

### Bước 0. Khai hồ sơ con
Trước khi tìm gia sư, bạn khai hồ sơ **từng con** (tên, lớp, trường).
> 👨‍👩‍👧‍👦 **Có 2-3 con?** Không sao — mỗi con là 1 hồ sơ riêng. Từ đó mọi thứ đều tách bạch: yêu cầu riêng, gia sư riêng, lịch riêng, gói học phí riêng.

### Bước 1. Nạp tiền ví
> **Ví tiền** → **Nạp tiền** → nhập số tiền → nhập PIN `1234`. (Tiền dùng chung 1 ví, nhưng trừ theo từng con)

### Bước 2. Tạo yêu cầu tìm gia sư
> **Tìm gia sư** → **Tạo yêu cầu** → chọn **con nào**, môn gì, lớp mấy, lịch mong muốn, ngân sách/buổi → **Gửi**.
> Trung tâm sẽ liên hệ tư vấn, sau đó giao gia sư phù hợp cho **đúng con bạn chọn**.

### Bước 3. Mua gói học phí
> Vào **lớp học của con** → **Nạp thêm buổi học** → chọn gói 10/20 buổi → nhập PIN `1234` → trừ tiền trong ví.

### Bước 4. Xác nhận buổi học (việc quan trọng nhất)
Sau mỗi buổi, gia sư điểm danh → bạn vào **Chi tiết lớp học** của đúng con:
- ✅ Giờ dạy & nhận xét đúng thực tế → **Xác nhận buổi học** → nhập PIN → trừ 1 buổi trong gói, gia sư được trả lương.
- ❌ Không đúng → **Khiếu nại** → ghi lý do + đính kèm ảnh (tối đa 5) → trung tâm xử lý, chưa trừ tiền.

### Bước 5. Báo nghỉ cho con
> **Lịch học** → chọn buổi → **Báo nghỉ** → ghi lý do → bạn (vai phụ huynh) duyệt → gia sư đồng ý dời lịch.
> ⚠️ Báo trước **4 giờ**, nghỉ muộn vẫn tính buổi đó.

---

## 🧑‍🏫 Gia sư — `localhost:5173/tutor` (tự đăng ký)

### a. Tìm lớp mới
> **Lớp mới tuyển** → xem chi tiết (chỉ thấy quận, không thấy tên/số phụ huynh) → **Ứng tuyển** → viết giới thiệu → gửi.

### b. Điểm danh buổi dạy (quan trọng nhất)
> Dạy xong → **Buổi học hôm nay** → **Điểm danh** → nhập giờ thực tế + nhận xét học sinh → gửi.
> Phụ huynh duyệt xong → **lương tự vào ví**. ⚠️ Chỉ điểm danh trong **24 giờ** sau giờ dạy.

### c. Ví lương & rút tiền
> **Ví lương** → xem từng buổi được thanh toán → **Yêu cầu rút lương** → kế toán chuyển khoản.

### d. Báo nghỉ dạy
> **Lịch dạy** → **Báo nghỉ dạy** → lý do + giờ dạy bù đề xuất → chờ phụ huynh đồng ý. ⚠️ Báo trước **24 giờ**, nghỉ muộn bị ghi vi phạm.

---

## 🧑‍💻 Nhân viên trung tâm — `localhost:5173/admin-crm` (SĐT: `0123456789`)

### a. Duyệt hồ sơ gia sư
> Xem hồ sơ chờ duyệt → **Duyệt** → gia sư mới được ứng tuyển lớp.

### b. Khớp lớp
> **Khớp lớp** → xem yêu cầu mới → hệ thống gợi ý gia sư kèm % tương thích → chọn 1 → **Giao dạy thử** → sau buổi thử, phụ huynh đồng ý → lớp chính thức.

### c. Giải quyết khiếu nại
> **Khiếu nại** → xem buổi bị phản ánh → đối chiếu 2 bên → **Ra phán quyết**: xác nhận (trừ buổi + trả đủ lương) / hủy (không trừ, không trả) / thỏa hiệp (trừ buổi + trả 50%).

### d. Kết toán lương
> **Kết toán lương** → chọn tháng → xem lương từng gia sư → nhập mã giao dịch ngân hàng → trừ ví + báo cho gia sư.

---

## 🎯 Mẹo trải nghiệm trọn vẹn
Mở **3 tab** (Admin, Phụ huynh, Gia sư) và chạy vòng tròn:
**Phụ huynh tạo yêu cầu** → **Admin giao dạy thử** → **Gia sư điểm danh** → **Phụ huynh xác nhận PIN** → **kiểm tra ví lương gia sư tăng**.

Muốn thử kịch bản 2 con: tạo yêu cầu cho bé A và bé B khác môn/lịch → trung tâm khớp 2 gia sư khác nhau → 2 lớp riêng biệt, trừ buổi và trả lương từng lớp độc lập.