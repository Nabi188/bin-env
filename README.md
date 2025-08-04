# ENV File Manager

Một ứng dụng web để quản lý các file environment variables (.env) một cách bảo mật với mã hóa AES.

## ✨ Tính năng

- 🔐 **Bảo mật**: Mã hóa AES cho tất cả nội dung ENV files
- 🏗️ **Quản lý Projects**: Tổ chức ENV files theo từng dự án
- 🌍 **Multi-environment**: Hỗ trợ dev, staging, production, v.v.
- 📋 **Copy/Paste**: Dễ dàng copy nội dung ENV files
- 🔑 **Authentication**: Đăng nhập bằng password duy nhất
- 🎨 **UI thân thiện**: Giao diện đẹp với Tailwind CSS

## 🚀 Cài đặt

### 1. Clone repository

```bash
git clone <repository-url>
cd env-file-manager
```

### 2. Cài đặt dependencies

```bash
pnpm install
```

### 3. Tạo file .env

Sao chép file `.env.example` thành `.env`:

```bash
cp .env.example .env
```

### 4. Cấu hình Environment Variables

Mở file `.env` và cập nhật các giá trị:

```env
BASE_URL=http://localhost:3000
PASSWORD=your_secure_password_here
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
JWT_SECRET=your_jwt_secret_here
ENCRYPTION_KEY=your_encryption_key_here
```

#### Tạo JWT_SECRET và ENCRYPTION_KEY bằng OpenSSL

**Trên macOS/Linux:**

```bash
# Tạo JWT_SECRET (32 bytes)
openssl rand -hex 32

# Tạo ENCRYPTION_KEY (32 bytes)
openssl rand -hex 32
```

**Trên Windows:**

```powershell
# Cài đặt OpenSSL trước (nếu chưa có):
# Tải từ: https://slproweb.com/products/Win32OpenSSL.html

# Hoặc sử dụng Git Bash (nếu đã cài Git):
openssl rand -hex 32  # JWT_SECRET
openssl rand -hex 32  # ENCRYPTION_KEY

# Hoặc sử dụng PowerShell:
[System.Web.Security.Membership]::GeneratePassword(64, 0)
```

### 5. Thiết lập Database

Ứng dụng sử dụng PostgreSQL với Prisma ORM.

#### Cài đặt PostgreSQL:

**Ví dụ với Docker (khuyến nghị):**

```bash
# Chạy PostgreSQL container
docker run --name env-manager-db \
  -e POSTGRES_DB=env_manager \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d postgres:15

# Kiểm tra container đang chạy
docker ps
```

**Hoặc sử dụng bất kỳ PostgreSQL instance nào khác** (local, cloud, etc.)

Cập nhật `DATABASE_URL` trong `.env` theo database của bạn:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/env_manager"
```

#### Chạy migrations:

```bash
pnpm dlx prisma migrate dev
```

### 6. Chạy ứng dụng

```bash
pnpm dev
```

Ứng dụng sẽ chạy tại: http://localhost:3000

## 🖥️ Sử dụng Web Interface

### 1. Đăng nhập

- Truy cập http://localhost:3000
- Nhập password đã cấu hình trong `.env`
- Click "Sign in"

### 2. Quản lý Projects

- **Tạo project mới**: Click "New Project" → nhập tên và mô tả
- **Xem project**: Click "View Project" trên project card
- **Xóa project**: Click "Delete" trên project card

### 3. Quản lý ENV Files

- **Tạo ENV file**: Trong project detail → click "New ENV File"
- **Edit ENV file**: Click "Edit" trên ENV file card
- **Copy nội dung**: Click "Copy" để copy vào clipboard
- **Paste nội dung**: Trong form edit → click "Paste"
- **Xóa ENV file**: Click "Delete" trên ENV file card

### 4. Đăng xuất

- Click nút "Logout" ở góc phải trên

## 🔧 API Endpoints (CLI - Coming Soon)

### Authentication

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -H "x-client-type: cli" \
  -d '{"password":"your_password"}'

# Response: {"token":"jwt_token_here"}
```

### Projects

```bash
# Get all projects
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/projects

# Create project
curl -X POST -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"My Project","description":"Description"}' \
  http://localhost:3000/api/projects

# Get project detail
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/projects/<project_id>
```

### ENV Files

```bash
# Get ENV files in project
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/projects/<project_id>/env-files

# Create ENV file
curl -X POST -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"dev","rawContent":"DATABASE_URL=postgresql://..."}' \
  http://localhost:3000/api/projects/<project_id>/env-files

# Get specific ENV file
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/projects/<project_id>/env-files/<file_id>
```

## 🛠️ Development

### Cấu trúc thư mục

```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── login/             # Login page
│   ├── projects/          # Project pages
│   └── page.tsx           # Home page
├── lib/                   # Utilities
│   ├── crypto.ts          # Encryption/decryption
│   ├── jwt.ts             # JWT handling
│   └── envConfig.ts       # Environment config
├── prisma/                # Database schema
└── middleware.ts          # Authentication middleware
```

### Scripts

```bash
pnpm dev          # Chạy development server
pnpm build        # Build production
pnpm start        # Chạy production server
pnpm lint         # Lint code
pnpm prettier:fix # Format code
```

### Database Commands

```bash
pnpm dlx prisma studio        # Mở Prisma Studio
pnpm dlx prisma migrate dev   # Chạy migrations
pnpm dlx prisma generate      # Generate Prisma client
```

## 🔒 Bảo mật

- **Mã hóa AES**: Tất cả nội dung ENV files được mã hóa trước khi lưu database
- **JWT Authentication**: Sử dụng JWT tokens cho authentication
- **Password Protection**: Chỉ một password duy nhất để truy cập
- **HttpOnly Cookies**: JWT được lưu trong HttpOnly cookies cho web
- **HTTPS Ready**: Sẵn sàng cho production với HTTPS

## 📝 License

MIT License

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Mở Pull Request

## 🐛 Issues

Nếu gặp vấn đề, vui lòng tạo issue tại GitHub repository.

## TODO

- bin-env CLI : Tải file về folder ứng dụng
