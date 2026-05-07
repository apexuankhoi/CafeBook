<div align="center">
  <img src="https://img.icons8.com/color/96/000000/cafe.png" alt="The Hills Coffe Logo">
  <h1>☕ The Hills Coffe - Coffee Shop Booking & Management</h1>
  <p><em>Hệ thống Quản lý và Đặt bàn Quán Cà phê Trực tuyến</em></p>
  
  [![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)](#)
  [![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)](#)
  [![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)](#)
  [![Bootstrap](https://img.shields.io/badge/Bootstrap_5-7952B3?style=flat&logo=bootstrap&logoColor=white)](#)
  [![jQuery](https://img.shields.io/badge/jQuery_3.7-0769AD?style=flat&logo=jquery&logoColor=white)](#)
  [![MockAPI](https://img.shields.io/badge/MockAPI-RESTful-2c3e50?style=flat&logo=json&logoColor=white)](#)
</div>

---

## 📖 Giới thiệu
**The Hills Coffe** là dự án Bài Tập Lớn Web được xây dựng hoàn toàn bằng các công nghệ Front-end cơ bản và MockAPI cho Back-end. Dự án kế thừa thiết kế cao cấp (Premium UI) với phong cách **Glassmorphism** và **Neumorphism**, đáp ứng 100% các yêu cầu kỹ thuật khắt khe.

## 🚀 Tính năng nổi bật

### 👤 Dành cho Khách hàng (Public)
- 📜 **Xem thực đơn**: Xem danh sách đồ uống, giá cả, và mô tả chi tiết.
- 🔍 **Lọc danh mục**: Lọc sản phẩm theo danh mục (Cà phê, Trà, Bánh) - *Dữ liệu động từ API (Yêu cầu nâng cao)*.
- 🪑 **Đặt bàn thông minh**: 
  - Xem sơ đồ bàn trực quan.
  - Chọn Ngày/Giờ và tự động lọc Bàn nào còn trống, Bàn nào đã bị đặt.
  - Form đặt bàn online siêu tốc, tự động lưu thông tin vào hệ thống.

### 👑 Dành cho Quản trị viên (Admin)
- 🍔 **Quản lý Menu (CRUD)**: Thêm mới, chỉnh sửa, xóa đồ uống/bánh ngọt.
- 📅 **Quản lý Đặt bàn**: 
  - Xem danh sách khách hàng đã đặt chỗ (Tên, SĐT, Giờ đặt, Bàn chọn).
  - Quản lý trạng thái đơn đặt (Chờ xác nhận / Đã xác nhận / Đã hủy).
- ✅ **Form Validation**: Ràng buộc dữ liệu nghiêm ngặt, bắt lỗi trực tiếp trên màn hình (Giá > 0, Tên không được rỗng, URL ảnh hợp lệ...).

---

## 📂 Cấu trúc thư mục

```text
Demo/
├── index.html        # Trang chủ khách hàng (Menu, Lọc danh mục, Đặt bàn)
├── admin.html        # Trang quản trị Dashboard (CRUD Sản phẩm, Duyệt đơn)
├── css/
│   └── style.css     # Design System (Glassmorphism, Neumorphism, Animations)
├── js/
│   ├── api.js        # Logic kết nối MockAPI (Fetch API, Promise, RESTful)
│   ├── utils.js      # Hàm tiện ích (format tiền, tạo ID...)
│   ├── main.js       # Logic xử lý Trang chủ & Thuật toán Sơ đồ đặt bàn
│   └── admin.js      # Logic xử lý CRUD, Validate Form & Trạng thái Booking
└── README.md         # File thông tin dự án
```

---

## 🎯 Chấm điểm Yêu cầu Bài tập

| Yêu cầu kỹ thuật | Đã hoàn thành | Chi tiết thực hiện |
| :--- | :---: | :--- |
| **JavaScript Thuần** | ✅ | Khai báo let/const, vòng lặp, xử lý sự kiện DOM (click, submit, change), querySelector, classList tại `main.js` & `admin.js`. |
| **JSON & Fetch API** | ✅ | Giao tiếp RESTful CRUD với MockAPI dùng Promise (`.then`, `.catch`) tách biệt tại `api.js`. Đủ Get, Post, Put, Delete. |
| **Form Validation** | ✅ | Bắt lỗi required, check giá > 0, check định dạng URL ảnh, chặn submit form sai, báo lỗi đỏ nội tuyến tại form thêm món. |
| **jQuery** | ✅ | Dùng cho khối Nhận thông báo. Dùng `$('#id')`, event `.on('submit')`, hiệu ứng UI `.slideDown()`, và AJAX POST qua `$.ajax()`. |
| **Bootstrap 5** | ✅ | Responsive Grid System (Row, Col), Layout chuẩn 3 breakpoint, Utilities (spacing, shadow), Components (Modal, Navbar, Table, Select). |
| **MockAPI.io** | ✅ | Fetch dữ liệu thực tế 100%. Đã tích hợp tính năng **Nâng cao**: gọi API động qua 3 endpoint (`products`, `categories`, `reservations`). |

---

## ⚙️ Hướng dẫn Cài đặt & Chạy dự án

1. **Clone dự án** về máy tính của bạn.
2. Mở file `index.html` hoặc `admin.html` bằng **Live Server** (trên VS Code) để tránh lỗi CORS và tận hưởng đầy đủ hiệu ứng.
3. Nếu bạn muốn sử dụng tài khoản MockAPI của riêng mình, chỉ cần mở file `js/api.js`, thay đổi đường link trong biến `BASE_URL` nằm ở dòng đầu tiên là xong. Toàn bộ logic tự động mapping qua.

---

## 🗄️ Cấu trúc Schema (Dành cho MockAPI)

Dự án hiện tại dùng **3 Resources (Bảng)** chạy độc lập trên MockAPI:

### 1. `products` (Sản phẩm)
- `name` (String) | `price` (Number) | `category` (String) | `image` (String - URL) | `stock` (Number) | `description` (String) | `createdAt` (Date)

### 2. `categories` (Danh mục - *Yêu cầu nâng cao*)
- `name` (String - VD: Coffee, Tea, Cake...)

### 3. `reservations` (Đơn đặt bàn)
- `customerName` (String) | `phone` (String) | `date` (String) | `time` (String) | `guests` (Number) | `tableId` (String) | `status` (String - Pending/Confirmed/Cancelled)

<br>
<div align="center">
  <i>Được xây dựng với sự tâm huyết 💖 - Sẵn sàng cho điểm A+!</i>
</div>