import { createIcons, Laptop, ShoppingCart, Search, X, ArrowLeft, Star } from 'lucide';
import { laptops as initialLaptops } from './store.js';

// Initialize Lucide icons
createIcons({
    icons: { Laptop, ShoppingCart, Search, X, ArrowLeft, Star }
});

// ===== SISTEMA DE ALMACENAMIENTO Y SEGURIDAD =====

// Cargar productos desde localStorage, si no existen usar los iniciales
let laptops = [];
function loadProductsFromStorage() {
    const storedProducts = localStorage.getItem('maxstore_products');
    if (storedProducts) {
        try {
            laptops = JSON.parse(storedProducts);
        } catch (e) {
            console.error('Error al cargar productos', e);
            laptops = JSON.parse(JSON.stringify(initialLaptops));
        }
    } else {
        // Primera vez: guardar productos iniciales
        laptops = JSON.parse(JSON.stringify(initialLaptops));
        saveProductsToStorage();
    }
}

// Guardar productos en localStorage
function saveProductsToStorage() {
    try {
        localStorage.setItem('maxstore_products', JSON.stringify(laptops));
    } catch (e) {
        console.error('Error al guardar productos', e);
        alert('Error: No se pudo guardar los cambios. Verifica el espacio disponible.');
    }
}

// Cargar credenciales desde localStorage (con configuración por defecto)
function loadAdminCredentials() {
    const stored = localStorage.getItem('maxstore_admin_creds');
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            console.error('Error al cargar credenciales', e);
        }
    }
    // Credenciales por defecto (encriptadas con ROT13)
    return {
        username: 'maxstore',
        passwordHash: btoa('puno2025')  // Base64 encoding (NO ES ENCRIPTACIÓN REAL, es para ofuscación)
    };
}

// Función para verificar contraseña de forma segura
function verifyAdminPassword(enteredPassword, storedHash) {
    // Codificar la contraseña ingresada con Base64 y comparar
    const enteredHash = btoa(enteredPassword);
    return enteredHash === storedHash;
}

// Función simple para hashear (usando base64 + SHA-like simple)
function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convertir a integer de 32 bits
    }
    return Math.abs(hash).toString(16);
}

// Cargar credenciales al inicializar
const adminCredentials = loadAdminCredentials();

// State Management
let cart = [];
let currentCategory = 'all';
let searchQuery = '';
let currentSort = 'newest';
let currentPage = 1;
const productsPerPage = 20; 
let minPrice = 0;
let maxPrice = 15000;
let selectedBrands = new Set();

// Sound Effects
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const playSound = async (url) => {
    try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
        const source = audioCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioCtx.destination);
        source.start();
    } catch (e) {
        console.warn("Audio play failed", e);
    }
};

// DOM Elements
const productGrid = document.getElementById('product-grid');
const cartBtn = document.getElementById('cart-btn');
const cartOverlay = document.getElementById('cart-overlay');
const closeCartBtn = document.getElementById('close-cart');
const cartItemsContainer = document.getElementById('cart-items');
const cartCount = document.getElementById('cart-count');
const cartTotal = document.getElementById('cart-total');
const searchInput = document.getElementById('search-input');
const categoryPills = document.querySelectorAll('.pill');
const sortSelect = document.getElementById('sort-select');
const detailModal = document.getElementById('detail-modal');
const closeModalBtn = document.getElementById('close-modal');
const modalBody = document.getElementById('modal-body');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const pageInfo = document.getElementById('page-info');
const paymentModal = document.getElementById('payment-modal');
const closePaymentModalBtn = document.getElementById('close-payment-modal');
const checkoutBtn = document.querySelector('.checkout-btn');

// Admin Panel Elements
const adminToggleBtn = document.getElementById('admin-toggle-btn');
const adminPanelOverlay = document.getElementById('admin-panel-overlay');
const adminLoginDiv = document.getElementById('admin-login');
const adminDashboardDiv = document.getElementById('admin-dashboard');
const adminLoginBtn = document.getElementById('admin-login-btn');
const adminLogoutBtn = document.getElementById('admin-logout-btn');
const adminUsernameInput = document.getElementById('admin-username');
const adminPasswordInput = document.getElementById('admin-password');
const adminProductsList = document.getElementById('admin-products-list');
const adminProductEditor = document.getElementById('admin-product-editor');
const adminEditForm = document.getElementById('admin-edit-form');
const adminBackBtn = document.getElementById('admin-back-btn');
const adminSaveBtn = document.getElementById('admin-save-btn');
const adminDeleteBtn = document.getElementById('admin-delete-btn');
const adminSearchInput = document.getElementById('admin-search');
const adminCreateBtn = document.getElementById('admin-create-btn');

// Helper for stars
function renderStars(rating) {
    let stars = '';
    for(let i=0; i<5; i++) {
        stars += `<i data-lucide="star" style="width:14px; height:14px; fill: ${i < Math.floor(rating) ? '#ffb900' : 'none'}; color: #ffb900;"></i>`;
    }
    return stars;
}

// Render Products
function renderProducts() {
    let filtered = laptops.filter(laptop => {
        const matchesCat = currentCategory === 'all' || laptop.category === currentCategory;
        const matchesSearch = laptop.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesPrice = laptop.price >= minPrice && laptop.price <= maxPrice;
        const matchesBrand = selectedBrands.size === 0 || selectedBrands.has(laptop.brand);
        return matchesCat && matchesSearch && matchesPrice && matchesBrand;
    });

    // Apply Sorting
    filtered.sort((a, b) => {
        if (currentSort === 'price-asc') return a.price - b.price;
        if (currentSort === 'price-desc') return b.price - a.price;
        if (currentSort === 'newest') return b.id - a.id;
        if (currentSort === 'alpha-asc') return a.name.localeCompare(b.name);
        if (currentSort === 'alpha-desc') return b.name.localeCompare(a.name);
        return 0;
    });

    // Calculate pagination
    const totalPages = Math.ceil(filtered.length / productsPerPage);
    if (currentPage > totalPages && totalPages > 0) {
        currentPage = totalPages;
    }
    if (currentPage < 1) {
        currentPage = 1;
    }

    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const paginatedProducts = filtered.slice(startIndex, endIndex);

    productGrid.innerHTML = paginatedProducts.map(laptop => `
        <div class="product-card" data-id="${laptop.id}">
            <img src="${laptop.image}" alt="${laptop.name}" loading="lazy">
            <div class="product-info">
                <h3>${laptop.name}</h3>
                <div class="rating-row">
                    <div class="stars">${renderStars(laptop.rating)}</div>
                </div>
                <p class="price">S/ ${laptop.price.toLocaleString('es-PE')}</p>
                <div class="condition-badge"><span>${laptop.condition}</span></div>
                <button class="add-btn" data-id="${laptop.id}">Añadir a la cesta</button>
            </div>
        </div>
    `).join('');

    // Update pagination controls
    updatePaginationControls(totalPages);

    createIcons({ icons: { Star } });

    // Add click listeners to cards (excluding the button)
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-btn')) return;
            showProductDetails(card.dataset.id);
        });
    });

    // Add listeners to 'Add' buttons
    document.querySelectorAll('.add-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            addToCart(parseInt(btn.dataset.id));
        });
    });
}

function updatePaginationControls(totalPages) {
    const paginationDiv = document.getElementById('pagination');
    if (totalPages <= 1) {
        paginationDiv.style.display = 'none';
    } else {
        paginationDiv.style.display = 'flex';
        pageInfo.innerText = `Página ${currentPage} de ${totalPages}`;
        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = currentPage === totalPages;
    }
}

function addToCart(id) {
    const laptop = laptops.find(l => l.id === id);
    cart.push(laptop);
    updateCartUI();
    playSound('cart-add.mp3');
    
    // Simple visual feedback on button
    const btn = document.querySelector(`.add-btn[data-id="${id}"]`);
    if(btn) {
        const originalText = btn.innerText;
        btn.innerText = "¡Añadido!";
        btn.style.background = "#10b981";
        setTimeout(() => {
            btn.innerText = originalText;
            btn.style.background = "";
        }, 1000);
    }
}

function updateCartUI() {
    const totalItems = cart.length;
    cartCount.innerText = totalItems;
    document.getElementById('total-items').innerText = totalItems;
    
    cartItemsContainer.innerHTML = cart.map((item, index) => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <div class="cart-specs">
                    <span class="spec-badge">CPU: ${item.specs.cpu}</span>
                    <span class="spec-badge">RAM: ${item.specs.ram}</span>
                    <span class="spec-badge">GPU: ${item.specs.gpu}</span>
                </div>
                <p class="cart-price">S/ ${item.price.toLocaleString('es-PE')}</p>
            </div>
            <button class="icon-btn remove-item" data-index="${index}">
                <i data-lucide="x"></i>
            </button>
        </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + (item.price || 0), 0);
    if (cartTotal) {
        cartTotal.innerText = `S/ ${total.toLocaleString('es-PE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    }
    
    // Update payment amounts if modal is visible
    if (paymentModal && paymentModal.style.display === 'flex') {
        updatePaymentAmounts();
    }
    
    // Refresh icons for dynamic content
    createIcons({ icons: { X } });

    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.dataset.index);
            cart.splice(index, 1);
            updateCartUI();
            playSound('click.mp3');
        });
    });
}

function showProductDetails(id) {
    const laptop = laptops.find(l => l.id === parseInt(id));
    if(!laptop) return;

    modalBody.innerHTML = `
        <div class="modal-wrapper">
            <div class="modal-hero">
                <img src="${laptop.image}" class="detail-img" alt="${laptop.name}">
            </div>
            
            <div class="detail-info">
                <div class="product-header">
                    <span class="meta">OFICIAL ${laptop.brand.toUpperCase()}</span>
                    <h2>${laptop.name}</h2>
                    <div class="rating-row">
                        <div class="stars">${renderStars(laptop.rating)}</div>
                    </div>
                </div>
                
                <div class="price-section">
                    <p class="price">S/ ${laptop.price.toLocaleString('es-PE')}</p>
                    <div class="condition-badge"><span>${laptop.condition}</span></div>
                </div>
                
                <p class="description">${laptop.description}</p>
                
                <div class="specs-section">
                    <h3>Especificaciones Técnicas</h3>
                    <div class="specs-grid-detailed">
                        <div class="spec-card">
                            <div class="spec-icon">🖥️</div>
                            <div class="spec-content">
                                <span class="spec-label">Procesador</span>
                                <strong>${laptop.specs.cpu}</strong>
                            </div>
                        </div>
                        <div class="spec-card">
                            <div class="spec-icon">💾</div>
                            <div class="spec-content">
                                <span class="spec-label">Memoria RAM</span>
                                <strong>${laptop.specs.ram}</strong>
                            </div>
                        </div>
                        <div class="spec-card">
                            <div class="spec-icon">🎮</div>
                            <div class="spec-content">
                                <span class="spec-label">Tarjeta Gráfica</span>
                                <strong>${laptop.specs.gpu}</strong>
                            </div>
                        </div>
                        <div class="spec-card">
                            <div class="spec-icon">💿</div>
                            <div class="spec-content">
                                <span class="spec-label">Almacenamiento</span>
                                <strong>${laptop.specs.ssd}</strong>
                            </div>
                        </div>
                        <div class="spec-card">
                            <div class="spec-icon">📺</div>
                            <div class="spec-content">
                                <span class="spec-label">Pantalla</span>
                                <strong>${laptop.specs.screen}</strong>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="cta-section">
                    <button class="add-btn primary-btn" onclick="window.dispatchAddToCart(${laptop.id})">🛒 Agregar al Carrito</button>
                    <button class="add-btn secondary-btn" onclick="window.dispatchBuyNow(${laptop.id})">⚡ Comprar Ahora</button>
                </div>
            </div>
        </div>
    `;

    detailModal.style.display = 'flex';
    createIcons({ icons: { Star } });
    playSound('click.mp3');
}

// Global hook for the inline onclick in modal
window.dispatchAddToCart = (id) => {
    addToCart(id);
    detailModal.style.display = 'none';
};

// Buy now function - add to cart and go directly to payment
window.dispatchBuyNow = (id) => {
    addToCart(id);
    detailModal.style.display = 'none';
    // Show payment modal directly
    setTimeout(() => {
        paymentModal.style.display = 'flex';
        updatePaymentAmounts();
        playSound('click.mp3');
    }, 100);
};

// Event Listeners
cartBtn.addEventListener('click', () => {
    cartOverlay.style.display = 'flex';
    playSound('click.mp3');
});

closeCartBtn.addEventListener('click', () => {
    cartOverlay.style.display = 'none';
});

const closeCartMobileBtn = document.getElementById('close-cart-mobile');
if (closeCartMobileBtn) {
    closeCartMobileBtn.addEventListener('click', () => {
        cartOverlay.style.display = 'none';
    });
}

closeModalBtn.addEventListener('click', () => {
    detailModal.style.display = 'none';
});

searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    currentPage = 1;
    renderProducts();
});

categoryPills.forEach(pill => {
    pill.addEventListener('click', () => {
        categoryPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        currentCategory = pill.dataset.category;
        currentPage = 1;
        renderProducts();
        closeFilterSidebarOnMobile();
        playSound('click.mp3');
    });
});

sortSelect.addEventListener('change', (e) => {
    currentSort = e.target.value;
    currentPage = 1;
    renderProducts();
    playSound('click.mp3');
});

// Pagination Event Listeners
prevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        renderProducts();
        productGrid.scrollIntoView({ behavior: 'smooth' });
    }
});

nextBtn.addEventListener('click', () => {
    currentPage++;
    renderProducts();
    productGrid.scrollIntoView({ behavior: 'smooth' });
});

// Mobile Filter Toggle
const openFilterMobileBtn = document.getElementById('open-filter-mobile');
const closeFilterMobileBtn = document.getElementById('close-filter-mobile');
const filterSidebar = document.querySelector('.filter-sidebar');
const filterOverlay = document.getElementById('filter-overlay');

// Show/hide filter button based on screen size
function toggleFilterButtonVisibility() {
    if (window.innerWidth <= 768) {
        openFilterMobileBtn.style.display = 'inline-block';
    } else {
        openFilterMobileBtn.style.display = 'none';
        filterSidebar.style.transform = 'translateX(0)';
        filterOverlay.classList.remove('active');
    }
}

// Function to close filter sidebar on mobile
function closeFilterSidebarOnMobile() {
    if (window.innerWidth <= 768) {
        filterSidebar.classList.remove('active');
        filterSidebar.style.transform = 'translateX(-100%)';
        closeFilterMobileBtn.style.display = 'none';
        filterOverlay.classList.remove('active');
    }
}

// Show filter sidebar
openFilterMobileBtn.addEventListener('click', () => {
    filterSidebar.classList.add('active');
    filterSidebar.style.transform = 'translateX(0)';
    closeFilterMobileBtn.style.display = 'block';
    filterOverlay.classList.add('active');
});

// Close filter sidebar
closeFilterMobileBtn.addEventListener('click', () => {
    filterSidebar.classList.remove('active');
    filterSidebar.style.transform = 'translateX(-100%)';
    closeFilterMobileBtn.style.display = 'none';
    filterOverlay.classList.remove('active');
});

// Close filter on overlay click
if (filterOverlay) {
    filterOverlay.addEventListener('click', () => {
        closeFilterSidebarOnMobile();
    });
}

// Check on load and resize
window.addEventListener('load', toggleFilterButtonVisibility);
window.addEventListener('resize', toggleFilterButtonVisibility);

// Close overlays on outside click
window.addEventListener('click', (e) => {
    if (e.target === cartOverlay) cartOverlay.style.display = 'none';
    if (e.target === detailModal) detailModal.style.display = 'none';
    if (e.target === paymentModal) paymentModal.style.display = 'none';
});

// Update payment amounts
function updatePaymentAmounts() {
    const total = cart.reduce((sum, item) => sum + (item.price || 0), 0);
    const formattedAmount = `S/ ${total.toLocaleString('es-PE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    const transferAmountEl = document.getElementById('transfer-amount');
    const yapePamountEl = document.getElementById('yape-amount');
    const plinAmountEl = document.getElementById('plin-amount');
    
    if (transferAmountEl) transferAmountEl.innerText = formattedAmount;
    if (yapePamountEl) yapePamountEl.innerText = formattedAmount;
    if (plinAmountEl) plinAmountEl.innerText = formattedAmount;
}

// Payment Methods Event Listeners
checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
        alert('Tu carrito está vacío');
        return;
    }
    cartOverlay.style.display = 'none';
    paymentModal.style.display = 'flex';
    updatePaymentAmounts();
    playSound('click.mp3');
});

closePaymentModalBtn.addEventListener('click', () => {
    paymentModal.style.display = 'none';
});

// Transfer payment
document.getElementById('transfer-payment').addEventListener('click', function(e) {
    if (e.target.classList.contains('payment-btn')) {
        document.querySelector('.payment-modal-body').style.display = 'none';
        document.getElementById('transfer-details').style.display = 'block';
    }
});

// Back from transfer
document.getElementById('back-from-transfer').addEventListener('click', function() {
    document.getElementById('transfer-details').style.display = 'none';
    document.querySelector('.payment-modal-body').style.display = 'flex';
});

// WhatsApp transfer
document.getElementById('whatsapp-transfer-btn').addEventListener('click', function() {
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    const cartItems = cart.map(item => `• ${item.name} - S/ ${item.price.toLocaleString('es-PE')}`).join('%0A');
    const message = `¡Hola! 👋 Ya realicé mi transferencia bancaria. Aquí está mi comprobante:%0A%0AProductos:%0A${cartItems}%0A%0ATotal: S/ ${total.toLocaleString('es-PE')}%0A%0APor favor, adjunta el archivo de mi comprobante a continuación.`;
    window.open(`https://wa.me/51981839480?text=${message}`, '_blank');
    cart = [];
    updateCartUI();
    paymentModal.style.display = 'none';
    cartOverlay.style.display = 'none';
    playSound('click.mp3');
});

// Yape payment
document.getElementById('yape-payment').addEventListener('click', function(e) {
    if (e.target.classList.contains('payment-btn')) {
        document.querySelector('.payment-modal-body').style.display = 'none';
        document.getElementById('yape-details').style.display = 'block';
    }
});

// Back from yape
document.getElementById('back-from-yape').addEventListener('click', function() {
    document.getElementById('yape-details').style.display = 'none';
    document.querySelector('.payment-modal-body').style.display = 'flex';
});

// WhatsApp yape
document.getElementById('whatsapp-yape-btn').addEventListener('click', function() {
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    const cartItems = cart.map(item => `• ${item.name} - S/ ${item.price.toLocaleString('es-PE')}`).join('%0A');
    const message = `¡Hola! 👋 Ya realicé mi pago por Yape. Aquí está mi comprobante:%0A%0AProductos:%0A${cartItems}%0A%0ATotal: S/ ${total.toLocaleString('es-PE')}%0A%0APor favor, adjunta el archivo de mi comprobante a continuación.`;
    window.open(`https://wa.me/51981839480?text=${message}`, '_blank');
    cart = [];
    updateCartUI();
    paymentModal.style.display = 'none';
    cartOverlay.style.display = 'none';
    playSound('click.mp3');
});

// Plin payment
document.getElementById('plin-payment').addEventListener('click', function(e) {
    if (e.target.classList.contains('payment-btn')) {
        document.querySelector('.payment-modal-body').style.display = 'none';
        document.getElementById('plin-details').style.display = 'block';
    }
});

// Back from plin
document.getElementById('back-from-plin').addEventListener('click', function() {
    document.getElementById('plin-details').style.display = 'none';
    document.querySelector('.payment-modal-body').style.display = 'flex';
});

// WhatsApp plin
document.getElementById('whatsapp-plin-btn').addEventListener('click', function() {
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    const cartItems = cart.map(item => `• ${item.name} - S/ ${item.price.toLocaleString('es-PE')}`).join('%0A');
    const message = `¡Hola! 👋 Ya realicé mi pago por Plin. Aquí está mi comprobante:%0A%0AProductos:%0A${cartItems}%0A%0ATotal: S/ ${total.toLocaleString('es-PE')}%0A%0APor favor, adjunta el archivo de mi comprobante a continuación.`;
    window.open(`https://wa.me/51981839480?text=${message}`, '_blank');
    cart = [];
    updateCartUI();
    paymentModal.style.display = 'none';
    cartOverlay.style.display = 'none';
    playSound('click.mp3');
});

// WhatsApp contact
document.getElementById('whatsapp-payment').addEventListener('click', function(e) {
    if (e.target.classList.contains('payment-btn')) {
        const total = cart.reduce((sum, item) => sum + item.price, 0);
        const cartItems = cart.map(item => `• ${item.name} - S/ ${item.price.toLocaleString('es-PE')}`).join('%0A');
        const message = `Hola, tengo un pedido pendiente:%0A${cartItems}%0A%0ATotal: S/ ${total.toLocaleString('es-PE')}%0A%0a¿Cuál es la forma de pago disponible?`;
        window.open(`https://wa.me/51981839480?text=${message}`, '_blank');
        playSound('click.mp3');
    }
});

// ===== ADMIN PANEL FUNCTIONALITY =====
let adminLoggedIn = false;
let editingProductId = null;
let currentImageUrl = '';

// Admin Login
adminLoginBtn.addEventListener('click', () => {
    const username = adminUsernameInput.value.trim();
    const password = adminPasswordInput.value.trim();
    
    // Verificación segura de credenciales
    if (username === adminCredentials.username && verifyAdminPassword(password, adminCredentials.passwordHash)) {
        adminLoggedIn = true;
        adminLoginDiv.style.display = 'none';
        adminDashboardDiv.style.display = 'flex';
        loadAdminProducts();
        playSound('click.mp3');
    } else {
        alert('Usuario o contraseña incorrecta');
        adminPasswordInput.value = '';
    }
});

// Admin Logout
adminLogoutBtn.addEventListener('click', () => {
    adminLoggedIn = false;
    adminLoginDiv.style.display = 'flex';
    adminDashboardDiv.style.display = 'none';
    adminUsernameInput.value = '';
    adminPasswordInput.value = '';
    adminPanelOverlay.style.display = 'none';
    playSound('click.mp3');
});

// Load Products in Admin List
function loadAdminProducts(searchTerm = '') {
    const filteredProducts = laptops.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toString().includes(searchTerm)
    );

    adminProductsList.innerHTML = filteredProducts.map(product => `
        <div class="admin-product-item">
            <div class="admin-product-info">
                <h4>${product.name} (ID: ${product.id})</h4>
                <p>Precio: S/ ${product.price.toLocaleString('es-PE')} | Categoría: ${product.category} | Rating: ${product.rating}★</p>
            </div>
            <div class="admin-product-buttons">
                <button class="admin-product-edit-btn" onclick="openProductEditor(${product.id})">Editar</button>
                <button class="admin-product-delete-btn" onclick="deleteProductDirect(${product.id})">Eliminar</button>
            </div>
        </div>
    `).join('');
}

// Open Product Editor
window.openProductEditor = function(productId) {
    editingProductId = productId;
    const product = laptops.find(p => p.id === productId);
    
    if (!product) return;

    // Fill form with product data
    document.getElementById('admin-product-id').value = product.id;
    document.getElementById('admin-product-name').value = product.name;
    document.getElementById('admin-product-brand').value = product.brand || '';
    document.getElementById('admin-product-price').value = product.price;
    document.getElementById('admin-product-image').value = product.image;
    document.getElementById('admin-product-category').value = product.category;
    document.getElementById('admin-product-cpu').value = product.specs.cpu;
    document.getElementById('admin-product-ram').value = product.specs.ram;
    document.getElementById('admin-product-gpu').value = product.specs.gpu;
    document.getElementById('admin-product-ssd').value = product.specs.ssd;
    document.getElementById('admin-product-screen').value = product.specs.screen;
    document.getElementById('admin-product-description').value = product.description;
    document.getElementById('admin-product-condition').value = product.condition || 'Sellado';
    document.getElementById('admin-product-rating').value = product.rating;
    document.getElementById('admin-product-stock').value = product.stock || 0;

    // Show image preview
    updateImagePreview();

    // Show/hide delete button
    adminDeleteBtn.style.display = 'block';

    adminProductEditor.style.display = 'block';
    playSound('click.mp3');
};

// Función para convertir y redimensionar imágenes
function processAndConvertImage(file, callback) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const img = new Image();
        
        img.onload = function() {
            // Crear canvas para redimensionar y convertir
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Dimensiones objetivo (600x600 es ideal para productos)
            const maxWidth = 600;
            const maxHeight = 600;
            
            let width = img.width;
            let height = img.height;
            
            // Calcular nuevas dimensiones manteniendo proporción
            if (width > height) {
                if (width > maxWidth) {
                    height = Math.round(height * (maxWidth / width));
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width = Math.round(width * (maxHeight / height));
                    height = maxHeight;
                }
            }
            
            canvas.width = width;
            canvas.height = height;
            
            // Dibujar imagen redimensionada
            ctx.drawImage(img, 0, 0, width, height);
            
            // Convertir a PNG o JPG según extensión
            const fileExtension = file.name.split('.').pop().toLowerCase();
            let outputFormat = 'image/jpeg';
            let outputExtension = 'jpg';
            
            // Si es PNG, GIF o transparencia, usar PNG
            if (fileExtension === 'png' || fileExtension === 'gif' || fileExtension === 'webp') {
                outputFormat = 'image/png';
                outputExtension = 'png';
            } else if (fileExtension === 'heic' || fileExtension === 'heif') {
                // HEIC de Apple se convierte a JPG
                outputFormat = 'image/jpeg';
                outputExtension = 'jpg';
            }
            
            // Convertir canvas a base64 con compresión
            let quality = 0.85; // 85% de calidad para balance entre tamaño y calidad
            const base64Image = canvas.toDataURL(outputFormat, quality);
            
            // Obtener tamaño en KB
            const sizeInKB = (base64Image.length / 1024).toFixed(2);
            
            callback({
                base64: base64Image,
                format: outputExtension,
                size: sizeInKB,
                width: width,
                height: height
            });
        };
        
        img.onerror = function() {
            console.error('Error al cargar la imagen');
            callback(null);
        };
        
        // Cargar la imagen desde el data URL
        img.src = e.target.result;
    };
    
    reader.onerror = function() {
        console.error('Error al leer el archivo');
        callback(null);
    };
    
    reader.readAsDataURL(file);
}

// Update Image Preview
function updateImagePreview() {
    const imageInput = document.getElementById('admin-product-image');
    const imageUrl = document.getElementById('admin-product-image-url').value.trim();
    const previewDiv = document.getElementById('admin-image-preview');
    const statusDiv = document.getElementById('admin-image-upload-status');
    
    // Si hay una URL de imagen (prioritario)
    if (imageUrl) {
        // Validar que sea una URL válida
        try {
            new URL(imageUrl);
            currentImageUrl = imageUrl;
            previewDiv.innerHTML = `<img src="${imageUrl}" alt="Preview" style="max-width: 100%; max-height: 300px; object-fit: contain;" onerror="this.parentElement.innerHTML='<p style=\"color: red;\">Error: No se pudo cargar la imagen</p>'">` ;
            statusDiv.innerHTML = `<p style="color: green; font-size: 0.9rem;">✓ URL de imagen válida y lista</p>`;
        } catch (e) {
            statusDiv.innerHTML = `<p style="color: red; font-size: 0.9rem;">✗ URL inválida. Ingresa una URL completa (ej: https://...)</p>`;
            currentImageUrl = '';
        }
    } 
    // Si hay un archivo seleccionado
    else if (imageInput.files && imageInput.files[0]) {
        const file = imageInput.files[0];
        const reader = new FileReader();
        
        reader.onload = function(e) {
            currentImageUrl = e.target.result;
            previewDiv.innerHTML = `<img src="${e.target.result}" alt="Preview" style="max-width: 100%; max-height: 300px; object-fit: contain;">`;
            const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
            statusDiv.innerHTML = `<p style="color: green; font-size: 0.9rem;">✓ Archivo cargado<br>Tamaño: ${sizeMB}MB</p>`;
        };
        
        reader.readAsDataURL(file);
    } 
    // Limpiar si no hay nada
    else {
        currentImageUrl = '';
        previewDiv.innerHTML = '<p style="color: var(--text-muted);">Aquí aparecerá la vista previa de tu imagen</p>';
        statusDiv.innerHTML = '';
    }
}

// Image preview on file input change
document.getElementById('admin-product-image').addEventListener('change', function(e) {
    updateImagePreview();
});

// Image preview on URL input change
document.getElementById('admin-product-image-url').addEventListener('input', function(e) {
    updateImagePreview();
});

// Camera button functionality
document.getElementById('admin-camera-btn').addEventListener('click', function(e) {
    e.preventDefault();
    // Simular clic en input de archivo pero con capture para móvil
    const fileInput = document.getElementById('admin-product-image');
    fileInput.setAttribute('capture', 'environment');
    fileInput.click();
});

// Admin Back Button
adminBackBtn.addEventListener('click', () => {
    adminProductEditor.style.display = 'none';
    editingProductId = null;
    playSound('click.mp3');
});

// Direct delete product from list (without opening editor)
window.deleteProductDirect = function(productId) {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) {
        return;
    }

    const productIndex = laptops.findIndex(p => p.id === productId);
    if (productIndex === -1) return;

    laptops.splice(productIndex, 1);
    saveProductsToStorage();

    alert('Producto eliminado correctamente');
    loadAdminProducts();
    renderProducts();
    playSound('click.mp3');
};

// Admin Delete Product
adminDeleteBtn.addEventListener('click', () => {
    if (editingProductId === null) return;

    if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) {
        return;
    }

    const productIndex = laptops.findIndex(p => p.id === editingProductId);
    if (productIndex === -1) return;

    laptops.splice(productIndex, 1);
    saveProductsToStorage();

    alert('Producto eliminado correctamente');
    adminProductEditor.style.display = 'none';
    editingProductId = null;
    loadAdminProducts();
    renderProducts();
    playSound('click.mp3');
});

// Admin Create New Product
adminCreateBtn.addEventListener('click', () => {
    editingProductId = null;

    // Clear form for new product
    document.getElementById('admin-product-id').value = '';
    document.getElementById('admin-product-name').value = '';
    document.getElementById('admin-product-brand').value = '';
    document.getElementById('admin-product-price').value = '';
    document.getElementById('admin-product-image').value = '';
    document.getElementById('admin-product-category').value = 'Laptops';
    document.getElementById('admin-product-cpu').value = '';
    document.getElementById('admin-product-ram').value = '';
    document.getElementById('admin-product-gpu').value = '';
    document.getElementById('admin-product-ssd').value = '';
    document.getElementById('admin-product-screen').value = '';
    document.getElementById('admin-product-description').value = '';
    document.getElementById('admin-product-condition').value = 'Sellado';
    document.getElementById('admin-product-rating').value = '4';
    document.getElementById('admin-product-stock').value = '';

    // Hide delete button for new product
    adminDeleteBtn.style.display = 'none';

    // Show preview div clear
    document.getElementById('admin-image-preview').innerHTML = '<p style="color: var(--text-muted);">Vista previa de imagen</p>';

    adminProductEditor.style.display = 'block';
    playSound('click.mp3');
});

// Save Product (handles both new and existing products)
const originalSaveHandler = adminSaveBtn.onclick;
adminSaveBtn.addEventListener('click', () => {
    if (editingProductId === null) {
        // Creating new product
        const newProduct = {
            id: Math.max(...laptops.map(p => p.id), 0) + 1,
            name: document.getElementById('admin-product-name').value,
            brand: document.getElementById('admin-product-brand').value,
            price: parseFloat(document.getElementById('admin-product-price').value),
            image: currentImageUrl,
            category: document.getElementById('admin-product-category').value,
            specs: {
                cpu: document.getElementById('admin-product-cpu').value,
                ram: document.getElementById('admin-product-ram').value,
                gpu: document.getElementById('admin-product-gpu').value,
                ssd: document.getElementById('admin-product-ssd').value,
                screen: document.getElementById('admin-product-screen').value
            },
            description: document.getElementById('admin-product-description').value,
            condition: document.getElementById('admin-product-condition').value,
            rating: parseFloat(document.getElementById('admin-product-rating').value),
            stock: parseInt(document.getElementById('admin-product-stock').value) || 0
        };

        if (!newProduct.name || !newProduct.price || !newProduct.image) {
            alert('Por favor completa: nombre, precio e imagen');
            return;
        }

        laptops.push(newProduct);
        saveProductsToStorage();

        alert('Producto creado correctamente');
        adminProductEditor.style.display = 'none';
        editingProductId = null;
        loadAdminProducts();
        renderProducts();
        playSound('click.mp3');
    } else {
        // Editing existing product
        const productIndex = laptops.findIndex(p => p.id === editingProductId);
        if (productIndex === -1) return;

        const updatedProduct = {
            ...laptops[productIndex],
            name: document.getElementById('admin-product-name').value,
            brand: document.getElementById('admin-product-brand').value,
            price: parseFloat(document.getElementById('admin-product-price').value),
            image: currentImageUrl,
            category: document.getElementById('admin-product-category').value,
            specs: {
                cpu: document.getElementById('admin-product-cpu').value,
                ram: document.getElementById('admin-product-ram').value,
                gpu: document.getElementById('admin-product-gpu').value,
                ssd: document.getElementById('admin-product-ssd').value,
                screen: document.getElementById('admin-product-screen').value
            },
            description: document.getElementById('admin-product-description').value,
            condition: document.getElementById('admin-product-condition').value,
            rating: parseFloat(document.getElementById('admin-product-rating').value),
            stock: parseInt(document.getElementById('admin-product-stock').value) || 0
        };

        laptops[productIndex] = updatedProduct;
        saveProductsToStorage();

        alert('Producto actualizado correctamente');
        adminProductEditor.style.display = 'none';
        loadAdminProducts();
        renderProducts();
        playSound('click.mp3');
    }
});

// Admin Search
adminSearchInput.addEventListener('input', (e) => {
    loadAdminProducts(e.target.value);
});

// Admin Toggle Button
adminToggleBtn.addEventListener('click', () => {
    adminPanelOverlay.style.display = adminPanelOverlay.style.display === 'none' ? 'flex' : 'none';
    if (adminPanelOverlay.style.display === 'flex' && !adminLoggedIn) {
        adminLoginDiv.style.display = 'flex';
        adminDashboardDiv.style.display = 'none';
    }
    playSound('click.mp3');
});

// Close admin panel when clicking overlay
adminPanelOverlay.addEventListener('click', (e) => {
    if (e.target === adminPanelOverlay) {
        adminPanelOverlay.style.display = 'none';
    }
});

// ===== FILTER SIDEBAR FUNCTIONALITY =====

// Initialize brands list
function initializeBrandsList() {
    const brands = [...new Set(laptops.map(l => l.brand))].sort();
    const brandsList = document.getElementById('brands-list');
    
    brandsList.innerHTML = brands.map(brand => `
        <div class="brand-checkbox">
            <input type="checkbox" id="brand-${brand}" value="${brand}">
            <label for="brand-${brand}">${brand}</label>
        </div>
    `).join('');
    
    // Add event listeners
    document.querySelectorAll('.brand-checkbox input').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                selectedBrands.add(e.target.value);
            } else {
                selectedBrands.delete(e.target.value);
            }
            currentPage = 1;
            renderProducts();
            closeFilterSidebarOnMobile();
        });
    });
}

// Price slider
const priceSlider = document.getElementById('price-slider');
const priceMinInput = document.getElementById('price-min');
const priceMaxInput = document.getElementById('price-max');
const sliderMinLabel = document.getElementById('slider-min-label');
const sliderMaxLabel = document.getElementById('slider-max-label');
const applyPriceBtn = document.getElementById('apply-price-btn');

// Update slider display
function updatePriceDisplay() {
    sliderMinLabel.textContent = `S/ ${minPrice}`;
    sliderMaxLabel.textContent = `S/ ${maxPrice}`;
    priceMinInput.value = minPrice;
    priceMaxInput.value = maxPrice;
}

// Price slider change
priceSlider.addEventListener('input', (e) => {
    maxPrice = parseInt(e.target.value);
    updatePriceDisplay();
});

// Apply price button
applyPriceBtn.addEventListener('click', () => {
    const inputMin = parseInt(priceMinInput.value) || 0;
    const inputMax = parseInt(priceMaxInput.value) || 5000;
    
    if (inputMin < 0 || inputMax < inputMin) {
        alert('Por favor ingresa un rango de precio válido');
        return;
    }
    
    minPrice = inputMin;
    maxPrice = inputMax;
    priceSlider.value = maxPrice;
    updatePriceDisplay();
    currentPage = 1;
    renderProducts();
    closeFilterSidebarOnMobile();
});

// Price inputs on enter
[priceMinInput, priceMaxInput].forEach(input => {
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            applyPriceBtn.click();
        }
    });
});

// ===== INICIALIZACIÓN =====
// Cargar productos desde localStorage al abrir la página
loadProductsFromStorage();

// Initialize filters
initializeBrandsList();
updatePriceDisplay();
// Ensure the sort select reflects the default sort
if (sortSelect) sortSelect.value = currentSort;

// Initial Render
updateCartUI();
renderProducts();