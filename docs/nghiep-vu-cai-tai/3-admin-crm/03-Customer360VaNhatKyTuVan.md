# ĐẶC TẢ NGHIỆP VỤ: HỒ SƠ KHÁCH HÀNG 360 ĐỘ & LỊCH SỬ LỚP HỌC (ADMIN CRM)

> **Mã phân hệ:** CRM-REF-03  
> **Phân hệ:** Cổng Quản trị Trung tâm (Admin CRM)  
> **Đối tượng:** Quản trị viên (Admin), Nhân viên Chăm sóc Khách hàng (CSKH)

---

## 1. Mục Tiêu Nghiệp Vụ

Hồ sơ khách hàng 360 độ (Customer 360) là kho lưu trữ toàn diện mọi thông tin, học sinh và lịch sử các lớp học của một gia đình:
* Giúp nhân viên trung tâm nắm bắt đầy đủ hoàn cảnh gia đình và quá trình học tập của các con chỉ trong **60 giây**.
* Lưu trữ lịch sử đánh giá chất lượng dạy học của gia sư và các phiếu yêu cầu hỗ trợ khi phụ huynh cần đổi gia sư.

---

## 2. Cấu Trúc Màn Hình Hồ Sơ Khách Hàng 360 Độ

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ KHÁCH HÀNG: CHỊ NGUYỄN THỊ HƯƠNG (0912.345.678) - QUẬN CẦU GIẤY             │
├──────────────────────────────────────┬──────────────────────────────────────┤
│ 1. THÔNG TIN GIA ĐÌNH & HỌC SINH     │ 2. LỊCH SỬ LỚP HỌC & HỖ TRỢ          │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ • Họ tên PH: Nguyễn Thị Hương        │ [LỚP HIỆN TẠI - SAM207]              │
│ • Địa chỉ: 18 Trần Duy Hưng, Cầu Giấy│ • Môn: Toán 10 (Học sinh: Bé Khôi)   │
│ • Nhãn: Khách VIP (Đã thuê 2 lớp)    │ • Gia sư: Nguyễn Văn Nam (Sinh viên) │
│                                      │ • Trạng thái: TEACHING (Đã học 8b)   │
│ • HỌC SINH 1: Bé Khôi (Lớp 10)       │ • Đánh giá dạy thử: ⭐⭐⭐⭐⭐ (5 sao)  │
│   - Mục tiêu: Ôn thi Đại học khối A  │                                      │
│   - Tính cách: Chăm chỉ, sợ Hình học │ [LỚP ĐÃ KẾT THÚC - SAM105]           │
│                                      │ • Môn: Tiếng Anh 9 (Bé Khôi)         │
│ • HỌC SINH 2: Bé Linh (Lớp 6)        │ • Đã học xong: Thi đỗ vào lớp 10     │
│   - Mục tiêu: Luyện phát âm Tiếng Anh│                                      │
│   - Tính cách: Năng động, thích vẽ   │ [TICKET BẢO HÀNH GẦN NHẤT]           │
│                                      │ • Không có khiếu nại phát sinh       │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

---

## 3. Lịch Sử Học Tập & Quản Lý Khiếu Nại

* **Lịch sử các lớp học đã mở:**
  * Lớp đang diễn ra: Thông tin môn học, gia sư phụ trách, số buổi đã hoàn thành, tổng tiền học phí đối soát cuối tháng.
  * Lớp trong quá khứ: Kết quả thi cử đầu ra của con, các nhận xét về gia sư cũ.
* **Lịch sử Ticket Hỗ trợ / Bảo hành:**
  * Lưu trữ các lần phụ huynh bấm nút *"Yêu cầu hỗ trợ"* hoặc *"Yêu cầu đổi gia sư"* trong vòng 30 ngày bảo hành.
  * Chi tiết lý do đổi người, gia sư thay thế và thời gian hoàn tất điều động gia sư mới (cam kết $\le 24$ giờ).

---

## 4. Phân Khúc Khách Hàng Tự Động (Customer Segmentation)

Hệ thống tự động gắn nhãn phân loại khách:
* 🌟 **VIP Customer:** Khách hàng mở từ 2 lớp học trở lên hoặc duy trì học liên tục trên 6 tháng.
* 👶 **Tiềm năng con nhỏ:** Đang có con lớn học lớp 10 và có bé nhỏ học lớp 6 $\rightarrow$ Gợi ý các chương trình hỗ trợ phù hợp khi bé nhỏ vào năm học mới.
* ⚠️ **Cần quan tâm:** Lớp học vừa có gia sư xin nghỉ đột xuất hoặc vừa đổi gia sư mới $\rightarrow$ Kích hoạt thông báo để nhân viên theo dõi sát sao chất lượng.
