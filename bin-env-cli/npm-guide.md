# NPM Publishing Guide for bin-env-cli

## Hướng dẫn publish package lên npmjs

### Bước 1: Chuẩn bị tài khoản npmjs

1. Tạo tài khoản tại [npmjs.com](https://www.npmjs.com/)
2. Xác thực email
3. Login vào npm CLI:
   ```bash
   npm login
   ```

### Bước 2: Kiểm tra package

1. Build project:

   ```bash
   npm run build
   ```

2. Test package locally:

   ```bash
   npm pack --dry-run
   ```

3. Test CLI commands:
   ```bash
   ./bin/bin-env --help
   ./bin/bin-env login --help
   ./bin/bin-env logout
   ./bin/bin-env pull
   ```

### Bước 3: Cập nhật thông tin package

Kiểm tra `package.json`:

- ✅ `name`: "bin-env-cli"
- ✅ `version`: "1.0.0" (hoặc version mới)
- ✅ `description`: "CLI tool for managing environment files"
- ✅ `bin`: `{"bin-env": "./bin/bin-env"}`
- ✅ `main`: "dist/index.js"
- ✅ `files`: Tự động include dist/, bin/, src/

### Bước 4: Publish lên npmjs

1. Kiểm tra tên package có available không:

   ```bash
   npm view bin-env-cli
   ```

   (Nếu trả về 404, tức là tên available)

2. Publish package:

   ```bash
   npm publish
   ```

3. Nếu muốn publish với tag beta:
   ```bash
   npm publish --tag beta
   ```

### Bước 5: Kiểm tra sau khi publish

1. Kiểm tra trên npmjs.com:

   ```
   https://www.npmjs.com/package/bin-env-cli
   ```

2. Test cài đặt global:

   ```bash
   npm install -g bin-env-cli
   bin-env --help
   ```

3. Test uninstall:
   ```bash
   npm uninstall -g bin-env-cli
   ```

### Bước 6: Update version cho lần publish tiếp theo

1. Update version:

   ```bash
   npm version patch  # 1.0.0 -> 1.0.1
   npm version minor  # 1.0.0 -> 1.1.0
   npm version major  # 1.0.0 -> 2.0.0
   ```

2. Build và publish lại:
   ```bash
   npm run build
   npm publish
   ```

### Lưu ý quan trọng

- ⚠️ **Tên package**: "bin-env-cli" phải unique trên npmjs
- ⚠️ **Version**: Không thể publish cùng version 2 lần
- ⚠️ **Files**: Chỉ dist/, bin/, package.json, README.md được include
- ⚠️ **Binary**: Command `bin-env` sẽ available globally sau khi install

### Troubleshooting

**Lỗi "package name already exists":**

- Đổi tên package trong `package.json`
- Hoặc thêm scope: `@username/bin-env-cli`

**Lỗi "permission denied":**

- Chạy `npm login` lại
- Kiểm tra quyền publish package

**Binary không hoạt động:**

- Kiểm tra `chmod +x bin/bin-env`
- Kiểm tra shebang `#!/usr/bin/env node`

### Chia sẻ với bạn bè

Sau khi publish thành công, bạn bè có thể cài đặt:

```bash
# Cài đặt global
npm install -g bin-env-cli

# Sử dụng
bin-env login
bin-env pull
bin-env logout
```

🎉 **Chúc mừng! Package của bạn đã sẵn sàng để chia sẻ với cộng đồng!**
