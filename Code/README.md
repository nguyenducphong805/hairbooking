# BARBERBOOK – HỆ THỐNG ĐẶT LỊCH CẮT TÓC

**Môn học:** Kỹ thuật phần mềm  
**Nhóm:** Nguyễn Đức Phong – Lê Trung Nghĩa  
**Công nghệ:** HTML5, CSS3, JavaScript ES Modules  
**Phạm vi thực hiện:** Frontend, dữ liệu lưu tại trình duyệt.

## 1. Khởi chạy

**Cách 1 – VS Code:**
1. Mở thư mục `Code/src` bằng VS Code.
2. Cài tiện ích **Live Server**.
3. Nhấp chuột phải `index.html`, chọn **Open with Live Server**.

**Cách 2 – Python:**

```bash
cd Code/src
python -m http.server 5500
```

Truy cập `http://localhost:5500/` bằng Chrome hoặc Edge.

**Quan trọng:** Không mở `index.html` theo địa chỉ `file://` vì ES Modules cần môi trường HTTP và Web Crypto có thể bị giới hạn.

## 2. Tài khoản nhân viên

| Nhân viên | Email đăng nhập | Mật khẩu khởi tạo |
| --- | --- | --- |
| Nguyễn Đức Phong | `nguyenducphong@gmail.com` | `Barber@2026` |
| Lê Trung Nghĩa | `letrungnghia@gmail.com` | `Barber@2026` |

Hai tài khoản được khởi tạo vào lần truy cập đầu khi trình duyệt chưa lưu dữ liệu tài khoản. Nếu đã đổi mật khẩu, dùng mật khẩu mới; dữ liệu tài khoản cũ được giữ lại. Email là định danh đăng nhập, không có hệ thống gửi thư Gmail.

## 3. Các vai trò

- **Khách:** Xem danh sách dịch vụ và thợ, chuyển đến màn hình đăng ký/đăng nhập.
- **Khách hàng:** Đăng ký, đăng nhập, xem danh mục, đặt lịch, xem/hủy lịch của mình, sửa hồ sơ và đổi mật khẩu.
- **Nhân viên:** Đăng nhập, xem/tìm/lọc lịch, cập nhật trạng thái, sửa số điện thoại và đổi mật khẩu. Họ tên và email nhân viên chỉ đọc.

## 4. Cấu trúc mã nguồn đã tách module

```text
Code/
├── README.md
└── src/
    ├── index.html        # 5 màn hình: vai trò, xác thực, cửa hàng, nhân viên, tài khoản
    ├── style.css         # Giao diện và responsive
    ├── main.js           # Tập trung gắn sự kiện và khởi tạo ứng dụng (entry point)
    ├── data.js           # Dữ liệu dịch vụ, thợ, tài khoản nhân viên, trạng thái, lưu trữ
    ├── auth.js           # Chọn vai trò, đăng ký, đăng nhập, đăng xuất, phiên
    ├── navigation.js     # Điều hướng và hiện/ẩn màn hình theo vai trò
    ├── catalog.js        # Hiển thị và lựa chọn dịch vụ/thợ
    ├── bookings.js       # Khung giờ, kiểm tra chồng lấn, đặt/xem/hủy lịch
    ├── staff.js          # Thống kê, tìm/lọc lịch, cập nhật trạng thái
    └── account.js        # Cập nhật thông tin tài khoản và đổi mật khẩu
```

**Vì sao tách như vậy?** `data.js` giữ mô hình dữ liệu và hàm dùng chung; module nghiệp vụ chỉ quản lý một nhóm chức năng; `main.js` nối các sự kiện giao diện với các hàm nghiệp vụ. Tất cả sử dụng cú pháp `import` / `export`, không cần thư viện JavaScript ngoài.

## 5. Quy tắc kiểm tra lịch hẹn

- Thời hạn đặt: từ ngày hiện tại đến 30 ngày tiếp theo.
- Giờ mở cửa: **09:00–18:00**, giờ bắt đầu cách nhau 30 phút.
- Thời lượng tùy dịch vụ (20, 30, 45 hoặc 90 phút).
- Giờ kết thúc của dịch vụ không được vượt quá 18:00.
- Lịch mới và lịch đã có cùng **ngày, thợ** bị coi là xung đột nếu lịch cũ chưa hủy và `start < otherEnd && end > otherStart`.
- Khoảng thời gian chỉ tiếp giáp tại một mốc (ví dụ kết thúc 09:30, lịch tiếp theo bắt đầu 09:30) **không** bị coi là trùng.
- Ứng dụng dùng cùng hàm `hasBarberConflict()` trong `validSlot()` khi hiển thị giờ trống và khi xác nhận đặt lịch.
- Lịch đã hủy không chiếm giờ trống.

## 6. Đối chiếu SRS ↔ Code

| Chức năng | Use Case | Module/hàm |
| --- | --- | --- |
| F01 Chọn vai trò | UC01 | `auth.js` – `selectRole()` |
| F02 Đăng ký | UC02 | `auth.js` – `register()` |
| F03 Đăng nhập | UC03 | `auth.js` – `login()`, `restoreSession()` |
| F04 Đăng xuất | UC04 | `auth.js` – `roleChooser()` |
| F05 Xem dịch vụ | UC05 | `catalog.js` – `renderCatalog()` |
| F06 Xem thợ | UC06 | `catalog.js` – `renderCatalog()` |
| F07 Đặt lịch | UC07 | `bookings.js` – `validSlot()`, `hasBarberConflict()`, `book()` |
| F08 Xem lịch | UC08 | `bookings.js` – `renderMine()` |
| F09 Hủy lịch | UC09 | `bookings.js` – `cancelMine()` |
| F10 Quản lý lịch | UC10 | `staff.js` – `renderStaff()`, `staffUpdate()` |
| F11 Đổi mật khẩu | UC11 | `account.js` – `changePassword()` |
| F12 Cập nhật hồ sơ | UC12 | `account.js` – `updateProfile()` |

Tất cả chức năng này được mô tả tại mục 2.6 của SRS; quy tắc đặt lịch chi tiết ở mục 2.5.5, sơ đồ Hình 2-9, kiểm thử TC15–TC19/TC41–TC44 và Phụ lục A.

## 7. Giới hạn kỹ thuật

Đề bài chỉ yêu cầu frontend. Dữ liệu lưu qua `localStorage` và `sessionStorage`, không dùng cơ sở dữ liệu máy chủ nên không đồng bộ giữa các máy hoặc trình duyệt khác nhau. Các màn hình chọn vai trò và xác thực thực hiện ở phía trình duyệt; **không phải cơ chế bảo vệ phân quyền cho hệ thống vận hành thật**. Mật khẩu tài khoản được dẫn xuất bằng PBKDF2 với salt nhưng dữ liệu và ứng dụng vẫn nằm ở phía trình duyệt. Không nhập dữ liệu cá nhân nhạy cảm vào hệ thống khi làm bài.
