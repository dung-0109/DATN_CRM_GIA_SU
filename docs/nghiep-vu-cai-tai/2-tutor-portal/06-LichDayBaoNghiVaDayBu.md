# ĐẶC TẢ NGHIỆP VỤ: LỊCH DẠY, BÁO NGHỈ & ĐỀ XUẤT DẠY BÙ (TUTOR PORTAL)

> **Mã phân hệ:** TUT-REF-06  
> **Phân hệ:** Cổng Đối tác Gia sư (Tutor Portal)  
> **Đối tượng:** Gia sư (Tutor), Phụ huynh (Parent)

---

## 1. Mục Tiêu Nghiệp Vụ

Một gia sư thường dạy từ 2 đến 5 lớp khác nhau trong tuần. Để tránh bị trùng lịch, quên lịch hoặc bối rối khi di chuyển:
* Hệ thống cung cấp **Thời khóa biểu đi dạy trực quan**.
* Hiển thị **địa chỉ chi tiết và số điện thoại liên hệ** của phụ huynh kèm nút sao chép địa chỉ tiện lợi.
* Quy chuẩn hóa quy trình **Báo nghỉ trước 24 giờ** và **Xếp lịch dạy bù** nhanh chóng mà không làm phật lòng phụ huynh.

---

## 2. Thời Khóa Biểu Giảng Dạy & Thông Tin Địa Chỉ

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ THỜI KHÓA BIỂU ĐI DẠY (TUẦN NÀY)                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│ [HÔM NAY - THỨ 3, 22/09/2026]                                               │
│ • 19:00 - 21:00: Lớp Toán 10 - Bé Khôi (Mã lớp: SAM207)                    │
│   Địa chỉ: P.1208, Tòa ĐN2, CC Hope 3, Nguyễn Lam, Sài Đồng, Long Biên      │
│   [ Nút: 📋 SAO CHÉP ĐỊA CHỈ ]  [ Nút: 📞 GỌI PHỤ HUYNH ]                   │
├─────────────────────────────────────────────────────────────────────────────┤
│ [NGÀY MAI - THỨ 4, 23/09/2026]                                               │
│ • 17:30 - 19:30: Lớp Tiếng Anh 8 - Bé Linh (Mã lớp: SAM108)                 │
│   Địa chỉ: Số 45 Ngõ 120 Trần Duy Hưng, Cầu Giấy                             │
│   [ Nút: 📋 SAO CHÉP ĐỊA CHỈ ]  [ Nút: 📞 GỌI PHỤ HUYNH ]                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

* **Hiển thị địa chỉ rõ ràng:** Hiển thị chi tiết số nhà, số phòng, tòa nhà cùng nút 1-Click "Sao chép địa chỉ" để gia sư dễ dàng lưu lại hoặc gửi khi cần.
* **Nhắc lịch trước 2 giờ:** Tự động gửi thông báo chuông Web / Zalo để gia sư kịp chuẩn bị giáo án và sắp xếp thời gian di chuyển.

---

## 3. Quy Trình Báo Nghỉ & Đề Xuất Lịch Dạy Bù

```mermaid
sequenceDiagram
    autonumber
    actor GS as Gia sư (Tutor)
    actor Web as Cổng Web Gia sư (Tutor Web)
    actor API as Backend CRM
    actor PH as Phụ huynh (Client Web)

    GS->>Web: 1. Chọn buổi học cần nghỉ (Ví dụ: Tối T3) -> Bấm 'Xin nghỉ buổi dạy'
    GS->>Web: 2. Nhập lý do (Bận thi tại trường / Ốm)
    GS->>Web: 3. Chọn khung giờ rảnh mới đề xuất DẠY BÙ (Ví dụ: Chiều Chủ nhật 14h-16h)
    Web->>API: POST /api/v1/tutor/leaves { sessionId, reason, rescheduleTime }
    
    API->>API: Kiểm tra thời điểm gửi đơn
    alt Gửi trước giờ học >= 24 giờ (Hợp lệ)
        API->>PH: Bắn thông báo: 'Gia sư xin dời lịch sang Chiều CN 14h, bạn có đồng ý?'
        PH->>PH: Phụ huynh bấm 'Đồng ý lịch bù'
        API->>API: Tự động cập nhật buổi học bù lên Lịch dạy của cả 2 bên
        API-->>GS: Thông báo: 'Lịch dạy bù đã được phụ huynh phê duyệt!'
    else Gửi trước giờ học < 24 giờ (Nghỉ muộn)
        API-->>GS: Cảnh báo: 'Báo nghỉ muộn dưới 24h sẽ bị trừ 10 điểm uy tín Karma!'
    end
```

---

## 4. Quy Tắc Nghiệp Vụ Báo Nghỉ (Business Rules)
* **BR-LEAVE-01 (Thời hạn báo nghỉ):**
  * Gia sư phải gửi thông báo xin nghỉ trước giờ học **tối thiểu 24 giờ** để giữ điểm uy tín.
  * Báo nghỉ muộn (dưới 24h): Trừ **$-10$ điểm Karma**.
  * Tự ý không đến dạy và không gửi đơn: Trừ **$-50$ điểm Karma**, phạt cảnh cáo toàn trung tâm.
* **BR-LEAVE-02 (Quy định dạy bù):**
  * Mọi buổi học báo nghỉ hợp lệ đều phải được sắp xếp dạy bù trong vòng **14 ngày** để đảm bảo tiến độ ôn thi của học sinh.
