document.addEventListener('DOMContentLoaded', () => {
    const productListEl = document.getElementById('product-list');
    const loadingSpinner = document.getElementById('loading-spinner');
    const errorMessage = document.getElementById('error-message');
    const categoryFilters = document.querySelectorAll('.filter-btn');

    let allProducts = [];

    // Lấy dữ liệu sản phẩm từ API
    function fetchAndRenderProducts() {
        loadingSpinner.style.display = 'flex';
        errorMessage.classList.add('d-none');
        productListEl.innerHTML = '';

        api.getProducts()
            .then(products => {
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

    // Hiển thị danh sách sản phẩm lên HTML
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
            btn.addEventListener('click', function() {
                // Thao tác DOM cơ bản
                const id = this.getAttribute('data-id');
                alert(`Đã thêm sản phẩm ID: ${id} vào giỏ hàng!`);
            });
        });
    }

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
    // TÍNH NĂNG ĐẶT BÀN (TABLE RESERVATION)
    // ==========================================
    const floorPlan = document.getElementById('floor-plan');
    const bookDate = document.getElementById('book-date');
    const bookTime = document.getElementById('book-time');
    const selectedTableDisplay = document.getElementById('selected-table-display');
    const bookTableIdInput = document.getElementById('book-table-id');
    const bookingForm = document.getElementById('booking-form');
    const bookingMsg = document.getElementById('booking-msg');

    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    bookDate.value = today;
    bookDate.min = today;

    // Hardcode 15 tables for the demo since floor plan is fixed
    const ALL_TABLES = Array.from({length: 15}, (_, i) => ({
        id: `T${i+1}`,
        name: `T${i+1}`,
        capacity: (i % 3 === 0) ? 4 : 2 // Mix of 2-seat and 4-seat tables
    }));

    let currentReservations = [];

    // Fetch reservations to block tables
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

    // Re-render when date/time changes
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

    // Handle form submit
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

    // Load initial reservations
    loadReservationsForFloorPlan();

    // ==========================================
    // Yêu cầu sử dụng jQuery
    // ==========================================
    $(document).ready(function() {
        // Sự kiện 1: jQuery .click() và .slideDown() cho nút Giỏ hàng trên Nav
        $('#cart-btn').click(function(e) {
            e.preventDefault();
            // Demo hiệu ứng jQuery
            $(this).fadeOut(100).fadeIn(100);
            alert("Tính năng giỏ hàng đang được cập nhật!");
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
