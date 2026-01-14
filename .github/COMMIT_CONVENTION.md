# Quy Tắc Viết Commit Message

## Định Dạng: `<type>: <Jira ID> <subject>`

### Types

- `feat` - Thêm tính năng mới
- `fix` - Sửa lỗi
- `docs` - Thay đổi documentation
- `style` - Format code (không ảnh hưởng logic)
- `refactor` - Cải thiện code
- `test` - Thêm/sửa tests
- `chore` - Build process/tools
- `perf` - Cải thiện hiệu suất

### Jira ID

- Format: `PROJ-123` (tên project viết hoa + số)
- Bắt buộc nếu commit liên quan đến task/issue trong Jira
- Có thể bỏ qua cho các commit đơn giản (docs, chore nhỏ)

### Subject Rules

- Thì hiện tại, dạng mệnh lệnh: "add" không phải "added"
- Không viết hoa chữ cái đầu
- Tối đa 50 ký tự
- Không kết thúc bằng dấu chấm

## Ví Dụ

### Với Jira ID

```
feat: PROJ-123 add multiple choice question generation
fix: PROJ-456 resolve null pointer exception in validation
refactor: PROJ-789 improve database query performance
perf: PROJ-234 optimize image loading
```

### Không có Jira ID (optional)

```
docs: update installation instructions
chore: update fastapi to 0.104.0
style: format code with prettier
```

## Quy Tắc

Tiếng Anh hoặc tiếng Việt, tối đa 50 ký tự, một commit một thay đổi
Tránh: "fix bug", "update code", commit nhiều thay đổi

---

> **Tham khảo**: [Conventional Commits](https://www.conventionalcommits.org/)
