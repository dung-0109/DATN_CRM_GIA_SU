# ĐẶC TẢ NGHIỆP VỤ: TIẾP NHẬN & TỰ ĐỘNG ĐẨY LỚP LÊN SÀN (ADMIN CRM)

> **Mã phân hệ:** CRM-REF-01  
> **Phân hệ:** Cổng Quản trị Trung tâm (Admin CRM)  
> **Đối tượng:** Hệ thống Tự động (Automation Gateway), Quản trị viên (Admin)

---

## 1. Mục Tiêu Nghiệp Vụ

Hệ thống vận hành theo mô hình **Sàn Tự Động Hóa 100% (Zero-Touch Ingestion)**:
* Phụ huynh hoàn tất điền form trên Cổng Web $\rightarrow$ Lớp học được kích hoạt và đăng ngay lên Sàn lớp trong vòng **1 giây**.
* **Không cần nhân viên gọi điện tư vấn:** Triệt tiêu hoàn toàn sự chậm trễ và không làm phiền phụ huynh bằng các cuộc gọi telesales.
* Hệ thống tự động kích hoạt thuật toán Smart Matching quét Top 5 gia sư ngay tại thời điểm đăng tin.

---

## 2. Quy Trình Tiếp Nhận & Lên Sàn Tự Động

```mermaid
flowchart TD
    A[Phụ huynh gửi Form tìm gia sư trên Website] --> B[Bộ lọc Kiểm duyệt Tự động (Auto-Validation)]
    
    B -->|Phát hiện từ khóa spam / bất hợp lệ| Reject[Tạm giữ để Admin duyệt thủ công]
    B -->|Dữ liệu hợp lệ 100%| C[Tự động sinh Mã lớp duy nhất SAM207]
    
    C --> D[1. Đẩy tin lên Sàn Lớp công khai trên Web Gia sư]
    C --> E[2. Kích hoạt Smart Matching quét Top 5 Gia sư phù hợp]
    
    E --> F[Bắn chuông thông báo Web mời 5 Gia sư vào nhận lớp]
    D & F --> G[(Lớp ở trạng thái OPEN: Đang chờ nhận lớp)]
```

---

## 3. Các Quy Tắc Kiểm Duyệt Tự Động (Auto-Validation Rules)

1. **Kiểm tra mức học phí hợp lệ:** Học phí đề xuất phải nằm trong khung mức giá sàn trung tâm cho phép (Ví dụ: $\ge 150,000$ đ/buổi đối với Sinh viên, $\ge 250,000$ đ/buổi đối với Giáo viên).
2. **Bộ lọc từ ngữ & Spam (Keyword Blacklist):** Tự động phát hiện và chặn các tin rác, quảng cáo hoặc từ ngữ phản cảm.
3. **Chuẩn hóa hiển thị bảo mật:**
   * **Thông tin công khai lên sàn:** Mã lớp, Môn học, Khối lớp, Lịch học, Học phí, Tên tòa chung cư, Tên đường, Phường, Quận.
   * **Thông tin bảo mật:** Số điện thoại phụ huynh, Họ tên đầy đủ và Số phòng căn hộ được mã hóa, chỉ mở khóa sau khi có gia sư nộp cọc 500k.
