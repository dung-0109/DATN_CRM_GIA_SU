# Software Requirements Specification (SRS) - Hệ Thống CRM Gia Sư

**Phiên bản:** v1.3 (cập nhật 31/07/2026 - bổ sung User Stories & AC, Notification/Permission matrix, Interface, Data retention)

## 1. Giới Thiệu (Introduction)

### 1.1. Mục đích (Purpose)
Tài liệu này cung cấp các yêu cầu phần mềm chi tiết (đặc tả chức năng và phi chức năng) cho hệ thống CRM Trung tâm Gia sư và Client/Tutor Portal nhằm phục vụ công tác thiết kế, phát triển và kiểm thử (QA/Tester).

### 1.2. Phạm vi sản phẩm (Product Scope)
Hệ thống bao gồm ba phân hệ chính:
1.  **Back-office CRM:** Dành cho nhân viên trung tâm quản lý vận hành.
2.  **Client Portal:** Dành cho Phụ huynh và Học viên (hệ thống Family Account).
3.  **Tutor Portal:** Dành cho Gia sư quản lý lịch học, điểm danh và thu nhập.

### 1.3. Thuật ngữ (Glossary)
| Thuật ngữ | Định nghĩa |
| :--- | :--- |
| Gói học (Package) | Gói học phí trả trước tối thiểu 10 buổi mà Phụ huynh mua cho 1 lớp |
| Dạy thử (Trial) | Buổi học đầu tiên trước khi lớp chuyển trạng thái chính thức |
| Family Account | Tài khoản gia đình cho phép Phụ huynh quản lý nhiều Học viên |
| Dispute | Khiếu nại điểm danh của Phụ huynh về 1 buổi học |

---

## 2. Mô Tả Tổng Quan (Overall Description)

### 2.1. Kiến trúc hệ thống tổng quát (Product Perspective)
Hệ thống được phát triển theo mô hình Web Application. Client Portal và Tutor Portal cần hỗ trợ tối ưu hiển thị trên thiết bị di động (Responsive Web/Mobile View). CRM nội bộ tối ưu hiển thị trên máy tính (Desktop View).

### 2.2. Đặc điểm người dùng (User Classes & Characteristics)
*   **Admin/Staff (CRM):** Trình độ công nghệ tốt, thao tác nhanh trên máy tính, yêu cầu giao diện quản trị hiển thị nhiều dữ liệu dạng bảng, hỗ trợ phím tắt và tìm kiếm/filter mạnh.
*   **Phụ huynh (Portal):** Đa dạng độ tuổi (30-55), yêu cầu giao diện Portal đơn giản, trực quan, các thao tác thanh toán và duyệt điểm danh phải rõ ràng, dễ hiểu.
*   **Học viên (Portal con):** Độ tuổi từ 6-18 tuổi, yêu cầu giao diện đơn giản, tập trung vào lịch học và bài tập về nhà.
*   **Gia sư (Portal):** Độ tuổi trẻ (18-30), thành thạo thiết bị di động, yêu cầu giao diện Mobile Web tối ưu để điểm danh nhanh chóng và cập nhật lịch dạy bù khi đang di chuyển.

### 2.3. Ràng buộc thiết kế & phát triển (Design & Implementation Constraints)
*   **UI/UX:** Giao diện Portal phải thiết kế dạng Responsive, tải nhanh trên môi trường mạng 3G/4G di động.
*   **Bảo mật:** Tất cả các kết nối trao đổi dữ liệu bắt buộc sử dụng HTTPS. Mật khẩu lưu trữ phải được mã hóa một chiều bằng thuật toán mạnh (ví dụ: bcrypt). Mã PIN phụ huynh chỉ lưu dạng hash, không lưu bản rõ.

---

## 3. Các Yêu Cầu Chức Năng (Functional Requirements)

### 3.1. Phân hệ CRM Nội bộ (CRM Back-office)

| Mã | Yêu cầu |
| :--- | :--- |
| **FR-CRM-01** | **Quản lý Hồ sơ Gia sư:** Tạo mới, chỉnh sửa thông tin gia sư, upload bằng cấp/chứng chỉ, quản lý điểm xếp hạng (Rating), quản lý trạng thái (`ACTIVE`, `PENDING_REVIEW`, `BANNED`), quản lý danh sách môn dạy được duyệt (`tutor_subjects`). |
| **FR-CRM-02** | **Duyệt ứng tuyển và Khớp lớp:** Hệ thống tự động quét và đề xuất danh sách Gia sư rảnh lịch và có chuyên môn khớp với lớp đang tìm gia sư. Hỗ trợ Sales bấm giao lớp dạy thử, tối đa 3 GS/vòng dạy thử (BR-MAT-03). |
| **FR-CRM-03** | **Quản lý Lớp học:** Quản lý trạng thái lớp học (`TRIAL_PENDING`, `TEACHING`, `SUSPENDED`, `COMPLETED`), theo dõi số buổi còn lại trong gói học của học sinh. |
| **FR-CRM-04** | **Học vụ giải quyết Dispute:** Xem danh sách buổi học bị khiếu nại (Disputed), tra cứu minh chứng (`dispute_evidence`), quyết định `RESOLVED_CONFIRM` / `RESOLVED_CANCEL` / `RESOLVED_PARTIAL`. SLA: phản hồi trong ≤ 48h. |
| **FR-CRM-05** | **Quản lý Gói học phí:** Xem lịch sử mua gói, số buổi đã dùng, số buổi còn lại; hỗ trợ hoàn tiền (Refund) khi có duyệt của Kế toán. |
| **FR-CRM-06** | **Quản lý Lịch định kỳ lớp:** Thiết lập/điều chỉnh lịch định kỳ (`class_schedules`) khi tạo lớp hoặc theo yêu cầu đổi lịch đã được hai bên duyệt. |
| **FR-CRM-07** | **Kết toán lương Gia sư:** Kế toán xem tổng hợp ví lương (`tutors.wallet_balance`), xác nhận chuyển khoản, đối soát bằng mã giao dịch (`transactions.reference`). |
| **FR-CRM-08** | **Báo cáo & Truy vết:** Báo cáo tổng quan (doanh thu, số lớp đang dạy, số GS hoạt động, tỷ lệ đổi GS) và tra cứu nhật ký kiểm toán (`audit_logs`) theo filter thời gian/đối tượng. |

### 3.2. Phân hệ Client Portal (Phụ huynh & Học viên)

| Mã | Yêu cầu |
| :--- | :--- |
| **FR-CLI-01** | **Profile Switcher:** Sau khi đăng nhập, hiển thị màn hình chọn Profile. Khi chọn Profile Phụ huynh, yêu cầu nhập mã PIN bảo mật 4 số. Profile Học viên chỉ được xem lịch học và báo nghỉ học, không được truy cập ví tiền hoặc duyệt điểm danh. |
| **FR-CLI-02** | **Tìm kiếm Gia sư ẩn danh:** Cho phép Phụ huynh lọc hồ sơ gia sư công khai theo môn học, cấp học, quận/huyện, giới tính, trình độ và bấm gửi lời mời dạy thử. |
| **FR-CLI-03** | **Xác nhận điểm danh & Chấm sao:** Phụ huynh xem thông tin buổi dạy gia sư vừa điểm danh (Giờ dạy, nhận xét), nhập mã PIN để xác nhận thanh toán hoặc bấm Khiếu nại (Dispute) kèm minh chứng hình ảnh. |
| **FR-CLI-04** | **Đăng ký yêu cầu tìm gia sư:** Phụ huynh tạo yêu cầu (môn, lớp, lịch rảnh mong muốn, ngân sách/buổi, giới tính GS), theo dõi trạng thái yêu cầu (`NEW → CONSULTING → PUBLISHED → MATCHED`). |
| **FR-CLI-05** | **Mua & Gia hạn gói học:** Phụ huynh mua gói học phí (≥ 10 buổi), thanh toán trực tuyến, xem số buổi còn lại, nhận cảnh báo khi gói còn ≤ 2 buổi, nạp thêm gói mới. Thao tác mua/hoàn phí yêu cầu nhập mã PIN. |
| **FR-CLI-06** | **Duyệt lịch dạy bù:** Phụ huynh nhận thông báo đề xuất lịch bù của Gia sư, chọn "Đồng ý" hoặc "Từ chối - đề xuất giờ khác". |
| **FR-CLI-07** | **Trung tâm thông báo:** Xem lịch sử thông báo (duyệt điểm danh, duyệt lịch bù, hết gói, biến động ví). |

### 3.3. Phân hệ Tutor Portal (Gia sư)

| Mã | Yêu cầu |
| :--- | :--- |
| **FR-TUT-01** | **Quản lý lịch dạy và lịch rảnh:** Gia sư đăng ký các khung giờ rảnh trong tuần (`tutor_schedules`). Hệ thống tự động vẽ thời khóa biểu các lớp đang dạy và đánh dấu các khung giờ bận. |
| **FR-TUT-02** | **Điểm danh buổi dạy:** Cho phép gia sư điểm danh sau buổi dạy (chụp ảnh/nhập ghi chú tiến độ học sinh). Bắt buộc thực hiện trong vòng **24 giờ** sau khi kết thúc buổi dạy (BR-SCH-04). |
| **FR-TUT-03** | **Yêu cầu nghỉ học & dời lịch:** Gia sư báo xin nghỉ buổi dạy lẻ và nhập khung giờ bù đề xuất (≥ 24h trước giờ dạy). Hệ thống gửi thông báo duyệt đến Phụ huynh. |
| **FR-TUT-04** | **Ứng tuyển lớp mới:** Xem danh sách lớp tuyển công khai (ẩn danh theo BR-SEC-01), lọc theo môn/cấp/quận, ứng tuyển (kiểm tra khớp môn `tutor_subjects` và chống trùng giờ BR-MAT-02), theo dõi trạng thái đơn. |
| **FR-TUT-05** | **Ví thu nhập & Ngân hàng:** Xem số dư ví lương, lịch sử giao dịch nhận lương theo từng buổi, quản lý tài khoản ngân hàng nhận lương (tối đa 3 tài khoản). |
| **FR-TUT-06** | **Trung tâm thông báo:** Nhận thông báo khi buổi học được duyệt (lương cộng), khi Phụ huynh duyệt lịch bù, khi bị khiếu nại/đánh giá thấp. |

---

### 3.4. User Stories & Acceptance Criteria (phiên bản chi tiết)

> Mỗi FR cốt lõi được mô tả dưới dạng User Story kèm Acceptance Criteria để Dev & QA sử dụng trực tiếp.

#### Nhóm CRM (Back-office)

| ID | User Story | Acceptance Criteria |
| :--- | :--- | :--- |
| **US-CRM-01** | Là **Sales**, tôi muốn duyệt hồ sơ gia sư (kèm chứng chỉ) để lớp mới có danh sách gia sư chất lượng. | ✔ Hồ sơ `PENDING_REVIEW` hiển thị đầy đủ CCCD (4 số cuối), chứng chỉ, `tutor_subjects`.<br>✔ Duyệt → `ACTIVE`; từ chối → nhập lý do gửi lại gia sư.<br>✔ Ghi audit log. |
| **US-CRM-02** | Là **Sales**, tôi muốn xem gợi ý match tự động và giao lớp dạy thử để giảm thời gian ghép lớp. | ✔ Hệ thống đề xuất ≤ 3 đơn khớp (môn/cấp/quận/lịch) với điểm tương thích %.<br>✔ "Giao dạy thử" tạo lớp `TRIAL_PENDING` + mở khóa SĐT phụ huynh cho GS được chọn.<br>✔ Các đơn khác tự `REJECTED`. |
| **US-CRM-03** | Là **Học vụ**, tôi muốn xem & xử lý khiếu nại có SLA để không tồn đọng tranh chấp. | ✔ Buổi `DISPUTED` hiển thị minh chứng + lý do.<br>✔ Ra phán quyết 1 trong 3 kết quả, hệ thống tự thực thi tài chính.<br>✔ Quá 48h chưa xử lý → cảnh báo đỏ cho Admin. |
| **US-CRM-04** | Là **Kế toán**, tôi muốn kết toán lương & nạp/hoàn tiền để dòng tiền chính xác. | ✔ Bảng lương theo kỳ tổng hợp theo gia sư, hiển thị 4 số cuối tài khoản.<br>✔ Duyệt chi → cập nhật ví, transaction `SUCCESSFUL`, gửi notification.<br>✔ Đối soát bằng mã giao dịch ngân hàng (`reference`). |

#### Nhóm Client Portal

| ID | User Story | Acceptance Criteria |
| :--- | :--- | :--- |
| **US-CLI-01** | Là **Phụ huynh**, tôi muốn mua gói học phí bằng mã PIN để thanh toán an toàn. | ✔ Mua tối thiểu 10 buổi; kiểm tra `balance ≥ price`.<br>✔ Sai PIN 5 lần → khóa 15 phút (BR-SEC-04).<br>✔ Mua xong hiển thị số buổi còn lại ngay. |
| **US-CLI-02** | Là **Phụ huynh**, tôi muốn xác nhận/ khiếu nại điểm danh để chỉ trả tiền cho buổi học thực tế. | ✔ Nhìn rõ giờ dạy thực tế + nhận xét GS.<br>✔ Xác nhận → trừ 1 buổi + cộng lương GS.<br>✔ Khiếu nại → buổi `DISPUTED`, không trừ tiền, đính kèm ≤ 5 ảnh. |
| **US-CLI-03** | Là **Học viên**, tôi muốn xem thời khóa biểu và báo nghỉ học để chủ động lịch. | ✔ Chỉ xem lịch & báo nghỉ, không thấy ví tiền.<br>✔ Đơn nghỉ phải được Phụ huynh duyệt trước khi đến GS.<br>✔ Nghỉ < 4h → cảnh báo tính buổi học. |

#### Nhóm Tutor Portal

| ID | User Story | Acceptance Criteria |
| :--- | :--- | :--- |
| **US-TUT-01** | Là **Gia sư**, tôi muốn điểm danh nhanh sau buổi dạy để nhận lương đúng hạn. | ✔ Chỉ trong 24h sau giờ dạy; quá hạn báo lỗi `ATTENDANCE_LOCKED`.<br>✔ Nhập giờ thực tế + ghi chú; tùy chọn chụp ảnh.<br>✔ Sau khi duyệt, ví lương tăng đúng `tutor_wage_rate`. |
| **US-TUT-02** | Là **Gia sư**, tôi muốn ứng tuyển lớp đúng chuyên môn để tăng khả năng trúng lớp. | ✔ Chỉ ứng tuyển môn/cấp trong `tutor_subjects`.<br>✔ Không được ứng tuyển trùng giờ với lớp đang dạy.<br>✔ Theo dõi trạng thái đơn (PENDING/SHORTLISTED/REJECTED). |
| **US-TUT-03** | Là **Gia sư**, tôi muốn xin nghỉ & đề xuất lịch bù để không ảnh hưởng uy tín. | ✔ Gửi ≥ 24h trước giờ dạy.<br>✔ Nghỉ muộn < 24h → ghi nhận 1 vi phạm.<br>✔ Lịch bù chỉ có hiệu lực khi Phụ huynh duyệt. |

---

## 4. Các Yêu Cầu Phi Chức Năng (Non-functional Requirements)

### 4.1. Hiệu năng hệ thống (Performance)
*   **Thời gian phản hồi (Response Time):** Các API thông thường phải phản hồi dưới **500ms** dưới điều kiện tải bình thường. API tìm kiếm gia sư có phân trang phải phản hồi dưới **1 giây**.
*   **Khả năng chịu tải (Scalability):** Hệ thống đáp ứng tối thiểu **1000 người dùng đồng thời** (Concurrent Users) truy cập Portal vào các khung giờ cao điểm (17h - 21h hàng ngày).

### 4.2. Khả năng hoạt động liên tục (Availability)
*   Hệ thống phải hoạt động liên tục với chỉ số Uptime tối thiểu là **99.9%** (tối đa 8.7 giờ ngừng hoạt động mỗi năm).

### 4.3. Bảo mật (Security)
*   **Bảo mật dữ liệu tài chính:** Mã hóa các thông tin nhạy cảm như số tài khoản ngân hàng của gia sư (AES-256), số dư tài khoản của phụ huynh. Mã PIN chỉ lưu dạng hash (bcrypt).
*   **Phân quyền chặt chẽ:** Kiểm tra quyền (Authorization) ở mức Endpoint API. Vai trò đăng nhập gồm `ADMIN`, `SALES`, `ACADEMIC`, `ACCOUNTANT`, `PARENT`, `TUTOR`. Riêng **`STUDENT` không phải role đăng nhập** — là ngữ cảnh Profile con trong Family Account (Profile Switcher, FR-CLI-01); API kiểm tra qua `profile_type`/`profile_id` trong JWT và chặn truy cập tài chính khi `profile_type = STUDENT`. Việc chuyển đổi giữa các Profile con được thực hiện thông qua endpoint bảo mật `AUTH-07` để cấp lại JWT Token mới có scope profile phù hợp, ngăn chặn việc can thiệp thay đổi Profile Id/Type tùy tiện ở client.
*   **Bảo vệ dữ liệu lớn:** Ngăn chặn các cuộc tấn công Brute Force vào mã PIN phụ huynh bằng cách khóa tạm thời tính năng xác nhận 15 phút nếu nhập sai mã PIN quá 5 lần liên tiếp (BR-SEC-04).
*   **Truy vết (Audit):** Mọi thao tác nhạy cảm (duyệt điểm danh, hoàn tiền, đổi lịch, khóa tài khoản) bắt buộc ghi `audit_logs`.

### 4.4. Khả năng mở rộng (Extensibility)
*   Hệ thống cho phép thêm gói học phí mới, môn học mới, và cấu hình quy tắc (số giờ nghỉ tối thiểu, số buổi tối thiểu) mà không cần thay đổi mã nguồn (Configuration-driven).

### 4.5. Ma trận Thông báo (Notification Matrix)

> Mọi thông báo lưu vào `notifications` (BR-COM-01); thông báo quan trọng thêm kênh SMS/Push (BR-COM-02).

| Sự kiện nghiệp vụ | Người nhận | Kênh | Nội dung tóm tắt |
| :--- | :--- | :--- | :--- |
| Gia sư điểm danh buổi dạy | Phụ huynh | Push + Inbox | "Có buổi học chờ bạn duyệt" (deep link tới màn duyệt) |
| Phụ huynh xác nhận buổi học | Gia sư | Push + Inbox | "Buổi học đã được duyệt. Ví lương +X đồng" |
| Phụ huynh khiếu nại buổi học | Học vụ | Inbox (CRM) + Email | "Alert khẩn: buổi S... bị DISPUTED" |
| Gia sư gửi đơn nghỉ (≥24h) | Phụ huynh | Push + Inbox | "Gia sư xin nghỉ buổi ... - đề xuất lịch bù" |
| Gia sư nghỉ muộn (<24h) | Học vụ | Inbox (CRM) | "GS X nghỉ muộn - ghi nhận vi phạm lần N" |
| Học viên gửi đơn nghỉ | Phụ huynh | Push + Inbox | "Bé ... xin nghỉ buổi ... - chờ duyệt" |
| Phụ huynh duyệt lịch bù | Gia sư | Push + Inbox | "Phụ huynh đã đồng ý lịch dạy bù Y" |
| Gói học còn ≤ 2 buổi | Phụ huynh | Push + SMS | "Gói học còn 2 buổi - nạp thêm để không gián đoạn" |
| Lớp bị tạm dừng vì hết buổi | Phụ huynh | Push + Inbox | "Lớp đã tạm dừng - mua gói mới để tiếp tục" |
| Học vụ ra phán quyết Dispute | Phụ huynh + Gia sư | Push + Inbox | "Kết quả giải quyết khiếu nại buổi S..." |
| Gia sư rút lương / Kế toán duyệt chi | Gia sư | Push + Inbox | "Yêu cầu rút lương đã được xử lý" |
| Đơn ứng tuyển được duyệt/từ chối | Gia sư | Push + Inbox | "Đơn ứng tuyển lớp ... đã {duyệt/từ chối}" |

### 4.6. Ma trận Phân Quyền (Permission Matrix)

| Màn hình / Chức năng | Admin | Sales | Academic | Accountant | Parent | Student | Tutor |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Đăng nhập & Profile Switcher | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Quản lý hồ sơ Gia sư | ✓ | ✓ | ✓ | | | | ✎ tự |
| Duyệt đơn ứng tuyển & giao lớp | ✓ | ✓ | | | | | |
| Quản lý yêu cầu tìm gia sư | ✓ | ✓ | ✓ | | ✎ tạo | | ✎ ứng tuyển |
| Quản lý lớp học & lịch lớp | ✓ | ✓ | ✓ | | Xem | Xem | Xem |
| Xem ví & gói học phí | ✓ | | | ✓ | ✓ | | |
| Xác nhận điểm danh | | | | | ✓ | | ✎ báo |
| Giải quyết khiếu nại | ✓ | | ✓ | | Gửi | | Xem |
| Kết toán / duyệt lương & nạp/hoàn | ✓ | | | ✓ | Yêu cầu | | Yêu cầu |
| Điểm danh buổi dạy | | | | | | | ✓ |
| Xin nghỉ / duyệt lịch bù | | | ✓ | | Duyệt | ✓ gửi | ✓ gửi |
| Báo cáo Dashboard | ✓ | ✓ | ✓ | ✓ | | | |
| Trung tâm thông báo | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

*Ghi chú: ✓ = Toàn quyền; ✎ = Tự quản lý dữ liệu của mình; ô trống = không truy cập.*

### 4.7. Yêu cầu Giao diện Ngoài (External Interface Requirements)

| Giao diện | Yêu cầu |
| :--- | :--- |
| **SMS/OTP Provider** | Gửi OTP < 10 giây; SLA ≥ 99.5%; hỗ trợ SĐT Việt Nam (84). |
| **Cổng thanh toán** | Hỗ trợ chuyển khoản QR + Ví điện tử; cung cấp mã giao dịch (`reference`) để đối soát tự động. |
| **Push Notification (FCM)** | Token thiết bị lưu theo user; gửi thất bại phải retry tối đa 3 lần. |
| **Cloud Storage (S3)** | URL file có chữ ký (signed URL) hết hạn sau 1 giờ; chặn truy cập công khai. |

### 4.8. Lưu trữ & Truy vết dữ liệu (Data Retention & Logging)
*   **Dữ liệu giao dịch tài chính:** Lưu trữ tối thiểu **5 năm** (bắt buộc pháp lý).
*   **Dữ liệu nhạy cảm khi xóa (Soft Delete):** Giữ `deleted_at` + `deleted_by`, không xóa vật lý.
*   **Audit Log:** Không được phép sửa/xóa; lưu trữ tối thiểu 2 năm.
*   **File minh chứng khiếu nại:** Lưu 1 năm, sau đó đưa vào lưu trữ lạnh (Cold Storage).

---

## 5. Ma Trận Truy Vết Yêu Cầu (Requirements Traceability Matrix)

| Yêu cầu | BRD Mục tiêu | Business Rule | Bảng dữ liệu | API | Use Case |
| :--- | :--- | :--- | :--- | :--- | :--- |
| FR-CRM-01 | Giảm đổi GS | BR-MAT-01, BR-PEN-02 | tutors, tutor_subjects | CRM-08, TUT-03 | UC-05 |
| FR-CRM-02 | Time-to-Match < 24h | BR-MAT-01/02/03 | class_applications | CRM-06, CRM-07 | UC-09 |
| FR-CRM-03 | Giảm đổi GS | BR-FIN-04 | classes, packages | CLASS-01 | UC-09 |
| FR-CRM-04 | Thất thoát 0% | BR-FIN-02, BR-SEC-04 | sessions, dispute_evidence | CRM-01, CRM-02 | UC-11 |
| FR-CRM-05 | Thất thoát 0% | BR-FIN-04/05 | packages, transactions | PKG-01, PKG-03, CRM-05 | UC-10 |
| FR-CRM-06 | Năng suất nhân sự | BR-SCH-03 | class_schedules | SCH-01 | UC-09 |
| FR-CRM-07 | Thất thoát 0% | BR-FIN-06 | transactions, tutor_bank_accounts | WAL-03, CRM-04, CRM-05 | UC-10 |
| FR-CRM-08 | Tất cả KPIs | BR-PEN-01 | audit_logs | CRM-03 | - |
| FR-CLI-01 | Trải nghiệm | BR-SEC-04 | parents | AUTH-01, AUTH-05 | UC-03 |
| FR-CLI-02 | Time-to-Match | BR-SEC-02 | tutors | TUT-01 | UC-02 |
| FR-CLI-03 | Thất thoát 0% | BR-FIN-02/03 | sessions | SES-02, SES-03 | UC-03 |
| FR-CLI-04 | Time-to-Match | BR-MAT-03 | tutor_requests | REQ-01, REQ-02 | UC-01 |
| FR-CLI-05 | Thất thoát 0% | BR-FIN-01/04 | packages | PKG-02, PKG-04 | UC-10 |
| FR-CLI-06 | Chăm sóc | BR-SCH-02 | tutor_leaves | LEAVE-02, LEAVE-03 | UC-08 |
| FR-CLI-07 | Chăm sóc | BR-COM-01 | notifications | NOTI-01 | - |
| FR-TUT-01 | Năng suất nhân sự | BR-MAT-02, BR-SCH-03 | tutor_schedules | SCH-02 | UC-05 |
| FR-TUT-02 | Thất thoát 0% | BR-SCH-04 | sessions | SES-01 | UC-07 |
| FR-TUT-03 | Chăm sóc | BR-SCH-02 | tutor_leaves | LEAVE-01, LEAVE-05 | UC-08 |
| FR-TUT-04 | Time-to-Match | BR-MAT-01/02 | class_applications | APPL-01, APPL-02 | UC-06 |
| FR-TUT-05 | Thất thoát 0% | BR-FIN-06 | transactions | WAL-01, WAL-02, WAL-03 | UC-10 |
| FR-TUT-06 | Chăm sóc | BR-COM-01 | notifications | NOTI-01 | - |
