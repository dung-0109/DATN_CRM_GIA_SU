# Use Cases Specification (Đặc Tả Use Case)

Tài liệu này đặc tả chi tiết các Use Case cốt lõi phục vụ lập trình giao diện (UI) và luồng xử lý nghiệp vụ cho hệ thống CRM Trung tâm Gia sư.

**Phiên bản:** v1.3 (cập nhật 31/07/2026 - bổ sung Notification/Audit per UC và Acceptance Criteria cho QA)

---

## 1. Sơ đồ Use Case Tổng Quát (Use Case Diagram)

```mermaid
leftToRightDirection
fcg --o ClientPortal
fcg --o TutorPortal
fcg --o CRM_System

rectangle ClientPortal {
    usecase UC01 as "UC-01: Đăng ký tìm gia sư"
    usecase UC02 as "UC-02: Tìm kiếm gia sư ẩn danh"
    usecase UC03 as "UC-03: Xác nhận điểm danh (Mã PIN)"
    usecase UC04 as "UC-04: Báo nghỉ học lẻ"
}

rectangle TutorPortal {
    usecase UC05 as "UC-05: Đăng ký hồ sơ & lịch rảnh"
    usecase UC06 as "UC-06: Ứng tuyển nhận lớp mới"
    usecase UC07 as "UC-07: Điểm danh buổi dạy"
    usecase UC08 as "UC-08: Báo nghỉ dạy & dời lịch"
}

rectangle CRM_System {
    usecase UC09 as "UC-09: Khớp gia sư tự động/thủ công"
    usecase UC10 as "UC-10: Quản lý ví tiền & duyệt lương"
    usecase UC11 as "UC-11: Giải quyết khiếu nại (Dispute)"
}

Parent --> UC01
Parent --> UC02
Parent --> UC03
Parent --> UC04

Student --> UC04

Tutor --> UC05
Tutor --> UC06
Tutor --> UC07
Tutor --> UC08

Sales --> UC09
Accountant --> UC10
Academic --> UC11
```

---

## 2. Bảng tổng hợp độ chi tiết đặc tả

| Use Case | Actor chính | Trạng thái đặc tả |
| :--- | :--- | :--- |
| UC-01 Đăng ký tìm gia sư | Parent | ✅ Chi tiết |
| UC-02 Tìm kiếm gia sư ẩn danh | Parent | ✅ Chi tiết |
| UC-03 Xác nhận điểm danh | Parent | ✅ Chi tiết |
| UC-04 Báo nghỉ học lẻ | Parent / Student | ✅ Chi tiết |
| UC-05 Đăng ký hồ sơ & lịch rảnh | Tutor | ✅ Chi tiết |
| UC-06 Ứng tuyển nhận lớp mới | Tutor | ✅ Chi tiết |
| UC-07 Điểm danh buổi dạy | Tutor | ✅ Chi tiết |
| UC-08 Báo nghỉ dạy & dời lịch | Tutor | ✅ Chi tiết |
| UC-09 Khớp gia sư | Sales | ✅ Chi tiết |
| UC-10 Quản lý ví tiền & lương | Accountant / Parent / Tutor | ✅ Chi tiết |
| UC-11 Giải quyết khiếu nại | Academic | ✅ Chi tiết |

---

## 3. Đặc Tả Chi Tiết Các Use Case Cốt Lõi

### 3.1. UC-01: Đăng ký tìm gia sư

*   **Mô tả:** Phụ huynh tạo yêu cầu tìm gia sư để hệ thống ghi nhận nhu cầu và bắt đầu quy trình khớp lớp.
*   **Actor chính:** Phụ huynh (Parent).
*   **Actor phụ:** Nhân viên CRM (Sales), Hệ thống.
*   **Điều kiện tiên quyết:**
    *   Phụ huynh đã đăng nhập và xác thực Profile Phụ huynh.
    *   Đã có ít nhất 1 hồ sơ Học viên (`students`).
*   **Kết quả thành công:** Yêu cầu ở trạng thái `NEW`, CRM nhận được cảnh báo tư vấn.

#### Luồng chính (Happy Path)
1.  Phụ huynh vào mục "Tìm gia sư" → bấm **"Tạo yêu cầu"**.
2.  Hệ thống hiển thị Form: Chọn Học viên, Môn học, Cấp lớp, Lịch học mong muốn, Số buổi/tuần, Ngân sách/buổi, Giới tính gia sư.
3.  Phụ huynh nhập liệu → bấm "Gửi yêu cầu".
4.  Hệ thống kiểm tra hợp lệ (`VALIDATION_ERROR` nếu thiếu/không hợp lệ) → tạo `tutor_requests` trạng thái `NEW`.
5.  Hệ thống thông báo cho nhân viên CRM qua màn hình Dashboard (khung "Yêu cầu mới").
6.  Nhân viên CRM gọi điện tư vấn → cập nhật trạng thái `CONSULTING`.

#### Luồng thay thế (Alternative Path) - Gửi yêu cầu qua CRM
1a. Phụ huynh gọi điện trực tiếp cho trung tâm.
2a. Sales nhập liệu thay phụ huynh trên màn hình CRM, tạo yêu cầu ở trạng thái `CONSULTING` ngay.

#### Luồng ngoại lệ (Exception Path) - Hủy yêu cầu
5a. Phụ huynh hủy yêu cầu trước khi khớp → trạng thái `CANCELLED`, hệ thống ngừng hiển thị cho gia sư.

---

### 3.2. UC-02: Tìm kiếm gia sư ẩn danh

*   **Mô tả:** Phụ huynh chủ động duyệt danh sách gia sư công khai (ẩn danh) và gửi lời mời dạy thử.
*   **Actor chính:** Phụ huynh.
*   **Điều kiện tiên quyết:** Tồn tại hồ sơ gia sư có `is_public = true`.
*   **Ràng buộc bảo mật:** Chỉ hiển thị `display_name` (BR-SEC-02), không hiển thị số điện thoại/địa chỉ (BR-SEC-01).

#### Luồng chính (Happy Path)
1.  Phụ huynh vào mục "Tìm gia sư" → nhập filter (Môn, Cấp, Quận, Giới tính, Trình độ).
2.  Hệ thống gọi `GET /api/v1/tutors` trả danh sách phân trang (≤ 1s).
3.  Phụ huynh xem chi tiết hồ sơ một gia sư (đánh giá, kinh nghiệm, học phí đề xuất).
4.  Phụ huynh bấm **"Mời dạy thử"** trên hồ sơ phù hợp → hệ thống liên kết với yêu cầu hiện có (hoặc tạo yêu cầu mới) và chuyển sang quy trình khớp (UC-09).

#### Luồng thay thế - Không có kết quả
3a. Hệ thống trả về danh sách rỗng → hiển thị **Empty State** với gợi ý "Mở rộng khu vực/quận" hoặc "Gửi yêu cầu để CRM tìm giúp".

---

### 3.3. UC-03: Xác nhận Điểm danh & Trừ tiền học phí

*   **Mô tả:** Phụ huynh kiểm tra thông tin buổi học gia sư đã điểm danh và xác nhận để thanh toán hoặc khiếu nại nếu có sai lệch.
*   **Actor chính:** Phụ huynh (Parent).
*   **Actor phụ:** Hệ thống (Autopay Job).
*   **Điều kiện tiên quyết (Preconditions):**
    *   Lớp học đang ở trạng thái `TEACHING`.
    *   Gia sư đã thực hiện điểm danh buổi học thành công, buổi học ở trạng thái `ATTENDED`.
    *   Tài khoản phụ huynh đang ở Profile Phụ huynh (đã xác thực mã PIN đăng nhập).

#### Luồng chính (Happy Path)
1.  Phụ huynh nhận được thông báo đẩy (Push Notification) có buổi dạy chờ duyệt.
2.  Phụ huynh truy cập Portal → vào trang Chi tiết Lớp học → xem thông tin buổi học (Thời gian thực tế, nhận xét của gia sư).
3.  Phụ huynh bấm nút **"Xác nhận buổi học"**.
4.  Hệ thống hiển thị Pop-up yêu cầu nhập mã PIN bảo mật 4 số.
5.  Phụ huynh nhập đúng mã PIN → bấm "Xác nhận".
6.  Hệ thống thực hiện (trong 1 giao dịch DB - tránh race condition):
    *   Chuyển trạng thái buổi học thành `CONFIRMED`.
    *   Tìm gói học của lớp có thời gian mua cũ nhất chưa dùng hết (FIFO), tăng `packages.used_sessions` của gói đó.
    *   Đồng bộ cập nhật cache `classes.remaining_sessions` (giảm 1).
    *   Tạo transaction `SESSION_DEDUCTION` (đối soát nội bộ, KHÔNG đổi `parents.balance` - BR-FIN-01).
    *   Cộng `tutors.wallet_balance` theo `tutor_wage_rate`, tạo transaction `TUTOR_SALARY`.
    *   Gửi thông báo thành công cho Gia sư qua Tutor Portal.

#### Luồng thay thế (Alternative Path) - Phụ huynh khiếu nại (Dispute)
3a. Phụ huynh phát hiện thông tin giờ dạy hoặc nhận xét của gia sư bị sai lệch.
4a. Phụ huynh bấm nút **"Khiếu nại điểm danh"**.
5a. Hệ thống hiển thị Form yêu cầu nhập Lý do khiếu nại và đính kèm minh chứng hình ảnh (`dispute_evidence`, tối đa 5 ảnh).
6a. Phụ huynh hoàn thành → bấm "Gửi khiếu nại".
7a. Hệ thống thực hiện:
    *   Chuyển trạng thái buổi học thành `DISPUTED`.
    *   Gửi cảnh báo khẩn cấp cho nhân viên Học vụ (UC-11).
    *   Không trừ số buổi học và không cộng lương cho gia sư cho đến khi có phán quyết.

#### Luồng ngoại lệ (Exception Path) - Nhập sai mã PIN
5b. Phụ huynh nhập sai mã PIN 4 số → hiển thị: *"Mã PIN không chính xác. Bạn còn X lần thử."*
6b. Nhập sai liên tiếp 5 lần → khóa tính năng xác nhận 15 phút (`PIN_LOCKED`), ghi audit log, gửi cảnh báo bảo mật qua SMS (BR-SEC-04).

#### Luồng ngoại lệ - Hết buổi gói
5c. Gói học hết buổi (`PACKAGE_EXHAUSTED`) → chặn xác nhận, hiển thị màn hình mua gói mới (BR-FIN-04).

---

### 3.4. UC-04: Báo nghỉ học lẻ (Học viên)

*   **Mô tả:** Học viên báo nghỉ một buổi học định kỳ; đơn phải được Phụ huynh xác nhận trước khi chuyển đến Gia sư.
*   **Actor chính:** Học viên (Student) / Phụ huynh (Parent).
*   **Actor phụ:** Gia sư (nhận thông báo), Hệ thống.
*   **Điều kiện tiên quyết:** Buổi học ở trạng thái `SCHEDULED`, thuộc lớp của học viên.
*   **Ràng buộc thời gian:** Gửi trước giờ học ≥ 4h (BR-SCH-01). Nghỉ muộn → vẫn tính buổi học và giữ 50% lương cho gia sư.

#### Luồng chính (Happy Path)
1.  Học viên mở Portal (Profile Học viên) → mục "Lịch học" → chọn buổi học → bấm **"Báo nghỉ"**.
2.  Hệ thống hiển thị Form: Lý do nghỉ, thời gian học bù đề xuất (tùy chọn).
3.  Học viên nhập liệu → bấm "Gửi yêu cầu".
4.  Hệ thống kiểm tra thời gian gửi ≥ 4h trước giờ học → tạo `student_leaves` trạng thái `PENDING`, `parent_approved = false`.
5.  Hệ thống gửi thông báo cho Phụ huynh: *"Bé Minh xin nghỉ buổi 19h thứ 2 - Chờ duyệt"*.
6.  Phụ huynh bấm "Xác nhận duyệt" (`LEAVE-04`) → `parent_approved = true`. Hệ thống chuyển đơn nghỉ đến Gia sư, buổi học tạm thời chuyển sang trạng thái chờ dời lịch.
7.  Gia sư nhận thông báo đề xuất dời lịch, truy cập Portal bấm "Đồng ý" (`LEAVE-02`) hoặc đề xuất giờ khác (`LEAVE-03`). Khi Gia sư đồng ý, buổi cũ chuyển `CANCELLED_BY_STUDENT` (không trừ buổi gói) và hệ thống tự động sinh buổi học mới theo giờ bù.

#### Luồng ngoại lệ (Exception Path) - Nghỉ muộn < 4h
3a. Hệ thống xác định thời gian còn lại < 4h → hiển thị cảnh báo: *"Nghỉ muộn sẽ tính 1 buổi học đã diễn ra và không hoàn lại. Bạn có chắc chắn?"*.
4a. Học viên xác nhận tiếp tục → `is_late_leave = true`. Buổi học vẫn tính như đã diễn ra: **tăng `used_sessions`** (trừ 1 buổi gói) và trả **50% lương** cho gia sư (BR-SCH-01).

#### Luồng ngoại lệ - Phụ huynh không duyệt
5a. Phụ huynh bấm "Từ chối" → đơn chuyển `REJECTED`, học viên vẫn phải đi học; buổi học giữ nguyên trạng thái `SCHEDULED`.

---

### 3.5. UC-05: Đăng ký hồ sơ & lịch rảnh (Gia sư)

*   **Mô tả:** Gia sư khai hồ sơ năng lực, môn dạy được duyệt và khai báo lịch rảnh để hệ thống dùng cho việc khớp lớp.
*   **Actor chính:** Gia sư (Tutor).
*   **Actor phụ:** Nhân viên CRM (Sales/Academic), Hệ thống.
*   **Điều kiện tiên quyết:** Tài khoản Gia sư đã đăng ký (AUTH-03) và xác thực OTP.

#### Luồng chính (Happy Path)
1.  Gia sư đăng nhập lần đầu → hệ thống dẫn đến màn hình **"Hoàn thiện hồ sơ"**.
2.  Gia sư khai: Họ tên, CCCD, nghề nghiệp, trình độ, mô tả bản thân → bấm "Lưu".
3.  Gia sư khai danh sách **môn dạy & cấp lớp** (`tutor_subjects`) → bấm "Tiếp tục".
4.  Gia sư khai **lịch rảnh** trong tuần (chọn thứ + khung giờ, nhiều khung) qua `SCH-02` → bấm "Gửi xét duyệt".
5.  Hệ thống lưu hồ sơ, đổi trạng thái thành `PENDING_REVIEW`, gửi thông báo cho Sales (`CRM-08`).
6.  Sales kiểm tra hồ sơ + chứng chỉ (upload qua `TUT-03`) → bấm "Duyệt".
7.  Hệ thống chuyển `tutors.status = ACTIVE`, `is_public = true`, gửi thông báo: *"Hồ sơ của bạn đã được duyệt. Bạn có thể ứng tuyển lớp mới."*

#### Luồng thay thế - Từ chối hồ sơ
6a. Sales bấm "Từ chối" → hồ sơ giữ `PENDING_REVIEW`, gửi lý do cho gia sư sửa lại và nộp lại.

#### Luồng ngoại lệ - Sửa lịch rảnh khi đã có lớp
4a. Gia sư cập nhật `tutor_schedules` sau khi đang dạy → hệ thống chặn xóa/đổi khung giờ trùng với `class_schedules` lớp đang dạy (trả `SCHEDULE_CONFLICT` - BR-MAT-02), chỉ cho phép chỉnh các khung giờ trống.

---

### 3.6. UC-06: Ứng tuyển nhận lớp mới

*   **Mô tả:** Gia sư xem các lớp tuyển công khai (ẩn danh) và nộp đơn ứng tuyển.
*   **Actor chính:** Gia sư (Tutor).
*   **Actor phụ:** Hệ thống (kiểm tra năng lực & trùng lịch).
*   **Điều kiện tiên quyết:** Hồ sơ gia sư ở trạng thái `ACTIVE`.

#### Luồng chính (Happy Path)
1.  Gia sư vào mục "Lớp mới tuyển" → xem danh sách (ẩn danh theo BR-SEC-01, chỉ hiển thị quận/khu vực).
2.  Gia sư bấm "Chi tiết" → xem yêu cầu (môn, lớp, lịch, ngân sách) → bấm **"Ứng tuyển"**.
3.  Hệ thống kiểm tra:
    *   Môn/Cấp có trong `tutor_subjects` được duyệt không → sai trả `SUBJECT_NOT_ALLOWED` (BR-MAT-01).
    *   Khung giờ có trùng `class_schedules` lớp đang dạy hoặc `tutor_schedules` không → trùng trả `SCHEDULE_CONFLICT` (BR-MAT-02).
4.  Gia sư nhập thư giới thiệu → bấm "Gửi".
5.  Hệ thống tạo `class_applications` trạng thái `PENDING`, gửi thông báo cho Sales.

#### Luồng thay thế - Rút đơn
5a. Gia sư rút đơn khi `PENDING`/`SHORTLISTED` → chuyển `WITHDRAWN`.

#### Luồng ngoại lệ - Lớp đã chốt
3a. Yêu cầu đã có gia sư được chốt (`MATCHED`) → ẩn nút "Ứng tuyển", hiển thị "Lớp đã khép tuyển".

---

### 3.7. UC-07: Điểm danh buổi dạy

*   **Mô tả:** Gia sư báo cáo giờ dạy thực tế sau khi kết thúc buổi học.
*   **Actor chính:** Gia sư (Tutor).
*   **Actor phụ:** Hệ thống.
*   **Điều kiện tiên quyết:** Buổi học đang ở trạng thái `SCHEDULED` và thuộc lớp gia sư đang dạy.

#### Luồng chính (Happy Path)
1.  Gia sư vào mục "Buổi học hôm nay" → bấm **"Điểm danh"** trên buổi học vừa kết thúc.
2.  Hệ thống hiển thị Form: Giờ bắt đầu (tự điền theo giờ hệ thống, cho sửa), Giờ kết thúc, Nhận xét tiến độ học sinh, tùy chọn chụp ảnh.
3.  Gia sư nhập liệu → bấm "Gửi điểm danh".
4.  Hệ thống kiểm tra cửa sổ 24h sau `scheduled_time` (quá hạn trả `ATTENDANCE_LOCKED` - BR-SCH-04).
5.  Hệ thống lưu `actual_start`, `actual_end`, `tutor_notes` → chuyển buổi thành `ATTENDED`.
6.  Hệ thống gửi Push Notification cho Phụ huynh chờ duyệt (dẫn đến UC-03).

#### Luồng ngoại lệ - Điểm danh trùng
4a. Buổi học đã `ATTENDED`/`CONFIRMED` → báo "Buổi học đã được điểm danh trước đó".

---

### 3.8. UC-08: Gia sư báo nghỉ dạy và đề xuất lịch dạy bù

*   **Mô tả:** Gia sư xin nghỉ buổi dạy định kỳ do có việc bận đột xuất và hẹn lịch dạy bù mới để phụ huynh phê duyệt.
*   **Actor chính:** Gia sư (Tutor).
*   **Actor phụ:** Phụ huynh (Parent).
*   **Điều kiện tiên quyết:** Buổi học đang ở trạng thái `SCHEDULED` (chưa diễn ra).

#### Luồng chính (Happy Path)
1.  Gia sư truy cập Portal → vào mục Lịch dạy → chọn buổi học muốn xin nghỉ → bấm **"Báo nghỉ dạy"**.
2.  Hệ thống hiển thị Form yêu cầu:
    *   Nhập lý do nghỉ học.
    *   Chọn thời gian dạy bù đề xuất (Ngày, Giờ).
3.  Gia sư hoàn thành thông tin → bấm "Gửi yêu cầu". (Yêu cầu được gửi trước giờ dạy > 24 giờ).
4.  Hệ thống chuyển trạng thái buổi học cũ thành `CANCELLED_BY_TUTOR`. Tạo bản ghi đề xuất dời lịch trong bảng `tutor_leaves` trạng thái `PENDING`.
5.  Hệ thống gửi thông báo duyệt lịch dạy bù tới Phụ huynh.
6.  Phụ huynh truy cập Portal → bấm **"Đồng ý dời lịch"**.
7.  Hệ thống cập nhật trạng thái dời lịch thành `APPROVED`, tự động tạo một buổi học mới với lịch thời gian dạy bù đã được thống nhất.

#### Luồng thay thế - Phụ huynh từ chối & đề xuất giờ khác
6a. Phụ huynh bấm "Từ chối" và chọn giờ thay thế.
7a. Hệ thống cập nhật `reschedule_suggested` theo giờ mới, gửi lại thông báo cho Gia sư xác nhận (vòng lặp tối đa 2 lần).

#### Luồng ngoại lệ (Exception Path) - Xin nghỉ muộn sát giờ dạy (<24h)
3a. Gia sư bấm gửi yêu cầu báo nghỉ khi thời gian đến giờ dạy thực tế nhỏ hơn 24 giờ.
4a. Hệ thống hiển thị cảnh báo: *"Chú ý: Bạn đang báo nghỉ muộn dưới 24h. Việc này có thể ảnh hưởng đến điểm uy tín của gia sư trên hệ thống. Bạn có chắc chắn muốn tiếp tục?"*
5a. Gia sư bấm Xác nhận → Hệ thống ghi nhận trạng thái hủy buổi, đánh dấu `is_late_leave = true`, tự động gửi cảnh báo cho nhân viên Học vụ trên CRM và ghi nhận 1 lần vi phạm nghỉ muộn của Gia sư (BR-SCH-02, BR-PEN-03).

---

### 3.9. UC-09: Khớp gia sư tự động / thủ công

*   **Mô tả:** Nhân viên CRM chọn gia sư phù hợp để giao dạy thử cho lớp, từ gợi ý tự động của hệ thống hoặc duyệt thủ công.
*   **Actor chính:** Nhân viên CRM (Sales).
*   **Actor phụ:** Hệ thống, Gia sư, Phụ huynh.
*   **Điều kiện tiên quyết:** Yêu cầu ở trạng thái `PUBLISHED` (hoặc `CONSULTING` nếu phụ huynh mời).

#### Luồng chính (Happy Path)
1.  Hệ thống chạy **Matching Engine** quét các yêu cầu `PUBLISHED` và gợi ý gia sư khớp (môn, cấp, quận, lịch rảnh, ngân sách, rating) → gán nhãn `SHORTLISTED` cho tối đa 3 đơn.
2.  Sales mở màn hình "Khớp lớp" → xem danh sách gợi ý (điểm tương thích %, hồ sơ ẩn danh).
3.  Sales chọn 1 gia sư → bấm **"Giao dạy thử"**.
4.  Hệ thống chuyển đơn ứng tuyển thành `SELECTED_FOR_TRIAL`, tạo lớp mới (`classes` trạng thái `TRIAL_PENDING`), thiết lập lịch định kỳ (`class_schedules`).
5.  Hệ thống **mở khóa thông tin liên hệ** Phụ huynh cho gia sư này (BR-SEC-01).
6.  Gia sư & Phụ huynh liên hệ thống nhất buổi dạy thử.
7.  Sau dạy thử: Phụ huynh xác nhận "Đồng ý gia sư chính thức" + mua gói (BR-FIN-01) → lớp chuyển `TEACHING`; các đơn khác tự chuyển `REJECTED` (BR-MAT-03).

#### Luồng thay thế - Dạy thử thất bại
7a. Phụ huynh báo dạy thử không đạt → lớp chuyển `TRIAL_FAILED`, **thu hồi thông tin liên hệ** (BR-MAT-04).
8a. Hệ thống tự động khấu trừ học phí 1 buổi dạy thử từ số dư `parents.balance` của Phụ huynh để chi trả lương cho Gia sư dạy thử (bằng transaction `SESSION_DEDUCTION` và `TUTOR_SALARY` trực tiếp).
9a. Sales chọn gia sư thay thế từ danh sách `SHORTLISTED` còn lại hoặc đăng lại yêu cầu (tái sử dụng yêu cầu tìm gia sư hiện tại). Lớp mới tạo ra sẽ trỏ về cùng một `tutor_request_id` giúp lưu lại lịch sử các lớp dạy thử trước đó.

#### Luồng ngoại lệ - Không đủ gia sư phù hợp
2a. Không có gợi ý khớp → Sales thông báo cho Phụ huynh, mở rộng tiêu chí (quận lân cận, giới tính) hoặc đưa yêu cầu ra ngoài hệ thống tuyển.

---

### 3.10. UC-10: Quản lý ví tiền & duyệt lương

*   **Mô tả:** Phụ huynh mua gói học phí; Gia sư theo dõi ví lương; Kế toán kết toán lương cuối tháng.
*   **Actor chính:** Phụ huynh, Gia sư, Kế toán (Accountant).
*   **Actor phụ:** Hệ thống (tự động ghi nhận lương).

#### Luồng chính (Happy Path) - Gia sư theo dõi ví
1.  Sau mỗi buổi học được xác nhận (UC-03), hệ thống tự cộng `tutor_wage_rate` vào `wallet_balance` và tạo transaction `TUTOR_SALARY`.
2.  Gia sư xem ví → danh sách giao dịch theo từng buổi + tổng số dư → bấm "Yêu cầu rút lương".
3.  Hệ thống tạo yêu cầu rút tiền, trạng thái `PENDING`, gửi cho Kế toán.

#### Luồng chính (Happy Path) - Kế toán duyệt lương
1.  Kế toán mở màn hình "Kết toán lương" → chọn kỳ (tháng) → xem tổng hợp lương theo gia sư.
2.  Kế toán xác nhận chuyển khoản tới `tutor_bank_accounts` → nhập mã giao dịch ngân hàng.
3.  Hệ thống cập nhật transaction `SUCCESSFUL`, trừ `wallet_balance`, ghi `reference`, gửi notification cho gia sư.

#### Luồng chính (Happy Path) - Phụ huynh mua gói
1.  Phụ huynh vào lớp học → "Nạp thêm buổi học" → chọn gói → nhập mã PIN.
2.  Hệ thống kiểm tra PIN (BR-SEC-04) → kiểm tra `balance ≥ price` (sai trả `BALANCE_INSUFFICIENT`).
3.  Hệ thống **trừ giá gói khỏi `balance`**, tạo `packages` + giao dịch `TUITION_DEPOSIT` (nếu nạp thêm tiền).
4.  Nếu lớp đang `SUSPENDED` vì hết buổi → tự chuyển lại `TEACHING` (BR-FIN-04).

#### Luồng ngoại lệ - Số dư không đủ
2a. Số dư không đủ thanh toán → trả `BALANCE_INSUFFICIENT`, hướng dẫn nạp tiền trước (gọi API nạp tiền `PKG-04`).

---

### 3.11. UC-11: Giải quyết khiếu nại (Dispute)

*   **Mô tả:** Nhân viên Học vụ xử lý các buổi học bị Phụ huynh khiếu nại và ra phán quyết cuối cùng.
*   **Actor chính:** Nhân viên Học vụ (Academic).
*   **Actor phụ:** Phụ huynh, Gia sư, Hệ thống.
*   **Điều kiện tiên quyết:** Tồn tại buổi học trạng thái `DISPUTED`.

#### Luồng chính (Happy Path)
1.  Hệ thống gửi cảnh báo khẩn cấp tới Học vụ khi có buổi `DISPUTED`.
2.  Học vụ mở màn hình "Danh sách khiếu nại" → chọn buổi → xem: thông tin điểm danh của gia sư, lý do + minh chứng của phụ huynh, lịch sử lớp.
3.  Học vụ liên hệ hai bên để đối soát (ngoài hệ thống, qua điện thoại/chat).
4.  Học vụ bấm **"Ra phán quyết"** và chọn một trong ba kết quả:
    *   `RESOLVED_CONFIRM` (xác nhận buổi dạy có thật): trừ buổi, cộng lương gia sư.
    *   `RESOLVED_CANCEL` (hủy buổi): không trừ buổi, không trả lương, khôi phục buổi `CANCELLED`.
    *   `RESOLVED_PARTIAL` (thỏa hiệp - nghỉ muộn): trừ buổi, trả 50% lương cho gia sư.
5.  Hệ thống thực thi nghiệp vụ tương ứng, cập nhật `dispute_resolution`, gửi notification cho cả Phụ huynh và Gia sư, ghi audit log.

#### Luồng thay thế - Thiếu minh chứng
4a. Hai bên không cung cấp đủ chứng cứ → Học vụ mặc định theo hồ sơ điểm danh (xác nhận buổi dạy) để bảo vệ quyền lợi gia sư, có ghi chú rõ ràng.

#### Luồng ngoại lệ - Quá hạn SLA
2a. Buổi `DISPUTED` quá **48h** chưa xử lý → hệ thống chuyển lên hàng đợi "Cần xử lý khẩn" và thông báo cho Admin (SLA trong SRS mục FR-CRM-04).

---

## 4. Ma Trận Use Case - Quy Tắc Nghiệp Vụ

| Use Case | Business Rules liên quan |
| :--- | :--- |
| UC-01 | BR-MAT-03 |
| UC-02 | BR-SEC-01, BR-SEC-02 |
| UC-03 | BR-FIN-02, BR-FIN-03, BR-FIN-06, BR-SEC-04 |
| UC-04 | BR-SCH-01, BR-FIN-02 |
| UC-05 | BR-MAT-01, BR-SEC-03 |
| UC-06 | BR-MAT-01, BR-MAT-02 |
| UC-07 | BR-SCH-04 |
| UC-08 | BR-SCH-02, BR-PEN-03 |
| UC-09 | BR-MAT-03, BR-MAT-04, BR-SEC-01 |
| UC-10 | BR-FIN-01, BR-FIN-04, BR-FIN-05, BR-FIN-06 |
| UC-11 | BR-FIN-02, BR-FIN-06, BR-PEN-01 |

---

## 5. Notification & Audit Log theo Use Case

> Chi tiết nội dung thông báo xem SRS 4.5 (Notification Matrix); quy tắc đa kênh theo BR-COM-01/02.

| Use Case | Thông báo gửi đi | Ai nhận | Audit log bắt buộc |
| :--- | :--- | :--- | :--- |
| **UC-01** Tạo yêu cầu | "Yêu cầu mới cần tư vấn" | Sales (CRM) | CREATE `tutor_requests` |
| **UC-02** Tìm GS | Không gửi (chỉ đọc) | - | Chỉ log đọc nếu lọc nhạy cảm |
| **UC-03** Xác nhận điểm danh | "Buổi học chờ duyệt" → "Buổi đã được duyệt" | PH → GS | CONFIRM `sessions` + 2 giao dịch |
| **UC-04** HV báo nghỉ | "Đơn nghỉ chờ duyệt" → "Đơn nghỉ đã duyệt" | PH → GS | CREATE/APPROVE `student_leaves` |
| **UC-05** Đăng ký hồ sơ | "Hồ sơ chờ duyệt" → "Hồ sơ đã duyệt" | Sales → GS | UPDATE `tutors.status` |
| **UC-06** Ứng tuyển | "Đơn mới" → "Đơn {duyệt/từ chối}" | Sales → GS | CREATE `class_applications` |
| **UC-07** Điểm danh | "Buổi chờ PH duyệt" | PH | UPDATE `sessions` → `ATTENDED` |
| **UC-08** Nghỉ dạy | "Đề xuất lịch bù" → "Lịch bù {duyệt/từ chối}" | PH ↔ GS | CREATE `tutor_leaves` + `is_late_leave` |
| **UC-09** Khớp lớp | "Bạn được chọn dạy thử" + "Yêu cầu đã khớp" | GS, PH | CREATE `classes` + `class_schedules` |
| **UC-10** Ví & lương | "Lương +X", "Rút lương {xử lý}", "Gói đã mua" | GS, PH, KT | Transaction `TUTOR_SALARY`/`SALARY_WITHDRAWAL` |
| **UC-11** Giải quyết khiếu nại | "Alert khẩn" → "Kết quả phán quyết" | Học vụ → PH, GS | UPDATE `sessions.dispute_resolution` |

---

## 6. Acceptance Criteria tóm tắt (cho QA/Tester)

| Use Case | TC-ID tiêu biểu | Kịch bản kiểm thử |
| :--- | :--- | :--- |
| **UC-03** | TC-03-01 | PH duyệt buổi `ATTENDED` đúng PIN → `CONFIRMED`, `remaining_sessions` giảm 1, ví GS + lương |
| | TC-03-02 | PH nhập sai PIN 5 lần → khóa 15 phút, cảnh báo SMS |
| | TC-03-03 | PH khiếu nại + đính kèm 5 ảnh → buổi `DISPUTED`, không trừ tiền |
| | TC-03-04 | Gói hết buổi khi duyệt → chặn, hiển thị màn hình mua gói |
| **UC-07** | TC-07-01 | GS điểm danh trong 24h → `ATTENDED` |
| | TC-07-02 | GS điểm danh sau 24h → lỗi `ATTENDANCE_LOCKED` |
| | TC-07-03 | Điểm danh 2 lần cùng buổi → báo đã điểm danh |
| **UC-08** | TC-08-01 | GS nghỉ ≥ 24h → không phạt, tạo lịch bù sau khi PH duyệt |
| | TC-08-02 | GS nghỉ < 24h → cảnh báo + ghi 1 vi phạm |
| **UC-09** | TC-09-01 | Matching Engine gợi ý ≤ 3 đơn khớp, điểm tương thích hợp lệ |
| | TC-09-02 | Giao dạy thử → mở khóa SĐT PH cho GS được chọn, các đơn khác `REJECTED` |
| **UC-10** | TC-10-01 | Mua gói khi balance đủ → trừ tiền, lớp `SUSPENDED` → `TEACHING` |
| | TC-10-02 | Mua gói khi balance thiếu → `BALANCE_INSUFFICIENT` |
| | TC-10-03 | Rút lương > ví → `BALANCE_INSUFFICIENT`; duyệt chi → trừ ví |
| **UC-11** | TC-11-01 | Học vụ `RESOLVED_CONFIRM` → trừ buổi + cộng lương |
| | TC-11-02 | Học vụ `RESOLVED_PARTIAL` (50%) → trừ buổi + cộng 50% lương |
| | TC-11-03 | Dispute quá 48h → cảnh báo Admin |

> Yêu cầu chi tiết boundary/exception khác: tham chiếu SRS 3.4 (User Stories & Acceptance Criteria) và Business_Rules 5 (Data Validation Rules).
