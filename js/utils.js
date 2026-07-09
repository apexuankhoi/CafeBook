// Các hàm tiện ích dùng chung cho toàn bộ dự án
// Chứa các hàm hỗ trợ định dạng dữ liệu, tạo thông báo (Toast), sinh ID, v.v.

/**
 * Hàm định dạng tiền tệ sang chuẩn Việt Nam Đồng (VNĐ)
 * @param {number} amount - Số tiền cần định dạng
 * @returns {string} - Chuỗi đã định dạng (VD: 50000 -> "50.000 ₫")
 */
function formatCurrency(amount) {
    // Sử dụng bộ định dạng số quốc tế (Intl.NumberFormat) dành cho ngôn ngữ vi-VN
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',  // Định dạng theo kiểu tiền tệ
        currency: 'VND'     // Đơn vị là Việt Nam Đồng
    }).format(amount);
}

/**
 * Hàm tạo ID ngẫu nhiên (Dùng cho UI nội bộ nếu cần, MockAPI tự xử lý ID thật)
 * @returns {string} - Một chuỗi ngẫu nhiên dài 9 ký tự
 */
function generateId() {
    // Math.random() tạo số thập phân ngẫu nhiên.
    // toString(36) chuyển sang hệ cơ số 36 (gồm số và chữ cái).
    // substr(2, 9) cắt bỏ phần "0." ở đầu và lấy 9 ký tự tiếp theo.
    return Math.random().toString(36).substr(2, 9);
}

/**
 * Hàm tạo độ trễ (delay) giả lập, dùng khi muốn hiển thị trạng thái loading trước khi làm việc gì đó
 * @param {number} ms - Số mili-giây cần chờ
 * @returns {Promise} - Trả về một Promise sẽ resolve sau `ms` mili-giây.
 */
function delay(ms) {
    // Dùng setTimeout để tạo độ trễ, bọc trong Promise để có thể dùng với .then() hoặc await
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Hàm hiển thị thông báo góc màn hình (Toast) thay thế cho alert() truyền thống
 * @param {string} title - Tiêu đề thông báo (VD: "Thành công", "Lỗi")
 * @param {string} message - Nội dung chi tiết cần thông báo
 * @param {string} type - Loại thông báo: 'success' (thành công), 'error' (lỗi), 'info' (thông tin)
 */
function showToast(title, message, type = 'success') {
    // 1. Tìm container chứa các toast (nếu chưa có thì tạo mới)
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div'); // Tạo thẻ div làm vùng chứa
        container.id = 'toast-container'; // Đặt ID để lần sau tái sử dụng
        document.body.appendChild(container); // Gắn vào cuối body của trang
    }

    // 2. Tạo thẻ div cho thông báo Toast mới
    const toast = document.createElement('div');
    toast.className = `toast-custom toast-${type}`; // Cấp class dựa vào loại thông báo để CSS đổi màu phù hợp
    
    // 3. Chọn icon Material Design tương ứng với loại thông báo
    let icon = 'info';
    if (type === 'success') icon = 'check_circle';
    if (type === 'error') icon = 'error';

    // 4. Định dạng cấu trúc HTML bên trong thẻ toast
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

    // 5. Thêm toast vào trong container
    container.appendChild(toast);

    // 6. Hiệu ứng hiện ra (thêm class show sau 10ms để kích hoạt transition CSS)
    setTimeout(() => toast.classList.add('show'), 10);

    // 7. Thiết lập chế độ tự động đóng (ẩn) toast sau 4 giây
    const timer = setTimeout(() => {
        closeToast(toast);
    }, 4000);

    // 8. Bắt sự kiện khi người dùng click vào nút "X" để đóng sớm hơn 4 giây
    toast.querySelector('.toast-close').addEventListener('click', () => {
        clearTimeout(timer); // Hủy hẹn giờ tự động đóng
        closeToast(toast);   // Đóng ngay lập tức
    });
}

/**
 * Hàm phụ trợ để đóng Toast (Thêm hiệu ứng mờ dần rồi xóa hẳn khỏi HTML)
 * @param {HTMLElement} toast - Phẩn tử thẻ HTML của thông báo toast
 */
function closeToast(toast) {
    toast.classList.add('hide'); // Thêm class hide để CSS kích hoạt hiệu ứng thu lại/mờ đi
    // Chờ cho đến khi hiệu ứng CSS (transition) kết thúc mới xóa thẻ khỏi DOM
    toast.addEventListener('transitionend', () => {
        toast.remove(); // Giải phóng bộ nhớ, giữ trang HTML sạch sẽ
    });
}

/**
 * Hàm hiển thị hộp thoại xác nhận (Confirm Dialog) thay thế cho confirm() mặc định
 * @param {string} title - Tiêu đề của hộp thoại
 * @param {string} message - Nội dung câu hỏi muốn hỏi người dùng
 * @returns {Promise<boolean>} - Trả về một Promise, resolve(true) nếu người dùng bấm Đồng ý, resolve(false) nếu bấm Hủy
 */
function showConfirm(title, message) {
    // Sử dụng Promise để có thể dùng .then() hoặc async/await khi gọi hàm này
    return new Promise((resolve) => {
        // 1. Kiểm tra xem trên trang đã có modal confirm cũ nào chưa, nếu có thì xóa đi để tránh trùng lặp
        const oldModal = document.getElementById('custom-confirm-modal');
        if (oldModal) {
            oldModal.remove();
        }

        // 2. Tạo giao diện HTML cho Modal bằng Bootstrap 5
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
        
        // 3. Chèn đoạn HTML của Modal vào cuối phần tử <body> của trang
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // 4. Lấy element vừa chèn và khởi tạo thành một đối tượng Modal của Bootstrap
        const modalElement = document.getElementById('custom-confirm-modal');
        const modalInstance = new bootstrap.Modal(modalElement);

        // 5. Bắt sự kiện khi người dùng click vào nút "Đồng ý"
        document.getElementById('btn-confirm-ok').addEventListener('click', () => {
            modalInstance.hide(); // Ẩn modal
            resolve(true);        // Trả về true báo hiệu người dùng đã đồng ý
        });

        // 6. Bắt sự kiện khi modal bị ẩn (do người dùng click nút "Hủy", click nút "X", hoặc click ra ngoài)
        modalElement.addEventListener('hidden.bs.modal', () => {
            resolve(false);       // Trả về false báo hiệu người dùng không đồng ý
            modalElement.remove(); // Xóa thẻ HTML của modal khỏi DOM để giải phóng bộ nhớ
        });

        // 7. Sau khi thiết lập xong thì hiển thị modal lên màn hình
        modalInstance.show();
    });
}

