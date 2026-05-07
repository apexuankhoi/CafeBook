// Format tiền tệ Việt Nam (VNĐ)
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

// Generate random UUID for UI purposes if needed (mock api handles ID though)
function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

// Hàm hỗ trợ delay để test loading state
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
