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

/**
 * Hàm hiển thị thông báo (Toast) thay thế cho alert() truyền thống
 * @param {string} title - Tiêu đề thông báo
 * @param {string} message - Nội dung chi tiết
 * @param {string} type - Loại thông báo: 'success', 'error', 'info'
 */
function showToast(title, message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast-custom toast-${type}`;
    
    let icon = 'info';
    if (type === 'success') icon = 'check_circle';
    if (type === 'error') icon = 'error';

    toast.innerHTML = `
        <div class="toast-icon">
            <span class="material-symbols-outlined fs-5">${icon}</span>
        </div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <div class="toast-close">
            <span class="material-symbols-outlined fs-5">close</span>
        </div>
    `;

    container.appendChild(toast);

    // Hiệu ứng hiện ra
    setTimeout(() => toast.classList.add('show'), 10);

    // Tự động đóng sau 4 giây
    const timer = setTimeout(() => {
        closeToast(toast);
    }, 4000);

    // Sự kiện đóng thủ công
    toast.querySelector('.toast-close').addEventListener('click', () => {
        clearTimeout(timer);
        closeToast(toast);
    });
}

function closeToast(toast) {
    toast.classList.add('hide');
    toast.addEventListener('transitionend', () => {
        toast.remove();
    });
}
