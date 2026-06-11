document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const productsGrid = document.getElementById('products-grid');
    const categoryFilters = document.getElementById('category-filters');
    const floatingCartBtn = document.getElementById('floating-cart-btn');
    const cartBadge = document.getElementById('cart-badge');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartSidebar = document.getElementById('cart-sidebar');
    const closeCartBtn = document.getElementById('close-cart-btn');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalPrice = document.getElementById('cart-total-price');
    const checkoutBtn = document.getElementById('checkout-btn');
    const deliverySelect = document.getElementById('delivery-select');
    const addressFields = document.getElementById('address-fields');
    const legalCheckbox = document.getElementById('legal-checkbox');

    // Cart State
    let cart = JSON.parse(sessionStorage.getItem('jorgazo_cart')) || [];
    let products = [];
    let currentCategory = 'Todos';

    // Constants
    const BIZUM_PHONE = "PENDIENTE";
    const CHECKOUT_FORM_URL = "https://forms.gle/j3ASQYjUX1ki21x2A";

    // Initialize Store
    const init = async () => {
        if (!productsGrid) return; 

        try {
            const response = await fetch('../../data/products.json');
            if (!response.ok) throw new Error('No se pudo cargar el catalogo');
            
            products = await response.json();
            
            // Render initial state
            renderFilters(products);
            renderProducts(products);
            updateCartUI();
        } catch (error) {
            console.error('Error inicializando la tienda:', error);
            productsGrid.innerHTML = '<p style="text-align:center; color:red; grid-column:1/-1;">Error al cargar el merchandising. Vuelve mas tarde.</p>';
        }
    };

    const tallasPrimark = {
        "Hombre": ["XS", "S", "M", "L", "XL", "XXL", "3XL"],
        "Mujer": ["2XS", "XS", "S", "M", "L", "XL", "XXL"],
        "Niño/a": ["1.5-2 años", "2-3 años", "3-4 años", "4-5 años", "5-6 años", "7-8 años", "9-10 años", "11-12 años", "13-14 años", "14-15 años", "15-16 años"]
    };

    // Render Filters
    const renderFilters = (allProducts) => {
        if (!categoryFilters) return;
        const categories = ['Todos', ...new Set(allProducts.map(p => p.category).filter(Boolean))];
        let filterHtml = '';
        categories.forEach(cat => {
            const activeClass = currentCategory === cat ? 'active' : '';
            filterHtml += `<button class="filter-btn ${activeClass}" data-category="${utils.escapeHtml(cat)}">${utils.escapeHtml(cat)}</button>`;
        });
        categoryFilters.innerHTML = filterHtml;
    };

    // Render Products Grid
    const renderProducts = (allProducts) => {
        if (allProducts.length === 0) {
            productsGrid.innerHTML = '<p style="text-align:center; grid-column:1/-1;">Pronto anunciaremos el merchandising.</p>';
            return;
        }

        const filteredProducts = currentCategory === 'Todos' ? allProducts : allProducts.filter(p => p.category === currentCategory);

        if (filteredProducts.length === 0) {
            productsGrid.innerHTML = '<p style="text-align:center; grid-column:1/-1;">No hay productos en esta categoría.</p>';
            return;
        }

        let html = '';
        filteredProducts.forEach((product, index) => {
            const isClothing = product.category === 'Camisetas' || product.category === 'Sudaderas';
            let sizesHtml = '';
            
            if (isClothing) {
                sizesHtml = tallasPrimark["Hombre"].map(size => `<option value="${utils.escapeHtml(size)}">${utils.escapeHtml(size)}</option>`).join('');
            } else if (product.sizes) {
                sizesHtml = product.sizes.map(size => `<option value="${utils.escapeHtml(size)}">${utils.escapeHtml(size)}</option>`).join('');
            }
            
            const colorsHtml = product.colors ? product.colors.map(color => `<option value="${utils.escapeHtml(color)}">${utils.escapeHtml(color)}</option>`).join('') : '';
            
            // Destacado & Stock
            const destacadoClass = product.destacado ? 'destacado' : '';
            const stockVal = parseInt(product.stock) || 0;
            const isOutOfStock = stockVal <= 0;
            const stockText = isOutOfStock ? 'AGOTADO' : (stockVal <= 10 ? `¡Últimas ${stockVal} unidades!` : `En stock`);
            const stockClass = isOutOfStock ? 'out-of-stock' : '';

            html += `
                <article class="product-card ${destacadoClass}" data-aos="fade-up" data-aos-delay="${(index % 4) * 100}">
                    <div class="product-image-container">
                        <img src="${utils.sanitizeUrl(product.image)}" alt="${utils.escapeHtml(product.name)}" loading="lazy">
                    </div>
                    <div class="product-info">
                        <h3 class="product-title">${utils.escapeHtml(product.name)}</h3>
                        <div class="product-price">${Number(product.price).toFixed(2)}€</div>
                        <div class="product-stock ${stockClass}">${utils.escapeHtml(stockText)}</div>
                        <p class="product-description">${utils.escapeHtml(product.description)}</p>
                        
                        <div class="product-options">
                            ${isClothing ? `
                            <div class="option-group">
                                <label for="genre-${utils.escapeHtml(product.id)}">Tallaje</label>
                                <select id="genre-${utils.escapeHtml(product.id)}" class="custom-select genre-select" data-id="${utils.escapeHtml(product.id)}" ${isOutOfStock ? 'disabled' : ''}>
                                    <option value="Hombre">Hombre</option>
                                    <option value="Mujer">Mujer</option>
                                    <option value="Niño/a">Niño/a</option>
                                </select>
                            </div>` : ''}
                            ${sizesHtml ? `
                            <div class="option-group">
                                <label for="size-${utils.escapeHtml(product.id)}">Talla</label>
                                <select id="size-${utils.escapeHtml(product.id)}" class="custom-select size-select" ${isOutOfStock ? 'disabled' : ''}>
                                    ${sizesHtml}
                                </select>
                            </div>` : ''}
                            ${colorsHtml ? `
                            <div class="option-group">
                                <label for="color-${utils.escapeHtml(product.id)}">Color</label>
                                <select id="color-${utils.escapeHtml(product.id)}" class="custom-select" ${isOutOfStock ? 'disabled' : ''}>
                                    ${colorsHtml}
                                </select>
                            </div>` : ''}
                            <div class="option-group">
                                <label for="qty-${utils.escapeHtml(product.id)}">Cantidad</label>
                                <input type="number" id="qty-${utils.escapeHtml(product.id)}" class="custom-select" min="1" max="${isOutOfStock ? 0 : Math.min(20, stockVal)}" value="${isOutOfStock ? 0 : 1}" style="text-align:center;" ${isOutOfStock ? 'disabled' : ''}>
                            </div>
                        </div>
                        
                        <button class="add-to-cart-btn" data-id="${utils.escapeHtml(product.id)}" ${isOutOfStock ? 'disabled' : ''}>
                            <i class="fas fa-cart-plus"></i> ${isOutOfStock ? 'Agotado' : 'Añadir a la cesta'}
                        </button>
                    </div>
                </article>
            `;
        });

        productsGrid.innerHTML = html;
    };

    // Event Delegation para Tienda
    document.addEventListener('click', (e) => {
        // Filter Buttons
        if (e.target.classList.contains('filter-btn')) {
            currentCategory = e.target.getAttribute('data-category');
            renderFilters(products);
            renderProducts(products);
            return;
        }

        // Add to Cart Buttons
        if (e.target.classList.contains('add-to-cart-btn') || e.target.closest('.add-to-cart-btn')) {
            const btn = e.target.classList.contains('add-to-cart-btn') ? e.target : e.target.closest('.add-to-cart-btn');
            if (btn.disabled) return;
            const productId = btn.getAttribute('data-id');
            addToCart(productId);
            return;
        }

        // Remove from cart buttons
        if (e.target.classList.contains('remove-item-btn') || e.target.closest('.remove-item-btn')) {
            const btn = e.target.classList.contains('remove-item-btn') ? e.target : e.target.closest('.remove-item-btn');
            const index = parseInt(btn.getAttribute('data-index'), 10);
            removeFromCart(index);
            return;
        }

        // Cart Qty Buttons (+/-)
        if (e.target.classList.contains('qty-btn')) {
            const index = parseInt(e.target.getAttribute('data-index'), 10);
            const delta = parseInt(e.target.getAttribute('data-delta'), 10);
            updateQuantity(index, delta);
            return;
        }
    });

    // Event Delegation para Selects (Cambio de Talla Primark)
    document.addEventListener('change', (e) => {
        if (e.target.classList.contains('genre-select')) {
            const productId = e.target.getAttribute('data-id');
            const sizeSelect = document.getElementById(`size-${productId}`);
            if (sizeSelect) {
                const genre = e.target.value;
                const tallas = tallasPrimark[genre] || [];
                sizeSelect.innerHTML = tallas.map(t => `<option value="${utils.escapeHtml(t)}">${utils.escapeHtml(t)}</option>`).join('');
            }
        }
    });

    // Add to Cart Logic
    const addToCart = (productId) => {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        const genreSelect = document.getElementById(`genre-${productId}`);
        const sizeSelect = document.getElementById(`size-${productId}`);
        const colorSelect = document.getElementById(`color-${productId}`);
        const qtyInput = document.getElementById(`qty-${productId}`);
        
        let size = sizeSelect ? sizeSelect.value : null;
        if (genreSelect && size) {
            size = `${genreSelect.value} - ${size}`;
        }
        const color = colorSelect ? colorSelect.value : null;
        const qty = qtyInput ? parseInt(qtyInput.value) || 1 : 1;
        const maxStock = parseInt(product.stock) || 0;

        if (qty <= 0) return;

        const existingItemIndex = cart.findIndex(item => 
            item.id === productId && item.size === size && item.color === color
        );

        let totalQtyEnCarrito = qty;
        if (existingItemIndex > -1) {
            totalQtyEnCarrito += cart[existingItemIndex].quantity;
        }

        // Validar Stock
        if (totalQtyEnCarrito > maxStock) {
            alert(`¡Eh! Sólo nos quedan ${maxStock} unidades de este artículo. No puedes añadir más al carrito.`);
            return;
        }

        if (existingItemIndex > -1) {
            cart[existingItemIndex].quantity += qty;
        } else {
            cart.push({
                id: productId,
                name: product.name,
                price: Number(product.price),
                image: product.image,
                size: size,
                color: color,
                quantity: qty,
                maxStock: maxStock
            });
        }

        saveCart();
        updateCartUI();
        openCart();
    };

    // Cart Management
    const saveCart = () => {
        sessionStorage.setItem('jorgazo_cart', JSON.stringify(cart));
    };

    const removeFromCart = (index) => {
        cart.splice(index, 1);
        saveCart();
        updateCartUI();
        validateCheckoutState();
    };

    const updateQuantity = (index, delta) => {
        const item = cart[index];
        const newQty = item.quantity + delta;

        if (newQty > 0) {
            if (newQty > item.maxStock) {
                alert(`Límite de stock alcanzado (${item.maxStock} unidades).`);
                return;
            }
            item.quantity = newQty;
        } else {
            cart.splice(index, 1);
        }
        saveCart();
        updateCartUI();
        validateCheckoutState();
    };

    const updateCartUI = () => {
        // Update badge
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (cartBadge) cartBadge.textContent = totalItems;

        // Render Cart Sidebar if it exists
        if (!cartItemsContainer) return;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="cart-empty-msg">Tu carrito esta mas vacio que la cartera de un musico.</p>';
            cartTotalPrice.textContent = '0.00€';
            validateCheckoutState();
            return;
        }

        let html = '';
        let total = 0;

        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            
            const variantText = [item.size, item.color].filter(Boolean).join(' | ');

            html += `
                <div class="cart-item">
                    <img src="${utils.sanitizeUrl(item.image)}" alt="${utils.escapeHtml(item.name)}" class="cart-item-img">
                    <div class="cart-item-details">
                        <div class="cart-item-title">${utils.escapeHtml(item.name)}</div>
                        ${variantText ? `<div class="cart-item-variant">${utils.escapeHtml(variantText)}</div>` : ''}
                        <div class="cart-item-price">${item.price.toFixed(2)}€ x ${item.quantity} = ${itemTotal.toFixed(2)}€</div>
                        <div class="cart-item-controls">
                            <button class="qty-btn" data-index="${index}" data-delta="-1">-</button>
                            <span>${item.quantity}</span>
                            <button class="qty-btn" data-index="${index}" data-delta="1">+</button>
                        </div>
                    </div>
                    <button class="remove-item-btn" data-index="${index}" title="Eliminar"><i class="fas fa-trash"></i></button>
                </div>
            `;
        });

        cartItemsContainer.innerHTML = html;
        cartTotalPrice.textContent = `${total.toFixed(2)}€`;
        validateCheckoutState();
    };

    // Sidebar toggles
    const openCart = () => {
        if (!cartSidebar) return;
        cartSidebar.classList.add('open');
        cartOverlay.classList.add('show');
        document.body.style.overflow = 'hidden';
    };

    const closeCart = () => {
        if (!cartSidebar) return;
        cartSidebar.classList.remove('open');
        cartOverlay.classList.remove('show');
        document.body.style.overflow = '';
    };

    if (floatingCartBtn) floatingCartBtn.addEventListener('click', openCart);
    if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
    if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

    // Form Logic
    if (deliverySelect && addressFields) {
        deliverySelect.addEventListener('change', (e) => {
            if (e.target.value === 'envio') {
                addressFields.classList.add('active');
            } else {
                addressFields.classList.remove('active');
            }
            validateCheckoutState();
        });
    }

    if (legalCheckbox) {
        legalCheckbox.addEventListener('change', validateCheckoutState);
    }

    function validateCheckoutState() {
        if (!checkoutBtn) return;
        
        let isValid = cart.length > 0;
        
        if (legalCheckbox && !legalCheckbox.checked) {
            isValid = false;
        }

        if (deliverySelect && deliverySelect.value === 'envio') {
            const addr = document.getElementById('delivery-address');
            const cp = document.getElementById('delivery-cp');
            const city = document.getElementById('delivery-city');
            if (!addr || !addr.value.trim() || !cp || !cp.value.trim() || !city || !city.value.trim()) {
                isValid = false; // Envío requiere dirección
            }
        }

        checkoutBtn.disabled = !isValid;
    }

    // Bind address fields inputs to re-validate
    const addressInputs = document.querySelectorAll('#address-fields input');
    addressInputs.forEach(input => input.addEventListener('input', validateCheckoutState));

    // Checkout
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (checkoutBtn.disabled) return;
            
            // Generate Reference
            const randomCode = Math.floor(1000 + Math.random() * 9000);
            const ref = `JORG-2026-${randomCode}`;

            const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            
            let addressInfo = "";
            if (deliverySelect.value === 'envio') {
                const addr = document.getElementById('delivery-address').value;
                const cp = document.getElementById('delivery-cp').value;
                const city = document.getElementById('delivery-city').value;
                addressInfo = `Envío a: ${addr}, ${cp}, ${city}`;
            } else {
                addressInfo = "Recogida en festival";
            }

            // Summary for modal or alert
            const orderSummaryStr = cart.map(item => 
                `- ${item.quantity}x ${item.name} (${item.size || ''} ${item.color || ''})`
            ).join('\n');

            const alertMsg = `Tu Referencia de Pedido es: ${ref}\n\n` +
                             `Por favor, COPIA esta referencia y ponla en el concepto de Bizum.\n\n` +
                             `Total a pagar: ${total.toFixed(2)}€\n\n` +
                             `Entrega: ${addressInfo}\n\n` +
                             `Te vamos a redirigir al formulario de Google donde debes adjuntar tu comprobante de pago.`;

            alert(alertMsg);

            // Redirect to Form
            if (CHECKOUT_FORM_URL.includes("PENDING_URL")) {
                console.log(`Redirect blocked because FORM URL is PENDING_URL.`);
            } else {
                // If we knew the entry IDs of the form, we could pre-fill them:
                // window.open(`${CHECKOUT_FORM_URL}?usp=pp_url&entry.XXXXX=${ref}&entry.YYYYY=${total}...`, '_blank');
                window.open(CHECKOUT_FORM_URL, '_blank');
            }
            
            // Limpiar carrito tras iniciar checkout? Opcional
            // cart = [];
            // saveCart();
            // closeCart();
            // updateCartUI();
        });
    }

    // Modal conditions link hook
    const linkCondiciones = document.getElementById('link-condiciones-venta');
    if (linkCondiciones) {
        linkCondiciones.addEventListener('click', (e) => {
            e.preventDefault();
            const modalLegal = document.getElementById('modalLegal');
            if (modalLegal && typeof window.abrirModalLegal === 'function') {
                // Though abrirModalLegal might be scoped in principal.js, 
                // actually we can trigger a click on a footer link to open it, 
                // or expose it to window.
            }
            // For now let's just trigger a click on a footer link that has 'condiciones-venta'
            const footerLink = Array.from(document.querySelectorAll('footer a')).find(a => a.getAttribute('href') && a.getAttribute('href').includes('condiciones-venta'));
            if (footerLink) {
                footerLink.click();
            } else {
                // Fallback to navigating to the page
                window.open(linkCondiciones.href, '_blank');
            }
        });
    }

    // Run!
    init();
});
