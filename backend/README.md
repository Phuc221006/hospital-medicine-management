# Hospital Medicine Management - Backend

## Tech Stack
- Java 17
- Spring Boot 3.2.5
- Spring Security + JWT
- Spring Data JPA
- MySQL 8.0
- Flyway Migration
- Docker

## Prerequisites
- Java 17+
- Maven 3.8+
- MySQL 8.0+ (or Docker)
- Google Cloud Console account (for OAuth)

## Setup

### 1. Database Setup

**Option A: Using Docker**
\`\`\`bash
docker-compose up -d mysql
\`\`\`

**Option B: Manual MySQL**
\`\`\`sql
CREATE DATABASE hospital_medicine;
CREATE USER 'hospital'@'localhost' IDENTIFIED BY 'hospital123';
GRANT ALL PRIVILEGES ON hospital_medicine.* TO 'hospital'@'localhost';
FLUSH PRIVILEGES;
\`\`\`

### 2. Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:8080/api/auth/google`
   - `http://localhost:5173` (frontend)
6. Copy Client ID and Client Secret

### 3. Environment Variables
\`\`\`bash
cp .env.example .env
# Edit .env with your values
\`\`\`

### 4. Run Application

**Development:**
\`\`\`bash
mvn spring-boot:run
\`\`\`

**Production:**
\`\`\`bash
mvn clean package -DskipTests
java -jar target/medicine-management-1.0.0.jar
\`\`\`

**Docker:**
\`\`\`bash
docker-compose up -d
\`\`\`

## API Documentation
After starting the application, visit:
- Swagger UI: http://localhost:8080/api/swagger-ui.html
- OpenAPI JSON: http://localhost:8080/api/v3/api-docs

## Default Admin Account
- Email: admin@hospital.com
- Password: admin123

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/google` - Login with Google
- `POST /api/auth/register` - Register new admin
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout

### Admin APIs
- `GET /api/admin/dashboard/stats` - Dashboard statistics
- `GET /api/admin/dashboard/alerts` - Stock alerts
- `GET/POST/PUT/DELETE /api/admin/medicines` - Medicine CRUD
- `GET/POST /api/admin/stock-imports` - Stock imports
- `GET/POST /api/admin/stock-exports` - Stock exports
- `GET/POST/PATCH /api/admin/prescriptions` - Prescriptions
- `GET /api/admin/patients` - Patient management
- `GET/POST /api/admin/alert-settings` - Alert settings
- `GET /api/admin/reports/*` - Reports (CSV)
- `GET/POST/PUT/DELETE /api/admin/categories` - Categories
- `GET/POST/PUT/DELETE /api/admin/suppliers` - Suppliers

### Patient APIs
- `GET /api/patient/profile` - Get profile
- `GET /api/patient/prescriptions` - My prescriptions
- `GET /api/patient/appointments` - My appointments
- `GET /api/patient/notifications` - My notifications
