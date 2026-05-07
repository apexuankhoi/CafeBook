document.addEventListener('DOMContentLoaded', () => {
    // Các biến DOM để thao tác giao diện
    const productListEl = document.getElementById('product-list');
    const loadingSpinner = document.getElementById('loading-spinner');
    const errorMessage = document.getElementById('error-message');
    const categoryFilters = document.querySelectorAll('.filter-btn');

    // Lưu trữ tạm danh sách sản phẩm lấy từ API để tiện tìm kiếm & lọc
    let allProducts = [];

    /**
     * Hàm gọi API lấy danh sách đồ uống (products)
     * Có hiển thị hiệu ứng Loading và tắt Loading sau khi tải xong.
     */
    function fetchAndRenderProducts() {
        loadingSpinner.style.display = 'flex';
        errorMessage.classList.add('d-none');
        productListEl.innerHTML = '';

        api.getProducts()
            .then(products => {
                // Đảm bảo mỗi sản phẩm đều có id duy nhất (phòng trường hợp MockAPI trả về thiếu id)
                products.forEach((p, index) => {
                    if (!p.id) p.id = p.name || `prod-${index}`;
                });
                allProducts = products;
                renderProducts(products);
            })
            .catch(err => {
                console.error(err);
                errorMessage.classList.remove('d-none');
            })
            .finally(() => {
                loadingSpinner.style.display = 'none';
            });
    }

    /**
     * Hàm render danh sách sản phẩm lên giao diện HTML.
     * Sử dụng DOM Manipulation để tạo các thẻ <div> chứa giao diện món.
     */
    function renderProducts(products) {
        productListEl.innerHTML = '';
        
        if (products.length === 0) {
            productListEl.innerHTML = '<div class="col-12 text-center text-muted py-5">Chưa có sản phẩm nào.</div>';
            return;
        }

        // Cấu trúc điều khiển vòng lặp for
        for (let i = 0; i < products.length; i++) {
            const product = products[i];
            
            // Xử lý huy hiệu (badge) bằng cấu trúc if/else
            let badgeHtml = '';
            if (product.stock && product.stock < 10) {
                badgeHtml = '<div class="badge-custom bg-danger">Sắp hết</div>';
            } else if (i < 2) { // 2 sản phẩm đầu tiên coi như Best Seller
                badgeHtml = '<div class="badge-custom">Best Seller</div>';
            }

            const col = document.createElement('div');
            col.className = 'col-sm-6 col-lg-3';
            col.innerHTML = `
                <div class="neu-card d-flex flex-column">
                    <div class="product-img-wrapper">
                        <img src="${product.image || 'https://via.placeholder.com/400x300'}" alt="${product.name}" class="product-img">
                        ${badgeHtml}
                    </div>
                    <div class="p-4 d-flex flex-column flex-grow-1">
                        <h5 class="mb-2 text-primary fw-bold">${product.name}</h5>
                        <p class="text-muted small mb-4 flex-grow-1">${product.description || 'Hương vị tuyệt hảo từ CaféBook.'}</p>
                        <div class="d-flex justify-content-between align-items-center mt-auto">
                            <span class="fs-5 fw-bold text-primary">${formatCurrency(product.price)}</span>
                            <button class="add-btn add-to-cart-btn" data-id="${product.id}">
                                <span class="material-symbols-outlined fs-5">add</span>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            productListEl.appendChild(col);
        }

        // Thêm sự kiện cho nút thêm vào giỏ hàng
        const addBtns = document.querySelectorAll('.add-to-cart-btn');
        addBtns.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const id = this.getAttribute('data-id');
                const product = allProducts.find(p => String(p.id) === String(id));
                if (product) {
                    try {
                        addToCart(product);
                        // Hiệu ứng thêm vào giỏ
                        const originalHtml = this.innerHTML;
                        this.innerHTML = '<span class="material-symbols-outlined fs-5">check</span>';
                        this.classList.add('btn-success', 'text-white');
                        setTimeout(() => {
                            this.innerHTML = originalHtml;
                            this.classList.remove('btn-success', 'text-white');
                        }, 1000);
                    } catch (err) {
                        console.error('Lỗi khi thêm vào giỏ:', err);
                    }
                }
            });
        });
    }

    // ==========================================
    // TÍNH NĂNG GIỎ HÀNG (CART)
    // ==========================================
    let cart = [];
    try {
        cart = JSON.parse(localStorage.getItem('cafe_cart')) || [];
        if (!Array.isArray(cart)) cart = [];
    } catch (e) {
        cart = [];
    }
    
    const cartOffcanvas = new bootstrap.Offcanvas(document.getElementById('cartOffcanvas'));
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalEl = document.getElementById('cart-total');

    function saveCart() {
        localStorage.setItem('cafe_cart', JSON.stringify(cart));
        updateCartUI();
    }

    function addToCart(product) {
        const existingItem = cart.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1
            });
        }
        saveCart();
    }

    function updateQuantity(id, delta) {
        const item = cart.find(item => item.id === id);
        if (item) {
            item.quantity += delta;
            if (item.quantity <= 0) {
                cart = cart.filter(i => i.id !== id);
            }
            saveCart();
        }
    }

    function updateCartUI() {
        cartItemsContainer.innerHTML = '';
        let total = 0;
        let count = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="text-center text-muted py-5 mt-5">
                    <span class="material-symbols-outlined fs-1 mb-3 opacity-50">shopping_basket</span>
                    <p>Giỏ hàng trống</p>
                    <button class="btn btn-outline-primary rounded-pill mt-2" data-bs-dismiss="offcanvas">Tiếp tục chọn món</button>
                </div>
            `;
        } else {
            cart.forEach(item => {
                total += item.price * item.quantity;
                count += item.quantity;

                const div = document.createElement('div');
                div.className = 'd-flex align-items-center gap-3 bg-white p-2 rounded-3 shadow-sm mb-2';
                div.innerHTML = `
                    <img src="${item.image || 'https://via.placeholder.com/100'}" class="rounded" style="width: 60px; height: 60px; object-fit: cover;">
                    <div class="flex-grow-1">
                        <div class="fw-bold text-dark text-truncate" style="max-width: 150px;">${item.name}</div>
                        <div class="text-primary fw-bold small">${formatCurrency(item.price)}</div>
                    </div>
                    <div class="d-flex align-items-center bg-light rounded-pill px-2 py-1">
                        <button class="btn btn-sm btn-link text-dark p-0 text-decoration-none btn-decrease" data-id="${item.id}">
                            <span class="material-symbols-outlined fs-6 align-middle">remove</span>
                        </button>
                        <span class="mx-2 fw-bold small" style="width: 20px; text-align: center;">${item.quantity}</span>
                        <button class="btn btn-sm btn-link text-dark p-0 text-decoration-none btn-increase" data-id="${item.id}">
                            <span class="material-symbols-outlined fs-6 align-middle">add</span>
                        </button>
                    </div>
                `;
                cartItemsContainer.appendChild(div);
            });

            // Gắn sự kiện tăng giảm
            cartItemsContainer.querySelectorAll('.btn-decrease').forEach(btn => {
                btn.addEventListener('click', function() { updateQuantity(this.getAttribute('data-id'), -1); });
            });
            cartItemsContainer.querySelectorAll('.btn-increase').forEach(btn => {
                btn.addEventListener('click', function() { updateQuantity(this.getAttribute('data-id'), 1); });
            });
        }

        cartTotalEl.textContent = formatCurrency(total);
        
        // Cập nhật số lượng trên icon giỏ hàng
        let badge = document.getElementById('cart-badge');
        if (count > 0) {
            if (!badge) {
                const cartBtn = document.getElementById('cart-btn');
                cartBtn.style.position = 'relative';
                badge = document.createElement('span');
                badge.id = 'cart-badge';
                badge.className = 'position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger';
                cartBtn.appendChild(badge);
            }
            badge.textContent = count;
        } else if (badge) {
            badge.remove();
        }
    }

    // Checkout
    document.getElementById('btn-checkout').addEventListener('click', () => {
        if (cart.length === 0) {
            alert('Giỏ hàng đang trống!');
            return;
        }
        alert('Cảm ơn bạn đã đặt hàng! Tổng thanh toán: ' + cartTotalEl.textContent);
        cart = [];
        saveCart();
        cartOffcanvas.hide();
    });

    // Khởi tạo giao diện giỏ hàng ban đầu
    updateCartUI();

    // Render filter buttons dynamically
    function fetchAndRenderCategories() {
        const filterContainer = document.getElementById('category-filters');
        
        api.getCategories()
            .then(categories => {
                categories.forEach(cat => {
                    const btn = document.createElement('button');
                    btn.className = 'btn btn-light rounded-pill px-4 shadow-sm filter-btn';
                    btn.setAttribute('data-category', cat.name); // Hoặc dùng cat.id tùy backend
                    btn.textContent = cat.name;
                    filterContainer.appendChild(btn);
                });
                // Attach events sau khi tạo xong
                attachFilterEvents();
            })
            .catch(err => {
                console.error("Lỗi tải danh mục: ", err);
                // Fallback nếu ko load đc
                attachFilterEvents(); 
            });
    }

    // Xử lý sự kiện lọc sản phẩm
    function attachFilterEvents() {
        const filters = document.querySelectorAll('.filter-btn');
        filters.forEach(btn => {
            btn.addEventListener('click', (e) => {
                filters.forEach(b => b.classList.remove('active', 'btn-primary-custom'));
                filters.forEach(b => b.classList.add('btn-light'));
                
                const target = e.target;
                target.classList.remove('btn-light');
                target.classList.add('active', 'btn-primary-custom');

                const category = target.getAttribute('data-category');
                
                if (category === 'all') {
                    renderProducts(allProducts);
                } else {
                    const filtered = allProducts.filter(p => p.category === category);
                    renderProducts(filtered);
                }
            });
        });
    }

    // Khởi tạo
    fetchAndRenderCategories();
    fetchAndRenderProducts();

    // ==========================================
    // MODULE ĐẶT BÀN TRỰC TUYẾN (TABLE RESERVATION)
    // - Hiển thị sơ đồ bàn (Trống/Đã đặt)
    // - Cho phép chọn ngày, giờ và Submit lên MockAPI
    // ==========================================
    const floorPlan = document.getElementById('floor-plan');
    const bookDate = document.getElementById('book-date');
    const bookTime = document.getElementById('book-time');
    const selectedTableDisplay = document.getElementById('selected-table-display');
    const bookTableIdInput = document.getElementById('book-table-id');
    const bookingForm = document.getElementById('booking-form');
    const bookingMsg = document.getElementById('booking-msg');

    // Mặc định chọn ngày hiện tại
    const today = new Date().toISOString().split('T')[0];
    bookDate.value = today;
    bookDate.min = today;

    // Giả lập danh sách 15 bàn cố định của quán
    const ALL_TABLES = Array.from({length: 15}, (_, i) => ({
        id: `T${i+1}`,
        name: `T${i+1}`,
        capacity: (i % 3 === 0) ? 4 : 2 // Mix bàn 2 và 4 chỗ
    }));

    // Lưu trữ đơn đặt bàn hiện có để check trùng
    let currentReservations = [];

    /**
     * Gọi API lấy danh sách toàn bộ các đơn Đặt bàn để từ đó
     * tính toán xem bàn nào đang bận, bàn nào trống.
     */
    function loadReservationsForFloorPlan() {
        floorPlan.innerHTML = '<div class="col-12 text-center py-5"><div class="spinner-border text-primary" role="status"></div></div>';
        
        api.getReservations()
            .then(reservations => {
                currentReservations = reservations;
                renderFloorPlan();
            })
            .catch(err => {
                console.error("Lỗi tải đặt bàn:", err);
                // Fallback: still render tables but none are blocked
                currentReservations = [];
                renderFloorPlan();
            });
    }

    function renderFloorPlan() {
        const date = bookDate.value;
        const time = bookTime.value;
        const selectedId = bookTableIdInput.value;

        floorPlan.innerHTML = '';

        ALL_TABLES.forEach(table => {
            // Check if this table is reserved at this date and time (and not cancelled)
            const isReserved = currentReservations.some(r => 
                r.tableId === table.id && 
                r.date === date && 
                r.time === time && 
                r.status !== 'Cancelled'
            );

            const isSelected = selectedId === table.id;
            
            let bgClass = 'bg-white';
            let borderClass = 'border';
            let textClass = 'text-dark';
            let cursorClass = 'cursor-pointer';
            let statusText = `${table.capacity} Chỗ`;

            if (isReserved) {
                bgClass = 'bg-light';
                textClass = 'text-muted';
                cursorClass = 'cursor-not-allowed opacity-50';
                statusText = 'Đã đặt';
            } else if (isSelected) {
                bgClass = 'bg-warning text-white border-warning';
                textClass = 'text-white';
            }

            const col = document.createElement('div');
            col.className = 'col-2 col-md-2 mb-2';
            col.innerHTML = `
                <div class="neu-card d-flex flex-column align-items-center justify-content-center p-2 ${bgClass} ${borderClass} ${cursorClass}" style="aspect-ratio: 1; transition: all 0.2s;" data-table-id="${table.id}" data-reserved="${isReserved}">
                    <span class="fw-bold fs-5 ${textClass}">${table.name}</span>
                    <span class="small" style="font-size: 0.65rem;">${statusText}</span>
                </div>
            `;
            floorPlan.appendChild(col);
        });

        // Add click events to available tables
        const tableCards = floorPlan.querySelectorAll('.neu-card');
        tableCards.forEach(card => {
            card.addEventListener('click', function() {
                if (this.getAttribute('data-reserved') === 'true') return;
                
                const tid = this.getAttribute('data-table-id');
                bookTableIdInput.value = tid;
                selectedTableDisplay.textContent = tid;
                renderFloorPlan(); // Re-render to show selection color
            });
        });
    }

    // Lắng nghe thay đổi Ngày/Giờ để cập nhật lại trạng thái Bàn
    bookDate.addEventListener('change', () => {
        bookTableIdInput.value = '';
        selectedTableDisplay.textContent = 'Chưa chọn';
        renderFloorPlan();
    });
    bookTime.addEventListener('change', () => {
        bookTableIdInput.value = '';
        selectedTableDisplay.textContent = 'Chưa chọn';
        renderFloorPlan();
    });

    /**
     * Hàm xử lý khi Form Đặt Bàn được Submit
     * Lấy dữ liệu -> Gọi API POST -> Thông báo thành công
     */
    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const tableId = bookTableIdInput.value;
        if (!tableId) {
            alert('Vui lòng chọn một bàn trống trên sơ đồ!');
            return;
        }

        const btnSubmit = document.getElementById('btn-submit-booking');
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span> Đang xử lý...';

        const reservationData = {
            customerName: document.getElementById('book-name').value.trim(),
            phone: document.getElementById('book-phone').value.trim(),
            date: bookDate.value,
            time: bookTime.value,
            guests: document.getElementById('book-guests').value,
            tableId: tableId,
            status: 'Pending', // Default status: Pending (Chờ xác nhận)
            createdAt: new Date().toISOString()
        };

        api.createReservation(reservationData)
            .then(() => {
                bookingMsg.innerHTML = '<span class="text-success"><span class="material-symbols-outlined align-middle">check_circle</span> Đặt bàn thành công! Chúng tôi sẽ liên hệ lại.</span>';
                bookingMsg.style.display = 'block';
                bookingForm.reset();
                bookDate.value = today; // Reset back to today
                bookTableIdInput.value = '';
                selectedTableDisplay.textContent = 'Chưa chọn';
                loadReservationsForFloorPlan(); // Refresh data
                
                setTimeout(() => bookingMsg.style.display = 'none', 5000);
            })
            .catch(err => {
                console.error(err);
                bookingMsg.innerHTML = '<span class="text-danger"><span class="material-symbols-outlined align-middle">error</span> Lỗi hệ thống, vui lòng thử lại!</span>';
                bookingMsg.style.display = 'block';
            })
            .finally(() => {
                btnSubmit.disabled = false;
                btnSubmit.innerHTML = 'Xác nhận đặt bàn';
            });
    });

    // Lần tải đầu tiên
    loadReservationsForFloorPlan();

    // ==========================================
    // YÊU CẦU SỬ DỤNG JQUERY
    // - Dùng jQuery cho 2 nghiệp vụ:
    // 1. Mở Offcanvas Giỏ Hàng khi click biểu tượng
    // 2. Form Nhận bản tin khuyến mãi (Ajax)
    // ==========================================
    $(document).ready(function() {
        // Sự kiện 1: jQuery .click() và .fadeOut() / .fadeIn()
        $('#cart-btn').click(function(e) {
            e.preventDefault();
            // Demo hiệu ứng jQuery
            $(this).fadeOut(100).fadeIn(100);
            cartOffcanvas.show(); // Mở Offcanvas giỏ hàng thay vì alert
        });

        // Sự kiện 2: jQuery .on() cho form Newsletter và $.ajax()
        $('#newsletter-form').on('submit', function(e) {
            e.preventDefault();
            
            const email = $('#nl-email').val();
            const $msg = $('#nl-message');
            
            // Mô phỏng gọi API bằng $.ajax
            $.ajax({
                url: 'https://jsonplaceholder.typicode.com/posts', // Dùng jsonplaceholder để test
                type: 'POST',
                data: JSON.stringify({ email: email }),
                contentType: 'application/json; charset=utf-8',
                success: function(response) {
                    // Thao tác DOM bằng jQuery: .html(), .slideDown()
                    $msg.html(`<span class="material-symbols-outlined align-middle me-1">check_circle</span> Đăng ký thành công cho email: <strong>${email}</strong>`);
                    $msg.slideDown();
                    
                    // Thao tác DOM bằng jQuery: .val()
                    $('#nl-email').val('');
                    
                    setTimeout(() => {
                        $msg.slideUp();
                    }, 5000);
                },
                error: function() {
                    $msg.html(`<span class="material-symbols-outlined align-middle me-1">error</span> Có lỗi xảy ra, vui lòng thử lại!`).removeClass('text-success').addClass('text-danger');
                    $msg.slideDown();
                }
            });
        });
    });
});
