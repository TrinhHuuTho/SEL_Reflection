# Đề xuất Nâng cấp Giao diện Game hoá (Gamification UI Plan) cho Học Sinh

Hiện tại, màn hình `MainGameScreen.jsx` và `QuestionModal.jsx` đã hoàn thiện 100% logic Backend (lấy progress, nộp bài, kiểm tra trùng lặp). Tuy nhiên, về mặt Visual (thị giác) và UX (trải nghiệm người dùng), nền tảng vẫn mang dáng dấp của một "Form khảo sát" hơn là một "Trò chơi".

Để học sinh thực sự **háo hức** và **tự giác** online làm bài tập sau giờ học, chúng ta cần biến hệ thống này thành một trò chơi thực thụ (Gamification) học hỏi từ cơ chế của các ứng dụng EdTech hàng đầu như Duolingo.

Dưới đây là Kế hoạch Thiết kế và Nâng cấp chi tiết.

## 1. Nâng cấp Bản đồ Hành trình (`MainGameScreen.jsx`)

### 1.1 Khích lệ Hàng ngày: Cơ chế Chuỗi Ngày (Streaks) & Danh hiệu
- **Bổ sung UI Góc Trên:** Hiển thị Thanh Lửa (Streak: 🔥 3 Ngày) và Kho báu (💎 1500 Xu) cạnh nút Quay Lại. Điều này đánh vào tâm lý "sợ mất chuỗi" của học sinh, khích lệ các em ngày nào cũng vào đăng nhập.
- **Hiệu ứng Mở khoá:** Khi một Node mới được mở (từ Xám thành Vàng), thêm Animation "toả sáng" hoặc nhấp nháy 3D để vẫy gọi học sinh ấn vào.

### 1.2 Môi trường Sống động: Mảnh đất Động (Thematic Maps)
- **Đồ họa Chuyên sâu:** Thay vì một `MapPath.jsx` với đường Line vẽ SVG cơ bản, chia Map thành các Theme đa dạng theo Sở thích lớp học (e.g. Map Rừng Nhiệt Đới, Map Hành Tinh Không Gian, Map Thành Phố Phép Thuật).
- **Nhân vật Di chuyển:** Thay vì đánh dấu chặng đang học bằng màu, hãy dùng Avatar của học sinh hiển thị nhảy lềnh bềnh ngay tại cục Node hiện tại (như kiểu đánh cờ tỷ phú).

---

## 2. Nâng cấp Cửa sổ Câu hỏi (`QuestionModal.jsx`)

Đây là nơi học sinh phải "suy nghĩ" và "đánh máy", rất dễ gây buồn chán. Cần dùng sức mạnh thiết kế để phá tan sự mệt mỏi:

### 2.1 Mascot (Nhân vật Trợ lý Ảo)
- **Bố cục mới:** Thay vì ghi "Câu hỏi bí ẩn" khô khan. Hãy thêm một nhân vật Mascot (Ví dụ: Bạn Gấu, Robot, Cú mèo) đứng kế bên.
- **Bóng Thoại (Speech Bubble):** Câu hỏi của giáo viên sẽ được hiển thị như một lời trò chuyện phát ra từ miệng Mascot với hiệu ứng chạy chữ "Loc cốc" (Typing Effect).

### 2.2 Micro-Interactions (Tương tác nhỏ khen ngợi tức thì)
- Khi học sinh để ô trống trong 5 giây, Mascot sẽ nảy lên (bounce) kèm dòng bóng thoại nhỏ: *"Mạnh dạn lên, tớ đang lắng nghe bạn nè!"*
- Khi học sinh gõ chữ vào Ô Textarea (đạt độ dài 10 từ, 20 từ) => Phun ra một vài hạt hạt màu nhạt (Sparkles effect) quanh ô text kèm chữ *"Phân tích đỉnh quá!"* hoặc *"Viết hay lắm!"* để thôi thúc các em viết thành đoạn văn dài thay vì chỉ vài chữ hời hợt.

### 2.3 Đại Tiệc Hoàn Thành (Success View)
Khi kết thúc câu cuối (Step 3 hiện tại):
- **Bắn Pháo Giấy (Confetti):** Tiêm thư viện `react-confetti` rớt kín màn hình.
- **Rương Kho Báu Giật/Rung:** Cho rương hiển thị mở bung tung xoé ra đồng xu rơi leng keng.
- **Tích luỹ Điểm:** Text chạy từ `0 điểm` lên `+50 EXP` bừng sáng.
- **Âm thanh:** Nếu không ngại dung lượng, chạy hàm audio một tiếng SFX "Tadaa!" vang lên.

### 2.4 Cải thiện Trải nghiệm Xem bạn bè (Góc nhìn Bạn Bè)
- Cột bên phải hiện tại hơi tĩnh (Chỉ là thẻ list bình thường).
- **Cơ chế Like:** Cho phép nhả Emoji Thả tim (❤️), Tuyệt vời (🌟) vào các câu trả lời của bạn cùng lớp. (Game hóa sự công nhận xã hội).

---

## 3. Lộ Trình Triển Khai Kỹ Thuật (Tech Plan)

Nếu triển khai, các bước Developer cần làm tiếp theo:

### Giai đoạn 1: Chuẩn bị Vũ khí UI
- `npm install framer-motion`: Sử dụng thư viện chuyển động mạnh nhất của React để làm Mascot nhảy, Rương kho báu mở nắp...
- `npm install react-confetti`: Bắn pháo bông giấy trọn vẹn tại Step 3.
- `npm install typeit-react`: Làm hiệu ứng chạy chữ mượt mà cho Mascot gõ câu hỏi dạo đầu.

### Giai đoạn 2: Phát triển (Dự kiến mất ~3-5 ngày tuỳ cường độ)
- **Ticket 1:** Tái cấu trúc CSS `QuestionModal`, cài cắm các file SVGs nhân vật ngộ nghĩnh, viết Animation (Sparkles + Jumping).
- **Ticket 2:** Tích hợp bộ hiệu ứng ở Bước Nộp Bài (Confetti & Chest unlock).
- **Ticket 3:** Nâng cấp Map bằng ảnh Sprite Graphic, kết hợp logic `progress.current` dể render toạ độ đứng cho Avatar của học sinh.
- **Ticket 4 (Backend Add-on):** Thiết lập thêm trường `exp` hoặc `coins` vào bảng `StudentProgress` nếu thực sự muốn tặng xu cho các em mua đồ áo quần cho Avatar.

## Anh/Chị Review Required

Kế hoạch này mang tính định hướng UX rất lớn. Hãy cho tôi biết Anh/Chị muốn tôi **Tập trung code cải thiện Giao diện Question Modal (Thêm hiệu ứng Bắn pháo, Phản hồi, Text sinh động)** trước, hay **Xây dựng hệ thống Chuỗi ngày/Avatar map (Main Game Map)** trước?
