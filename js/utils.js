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

/**
 * Hàm hiển thị hộp thoại xác nhận (Confirm Dialog) thay thế cho confirm() mặc định
 * @param {string} title - Tiêu đề
 * @param {string} message - Nội dung câu hỏi
 * @returns {Promise<boolean>} - Trả về true nếu Đồng ý, false nếu Hủy
 */
function showConfirm(title, message) {
    return new Promise((resolve) => {
        const oldModal = document.getElementById('custom-confirm-modal');
        if (oldModal) {
            oldModal.remove();
        }

        const modalHtml = `
            <div class="modal fade" id="custom-confirm-modal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content border-0 shadow-lg" style="border-radius: 1.5rem;">
                        <div class="modal-header border-0 pb-0 pt-4 px-4">
                            <h5 class="modal-title font-playfair fw-bold fs-4 text-primary">${title}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body p-4">
                            <p class="mb-0 text-muted" style="font-size: 1.1rem;">${message}</p>
                        </div>
                        <div class="modal-footer border-0 pb-4 pe-4">
                            <button type="button" class="btn btn-outline-secondary rounded-pill px-4" data-bs-dismiss="modal" id="btn-confirm-cancel">Hủy</button>
                            <button type="button" class="btn btn-danger rounded-pill px-4" id="btn-confirm-ok">Đồng ý</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        const modalElement = document.getElementById('custom-confirm-modal');
        const modalInstance = new bootstrap.Modal(modalElement);

        document.getElementById('btn-confirm-ok').addEventListener('click', () => {
            modalInstance.hide();
            resolve(true);
        });

        modalElement.addEventListener('hidden.bs.modal', () => {
            resolve(false);
            modalElement.remove();
        });

        modalInstance.show();
    });
}
