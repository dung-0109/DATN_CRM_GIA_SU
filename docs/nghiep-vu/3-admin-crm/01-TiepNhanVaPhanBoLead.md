# Usecase: UC-ADM-01 - Tiếp nhận Lead Yêu cầu & Tự động Đẩy Lớp lên Sàn (Zero-Touch Lead Ingestion & Auto-Publishing)

> **Mã phân hệ:** CRM-REF-01  
> **Phân hệ:** Cổng Quản trị Trung tâm (Admin CRM)  
> **Tác nhân chính:** Phụ huynh (Parent), Hệ thống Tự động (Automation Gateway), Quản trị viên (Admin), Chuyên viên Tư vấn (Sales Staff)

---

## 1. Giới thiệu chức năng

### 1.1. Mục đích
Cung cấp giải pháp tiếp nhận lead tự động toàn diện theo mô hình **Zero-Touch Ingestion (Sàn Tự động hóa 100%)**. Ngay khi phụ huynh gửi biểu mẫu đăng ký tìm gia sư từ Client Portal, hệ thống thực hiện kiểm duyệt tự động (Auto-Validation), chuẩn hóa dữ liệu địa lý, sinh mã định danh và niêm yết công khai lên Sàn lớp gia sư trong thời gian thực ($\le 1.0$ giây). Quy trình này triệt tiêu hoàn toàn sự chậm trễ của các cuộc gọi tư vấn truyền thống (Telesales delay), chống thất thoát dữ liệu, đồng thời kích hoạt thuật toán Smart Matching quét Top 5 gia sư tương thích cao nhất.

### 1.2. Actor (Tác nhân)
* **Khách hàng / Phụ huynh (Parent)**: Điền form đăng ký nhu cầu tìm gia sư trên Web Portal.
* **Hệ thống Tự động (Automation Gateway / System Worker)**: Kiểm tra tính hợp lệ dữ liệu, quét từ khóa vi phạm (Blacklist filter), cấp mã lớp, đẩy tin lên sàn, kích hoạt thuật toán ghép lớp.
* **Chuyên viên Tư vấn (Sales Staff)**: Theo dõi danh sách lead, can thiệp thủ công đối với các yêu cầu bị tạm giữ (Flagged) hoặc yêu cầu đặc thù.
* **Quản trị viên (Admin)**: Toàn quyền cấu hình bộ lọc từ khóa, sàn giá tối thiểu, quy định chính sách bảo mật thông tin liên hệ.

### 1.3. Điều kiện tiên quyết
* Phụ huynh đã có tài khoản trên hệ thống hoặc được định danh qua Số điện thoại hợp lệ (chuẩn E.164 / 10 chữ số).
* Dữ liệu môn học, khối lớp, quận huyện nằm trong danh mục hệ thống cho phép.
* Nhân viên quản trị/tư vấn đã đăng nhập với vai trò `ADMIN` hoặc `SALES`.

### 1.4. Danh mục các chức năng con (Sub-features)
1. **UC-ADM-01-01**: Tiếp nhận & Kiểm duyệt Tự động Lead Đầu vào (Automated Lead Validation).
2. **UC-ADM-01-02**: Chuẩn hóa & Công khai Lớp học lên Sàn Lớp (Instant Sàn Lớp Publishing).
3. **UC-ADM-01-03**: Kích hoạt Động cơ Gợi ý & Phát Thông báo Mời Nhận Lớp (Smart Matching Notification Trigger).
4. **UC-ADM-01-04**: Xử lý Ngoại lệ Lead Bị Giữ & Phân bổ Tư vấn viên Can thiệp (Flagged Lead Resolution).

---

## 2. Dữ liệu nghiệp vụ đầu vào (Input Data & Parameters)

### 2.1. Dữ liệu Lead Yêu Cầu Tìm Gia Sư (`TutorRequest` Form Data)

| Trường thông tin | Kiểu dữ liệu | Bắt buộc | Ràng buộc kỹ thuật & Nghiệp vụ |
| :--- | :--- | :---: | :--- |
| `studentId` | UUID | Có | Khóa ngoại tham chiếu đến bảng `students`. Phải thuộc quyền sở hữu của `parentId`. |
| `subject` | String (VarChar 100) | Có | Tên môn học (Toán, Vật lý, Hóa học, Tiếng Anh...). |
| `grade` | String (VarChar 20) | Có | Khối lớp từ "Lớp 1" đến "Lớp 12", "Đại học", "Luyện thi". |
| `sessionsPerWeek` | Integer | Có | Số buổi học trong tuần ($1 \le n \le 7$). |
| `budgetPerSession` | Decimal(10,2) | Có | Mức học phí phụ huynh chi trả cho 1 buổi học ($\ge 150,000$ VNĐ). |
| `tutorGenderPref` | String (VarChar 10)| Có | Giá trị: `MALE` (Nam), `FEMALE` (Nữ), `ANY` (Không yêu cầu). |
| `learningMode` | String (VarChar 20)| Không | Mặc định `OFFLINE`. Giá trị: `OFFLINE` (Tại nhà), `ONLINE` (Trực tuyến). |
| `address` | String (VarChar 255)| Có | Địa chỉ chi tiết nơi học (Số nhà, tòa nhà, ngõ/đường, phường, quận). |
| `tutorTypePref` | String (VarChar 20)| Không | Mặc định `ANY`. Giá trị: `TEACHER` (Giáo viên), `STUDENT` (Sinh viên), `ANY`. |
| `scheduleNotes` | Text | Có | Mô tả thời gian rảnh của học sinh (VD: "Tối Thứ 2, 4, 6 từ 19h00 - 21h00"). |
| `requirements` | Text | Không | Yêu cầu học lực, tính cách học sinh, chứng chỉ gia sư cần có. |

### 2.2. Vòng đời Trạng thái Lead Yêu Cầu (`RequestStatus`)

| Trạng thái | Diễn giải nghiệp vụ | Thao tác kế tiếp |
| :--- | :--- | :--- |
| `NEW` | Yêu cầu mới ghi nhận, đang đợi hệ thống xử lý hoặc tạm giữ kiểm tra do dính blacklist. | Quét Auto-Validation hoặc Sales duyệt thủ công. |
| `CONSULTING` | Lead có yêu cầu phức tạp, đang được chuyên viên tư vấn gọi điện hỗ trợ phụ huynh. | Sales điều chỉnh thông tin và bấm duyệt lên sàn. |
| `PUBLISHED` | Tin đã được duyệt hợp lệ và niêm yết công khai trên Bảng tin Sàn lớp gia sư. | Gia sư nộp cọc hoặc Sales bấm chỉ định ghép lớp. |
| `MATCHED` | Đã có gia sư đóng cọc 500k hoặc được chốt nhận lớp; yêu cầu được đóng lại. | Hệ thống sinh bản ghi lớp học `Class` ở trạng thái `DEPOSIT`/`TRIAL`. |
| `CANCELLED` | Yêu cầu bị hủy do phụ huynh rút lại, dính spam, hoặc không tìm được gia sư quá hạn. | Lưu lý do hủy, ẩn khỏi sàn lớp. |

---

## 3. Quy tắc nghiệp vụ (Business Rules)

| Mã BR | Tình huống kích hoạt | Xử lý của hệ thống | Mã lỗi / Phản hồi |
| :--- | :--- | :--- | :--- |
| **BR-ADM-01-01** | Học phí thấp hơn khung giá sàn trung tâm quy định. | Nếu `budgetPerSession` < 150,000 VNĐ đối với Sinh viên hoặc < 250,000 VNĐ đối với Giáo viên: Không cho phép tự động lên sàn; chuyển `RequestStatus` thành `NEW` kèm gắn cờ `SUSPICIOUS_PRICE` để Sales gọi điện tư vấn điều chỉnh. | `400 BAD_REQUEST` ("Mức học phí đề xuất thấp hơn mức giá sàn tối thiểu của trung tâm") |
| **BR-ADM-01-02** | Nội dung ghi chú chứa từ khóa vi phạm (Keyword Blacklist). | Kiểm tra `scheduleNotes` và `requirements` với từ điển cấm (quảng cáo, vay tiền, cá độ, từ ngữ phản cảm, lôi kéo giao dịch chui). Nếu phát hiện: Đổi trạng thái sang `NEW`, khóa tự động lên sàn, gửi thông báo cảnh báo đến kênh kiểm duyệt của Admin. | `422 UNPROCESSABLE_ENTITY` ("Nội dung chứa từ khóa nhạy cảm, hồ sơ được chuyển sang kiểm duyệt thủ công") |
| **BR-ADM-01-03** | Bảo mật thông tin riêng tư phụ huynh trên Sàn lớp công khai. | Dữ liệu public trên Sàn lớp chỉ bao gồm: Mã lớp, Môn học, Khối lớp, Lịch học, Học phí/buổi, Tên tòa chung cư/Đường/Phường/Quận. Tuyệt đối ẩn `phone`, `fullName` phụ huynh và số phòng căn hộ. Chỉ giải mã mở khóa khi có Gia sư đặt cọc 500k thành công. | `BR_DATA_MASKING` |
| **BR-ADM-01-04** | Tự động sinh mã định danh lớp học duy nhất (Human-readable Code). | Hệ thống tự động tạo mã lớp theo format chuẩn hóa: `SAM` + `Random 3-4 chữ số/ký tự in hoa` (Ví dụ: `SAM207`, `SAM891`). Mã này gắn liền xuyên suốt từ khâu đăng tin, đặt cọc đến hợp đồng lớp học. | `UNIQUE_CONSTRAINT` trên mã tham chiếu |
| **BR-ADM-01-05** | Tự động kích hoạt thuật toán Smart Matching. | Khi trạng thái chuyển sang `PUBLISHED`, hệ thống gọi ngầm Service `matchingService.suggestTutors(requestId)` để xếp hạng Top 5 Gia sư có `matchScore` cao nhất và gửi Notification chuông Web mời ứng tuyển. | `ASYNC_EVENT_TRIGGERED` |

---

## 4. Đặc tả chi tiết các Use Case chức năng con

```mermaid
usecaseDiagram
    actor "Phụ huynh" as Parent
    actor "Hệ thống Tự động" as System
    actor "Chuyên viên Sales" as Sales
    actor "Quản trị viên" as Admin

    package "UC-ADM-01: Tiếp nhận Lead & Tự động Đẩy Lớp" {
        usecase "UC-ADM-01-01: Kiểm duyệt Lead Tự động" as UC1
        usecase "UC-ADM-01-02: Đăng Tin Công khai Lên Sàn Lớp" as UC2
        usecase "UC-ADM-01-03: Kích hoạt Gợi ý & Bắn Thông báo Matching" as UC3
        usecase "UC-ADM-01-04: Xử lý Ngoại lệ Lead Bị Giữ" as UC4
    }

    Parent --> UC1
    System --> UC1
    UC1 ..> UC2 : <<include>> Dữ liệu hợp lệ 100%
    UC2 ..> UC3 : <<include>> Kích hoạt ngầm
    UC1 ..> UC4 : <<extend>> Vi phạm giá sàn / Blacklist
    Sales --> UC4
    Admin --> UC4
```

### 4.1. UC-ADM-01-01: Kiểm duyệt Lead Tự động (Automated Lead Validation)
* **Mục tiêu**: Đảm bảo dữ liệu yêu cầu tìm gia sư gửi lên đáp ứng đầy đủ tiêu chuẩn trước khi đưa ra thị trường sàn lớp.
* **Tác nhân**: Phụ huynh (Parent), Hệ thống Tự động (System).
* **Tiền điều kiện**: Phụ huynh đã gửi form tạo yêu cầu tại API `POST /api/v1/tutor-requests`.
* **Hậu điều kiện**: Lead được gắn trạng thái `PUBLISHED` (hợp lệ) hoặc `NEW` (cần kiểm tra).
* **Luồng cơ bản**:
  1. Phụ huynh nhập form yêu cầu tìm gia sư và bấm Xác nhận.
  2. Hệ thống kiểm tra xác thực JWT Token, truy vấn hồ sơ học sinh (`Student`) đảm bảo thuộc quyền quản lý của phụ huynh.
  3. Hệ thống quét kiểm tra mức giá `budgetPerSession` đối chiếu bảng giá sàn trung tâm (BR-ADM-01-01).
  4. Hệ thống chạy thuật toán Regex quét chuỗi văn bản `requirements` và `scheduleNotes` qua danh sách từ khóa cấm (BR-ADM-01-02).
  5. Nếu tất cả điều kiện thỏa mãn: Hệ thống gán trạng thái `PUBLISHED` và chuyển sang Use Case UC-ADM-01-02.
* **Luồng ngoại lệ**:
  * *Học phí dưới mức sàn*: Hệ thống lưu bản ghi với trạng thái `NEW`, ghi nhận log `PRICE_UNDER_THRESHOLD`, gửi thông báo đến chuyên viên Sales để phụ trách gọi điện tư vấn.
  * *Phát hiện từ khóa nhạy cảm/quảng cáo*: Hệ thống gắn cờ `SPAM_SUSPECTED`, tạm dừng hiển thị công khai, thông báo qua kênh cảnh báo quản trị.
* **Dữ liệu đầu ra**: Bản ghi `TutorRequest` hợp lệ trong cơ sở dữ liệu.
* **Ghi chú & Audit**: Ghi nhận bản ghi `AuditLog` với `action: 'LEAD_INGESTION_AUTO_VALIDATED'`.

### 4.2. UC-ADM-01-02: Đăng Tin Công khai Lên Sàn Lớp (Instant Sàn Lớp Publishing)
* **Mục tiêu**: Niêm yết lớp học lên bảng tin tìm lớp của Gia sư trong vòng dưới 1 giây, bảo mật thông tin cá nhân của phụ huynh.
* **Tác nhân**: Hệ thống Tự động (System).
* **Tiền điều kiện**: Yêu cầu đã chuyển sang trạng thái `PUBLISHED`.
* **Hậu điều kiện**: Lớp học xuất hiện ngay trên Bảng tin Sàn lớp gia sư (Public Sàn Lớp).
* **Luồng cơ bản**:
  1. Hệ thống khởi tạo mã lớp định danh (Ví dụ: `SAM207`).
  2. Hệ thống thực hiện ẩn thông tin định danh (Data Masking): Tách địa chỉ hiển thị chỉ gồm Quận/Huyện và Phường/Đường (bỏ số nhà/số phòng).
  3. Hệ thống kích hoạt hiển thị tin trên API `GET /api/v1/matching/requests` với trạng thái `PUBLISHED`.
  4. Phản hồi xác nhận thành công về giao diện phụ huynh kèm mã lớp để phụ huynh theo dõi tiến trình.
* **Dữ liệu đầu ra**: Tin lớp học công khai có cấu trúc chuẩn trên Sàn lớp.

### 4.3. UC-ADM-01-03: Kích hoạt Gợi ý & Phát Thông báo Mời Nhận Lớp (Smart Matching Notification Trigger)
* **Mục tiêu**: Đẩy nhanh tốc độ nhận lớp bằng cách tự động chủ động mời các gia sư có điểm tương thích cao nhất vào nhận lớp.
* **Tác nhân**: Hệ thống Tự động (System), Gia sư (Tutor).
* **Tiền điều kiện**: Tin lớp học đã được công khai trên Sàn.
* **Hậu điều kiện**: Top 5 gia sư nhận được thông báo chuông trên Web Portal.
* **Luồng cơ bản**:
  1. Hệ thống chạy nền worker gọi `matchingService.suggestTutors(requestId)`.
  2. Đánh giá hồ sơ các gia sư thỏa mãn tiêu chí: cùng địa bàn quận huyện, đúng môn học/khối lớp đã xác minh, lịch rảnh trùng khớp, điểm uy tín Karma $\ge 80$.
  3. Lấy danh sách Top 5 ứng viên có điểm tương thích cao nhất.
  4. Tạo bản ghi `Notification` loại `SYSTEM` / `CLASS_UPDATE` gửi trực tiếp tới tài khoản 5 gia sư này với nội dung: *"Lớp mới phù hợp 95%: [Mã lớp] - [Môn học] [Lớp] tại [Quận]. Bấm vào để nộp cọc nhận lớp ngay!"*.
* **Dữ liệu đầu ra**: 5 thông báo real-time được gửi đi.

### 4.4. UC-ADM-01-04: Xử lý Ngoại lệ Lead Bị Giữ & Phân bổ Tư vấn viên Can thiệp (Flagged Lead Resolution)
* **Mục tiêu**: Đảm bảo 100% các lead không đủ điều kiện tự động vẫn được nhân viên tiếp nhận chăm sóc, không bị bỏ quên.
* **Tác nhân**: Chuyên viên Sales, Quản trị viên (Admin).
* **Tiền điều kiện**: Bản ghi `TutorRequest` ở trạng thái `NEW` hoặc `CONSULTING`.
* **Hậu điều kiện**: Lead được điều chỉnh dữ liệu và phát hành lên sàn (`PUBLISHED`) hoặc hủy bỏ (`CANCELLED`).
* **Luồng cơ bản**:
  1. Chuyên viên Sales đăng nhập vào phân hệ Điều phối/Matching (`/admin-crm/matching`).
  2. Bật bộ lọc trạng thái `NEW` để quét các yêu cầu bị hệ thống giữ lại.
  3. Bấm mở chi tiết yêu cầu, xem lý do cảnh báo (Học phí thấp, địa chỉ thiếu, nội dung đặc thù).
  4. Chuyên viên Sales gọi điện cho phụ huynh qua số điện thoại trên hồ sơ, hỗ trợ điều chỉnh mức giá hoặc làm rõ lịch học.
  5. Sales cập nhật lại thông tin trên form quản trị và bấm "Duyệt Đăng Tin".
  6. Hệ thống chuyển trạng thái sang `PUBLISHED` và kích hoạt luồng đăng sàn tự động.
* **Luồng ngoại lệ**: Nếu phụ huynh không nghe máy sau 3 lần gọi hoặc đổi ý hủy nhu cầu, Sales bấm "Hủy yêu cầu" kèm lý do (`cancelReason`).
* **Dữ liệu đầu ra**: Trạng thái lead cập nhật thành `PUBLISHED` hoặc `CANCELLED`.

---

## 5. Sơ đồ tuần tự nghiệp vụ (Sequence Diagrams)

```mermaid
sequenceDiagram
    autonumber
    actor Parent as Phụ huynh (Client Portal)
    participant API as TutorRequest API
    participant Engine as Auto-Validation Engine
    participant DB as PostgreSQL Database
    participant Matching as Smart Matching Worker
    actor Tutor as Gia sư mục tiêu

    Parent->>API: POST /api/v1/tutor-requests (Dữ liệu môn, lớp, giá, lịch, địa chỉ)
    activate API
    API->>Engine: Thực hiện kiểm tra nghiệp vụ tự động
    activate Engine
    
    Engine->>Engine: Kiểm tra giá sàn (budgetPerSession >= 150k)
    Engine->>Engine: Quét Regex Blacklist từ khóa nhạy cảm
    
    alt Dữ liệu Hợp Lệ 100%
        Engine-->>API: Phê duyệt: VALID_AUTO_APPROVED
        API->>DB: INSERT TutorRequest (status: 'PUBLISHED', referenceCode: 'SAM207')
        API->>DB: INSERT AuditLog (action: 'AUTO_PUBLISHED')
        API-->>Parent: 201 Created (Mã lớp: SAM207, Trạng thái: Đã lên sàn)
        
        API->)Matching: Kích hoạt Worker quét Top 5 Gia sư
        activate Matching
        Matching->>DB: SELECT Tutors WHERE status='ACTIVE' AND Karma >= 80...
        Matching->>Matching: Tính điểm Match Score đa trọng số
        Matching->>DB: INSERT 5 Notifications (deepLink: '/tutor-portal/san-lop/SAM207')
        Matching-->>Tutor: Chuông thông báo Web mời nhận lớp
        deactivate Matching
    else Dữ liệu Không Hợp Lệ (Giá thấp / Dính từ khóa cấm)
        Engine-->>API: Cảnh báo: FLAGGED_FOR_REVIEW
        API->>DB: INSERT TutorRequest (status: 'NEW', flag: 'LOW_BUDGET')
        API-->>Parent: 201 Created (Ghi nhận yêu cầu, Chuyên viên sẽ hỗ trợ trong 30p)
    end
    deactivate Engine
    deactivate API
```

---

## 6. Kịch bản kiểm thử & Nghiệm thu (Test Scenarios)

### Kịch bản 1: Phụ huynh đăng tin hợp lệ - Đẩy lên sàn tự động dưới 1 giây
* **Given**: Phụ huynh đã đăng nhập tài khoản hợp lệ, có học sinh `Bé Khôi (Lớp 10)`. Mức học phí đề xuất là `250,000 VNĐ/buổi`, nội dung yêu cầu chuẩn mực không có từ khóa spam.
* **When**: Phụ huynh bấm "Đăng Yêu Cầu Tìm Gia Sư" gửi `POST /api/v1/tutor-requests`.
* **Then**: 
  * Hệ thống phản hồi mã HTTP `201 Created` trong thời gian $\le 1.0$ giây.
  * Bản ghi `TutorRequest` có `status = 'PUBLISHED'`, sinh mã lớp `SAMxxx`.
  * Trên Sàn lớp gia sư xuất hiện ngay thẻ lớp mới; thông tin số điện thoại của phụ huynh bị ẩn bảo mật.
  * 5 gia sư thỏa mãn tiêu chí môn Toán lớp 10 nhận được thông báo chuông mời nhận lớp.

### Kịch bản 2: Phụ huynh nhập học phí dưới sàn tối thiểu
* **Given**: Phụ huynh tạo yêu cầu dạy kèm môn Tiếng Anh Lớp 12 nhưng nhập mức giá `100,000 VNĐ/buổi` (thấp hơn sàn quy định 150,000 VNĐ).
* **When**: Gửi yêu cầu lên hệ thống.
* **Then**:
  * Hệ thống chặn không cho tự động lên sàn `PUBLISHED`.
  * Bản ghi lưu ở trạng thái `NEW` kèm mã cảnh báo `PRICE_UNDER_THRESHOLD`.
  * Xuất hiện thông báo trên danh sách Lead chờ xử lý của chuyên viên Sales trên CRM.
  * Trên Sàn lớp của Gia sư không hiển thị lớp học này.

### Kịch bản 3: Nội dung yêu cầu dính từ khóa Spam / Quảng cáo
* **Given**: Người dùng nhập nội dung yêu cầu chứa chuỗi "cho vay tiền nhanh không thế chấp lãi suất thấp".
* **When**: Gửi yêu cầu lên hệ thống.
* **Then**:
  * Bộ lọc Auto-Validation kích hoạt luật `BR-ADM-01-02`.
  * Yêu cầu bị chuyển ngay vào hộp thư tạm giữ kiểm duyệt của Admin.
  * Ghi nhật ký cảnh báo bảo mật hệ thống `SECURITY_SPAM_DETECTED`.
