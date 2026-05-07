// Cấu hình URL gốc của API (Trỏ tới MockAPI)
const BASE_URL = 'https://69fbe478fce564e25916f8c0.mockapi.io/api/cafeshop';

// Object api chứa tất cả các hàm gọi HTTP Request (GET, POST, PUT, DELETE)
// Sử dụng Fetch API và Promise để xử lý bất đồng bộ
const api = {
    // GET: Lấy danh sách danh mục (Tự động lấy từ danh sách sản phẩm)
    getCategories: () => {
        return fetch(`${BASE_URL}/products`)
            .then(res => res.ok ? res.json() : [])
            .then(products => {
                // Lọc danh mục duy nhất từ các sản phẩm hiện có
                const uniqueCats = [...new Set(products.map(p => p.category).filter(c => c))];
                return uniqueCats.map((cat, index) => ({ id: String(index + 1), name: cat }));
            });
    },

    // GET all products
    getProducts: () => {
        return fetch(`${BASE_URL}/products`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Lỗi khi tải danh sách sản phẩm');
                }
                return response.json();
            })
            .then(data => data.map(item => ({ ...item, id: item.id || item.Id })));
    },

    // GET single product by ID
    getProductById: (id) => {
        return fetch(`${BASE_URL}/products/${id}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Lỗi khi tải sản phẩm');
                }
                return response.json();
            })
            .then(data => ({ ...data, id: data.id || data.Id }));
    },

    // POST create new product
    createProduct: (productData) => {
        return fetch(`${BASE_URL}/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Lỗi khi thêm sản phẩm');
                }
                return response.json();
            })
            .then(data => ({ ...data, id: data.id || data.Id }));
    },

    // PUT update product
    updateProduct: (id, productData) => {
        return fetch(`${BASE_URL}/products/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Lỗi khi cập nhật sản phẩm');
                }
                return response.json();
            })
            .then(data => ({ ...data, id: data.id || data.Id }));
    },

    // DELETE: Xóa 1 sản phẩm theo ID
    deleteProduct: (id) => {
        return fetch(`${BASE_URL}/products/${id}`, {
            method: 'DELETE'
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Lỗi khi xóa sản phẩm');
                }
                return response.json();
            });
    },

    // ==========================================
    // CÁC HÀM API DÀNH CHO TÍNH NĂNG ĐẶT BÀN
    // Tương tác với bảng 'reservations'
    // ==========================================

    getTables: () => {
        return fetch(`${BASE_URL}/tables`).then(res => res.ok ? res.json() : []);
    },

    getReservations: () => {
        return fetch(`${BASE_URL}/reservations`)
            .then(res => res.ok ? res.json() : [])
            .then(data => data.map(item => ({ ...item, id: item.id || item.Id })));
    },

    getReservationById: (id) => {
        return fetch(`${BASE_URL}/reservations/${id}`)
            .then(res => {
                if (!res.ok) throw new Error('Không tìm thấy đơn đặt bàn');
                return res.json();
            })
            .then(data => ({ ...data, id: data.id || data.Id }));
    },

    createReservation: (data) => {
        return fetch(`${BASE_URL}/reservations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(res => {
            if (!res.ok) throw new Error('Lỗi đặt bàn');
            return res.json();
        }).then(data => ({ ...data, id: data.id || data.Id }));
    },

    updateReservation: (id, data) => {
        return fetch(`${BASE_URL}/reservations/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(res => {
            if (!res.ok) throw new Error('Lỗi cập nhật đặt bàn');
            return res.json();
        }).then(data => ({ ...data, id: data.id || data.Id }));
    }
};
