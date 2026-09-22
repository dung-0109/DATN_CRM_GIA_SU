# ĐẶC TẢ NGHIỆP VỤ: ĐIỂM DANH BUỔI DẠY & BÁO CÁO TIẾN ĐỘ (TUTOR PORTAL)

> **Mã phân hệ:** TUT-04 / SES-02  
> **Đối tượng sử dụng:** Gia sư (Tutor)  
> **Cổng truy cập:** `http://localhost:5173/tutor` (Menu Buổi học hôm nay / Điểm danh)

---

## 1. Mục Tiêu Nghiệp Vụ
Điểm danh là hành động then chốt để gia sư chứng minh đã hoàn thành buổi giảng dạy. Báo cáo điểm danh không chỉ ghi nhận thời gian thực tế mà còn là cầu nối minh bạch giúp phụ huynh theo dõi sát sao sự tiến bộ từng ngày của con mình.

---

## 2. Quy Tắc Khóa Điểm Danh Trong 24 Giờ (Business Rule BR-SCH-04)

```mermaid
flowchart TD
    A[Buổi dạy kết thúc] --> B[Gia sư mở Tutor Portal -> Chọn Buổi học hôm nay]
    B --> C{Kiểm tra thời gian kết thúc buổi dạy}
    
    C -->|"Thời gian trôi qua ≤ 24 giờ"| D[Mở Form Điểm Danh Thành Công]
    D --> E[Nhập giờ dạy thực tế + Nhận xét học sinh]
    E --> F[Gửi báo cáo điểm danh]
    F --> G[Buổi học chuyển sang trạng thái ATTENDED]
    G --> H[Hệ thống gửi thông báo duyệt đến Phụ huynh]
    
    C -->|"Thời gian trôi qua > 24 giờ"| I[Hệ thống Khóa Điểm Danh - ATTENDANCE_LOCKED]
    I --> J[Gia sư bị phạt vi phạm điểm danh muộn]
    J --> K[Bắt buộc liên hệ Học vụ trung tâm để mở khóa thủ công]
```

### 2.1. Sơ đồ tuần tự: Điểm danh & Kích hoạt đếm ngược 48h (Sequence Diagram)

```mermaid
sequenceDiagram
    autonumber
    actor GS as Gia sư (Tutor)
    participant TP as Tutor Portal UI
    participant SVR as Backend API
    participant DB as Database
    actor PH as Phụ huynh (Client)

    Note over GS, TP: 1. Gia sư mở form điểm danh sau buổi học
    GS->>TP: Bấm "Điểm danh" buổi học vừa dạy
    TP->>SVR: GET /api/tutor/sessions/{id}/can-attend
    SVR->>DB: Kiểm tra: now() - session.end_time <= 24 giờ (BR-SCH-04)
    alt Đã trôi qua > 24 giờ
        SVR-->>TP: Error 400 (ATTENDANCE_LOCKED)
        TP-->>GS: Nút bị khóa xám, yêu cầu liên hệ Học vụ để mở lại
    else Trong vòng 24 giờ hợp lệ
        SVR-->>TP: HTTP 200 OK (Cho phép điểm danh)
        TP-->>GS: Mở Biểu mẫu nhập báo cáo & giờ dạy thực tế
    end

    Note over GS, DB: 2. Nộp báo cáo điểm danh & đánh giá học sinh
    GS->>TP: Nhập giờ dạy (19:05-21:05), nội dung bài học, nhận xét
    GS->>TP: Bấm "Gửi báo cáo điểm danh"
    TP->>SVR: POST /api/tutor/sessions/{id}/attend {realStartTime, realEndTime, notes, homework}
    SVR->>DB: UPDATE sessions SET status = 'ATTENDED', attended_at = now()
    SVR->>DB: Kích hoạt đồng hồ đếm ngược 48 giờ tự động duyệt (BR-SCH-02)
    SVR-->>TP: HTTP 200 OK (Điểm danh thành công)
    TP-->>GS: Chuyển trạng thái sang "Chờ Phụ huynh xác nhận"

    Note over SVR, PH: 3. Thông báo cho Phụ huynh
    SVR-)PH: Push notification & Email: "Gia sư đã gửi báo cáo buổi học ngày hôm nay"
    PH->>SVR: Xem báo cáo tiến độ & Nhập PIN xác nhận (hoặc tự động duyệt sau 48h)
```

### 2.1. Lý do áp dụng giới hạn 24 giờ:
* Tránh tình trạng gia sư để dồn 1-2 tuần hoặc cuối tháng mới điểm danh một thể, dẫn đến việc phụ huynh không còn nhớ chính xác ngày đó con có học hay không, gây tranh chấp tài chính.
* Đảm bảo tính tươi mới của nhận xét học tập: vừa dạy xong, nhận xét sẽ bám sát thực tế nhất.

---

## 3. Nội Dung Biểu Mẫu Điểm Danh (Attendance Form)

Gia sư chọn buổi học tương ứng trong danh sách lịch dạy và hoàn thiện các mục:
1. **Thời gian giảng dạy thực tế**:
   * Giờ bắt đầu thực tế (ví dụ: `19:05`).
   * Giờ kết thúc thực tế (ví dụ: `21:05`).
   * Tổng thời lượng: Phải đạt tối thiểu thời lượng theo quy định của lớp (thông thường là 120 phút).
2. **Nội dung bài học đã truyền đạt**:
   * Ví dụ: *"Chương 3: Phương trình bậc hai một ẩn và Định lý Vi-ét. Đã hoàn thành lý thuyết và chữa 10 bài tập cơ bản."*
3. **Đánh giá & Nhận xét thái độ của học sinh**:
   * Mức độ tập trung (Tập trung / Trung bình / Mất tập trung).
   * Điểm mạnh / Kiến thức con đã nắm vững.
   * Lỗ hổng kiến thức con cần ôn lại thêm.
4. **Bài tập về nhà giao cho con**:
   * Ghi rõ bài tập trong sách giáo khoa hoặc link tài liệu giao cho con làm trước buổi sau.
5. **Minh chứng hình ảnh (Tùy chọn)**:
   * Cho phép chụp ảnh phiếu bài tập con đã làm trên lớp, bảng viết hoặc vở ghi chép.

---

## 4. Xử Lý Sau Khi Nộp Điểm Danh

* **Trạng thái buổi học**: Lập tức chuyển từ `SCHEDULED` $\rightarrow$ `ATTENDED`.
* **Kích hoạt đồng hồ đếm ngược 48 giờ**: Phụ huynh có đúng 48 giờ để xác nhận (Mã PIN) hoặc khiếu nại (Dispute).
* **Nếu quá 24h gia sư quên điểm danh**:
  * Nút "Điểm danh" bị mờ đi và chuyển sang màu xám.
  * Khi bấm vào, hiển thị thông báo lỗi: *"Buổi dạy đã kết thúc quá 24 giờ. Hệ thống đã khóa điểm danh tự động. Vui lòng liên hệ bộ phận Học vụ để được hỗ trợ đối soát."*

---

## 5. Danh Sách Mã Lỗi Phục Vụ Dev & QA

| Mã lỗi (Error Code) | HTTP Status | Nguyên nhân | Hướng xử lý |
| :--- | :---: | :--- | :--- |
| `ATTENDANCE_LOCKED` | 400 | Quá 24 giờ kể từ thời điểm tan học. | Liên hệ Admin/Học vụ để giải trình. |
| `SESSION_NOT_STARTED` | 400 | Điểm danh trước khi buổi học bắt đầu theo lịch. | Dạy xong mới được điểm danh. |
| `DURATION_INSUFFICIENT` | 422 | Thời lượng dạy thực tế dưới mức tối thiểu quy định (ví dụ < 60 phút). | Nhập lại đúng giờ thực tế hoặc ghi rõ lý do. |
| `ALREADY_ATTENDED` | 409 | Buổi học này đã được điểm danh rồi. | Chờ phụ huynh xác nhận. |
