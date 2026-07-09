// Cấu hình URL gốc của API (Trỏ tới MockAPI) - Nơi lưu trữ dữ liệu của ứng dụng
const BASE_URL = 'https://69fbe478fce564e25916f8c0.mockapi.io/api/cafeshop';

// Object api chứa tất cả các hàm gọi HTTP Request (GET, POST, PUT, DELETE)
// Sử dụng Fetch API và Promise để xử lý dữ liệu bất đồng bộ (gửi request và đợi phản hồi)
const api = {
    // GET: Lấy danh sách danh mục sản phẩm
    getCategories: () => {
        // Gửi request GET tới endpoint /products để lấy toàn bộ sản phẩm
        return fetch(`${BASE_URL}/products`)
            // Kiểm tra nếu request thành công (res.ok) thì chuyển dữ liệu sang JSON, nếu lỗi thì trả về mảng rỗng
            .then(res => res.ok ? res.json() : [])
            .then(products => {
                // Lọc danh mục duy nhất từ các sản phẩm hiện có
                // Sử dụng Set để loại bỏ các danh mục trùng lặp, sau đó dùng filter(c => c) để bỏ đi các giá trị rỗng/null
                const uniqueCats = [...new Set(products.map(p => p.category).filter(c => c))];
                // Chuyển đổi mảng chuỗi thành mảng các object có định dạng { id: ..., name: ... } để dễ dàng hiển thị lên giao diện
                return uniqueCats.map((cat, index) => ({ id: String(index + 1), name: cat }));
            });
    },

    // GET: Lấy toàn bộ danh sách sản phẩm
    getProducts: () => {
        return fetch(`${BASE_URL}/products`)
            .then(response => {
                // Nếu server trả về lỗi (404, 500...), ném ra lỗi để xử lý ở khối catch() bên ngoài
                if (!response.ok) {
                    throw new Error('Lỗi khi tải danh sách sản phẩm');
                }
                // Nếu thành công, parse dữ liệu JSON từ body của response
                return response.json();
            })
            // MockAPI đôi khi trả về trường ID viết hoa (Id) hoặc viết thường (id), 
            // hàm map này giúp đồng bộ tất cả thành chữ thường để không bị lỗi lúc gọi id
            .then(data => data.map(item => ({ ...item, id: item.id || item.Id })));
    },

    // GET: Lấy chi tiết một sản phẩm dựa vào ID
    getProductById: (id) => {
        // Nối ID vào URL để chỉ định rõ sản phẩm nào cần lấy
        return fetch(`${BASE_URL}/products/${id}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Lỗi khi tải sản phẩm');
                }
                return response.json();
            })
            // Tương tự, đồng bộ trường ID cho đối tượng trả về
            .then(data => ({ ...data, id: data.id || data.Id }));
    },

    // POST: Thêm mới một sản phẩm vào cơ sở dữ liệu
    createProduct: (productData) => {
        return fetch(`${BASE_URL}/products`, {
            method: 'POST', // Sử dụng phương thức POST để tạo mới
            headers: {
                'Content-Type': 'application/json' // Định dạng gửi đi là JSON
            },
            // Chuyển đổi object JS thành chuỗi JSON để gửi lên server
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

    // PUT: Cập nhật thông tin của một sản phẩm đã có (dựa vào ID)
    updateProduct: (id, productData) => {
        return fetch(`${BASE_URL}/products/${id}`, {
            method: 'PUT', // Sử dụng phương thức PUT để ghi đè/cập nhật dữ liệu
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
            method: 'DELETE' // Sử dụng phương thức DELETE để yêu cầu server xóa dòng dữ liệu này
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

    // GET: Lấy danh sách các bàn (nếu có bảng tables trên MockAPI)
    getTables: () => {
        return fetch(`${BASE_URL}/tables`).then(res => res.ok ? res.json() : []);
    },

    // GET: Lấy toàn bộ danh sách các đơn đặt bàn
    getReservations: () => {
        return fetch(`${BASE_URL}/reservations`)
            .then(res => res.ok ? res.json() : [])
            .then(data => data.map(item => ({ ...item, id: item.id || item.Id })));
    },

    // GET: Lấy chi tiết đơn đặt bàn theo ID
    getReservationById: (id) => {
        return fetch(`${BASE_URL}/reservations/${id}`)
            .then(res => {
                if (!res.ok) throw new Error('Không tìm thấy đơn đặt bàn');
                return res.json();
            })
            .then(data => ({ ...data, id: data.id || data.Id }));
    },

    // POST: Tạo mới một đơn đặt bàn
    createReservation: (data) => {
        return fetch(`${BASE_URL}/reservations`, {
            method: 'POST', // Tạo mới đơn đặt bàn
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(res => {
            if (!res.ok) throw new Error('Lỗi đặt bàn');
            return res.json();
        }).then(data => ({ ...data, id: data.id || data.Id }));
    },

    // PUT: Cập nhật trạng thái hoặc thông tin của đơn đặt bàn (Chờ xác nhận -> Đã xác nhận / Đã hủy)
    updateReservation: (id, data) => {
        return fetch(`${BASE_URL}/reservations/${id}`, {
            method: 'PUT', // Ghi đè/cập nhật thông tin đơn đặt bàn theo ID
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(res => {
            if (!res.ok) throw new Error('Lỗi cập nhật đặt bàn');
            return res.json();
        }).then(data => ({ ...data, id: data.id || data.Id }));
    }
};
