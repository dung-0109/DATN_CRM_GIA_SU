# BÁO CÁO TÓM TẮT THÔNG QUA ĐỀ TÀI ĐỒ ÁN TỐT NGHIỆP

**Tên đề tài:** Xây dựng Hệ thống Web CRM Quản lý và Kết nối Trung tâm Gia sư Trực tuyến
**Nền tảng:** Web Application (Web Browser-First & Responsive Web / PWA)
**Mô hình cốt lõi:** Sàn Kết nối Tự động hóa (Automated Marketplace) kết hợp Quản trị Khách hàng & Đối soát Cọc Minh bạch (Pure CRM).

---

## 1. Tính Cấp Thiết & Lý Do Chọn Đề Tài

### 1.1 Thực trạng và "Nỗi đau" của thị trường
Nhu cầu tìm kiếm gia sư 1-1 tại nhà luôn rất cao, tuy nhiên thị trường đang vận hành phân tán và tồn tại nhiều vấn đề:
*   **Với Phụ huynh:** E ngại "gia sư ảo", bị ép nạp tiền mua gói trước (Drop-off rate lên tới 60-70%), khó đổi gia sư khi dạy không hiệu quả, thiếu công cụ theo dõi tiến độ của con.
*   **Với Gia sư (Sinh viên/Giáo viên):** Ám ảnh nạn "trung tâm ma" lừa tiền cọc nhận lớp. Bị phụ huynh "bùng kèo" không đòi lại được cọc.
*   **Với Trung tâm môi giới:** Quản lý thủ công bằng sổ sách/Excel dễ sai sót. Tốn chi phí vận hành đội ngũ telesales, không đối soát được số buổi học thực tế hàng tháng.

### 1.2 Bất cập của giải pháp hiện tại
*   **Nhóm Facebook/Zalo:** Ẩn danh, không xác thực (KYC), tiềm ẩn rủi ro lừa đảo cao.
*   **App / Hệ thống cũ:** Bắt ép tải Native App dung lượng lớn, ép nạp ví điện tử trả trước hàng triệu đồng trái với thói quen trả tiền sau của người Việt. Cơ chế cào bằng giữa sinh viên và giáo viên chuyên nghiệp.

---

## 2. Mục Tiêu & Giải Pháp Đột Phá

Để giải quyết triệt để bài toán niềm tin và tối ưu vận hành, hệ thống đề xuất các giải pháp đột phá sau:

### 2.1 Đột phá về Mô hình Kinh doanh
*   **Phụ huynh (Khách hàng):** Miễn phí 100% đăng tuyển, không ép nạp ví trước. Được trải nghiệm dạy thử (Giáo viên 1 buổi, Sinh viên 2 buổi). Cam kết bảo hành đổi gia sư miễn phí trong 30 ngày (SLA 24h). Thanh toán học phí trực tiếp cho gia sư vào cuối tháng.
*   **Gia sư (Đối tác):** Nộp cọc cam kết (500k qua VietQR) để nhận lớp, có trọng tài đối soát minh bạch: Cam kết hoàn trả 100% tiền cọc trong 24 giờ nếu lỗi do phía phụ huynh. Quản lý chất lượng qua Hệ thống điểm tín nhiệm Karma.
*   **Trung tâm (Vận hành):** Vai trò là nền tảng quản trị thông minh (Pure CRM), tự động hóa luồng ghép lớp, làm trọng tài bảo vệ quyền lợi hai bên.

### 2.2 Đột phá về Công nghệ & Trải nghiệm
*   **100% Trình duyệt (Web Browser-First):** Tiếp cận tức thì (Zero-Install) trên mọi thiết bị.
*   **Tự động hóa 100% (Zero-Touch Ingestion):** Tự động duyệt và đăng tin yêu cầu lên sàn lớp trong 1 giây.
*   **Smart Matching Engine:** Tự động quét và bắn chuông thông báo Web tới Top 5 gia sư phù hợp nhất, loại bỏ hoàn toàn telesales.
*   **Thanh toán VietQR động:** Lắng nghe Webhook tự động mở khóa lớp tức thì khi nộp cọc.

---

## 3. Tổng Quan Kiến Trúc & Nghiệp Vụ Cốt Lõi

Hệ thống được chia làm 3 phân hệ Cổng Web (Web Portal) độc lập nhưng liên kết chặt chẽ qua API và WebSocket thời gian thực:

### 3.1 Cổng Khách Hàng (Client Web Portal)
*   Đăng yêu cầu tìm gia sư nhanh chóng.
*   Quản lý hồ sơ nhiều học sinh.
*   Thực hiện đánh giá sau quá trình dạy thử (Chốt nhận / Từ chối / Hủy / Giảm buổi).
*   Theo dõi nhật ký học tập và yêu cầu đổi gia sư trong thời gian bảo hành.

### 3.2 Cổng Đối Tác Gia Sư (Tutor Web Portal)
*   Thực hiện KYC (Xác thực CCCD, thẻ sinh viên/bằng cấp).
*   Lướt Sàn lớp và Nộp cọc VietQR nhận lớp trực tiếp.
*   Theo dõi biến động Điểm tín nhiệm Karma.
*   Cập nhật nhật ký giảng dạy, báo nghỉ đúng chuẩn 24h và đối soát thu nhập.

### 3.3 Cổng Quản Trị Trung Tâm (Admin CRM Back-office)
*   Quản lý phễu bán hàng bằng bảng Kanban 4 trạng thái (`OPEN` $\rightarrow$ `TRIAL` $\rightarrow$ `TEACHING` $\rightarrow$ `CLOSED`).
*   Khách hàng 360 độ: Quản lý toàn diện lịch sử và ticket hỗ trợ của từng gia đình.
*   Màn hình Kế toán độc quyền: Xử lý 4 lệnh tài chính đối soát cọc (Duyệt phí, Hoàn 100%, Hoàn 50%, Tịch thu) có lưu vết kiểm toán (Audit Logs) bất biến.

---

## 4. Luồng Nghiệp Vụ Xuyên Suốt (Cross-Portal Workflow)

1.  **Đăng tin & Lên sàn:** Phụ huynh đăng yêu cầu tìm GS (Miễn phí) $\rightarrow$ Hệ thống tự động đẩy lên Sàn Lớp $\rightarrow$ Smart Matching gợi ý cho Top 5 GS phù hợp.
2.  **Đặt cọc & Dạy thử:** GS quét VietQR nộp cọc 500k $\rightarrow$ Nhận thông tin liên hệ PH $\rightarrow$ Tiến hành dạy thử (1 buổi GV, 2 buổi SV) $\rightarrow$ Cập nhật nhật ký lên web.
3.  **Phán quyết & Quyết toán:**
    *   *PH Chốt lớp:* Tiền cọc thành Phí môi giới, GS nhận lương trực tiếp từ PH hàng tháng.
    *   *Hủy do lỗi PH:* Hoàn trả 100% cọc cho GS trong 24h.
    *   *Hủy do lỗi GS:* Tịch thu cọc, trừ điểm Karma, kích hoạt đổi GS mới cho PH.

---

## 5. Ý Nghĩa Khoa Học & Thực Tiễn

*   **Về Kỹ thuật:** Áp dụng kiến trúc liên cổng (Cross-Portal), thuật toán Matching Engine, Audit Trail bất biến và Webhook thanh toán tự động, RBAC chặt chẽ.
*   **Về Thực tiễn:** Tạo ra một môi trường kết nối gia sư văn minh, minh bạch, bảo vệ tài chính cho sinh viên và đảm bảo chất lượng học tập cho học sinh. Mô hình có tính khả thi thương mại cao, sẵn sàng triển khai thực tế.

---

## 6. Kiến Trúc Công Nghệ & Tài Nguyên Đề Xuất

Để đáp ứng được yêu cầu về thời gian thực (Real-time), tự động hóa và xử lý giao dịch an toàn, hệ thống được thiết kế với Tech Stack hiện đại:

### 6.1 Kiến trúc Frontend (Client, Tutor, Admin Portals)
*   **Framework:** **Next.js** (Tối ưu SEO và hiệu suất tải trang cho nền tảng Web).
*   **UI/UX:** **Vanilla CSS / CSS Modules** kết hợp giao diện Glassmorphism hiện đại. Trang Admin sử dụng **Ant Design / MUI** để quản lý Kanban.
*   **State Management:** Redux Toolkit / Zustand.

### 6.2 Kiến trúc Backend & Logic
*   **Ngôn ngữ / Framework:** **Node.js (NestJS)** - Cung cấp kiến trúc Micro-services và chuẩn doanh nghiệp.
*   **Giao tiếp Real-time:** **Socket.IO / WebSockets** (Dành cho chức năng bắn thông báo tìm lớp tức thì và cập nhật trạng thái nộp cọc).
*   **Background Jobs:** **BullMQ** (Xử lý hàng đợi cho thuật toán Smart Matching và đếm ngược thời gian).

### 6.3 Cơ Sở Dữ Liệu & Lưu Trữ
*   **Database Chính:** **PostgreSQL** (Đảm bảo tính toàn vẹn dữ liệu cho giao dịch tài chính, lưu vết Audit Logs và quan hệ phức tạp giữa Phụ huynh - Học sinh - Gia sư).
*   **Database Cache:** **Redis** (Tăng tốc độ truy vấn, lưu trữ phiên WebSocket và OTP).
*   **Lưu trữ File:** **AWS S3 / Cloudinary** (Lưu trữ bằng cấp, CCCD, ảnh bài tập).

### 6.4 API & Tích hợp Dịch vụ (Third-Party)
*   **Thanh toán VietQR:** Tích hợp API của **PayOS / Casso / SePay** để sinh mã QR động và lắng nghe Webhook gạch nợ tự động.
*   **Đăng nhập & Xác thực:** Firebase Authentication (Google Login, SMS OTP).
