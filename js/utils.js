// Các hàm tiện ích dùng chung cho toàn bộ dự án

/**
 * Hàm định dạng tiền tệ sang chuẩn Việt Nam Đồng (VNĐ)
 * Ví dụ: 50000 -> "50.000 ₫"
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

/**
 * Hàm tạo ID ngẫu nhiên (Dùng cho UI nội bộ nếu cần, MockAPI tự xử lý ID thật)
 */
function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

/**
 * Hàm tạo độ trễ (delay) giả lập, dùng khi muốn hiển thị trạng thái loading
 * Trả về một Promise sẽ resolve sau `ms` mili-giây.
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
