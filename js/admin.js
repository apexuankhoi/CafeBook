document.addEventListener('DOMContentLoaded', () => {
    // Các biến DOM để thao tác giao diện quản lý
    const adminProductList = document.getElementById('admin-product-list');
    const totalProductsEl = document.getElementById('total-products');
    const form = document.getElementById('product-form');
    const productModal = new bootstrap.Modal(document.getElementById('productModal'));
    const modalTitle = document.getElementById('modalTitle');
    const btnSave = document.getElementById('btn-save');
    const saveSpinner = document.getElementById('save-spinner');

    let isEditMode = false; // Biến cờ (flag) để phân biệt giữa Thêm Mới và Cập Nhật

    /**
     * Tải danh sách Danh mục (Categories) từ API (Resource 2)
     * Đổ dữ liệu vào thẻ <select> trong form thêm/sửa sản phẩm
     */
    function loadCategories() {
        const categorySelect = document.getElementById('category');
        api.getCategories()
            .then(categories => {
                categories.forEach(cat => {
                    const option = document.createElement('option');
                    option.value = cat.name; // Dùng name làm value để dễ xử lý đồng bộ với filter
                    option.textContent = cat.name;
                    categorySelect.appendChild(option);
                });
            })
            .catch(err => console.error("Lỗi tải danh mục:", err));
    }

    /**
     * Lấy dữ liệu toàn bộ sản phẩm và hiển thị lên Bảng (Table) Quản trị
     */
    function loadProducts() {
        adminProductList.innerHTML = '<tr><td colspan="6" class="text-center py-4">Đang tải dữ liệu...</td></tr>';
        
        api.getProducts()
            .then(products => {
                totalProductsEl.textContent = products.length;
                renderAdminTable(products);
            })
            .catch(err => {
                console.error(err);
                adminProductList.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-danger">Lỗi kết nối máy chủ! Vui lòng kiểm tra lại.</td></tr>';
            });
    }

    // Render Table
    function renderAdminTable(products) {
        adminProductList.innerHTML = '';
        if (products.length === 0) {
            adminProductList.innerHTML = '<tr><td colspan="6" class="text-center py-4">Chưa có sản phẩm.</td></tr>';
            return;
        }

        products.forEach(p => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <img src="${p.image}" alt="${p.name}" class="rounded" style="width: 50px; height: 50px; object-fit: cover;">
                </td>
                <td class="fw-bold text-primary">${p.name}</td>
                <td><span class="badge bg-light text-dark border">${p.category}</span></td>
                <td class="fw-bold">${formatCurrency(p.price)}</td>
                <td>${p.stock || 0}</td>
                <td class="text-end">
                    <button class="btn btn-sm btn-outline-primary btn-edit me-1" data-id="${p.id}">
                        <span class="material-symbols-outlined fs-6 align-middle">edit</span>
                    </button>
                    <button class="btn btn-sm btn-outline-danger btn-delete" data-id="${p.id}">
                        <span class="material-symbols-outlined fs-6 align-middle">delete</span>
                    </button>
                </td>
            `;
            adminProductList.appendChild(tr);
        });

        // Add event listeners for edit and delete buttons
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', handleEditClick);
        });
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', handleDeleteClick);
        });
    }

    // Handle Delete
    function handleDeleteClick(e) {
        const id = e.currentTarget.getAttribute('data-id');
        if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này không? Thao tác không thể hoàn tác.')) {
            const btn = e.currentTarget;
            btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span>';
            btn.disabled = true;

            api.deleteProduct(id)
                .then(() => {
                    alert('Đã xóa thành công!');
                    loadProducts();
                })
                .catch(err => {
                    console.error(err);
                    alert('Xóa thất bại!');
                    btn.innerHTML = '<span class="material-symbols-outlined fs-6 align-middle">delete</span>';
                    btn.disabled = false;
                });
        }
    }

    // Handle Edit
    function handleEditClick(e) {
        const id = e.currentTarget.getAttribute('data-id');
        
        api.getProductById(id)
            .then(product => {
                isEditMode = true;
                modalTitle.textContent = 'Cập nhật sản phẩm';
                
                // Điền dữ liệu vào form
                document.getElementById('product-id').value = product.id;
                document.getElementById('name').value = product.name;
                document.getElementById('price').value = product.price;
                document.getElementById('category').value = product.category;
                document.getElementById('image').value = product.image;
                document.getElementById('stock').value = product.stock || 0;
                document.getElementById('description').value = product.description || '';
                
                resetErrors();
                productModal.show();
            })
            .catch(err => {
                console.error(err);
                alert('Không thể tải thông tin sản phẩm!');
            });
    }

    // Nút thêm mới hiển thị Modal trống
    document.getElementById('btn-add-new').addEventListener('click', () => {
        isEditMode = false;
        modalTitle.textContent = 'Thêm sản phẩm mới';
        form.reset();
        document.getElementById('product-id').value = '';
        resetErrors();
    });

    // ==========================================
    // VALIDATE FORM (YÊU CẦU BÀI TẬP)
    // - Bắt lỗi form bằng JS thuần, hiển thị thông báo dưới ô nhập
    // ==========================================
    function resetErrors() {
        document.querySelectorAll('.error-message').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.neu-input').forEach(el => el.classList.remove('is-invalid'));
    }

    function showError(id, message) {
        const input = document.getElementById(id);
        const errEl = document.getElementById(`err-${id}`);
        input.classList.add('is-invalid');
        if (message) errEl.textContent = message;
        errEl.style.display = 'block';
    }

    function isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    // Handle Form Submit
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        resetErrors();

        let isValid = true;

        // Lấy giá trị
        const id = document.getElementById('product-id').value;
        const name = document.getElementById('name').value.trim();
        const price = Number(document.getElementById('price').value);
        const category = document.getElementById('category').value;
        const image = document.getElementById('image').value.trim();
        const stock = Number(document.getElementById('stock').value) || 0;
        const description = document.getElementById('description').value.trim();

        // Validate tên
        if (!name) {
            showError('name', 'Tên sản phẩm không được để trống.');
            isValid = false;
        }

        // Validate giá
        if (!price || price <= 0) {
            showError('price', 'Giá bán phải là số lớn hơn 0.');
            isValid = false;
        }

        // Validate danh mục
        if (!category) {
            showError('category', 'Vui lòng chọn danh mục.');
            isValid = false;
        }

        // Validate ảnh (URL)
        if (!image || !isValidUrl(image)) {
            showError('image', 'Vui lòng nhập đường dẫn URL hợp lệ.');
            isValid = false;
        }

        // Ngăn submit form nếu dữ liệu không hợp lệ
        if (!isValid) return;

        // Bắt đầu lưu
        saveSpinner.classList.remove('d-none');
        btnSave.disabled = true;

        const productData = { name, price, category, image, stock, description };

        if (isEditMode) {
            // Cập nhật
            api.updateProduct(id, productData)
                .then(() => {
                    alert('Cập nhật thành công!');
                    form.reset();
                    productModal.hide();
                    loadProducts();
                })
                .catch(err => {
                    console.error(err);
                    alert('Lỗi cập nhật!');
                })
                .finally(() => {
                    saveSpinner.classList.add('d-none');
                    btnSave.disabled = false;
                });
        } else {
            // Thêm mới
            productData.createdAt = new Date().toISOString();
            api.createProduct(productData)
                .then(() => {
                    alert('Thêm mới thành công!');
                    form.reset(); // Reset form sau khi thành công
                    productModal.hide();
                    loadProducts();
                })
                .catch(err => {
                    console.error(err);
                    alert('Lỗi thêm mới!');
                })
                .finally(() => {
                    saveSpinner.classList.add('d-none');
                    btnSave.disabled = false;
                });
        }
    });



    // ==========================================
    // MODULE QUẢN LÝ ĐẶT BÀN (RESERVATIONS)
    // - Chuyển đổi tab hiển thị
    // - Lấy danh sách đặt bàn và thao tác Trạng thái, Chỉnh sửa thông tin
    // ==========================================
    const navProducts = document.getElementById('nav-products');
    const navReservations = document.getElementById('nav-reservations');
    const sectionProducts = document.getElementById('section-products');
    const sectionReservations = document.getElementById('section-reservations');
    const adminReservationList = document.getElementById('admin-reservation-list');
    const btnRefreshReservations = document.getElementById('btn-refresh-reservations');
    
    // Elements for Reservation Modal
    const reservationModal = new bootstrap.Modal(document.getElementById('reservationModal'));
    const resForm = document.getElementById('reservation-form');
    const resTableSelect = document.getElementById('res-table');
    const btnSaveRes = document.getElementById('btn-save-res');
    const saveResSpinner = document.getElementById('save-res-spinner');

    // Init table options T1-T15
    for(let i=1; i<=15; i++) {
        const opt = document.createElement('option');
        opt.value = `T${i}`;
        opt.textContent = `Bàn T${i}`;
        resTableSelect.appendChild(opt);
    }

    // Chuyển tab
    navProducts.addEventListener('click', (e) => {
        e.preventDefault();
        navReservations.classList.remove('active');
        navProducts.classList.add('active');
        sectionReservations.classList.add('d-none');
        sectionProducts.classList.remove('d-none');
    });

    navReservations.addEventListener('click', (e) => {
        e.preventDefault();
        navProducts.classList.remove('active');
        navReservations.classList.add('active');
        sectionProducts.classList.add('d-none');
        sectionReservations.classList.remove('d-none');
        loadReservations();
    });

    btnRefreshReservations.addEventListener('click', loadReservations);

    function loadReservations() {
        adminReservationList.innerHTML = '<tr><td colspan="6" class="text-center py-4">Đang tải dữ liệu...</td></tr>';
        api.getReservations()
            .then(reservations => {
                // Sắp xếp mới nhất lên đầu
                reservations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                renderReservationTable(reservations);
            })
            .catch(err => {
                console.error(err);
                adminReservationList.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-danger">Lỗi kết nối máy chủ!</td></tr>';
            });
    }

    function renderReservationTable(reservations) {
        adminReservationList.innerHTML = '';
        if (reservations.length === 0) {
            adminReservationList.innerHTML = '<tr><td colspan="6" class="text-center py-4">Chưa có đơn đặt bàn nào.</td></tr>';
            return;
        }

        reservations.forEach(r => {
            const tr = document.createElement('tr');
            
            let statusHtml = '';
            if (r.status === 'Pending') {
                statusHtml = '<span class="badge bg-warning text-dark">Chờ xác nhận</span>';
            } else if (r.status === 'Confirmed') {
                statusHtml = '<span class="badge bg-success">Đã xác nhận</span>';
            } else {
                statusHtml = '<span class="badge bg-secondary">Đã hủy</span>';
            }

            // Format datetime for display
            let dateStr = r.date;
            try {
                const parts = r.date.split('-');
                if(parts.length === 3) dateStr = `${parts[2]}/${parts[1]}/${parts[0]}`;
            } catch(e){}

            tr.innerHTML = `
                <td>
                    <div class="fw-bold text-primary">${r.customerName}</div>
                    <div class="small text-muted">${r.phone}</div>
                </td>
                <td>
                    <div class="fw-bold">${r.time}</div>
                    <div class="small text-muted">${dateStr}</div>
                </td>
                <td class="fw-bold">${r.tableId}</td>
                <td>${r.guests} người</td>
                <td>${statusHtml}</td>
                <td class="text-end">
                    <button class="btn btn-sm btn-outline-primary btn-edit-res me-1" data-id="${r.id}" title="Chỉnh sửa">
                        <span class="material-symbols-outlined fs-6 align-middle">edit</span>
                    </button>
                    ${r.status === 'Pending' ? `
                        <button class="btn btn-sm btn-outline-success btn-confirm-res me-1" data-id="${r.id}" title="Xác nhận">
                            <span class="material-symbols-outlined fs-6 align-middle">check_circle</span>
                        </button>
                    ` : ''}
                </td>
            `;
            adminReservationList.appendChild(tr);
        });

        // Add events
        document.querySelectorAll('.btn-edit-res').forEach(btn => {
            btn.addEventListener('click', function() {
                openEditReservation(this.getAttribute('data-id'));
            });
        });
        document.querySelectorAll('.btn-confirm-res').forEach(btn => {
            btn.addEventListener('click', function() {
                updateResStatus(this.getAttribute('data-id'), 'Confirmed', this);
            });
        });
    }

    function openEditReservation(id) {
        api.getReservationById(id)
            .then(res => {
                document.getElementById('res-id').value = res.id;
                document.getElementById('res-name').value = `${res.customerName} - ${res.phone}`;
                document.getElementById('res-date').value = res.date;
                document.getElementById('res-time').value = res.time;
                document.getElementById('res-table').value = res.tableId;
                document.getElementById('res-guests').value = res.guests;
                document.getElementById('res-status').value = res.status;
                
                reservationModal.show();
            })
            .catch(err => {
                console.error(err);
                alert("Không thể tải thông tin đơn đặt bàn!");
            });
    }

    // Handle Form Submit for Reservation
    resForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const id = document.getElementById('res-id').value;
        const newStatus = document.getElementById('res-status').value;
        const newDate = document.getElementById('res-date').value;
        const newTime = document.getElementById('res-time').value;
        const newTable = document.getElementById('res-table').value;
        const newGuests = document.getElementById('res-guests').value;

        btnSaveRes.disabled = true;
        saveResSpinner.classList.remove('d-none');

        // Fetch current to keep other fields intact, then update
        api.getReservationById(id)
            .then(currentRes => {
                currentRes.status = newStatus;
                currentRes.date = newDate;
                currentRes.time = newTime;
                currentRes.tableId = newTable;
                currentRes.guests = newGuests;
                return api.updateReservation(id, currentRes);
            })
            .then(() => {
                alert('Cập nhật đơn đặt bàn thành công!');
                reservationModal.hide();
                loadReservations();
            })
            .catch(err => {
                console.error(err);
                alert('Lỗi cập nhật đơn!');
            })
            .finally(() => {
                btnSaveRes.disabled = false;
                saveResSpinner.classList.add('d-none');
            });
    });

    function updateResStatus(id, newStatus, btnEl) {
        const originalHtml = btnEl.innerHTML;
        btnEl.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';
        btnEl.disabled = true;

        api.getReservationById(id)
            .then(currentRes => {
                currentRes.status = newStatus;
                return api.updateReservation(id, currentRes);
            })
            .then(() => {
                loadReservations();
            })
            .catch(err => {
                console.error(err);
                alert('Lỗi cập nhật trạng thái!');
                btnEl.innerHTML = originalHtml;
                btnEl.disabled = false;
            });
    }

    // Khởi tạo
    loadCategories();
    loadProducts();
});
