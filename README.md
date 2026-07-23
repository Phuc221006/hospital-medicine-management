# Hospital Medicine Management System

Ứng dụng quản lý tủ thuốc bệnh viện với đầy đủ tính năng cho cả bệnh nhân và quản trị viên.

## Live Demo
- **Frontend URL:** [https://hospital-medicine-management.netlify.app](https://hospital-medicine-management.netlify.app)
- **Backend API URL:** [https://hospital-medicine-management.onrender.com](https://hospital-medicine-management.onrender.com)

## Tech Stack

### Frontend
- **Framework**: Next.js 15 (React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: React Context + SWR
- **Real-time**: WebSocket

### Backend
- **Framework**: Spring Boot 3.x
- **Language**: Java 17+
- **Database**: Cloud MySQL (Aiven)
- **Authentication**: JWT + Google OAuth2 (Production Mode)
- **Migration**: Flyway
- **Containerization**: Docker
- **Hosting / Deploy**: Render (Backend) & Netlify (Frontend)

## Features

### Patient (Bệnh nhân)
- Đăng nhập bằng Google
- Xem đơn thuốc và trạng thái
- Xem lịch khám
- Đặt lịch khám mới
- Yêu cầu bổ sung thuốc
- Cập nhật thông tin cá nhân
- Nhận thông báo real-time

### Admin (Quản trị viên)
- Dashboard tổng quan với KPIs và biểu đồ
- CRUD thuốc với import CSV
- Quản lý bệnh nhân và lịch sử khám
- Nhập kho (theo lô, hạn dùng)
- Xuất kho (phát thuốc cho bệnh nhân)
- Cảnh báo tồn kho thấp và hết hạn
- Báo cáo xuất CSV/PDF
- Cài đặt ngưỡng cảnh báo
- Real-time notifications qua WebSocket

---

## 🔐 Test Accounts (Tài khoản thử nghiệm hệ thống)

Để kiểm thử nhanh các phân quyền trên môi trường Live Demo hoặc Local, sử dụng các tài khoản sau:

### 1. Quyền Quản trị viên (Admin)
- **Email:** `admin@hospital.com`
- **Mật khẩu:** `123456`

### 2. Quyền Bệnh nhân (Patient)
- Sử dụng chức năng **Đăng nhập bằng Google** trực tiếp bằng bất kỳ tài khoản Gmail cá nhân nào. Hệ thống tự động kích hoạt phân quyền `PATIENT` khi đăng nhập lần đầu thành công.

---

## Setup

### Prerequisites
- Node.js 18+
- Java 17+
- MySQL 8.0+
- Docker (optional)

### Backend Setup

1. Clone repository và vào thư mục backend:
\`\`\`bash
cd backend
\`\`\`

2. Cấu hình database trong \`application.yml\`:
\`\`\`yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/hospital_medicine
    username: your_username
    password: your_password
\`\`\`

3. Cấu hình Google OAuth:
\`\`\`yaml
google:
  google:
  client-id: your-google-client-id.apps.googleusercontent.com
\`\`\`

4. Chạy với Maven:
\`\`\`bash
mvn spring-boot:run
\`\`\`

Hoặc với Docker:
\`\`\`bash
docker-compose up -d
\`\`\`

### Frontend Setup

1. Tạo file \`.env.local\`:
\`\`\`
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_WS_URL=ws://localhost:8080/ws
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Run development server:
\`\`\`bash
npm run dev
\`\`\`

## API Endpoints

### Authentication
- \`POST /api/auth/login\` - Email/password login
- \`POST /api/auth/google\` - Google OAuth login
- \`POST /api/auth/refresh\` - Refresh token
- \`GET /api/auth/me\` - Get current user

### Admin APIs
- \`GET/POST /api/admin/medicines\` - Medicine CRUD
- \`GET/POST /api/admin/patients\` - Patient management
- \`POST /api/admin/stock-imports\` - Import stock
- \`POST /api/admin/stock-exports\` - Export stock
- \`GET /api/admin/dashboard\` - Dashboard data
- \`GET /api/admin/reports\` - Generate reports
- \`GET/POST /api/admin/alert-settings\` - Alert configuration

### Patient APIs
- \`GET/PUT /api/patient/profile\` - Profile management
- \`GET /api/patient/prescriptions\` - View prescriptions
- \`GET/POST /api/patient/appointments\` - Appointments
- \`POST /api/patient/medicine-requests\` - Request medicine

## WebSocket Events

### From Server
- \`ALERT_NEW\` - New alert created
- \`STOCK_LOW\` - Low stock warning
- \`STOCK_EXPIRING\` - Expiring medicine warning
- \`PRESCRIPTION_UPDATE\` - Prescription status changed
- \`APPOINTMENT_UPDATE\` - Appointment updated
- \`NOTIFICATION\` - General notification
