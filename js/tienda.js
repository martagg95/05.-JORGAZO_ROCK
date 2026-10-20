document.addEventListener('DOMContentLoaded', () => {
    const CFG = window.TIENDA_CONFIG || {};

    // DOM Elements
    const productsGrid = document.getElementById('products-grid');
    const categoryFilters = document.getElementById('category-filters');
    const floatingCartBtn = document.getElementById('floating-cart-btn');
    const cartBadge = document.getElementById('cart-badge');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartSidebar = document.getElementById('cart-sidebar');
    const closeCartBtn = document.getElementById('close-cart-btn');
    const clearCartBtn = document.getElementById('clear-cart-btn');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalPrice = document.getElementById('cart-total-price');
    const cartSubtotalPrice = document.getElementById('cart-subtotal-price');
    const cartItemsCountBadge = document.getElementById('cart-items-count-badge');
    const checkoutBtn = document.getElementById('checkout-btn');
    const legalCheckbox = document.getElementById('legal-checkbox');
    const reservaForm = document.getElementById('reserva-form');
    const formError = document.getElementById('form-error');
    const okModal = document.getElementById('reserva-ok-modal');
    const okRef = document.getElementById('reserva-ok-ref');
    const okEmail = document.getElementById('reserva-ok-email');
    const okWhatsapp = document.getElementById('reserva-ok-whatsapp');
    const okClose = document.getElementById('reserva-ok-close');

    // OTP & Verification DOM Elements
    const sendOtpBtn = document.getElementById('send-otp-btn');
    const verifyOtpBtn = document.getElementById('verify-otp-btn');
    const otpWrapper = document.getElementById('otp-wrapper');
    const otpInput = document.getElementById('res-otp');
    const otpFeedback = document.getElementById('otp-feedback');
    const emailHint = document.getElementById('email-hint');

    // Estado
    const FORM_STARTED_AT = Date.now();
    let products = [];
    let currentCategory = 'Todos';
    let sending = false;
    let emailVerified = false;
    let currentOtpCode = null;
    let verifiedEmailAddress = '';

    // Dominios de correo desechable y temporal bloqueados contra fraude
    const DISPOSABLE_EMAIL_DOMAINS = new Set([
        'mailinator.com', 'yopmail.com', 'yopmail.fr', 'yopmail.net', 'guerrillamail.com',
        'tempmail.com', 'temp-mail.org', '10minutemail.com', 'sharklasers.com', 'trashmail.com',
        'throwawaymail.com', 'getnada.com', 'mohmal.com', 'dispostable.com', 'fakeinbox.com',
        'tempail.com', 'burnermail.io', 'inboxkitten.com', 'generator.email', 'crazymailing.com',
        'maildrop.cc', 'cool.fr.nf', 'jetable.fr.nf', 'courriel.fr.nf', 'moncourrier.fr.nf',
        'monemail.fr.nf', 'monmail.fr.nf', 'hideaddress.net', 'mytrashmail.com', 'mytemp.email',
        'emailondeck.com', 'getairmail.com', 'mintemail.com', 'trashmail.net', 'discard.email'
    ]);

    // El carrito solo guarda referencias (id, talla, color, cantidad).
    // Precios y nombres se sacan SIEMPRE del catálogo, nunca del almacenamiento del navegador.
    let cart = [];
    try {
        const raw = JSON.parse(sessionStorage.getItem('jorgazo_cart')) || [];
        cart = Array.isArray(raw) ? raw.filter(i => i && typeof i.id === 'string').map(i => ({
            id: i.id, size: i.size || null, color: i.color || null,
            quantity: Math.max(1, Math.min(CFG.MAX_QTY_PER_LINE || 10, parseInt(i.quantity, 10) || 1))
        })) : [];
    } catch (e) { cart = []; }

    const tallasPrimark = {
        "Hombre": ["XS", "S", "M", "L", "XL", "XXL", "3XL"],
        "Mujer": ["2XS", "XS", "S", "M", "L", "XL", "XXL", "3XL"],
        "Niño/a": ["1.5-2 años", "2-3 años", "3-4 años", "4-5 años", "5-6 años", "7-8 años", "9-10 años", "11-12 años", "13-14 años", "14-15 años", "15-16 años"]
    };

    const waLink = (text) => `https://wa.me/${encodeURIComponent(CFG.WHATSAPP_NUMBER || '')}?text=${encodeURIComponent(text)}`;

    const findProduct = (id) => products.find(p => p.id === id);

    // Stock por talla (p.ej. FEFA: {"S":1,"L":3}). null si el producto no lo usa.
    const sizeStockOf = (p) => (p && p.sizeStock && typeof p.sizeStock === 'object' && Object.keys(p.sizeStock).length) ? p.sizeStock : null;
    const availableSizes = (p) => { const ss = sizeStockOf(p); return ss ? Object.keys(ss).filter(k => (parseInt(ss[k], 10) || 0) > 0) : []; };
    const unitsOfSize = (id, size) => cart.filter(i => i.id === id && i.size === size).reduce((s, i) => s + i.quantity, 0);

    // Inicializar
    const loadCatalog = async () => {
        if (CFG.API_URL) {
            try {
                const res = await fetch(`${CFG.API_URL}?action=catalog`, { method: 'GET', credentials: 'omit', redirect: 'follow' });
                const data = await res.json();
                if (data && data.ok && Array.isArray(data.products)) return data.products;
            } catch (e) {
                console.warn('Catálogo remoto no disponible, usando copia local.', e);
            }
        }
        const response = await fetch('../../data/products.json');
        if (!response.ok) throw new Error('No se pudo cargar el catalogo');
        return response.json();
    };

    const init = async () => {
        if (!productsGrid) return;
        try {
            products = await loadCatalog();
            cart = cart.filter(i => findProduct(i.id)); // limpia productos que ya no existen
            renderFilters(products);
            renderProducts(products);
            updateCartUI();
        } catch (error) {
            console.error('Error inicializando la tienda:', error);
            productsGrid.innerHTML = '<p style="text-align:center; color:red; grid-column:1/-1;">Error al cargar el merchandising. Vuelve más tarde.</p>';
        }
    };

    // Filtros
    const renderFilters = (allProducts) => {
        if (!categoryFilters) return;
        const categories = ['Todos', ...new Set(allProducts.map(p => p.category).filter(Boolean))];
        categoryFilters.innerHTML = categories.map(cat => {
            const activeClass = currentCategory === cat ? 'active' : '';
            return `<button class="filter-btn ${activeClass}" data-category="${utils.escapeHtml(cat)}">${utils.escapeHtml(cat)}</button>`;
        }).join('');
    };

    const options = (list) => list.map(v => `<option value="${utils.escapeHtml(v)}">${utils.escapeHtml(v)}</option>`).join('');

    // Grid de productos
    const renderProducts = (allProducts) => {
        if (allProducts.length === 0) {
            productsGrid.innerHTML = '<p style="text-align:center; grid-column:1/-1;">Pronto anunciaremos el merchandising.</p>';
            return;
        }

        const filtered = currentCategory === 'Todos' ? allProducts : allProducts.filter(p => p.category === currentCategory);
        if (filtered.length === 0) {
            productsGrid.innerHTML = '<p style="text-align:center; grid-column:1/-1;">No hay productos en esta categoría.</p>';
            return;
        }

        productsGrid.innerHTML = filtered.map((product, index) => {
            const id = utils.escapeHtml(product.id);
            const sizeStock = sizeStockOf(product);
            const fixedSizes = availableSizes(product);
            const fits = sizeStock ? [] : (product.sizes || []).filter(s => tallasPrimark[s]);
            const colors = product.colors || [];
            const stockVal = sizeStock ? fixedSizes.reduce((s, k) => s + (parseInt(sizeStock[k], 10) || 0), 0) : (parseInt(product.stock, 10) || 0);
            const isBajoDemanda = product.bajoDemanda === true;
            const out = stockVal <= 0;
            const dis = out ? 'disabled' : '';

            // Texto de disponibilidad
            let stockText = 'Disponible para reservar';
            if (out) {
                stockText = 'AGOTADO';
            } else if (sizeStock) {
                stockText = `¡Últimas unidades! Quedan: ${fixedSizes.map(k => `${k} (${sizeStock[k]})`).join(', ')}`;
            } else if (isBajoDemanda) {
                stockText = 'Edición oficial (Serigrafía a demanda)';
            } else if (stockVal <= 10) {
                stockText = `¡Stock limitado: solo ${stockVal} unidades!`;
            }

            return `
                <article class="product-card ${product.destacado ? 'destacado' : ''}" data-aos="fade-up" data-aos-delay="${(index % 4) * 100}">
                    <div class="product-image-container">
                        <img id="img-${id}" src="${utils.sanitizeUrl(product.image)}" alt="${utils.escapeHtml(product.name)}" loading="lazy">
                        ${product.destacado ? '<span class="product-ribbon">NOVEDAD XI</span>' : ''}
                    </div>
                    <div class="product-info">
                        <h3 class="product-title">${utils.escapeHtml(product.name)}</h3>
                        <div class="product-price">${Number(product.price).toFixed(2)}€</div>
                        <div class="product-stock ${out ? 'out-of-stock' : ''}">${utils.escapeHtml(stockText)}</div>
                        <p class="product-description">${utils.escapeHtml(product.description)}</p>

                        <div class="product-options">
                            ${sizeStock && fixedSizes.length ? `
                            <div class="option-group">
                                <label for="size-${id}">Talla</label>
                                <select id="size-${id}" class="custom-select size-select" ${dis}>${options(fixedSizes)}</select>
                            </div>` : ''}
                            ${fits.length ? `
                            <div class="option-group">
                                <label for="genre-${id}">Tallaje</label>
                                <select id="genre-${id}" class="custom-select genre-select" data-id="${id}" ${dis}>${options(fits)}</select>
                            </div>
                            <div class="option-group">
                                <label for="size-${id}">Talla</label>
                                <select id="size-${id}" class="custom-select size-select" ${dis}>${options(tallasPrimark[fits[0]])}</select>
                            </div>` : ''}
                            ${colors.length ? `
                            <div class="option-group">
                                <label for="color-${id}">Color</label>
                                <select id="color-${id}" class="custom-select color-select" data-id="${id}" ${dis}>${options(colors)}</select>
                            </div>` : ''}
                            <div class="option-group">
                                <label for="qty-${id}">Cantidad</label>
                                <input type="number" id="qty-${id}" class="custom-select" min="1" max="${out ? 0 : Math.min(CFG.MAX_QTY_PER_LINE || 10, stockVal)}" value="${out ? 0 : 1}" style="text-align:center;" ${dis}>
                            </div>
                        </div>

                        <button class="add-to-cart-btn" data-id="${id}" ${dis}>
                            <i class="fas fa-cart-plus"></i> ${out ? 'Agotado' : 'Añadir a la cesta'}
                        </button>
                    </div>
                </article>`;
        }).join('');
    };

    // Delegación de eventos de clicks
    document.addEventListener('click', (e) => {
        const t = e.target;
        if (t.classList.contains('filter-btn')) {
            currentCategory = t.getAttribute('data-category');
            renderFilters(products);
            renderProducts(products);
            return;
        }
        const addBtn = t.closest('.add-to-cart-btn');
        if (addBtn) { if (!addBtn.disabled) addToCart(addBtn.getAttribute('data-id')); return; }

        const rmBtn = t.closest('.remove-item-btn');
        if (rmBtn) { removeFromCart(parseInt(rmBtn.getAttribute('data-index'), 10)); return; }

        if (t.classList.contains('qty-btn')) {
            updateQuantity(parseInt(t.getAttribute('data-index'), 10), parseInt(t.getAttribute('data-delta'), 10));
        }
    });

    // Vaciar cesta completa
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', () => {
            if (cart.length === 0) return;
            cart = [];
            saveCart();
            updateCartUI();
        });
    }

    // Delegación de eventos change: tallaje y cambio de imagen según color seleccionado
    document.addEventListener('change', (e) => {
        if (e.target.classList.contains('genre-select')) {
            const sizeSelect = document.getElementById(`size-${e.target.getAttribute('data-id')}`);
            if (sizeSelect) sizeSelect.innerHTML = options(tallasPrimark[e.target.value] || []);
        }

        // Cambio de imagen dinámico si el producto tiene colorImages (ej. X Aniversario morada vs negra)
        if (e.target.classList.contains('color-select')) {
            const prodId = e.target.getAttribute('data-id');
            const product = findProduct(prodId);
            if (product && product.colorImages && product.colorImages[e.target.value]) {
                const targetImg = document.getElementById(`img-${prodId}`);
                if (targetImg) {
                    targetImg.src = product.colorImages[e.target.value];
                }
            }
        }
    });

    // Cesta
    const saveCart = () => sessionStorage.setItem('jorgazo_cart', JSON.stringify(cart));
    const unitsOf = (id) => cart.filter(i => i.id === id).reduce((s, i) => s + i.quantity, 0);

    const addToCart = (productId) => {
        const product = findProduct(productId);
        if (!product) return;

        const genreSelect = document.getElementById(`genre-${productId}`);
        const sizeSelect = document.getElementById(`size-${productId}`);
        const colorSelect = document.getElementById(`color-${productId}`);
        const qtyInput = document.getElementById(`qty-${productId}`);

        const sizeStock = sizeStockOf(product);
        const size = sizeStock ? (sizeSelect ? sizeSelect.value : null)
            : (genreSelect && sizeSelect ? `${genreSelect.value} - ${sizeSelect.value}` : null);
        const color = colorSelect ? colorSelect.value : null;
        const qty = Math.min(CFG.MAX_QTY_PER_LINE || 10, parseInt(qtyInput && qtyInput.value, 10) || 1);
        const maxStock = parseInt(product.stock, 10) || 0;
        if (qty <= 0) return;

        if (sizeStock) {
            const left = parseInt(sizeStock[size], 10) || 0;
            if (unitsOfSize(productId, size) + qty > left) {
                alert(`¡Eh! De la talla ${size} solo nos quedan ${left}.`);
                return;
            }
        } else if (unitsOf(productId) + qty > maxStock) {
            alert(`¡Eh! Sólo nos quedan ${maxStock} unidades disponibles de este artículo.`);
            return;
        }

        const idx = cart.findIndex(i => i.id === productId && i.size === size && i.color === color);
        if (idx > -1) {
            if (cart[idx].quantity + qty > (CFG.MAX_QTY_PER_LINE || 10)) {
                alert(`Máximo ${CFG.MAX_QTY_PER_LINE || 10} unidades por artículo y talla.`);
                return;
            }
            cart[idx].quantity += qty;
        } else {
            if (cart.length >= (CFG.MAX_LINES || 10)) {
                alert('Has llegado al máximo de artículos distintos por reserva. ¡Haz otra reserva después!');
                return;
            }
            cart.push({ id: productId, size, color, quantity: qty });
        }
        saveCart();
        updateCartUI();

        // Feedback visual en el botón de la tarjeta sin abrir el modal
        const btn = document.querySelector(`.add-to-cart-btn[data-id="${productId}"]`);
        if (btn) {
            const originalHtml = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i> ¡Añadido a la cesta!';
            btn.style.background = '#25d366';
            setTimeout(() => {
                btn.innerHTML = originalHtml;
                btn.style.background = '';
            }, 1200);
        }

        if (floatingCartBtn) {
            floatingCartBtn.classList.add('cart-bounce');
            setTimeout(() => floatingCartBtn.classList.remove('cart-bounce'), 500);
        }
    };

    const removeFromCart = (index) => {
        cart.splice(index, 1);
        saveCart();
        updateCartUI();
    };

    const updateQuantity = (index, delta) => {
        const item = cart[index];
        if (!item) return;
        const product = findProduct(item.id);
        const newQty = item.quantity + delta;
        if (newQty <= 0) { cart.splice(index, 1); }
        else {
            const ss = sizeStockOf(product);
            const overSize = ss && (unitsOfSize(item.id, item.size) + delta > (parseInt(ss[item.size], 10) || 0));
            if (delta > 0 && (overSize || unitsOf(item.id) + delta > (parseInt(product.stock, 10) || 0) || newQty > (CFG.MAX_QTY_PER_LINE || 10))) {
                alert('Límite alcanzado para este artículo.');
                return;
            }
            item.quantity = newQty;
        }
        saveCart();
        updateCartUI();
    };

    const cartTotal = () => cart.reduce((s, i) => {
        const p = findProduct(i.id);
        return s + (p ? Number(p.price) * i.quantity : 0);
    }, 0);

    const updateCartUI = () => {
        const totalUnits = cart.reduce((s, i) => s + i.quantity, 0);
        if (cartBadge) cartBadge.textContent = totalUnits;
        if (cartItemsCountBadge) {
            cartItemsCountBadge.textContent = `${totalUnits} prenda${totalUnits === 1 ? '' : 's'}`;
        }
        if (!cartItemsContainer) return;

        // Estado cesta vacía
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="cart-empty-container">
                    <i class="fas fa-shopping-basket" aria-hidden="true"></i>
                    <h3>TU CESTA ESTÁ VACÍA</h3>
                    <p>Mete lo que quieras reservar en la cesta para no quedarte sin tu talla en el festi.</p>
                    <button type="button" class="btn-ir-catalogo" onclick="document.getElementById('close-cart-btn').click(); document.getElementById('merch')?.scrollIntoView({behavior: 'smooth'});">
                        <i class="fas fa-arrow-left"></i> ELEGIR PRENDAS
                    </button>
                </div>`;
            if (cartSubtotalPrice) cartSubtotalPrice.textContent = '0.00€';
            if (cartTotalPrice) cartTotalPrice.textContent = '0.00€';
            if (clearCartBtn) clearCartBtn.style.visibility = 'hidden';
            validateCheckoutState();
            return;
        }

        if (clearCartBtn) clearCartBtn.style.visibility = 'visible';

        cartItemsContainer.innerHTML = cart.map((item, index) => {
            const p = findProduct(item.id);
            if (!p) return '';
            const price = Number(p.price);
            const variant = [item.size, item.color].filter(Boolean).join(' | ');
            // Usar imagen específica de color si existe
            let itemImg = p.image;
            if (item.color && p.colorImages && p.colorImages[item.color]) {
                itemImg = p.colorImages[item.color];
            }

            return `
                <div class="cart-item">
                    <img src="${utils.sanitizeUrl(itemImg)}" alt="${utils.escapeHtml(p.name)}" class="cart-item-img">
                    <div class="cart-item-details">
                        <div class="cart-item-title">${utils.escapeHtml(p.name)}</div>
                        ${variant ? `<div class="cart-item-variant">${utils.escapeHtml(variant)}</div>` : ''}
                        <div class="cart-item-price">${price.toFixed(2)}€ x ${item.quantity} = ${(price * item.quantity).toFixed(2)}€</div>
                        <div class="cart-item-controls">
                            <button type="button" class="qty-btn" data-index="${index}" data-delta="-1" aria-label="Quitar una">-</button>
                            <span>${item.quantity}</span>
                            <button type="button" class="qty-btn" data-index="${index}" data-delta="1" aria-label="Añadir una">+</button>
                        </div>
                    </div>
                    <button type="button" class="remove-item-btn" data-index="${index}" title="Eliminar"><i class="fas fa-trash"></i></button>
                </div>`;
        }).join('');

        const totalFormatted = `${cartTotal().toFixed(2)}€`;
        if (cartSubtotalPrice) cartSubtotalPrice.textContent = totalFormatted;
        if (cartTotalPrice) cartTotalPrice.textContent = totalFormatted;
        validateCheckoutState();
    };

    // Abrir / cerrar cesta
    const openCart = () => {
        if (!cartSidebar) return;
        document.body.classList.add('cart-open');
        cartSidebar.classList.add('open');
        if (cartOverlay) cartOverlay.classList.add('show');
        document.body.style.overflow = 'hidden';
    };
    const closeCart = () => {
        if (!cartSidebar) return;
        document.body.classList.remove('cart-open');
        cartSidebar.classList.remove('open');
        if (cartOverlay) cartOverlay.classList.remove('show');
        document.body.style.overflow = '';
    };

    if (floatingCartBtn) floatingCartBtn.addEventListener('click', openCart);
    if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
    if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

    // Formulario y validaciones
    const field = (id) => document.getElementById(id);
    const readCustomer = () => ({
        nombre: (field('res-nombre') ? field('res-nombre').value : '').trim(),
        apellidos: (field('res-apellidos') ? field('res-apellidos').value : '').trim(),
        email: (field('res-email') ? field('res-email').value : '').trim().toLowerCase(),
        telefono: (field('res-telefono') ? field('res-telefono').value : '').trim()
    });

    const NAME_RE = /^[\p{L}][\p{L}\s'.-]{1,}$/u;
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

    function validateEmailDomain(email) {
        if (!EMAIL_RE.test(email)) return 'Email no válido. Escribe un correo auténtico.';
        const parts = email.split('@');
        const domain = (parts[1] || '').toLowerCase().trim();
        if (DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
            return 'No se permiten emails temporales ni desechables. Usa tu correo habitual para recibir la reserva serigrafiada.';
        }
        return null;
    }

    function customerErrors(c) {
        if (!NAME_RE.test(c.nombre)) return 'Pon tu nombre auténtico (solo letras).';
        if (!NAME_RE.test(c.apellidos)) return 'Pon tus apellidos auténticos (solo letras).';
        const emailErr = validateEmailDomain(c.email);
        if (emailErr) return emailErr;
        if (c.telefono && !/^\+?[\d ]{9,16}$/.test(c.telefono)) return 'El teléfono no es válido.';
        return null;
    }

    function validateCheckoutState() {
        if (!checkoutBtn) return;
        const cust = readCustomer();
        const baseOk = cart.length > 0 && legalCheckbox && legalCheckbox.checked && !customerErrors(cust) && !sending;
        
        // La reserva solo se activa si el email está verificado (o modo validado)
        const isOk = baseOk && emailVerified;
        checkoutBtn.disabled = !isOk;

        if (!emailVerified && baseOk) {
            checkoutBtn.title = 'Haz clic en "Verificar" junto a tu email para recibir el código y validar tu pedido.';
        } else {
            checkoutBtn.title = '';
        }
    }

    const showError = (msg) => {
        if (!formError) return;
        formError.textContent = msg || '';
        formError.hidden = !msg;
    };

    // Si el usuario cambia el email después de haberlo verificado, invalidar la verificación previa
    const emailInput = field('res-email');
    if (emailInput) {
        emailInput.addEventListener('input', () => {
            const currentEmail = emailInput.value.trim().toLowerCase();
            if (emailVerified && currentEmail !== verifiedEmailAddress) {
                emailVerified = false;
                if (sendOtpBtn) {
                    sendOtpBtn.disabled = false;
                    sendOtpBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Verificar';
                }
                if (emailHint) {
                    emailHint.className = 'field-hint';
                    emailHint.textContent = 'Has cambiado de email. Vuelve a verificarlo.';
                }
                if (otpWrapper) otpWrapper.hidden = true;
            }
            showError('');
            validateCheckoutState();
        });
    }

    // --- FLUJO DE VERIFICACIÓN ANTI-FRAUDE / OTP ---
    if (sendOtpBtn) {
        sendOtpBtn.addEventListener('click', async () => {
            const customer = readCustomer();
            const err = customerErrors(customer);
            if (err) {
                showError(err);
                if (emailHint) {
                    emailHint.className = 'field-hint error';
                    emailHint.textContent = err;
                }
                return;
            }

            showError('');
            sendOtpBtn.disabled = true;
            sendOtpBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

            try {
                if (!CFG.API_URL) {
                    // MODO LOCAL / DEMO: generamos código localmente para pruebas
                    currentOtpCode = String(Math.floor(100000 + Math.random() * 900000));
                    verifiedEmailAddress = customer.email;
                    if (otpWrapper) otpWrapper.hidden = false;
                    if (otpFeedback) {
                        otpFeedback.className = 'otp-feedback success';
                        otpFeedback.innerHTML = `⚡ <strong>Código de prueba local:</strong> <code>${currentOtpCode}</code> (en producción se envía por email a ${customer.email}).`;
                    }
                    if (emailHint) {
                        emailHint.className = 'field-hint success';
                        emailHint.textContent = 'Introduce los 6 dígitos a continuación.';
                    }
                    if (otpInput) {
                        otpInput.value = currentOtpCode; // facilitamos autocompletado en prueba local
                        otpInput.focus();
                    }
                } else {
                    const res = await fetch(CFG.API_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                        body: JSON.stringify({
                            action: 'send_otp',
                            email: customer.email,
                            nombre: customer.nombre
                        }),
                        credentials: 'omit',
                        redirect: 'follow'
                    });
                    const raw = await res.text();
                    let data;
                    try {
                        data = JSON.parse(raw);
                    } catch (e) {
                        console.error('[Apps Script Error]:', raw);
                        if (raw.indexOf('doPost') !== -1) {
                            throw new Error('Google Apps Script no tiene activa la función doPost. Comprueba la versión implementada.');
                        }
                        throw new Error('El servidor devolvió una respuesta no válida.');
                    }
                    if (!data || !data.ok) {
                        const errMsg = (data && data.error && ERRORS[data.error]) || (data && data.error) || 'Fallo enviando código';
                        throw new Error(errMsg);
                    }
                    verifiedEmailAddress = customer.email;
                    if (otpWrapper) otpWrapper.hidden = false;
                    if (otpFeedback) {
                        otpFeedback.className = 'otp-feedback';
                        otpFeedback.textContent = `Hemos enviado un código de 6 dígitos a ${customer.email}. Revisa tu bandeja de entrada o spam.`;
                    }
                }
            } catch (err) {
                console.error(err);
                sendOtpBtn.disabled = false;
                sendOtpBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Reintentar';
                showError(err.message || 'No se pudo enviar el código de verificación. Revisa el correo o conexión.');
            }
        });
    }

    if (verifyOtpBtn && otpInput) {
        verifyOtpBtn.addEventListener('click', async () => {
            const entered = otpInput.value.trim();
            if (!/^[0-9]{6}$/.test(entered)) {
                if (otpFeedback) {
                    otpFeedback.className = 'otp-feedback error';
                    otpFeedback.textContent = 'El código debe tener exactamente 6 números.';
                }
                return;
            }

            // Validar código: en local contra el código de prueba; en real, contra el servidor
            let valid = false;
            if (!CFG.API_URL) {
                valid = !!currentOtpCode && entered === currentOtpCode;
            } else {
                verifyOtpBtn.disabled = true;
                try {
                    const res = await fetch(CFG.API_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                        body: JSON.stringify({ action: 'verify_otp', email: verifiedEmailAddress, otp: entered }),
                        credentials: 'omit',
                        redirect: 'follow'
                    });
                    const raw = await res.text();
                    let data;
                    try { data = JSON.parse(raw); } catch (e) { console.error('[Apps Script Error]:', raw); }
                    valid = !!(data && data.ok);
                } catch (e) {
                    console.error(e);
                } finally {
                    verifyOtpBtn.disabled = false;
                }
            }

            if (valid) {
                emailVerified = true;
                if (otpFeedback) {
                    otpFeedback.className = 'otp-feedback success';
                    otpFeedback.innerHTML = '<i class="fas fa-check-circle"></i> ¡Email verificado con éxito! Ya puedes confirmar tu reserva.';
                }
                if (sendOtpBtn) {
                    sendOtpBtn.disabled = true;
                    sendOtpBtn.innerHTML = '<i class="fas fa-check"></i> Verificado';
                }
                if (emailHint) {
                    emailHint.className = 'field-hint success';
                    emailHint.textContent = '✓ Correo autenticado.';
                }
                validateCheckoutState();
            } else {
                if (otpFeedback) {
                    otpFeedback.className = 'otp-feedback error';
                    otpFeedback.textContent = 'Código erróneo o caducado. Vuelve a comprobarlo.';
                }
            }
        });
    }

    if (reservaForm) {
        reservaForm.addEventListener('input', () => { showError(''); validateCheckoutState(); });
        reservaForm.addEventListener('change', validateCheckoutState);
        reservaForm.addEventListener('submit', (e) => { e.preventDefault(); submitReserva(); });
    }

    const ERRORS = {
        too_fast: 'Vas más rápido que un bolo de hardcore. Espera unos segundos y vuelve a darle.',
        invalid_customer: 'Revisa nombre, apellidos y email auténtico.',
        invalid_email: 'El correo introducido no es válido.',
        disposable_email: 'No se permiten correos temporales ni desechables.',
        invalid_otp: 'Código de verificación incorrecto.',
        invalid_items: 'Algo no cuadra en tu cesta. Recarga la página y vuelve a intentarlo.',
        no_stock: 'Se ha agotado algo mientras reservabas. Recarga la página.',
        rate_email: 'Ya has hecho una reserva hace nada. Espera un par de minutos.',
        rate_global: 'Hay mucho jaleo ahora mismo. Inténtalo más tarde o escribe por WhatsApp.',
        terms: 'Tienes que aceptar las condiciones de reserva.',
        busy: 'Hay mucho jaleo ahora mismo en el servidor. Vuelve a intentarlo en un momento.'
    };

    // Generador automático robusto de referencia: JORG-YYMMDD-XXXXXX
    function generateReservationReference() {
        const now = new Date();
        const yy = String(now.getFullYear()).slice(-2);
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let randStr = '';
        for (let i = 0; i < 6; i++) {
            randStr += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return `JORG-${yy}${mm}${dd}-${randStr}`;
    }

    async function submitReserva() {
        if (sending) return;
        const customer = readCustomer();
        const err = customerErrors(customer);
        if (err) return showError(err);
        if (!emailVerified) return showError('Debes verificar tu email antes de confirmar la reserva para asegurar la serigrafía.');
        if (!legalCheckbox.checked) return showError(ERRORS.terms);
        if (!cart.length) return;

        // Comprobación anti-bots
        const honeypot = field('res-website') ? field('res-website').value : '';
        const elapsed = Date.now() - FORM_STARTED_AT;
        if (honeypot || elapsed < 3000) {
            console.warn('[Anti-Bot] Detección de bot activada.');
            showError('Por seguridad, espera 3 segundos antes de enviar tu reserva.');
            return;
        }

        const payload = {
            customer,
            items: cart.map(i => ({ id: i.id, size: i.size, color: i.color, quantity: i.quantity })),
            acceptTerms: true,
            startedAt: FORM_STARTED_AT,
            otp: otpInput ? otpInput.value.trim() : '',
            website: honeypot
        };

        sending = true;
        checkoutBtn.disabled = true;
        checkoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> RESERVANDO...';

        try {
            let result;
            if (!CFG.API_URL) {
                // MODO DEMO / LOCAL
                console.warn('[Tienda] MODO LOCAL: Simulación de reserva completada.', payload);
                await new Promise(r => setTimeout(r, 600));
                result = { ok: true, ref: generateReservationReference(), total: cartTotal() };
            } else {
                const res = await fetch(CFG.API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: JSON.stringify(payload),
                    credentials: 'omit',
                    redirect: 'follow'
                });
                result = await res.json();
            }

            if (!result || !result.ok) {
                showError(ERRORS[result && result.error] || 'No hemos podido guardar la reserva. Prueba otra vez o escríbenos por WhatsApp.');
                return;
            }
            onSuccess(result, customer);
        } catch (e) {
            console.error(e);
            showError('Fallo de conexión. Prueba otra vez o escríbenos por WhatsApp.');
        } finally {
            sending = false;
            checkoutBtn.innerHTML = '<i class="fas fa-hand-rock" aria-hidden="true"></i> RESERVAR';
            validateCheckoutState();
        }
    }

    function onSuccess(result, customer) {
        const ref = String(result.ref || generateReservationReference()).replace(/[^A-Z0-9-]/gi, '');
        const lines = cart.map(i => {
            const p = findProduct(i.id);
            return `• ${i.quantity}x ${p ? p.name : i.id}${i.size ? ` (${i.size}` : ''}${i.color ? `${i.size ? ', ' : ' ('}${i.color}` : ''}${i.size || i.color ? ')' : ''}`;
        }).join('\n');
        const total = cartTotal().toFixed(2);

        const waText = 
            `¡Hola ${CFG.WHATSAPP_NAME || 'José María'}! Te envío los datos de mi reserva en la tienda del Jorgazo Rock 🤘\n\n` +
            `📋 *Referencia:* ${ref}\n` +
            `👤 *Nombre:* ${customer.nombre} ${customer.apellidos}\n` +
            `📧 *Email:* ${customer.email}\n` +
            (customer.telefono ? `📞 *Teléfono:* ${customer.telefono}\n` : '') +
            `\n📦 *Artículos reservados:*\n${lines}\n\n` +
            `💰 *Total a pagar en el festival:* ${total}€ (pago en efectivo)\n` +
            `📍 *Recogida:* Puesto oficial de merchandising`;

        const waUrl = waLink(waText);

        if (okRef) okRef.textContent = ref;
        if (okEmail && customer) okEmail.textContent = customer.email;
        if (okWhatsapp) okWhatsapp.href = waUrl;

        // Intentar abrir WhatsApp en pestaña nueva
        try {
            window.open(waUrl, '_blank');
        } catch (e) {
            console.log('Navegador bloqueó apertura de WhatsApp automática, botón manual habilitado.');
        }

        cart = [];
        saveCart();
        updateCartUI();
        if (reservaForm) reservaForm.reset();
        emailVerified = false;
        if (sendOtpBtn) {
            sendOtpBtn.disabled = false;
            sendOtpBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Verificar';
        }
        if (otpWrapper) otpWrapper.hidden = true;
        closeCart();
        if (okModal) {
            okModal.hidden = false;
            if (okClose) okClose.focus();
        }
    }

    if (okClose) okClose.addEventListener('click', () => { if (okModal) okModal.hidden = true; });
    if (okModal) okModal.addEventListener('click', (e) => { if (e.target === okModal) okModal.hidden = true; });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (okModal && !okModal.hidden) okModal.hidden = true;
            else closeCart();
        }
    });

    // Enlace a condiciones: abre modal legal del footer si existe
    const linkCondiciones = document.getElementById('link-condiciones-venta');
    if (linkCondiciones) {
        linkCondiciones.addEventListener('click', (e) => {
            e.preventDefault();
            const footerLink = Array.from(document.querySelectorAll('footer a')).find(a => (a.getAttribute('href') || '').includes('condiciones-venta'));
            if (footerLink) footerLink.click();
            else window.open(linkCondiciones.href, '_blank', 'noopener');
        });
    }

    init().then(() => {
        if (window.location.hash === '#cesta' || window.location.hash === '#cart') {
            openCart();
        } else if (window.location.hash === '#cart-demo') {
            if (cart.length === 0 && products.length > 0) {
                cart.push({ id: products[0].id, size: "Hombre - L", color: "Negro", quantity: 1 });
                saveCart();
                updateCartUI();
            }
            openCart();
        }
    });
});

