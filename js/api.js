const BASE_URL = 'https://69fbe478fce564e25916f8c0.mockapi.io/api/cafeshop';

// Các hàm gọi API sử dụng Fetch API và Promise
const api = {
    // GET all categories (Phần nâng cao)
    getCategories: () => {
        return fetch(`${BASE_URL}/categories`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Lỗi khi tải danh mục');
                }
                return response.json();
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
            });
    },

    // GET single product by ID
    getProductById: (id) => {
        return fetch(`${BASE_URL}/products/${id}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Lỗi khi tải sản phẩm');
                }
                return response.json();
            });
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
            });
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
            });
    },

    // DELETE product
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
    // API CHO ĐẶT BÀN (TABLES & RESERVATIONS)
    // ==========================================

    getTables: () => {
        return fetch(`${BASE_URL}/tables`).then(res => res.ok ? res.json() : []);
    },

    getReservations: () => {
        return fetch(`${BASE_URL}/reservations`).then(res => res.ok ? res.json() : []);
    },

    createReservation: (data) => {
        return fetch(`${BASE_URL}/reservations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(res => {
            if (!res.ok) throw new Error('Lỗi đặt bàn');
            return res.json();
        });
    },

    updateReservation: (id, data) => {
        return fetch(`${BASE_URL}/reservations/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(res => {
            if (!res.ok) throw new Error('Lỗi cập nhật đặt bàn');
            return res.json();
        });
    }
};
