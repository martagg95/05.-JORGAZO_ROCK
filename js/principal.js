document.addEventListener("DOMContentLoaded", () => {

  const isSubpage = window.location.pathname.includes('/pages/');
  const basePath = isSubpage ? '../../' : '';

  /* === LÓGICA MENÚ PUNK === */
  const menuTrigger = document.getElementById('menu-trigger');
  const menuOverlay = document.getElementById('punk-menu-overlay');
  const menuClose = document.getElementById('menu-close');
  const menuLinks = document.querySelectorAll('.menu-link');

  if (menuTrigger && menuOverlay && menuClose) {
    const focusableElements = menuOverlay.querySelectorAll('button, [href]');
    const firstFocusableElement = focusableElements[0];
    const lastFocusableElement = focusableElements[focusableElements.length - 1];

    const openMenu = (e) => {
      e.preventDefault();
      menuTrigger.classList.add('hidden');
      menuOverlay.classList.add('visible');
      menuTrigger.setAttribute('aria-expanded', 'true');
      setTimeout(() => {
        menuClose.focus();
      }, 50);
    };

    const closeMenu = () => {
      menuOverlay.classList.remove('visible');
      menuTrigger.classList.remove('hidden');
      menuTrigger.setAttribute('aria-expanded', 'false');
      menuTrigger.focus();
    };

    menuTrigger.addEventListener('click', openMenu);
    menuClose.addEventListener('click', closeMenu);
    menuLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href');
        if (targetId && targetId.startsWith('#')) {
          e.preventDefault();
          const targetElement = document.querySelector(targetId);
          if (targetElement) {
            targetElement.scrollIntoView({
              behavior: 'smooth'
            });
          }
          closeMenu();
        }
        // If it's a page (e.g., pages/tienda/), let the default navigation happen
      });
    });
    menuOverlay.addEventListener('click', (e) => {
      if (e.target === menuOverlay) {
        closeMenu();
      }
    });
    menuOverlay.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeMenu();
        return;
      }
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstFocusableElement) {
            e.preventDefault();
            lastFocusableElement.focus();
          }
        } else {
          if (document.activeElement === lastFocusableElement) {
            e.preventDefault();
            firstFocusableElement.focus();
          }
        }
      }
    });
  }

  /* === MODAL CARTEL / FECHA === */
  const modalCartel = document.getElementById("modalCartel");
  if (modalCartel) {
    const festivalEndDate = new Date("2026-11-22T06:00:00");
    const cartelImg = document.getElementById("cartelImg");
    const fallback = document.getElementById("fallbackFecha");
    const cerrarModalBtn = document.getElementById("cerrarModal");

    const closeCartelModal = () => {
      modalCartel.style.display = "none";
    };

    if (new Date() > festivalEndDate) {
      closeCartelModal();
    } else if (cartelImg && fallback) {
      const showFallback = () => {
        cartelImg.style.display = "none";
        fallback.style.display = "block";
      };
      cartelImg.addEventListener("error", showFallback, { once: true });
      if (cartelImg.complete && cartelImg.naturalWidth === 0) {
        showFallback();
      }
    }

    if (cerrarModalBtn) {
      cerrarModalBtn.addEventListener("click", closeCartelModal);
    }
    modalCartel.addEventListener("click", (e) => {
      if (e.target === modalCartel) {
        closeCartelModal();
      }
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modalCartel.style.display !== "none") {
        closeCartelModal();
      }
    });
  }

  /* === CONTADOR === */
  const countdownElement = document.getElementById("countdown");
  if (countdownElement) {
    const targetDate = new Date("2026-11-21T18:00:00");
    const updateCountdown = () => {
      const now = new Date();
      const diff = targetDate - now;
      if (diff <= 0) {
        countdownElement.innerHTML = "<p>¡El Jorgazo ha empezado!</p>";
        clearInterval(countdownInterval);
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      document.getElementById("days").textContent = String(days).padStart(2, "0");
      document.getElementById("hours").textContent = String(hours).padStart(2, "0");
      document.getElementById("minutes").textContent = String(minutes).padStart(2, "0");
      document.getElementById("seconds").textContent = String(seconds).padStart(2, "0");
    };
    const countdownInterval = setInterval(updateCountdown, 1000);
    updateCountdown();
  }

  /* === SCROLLING LOGO === */
  const logo = document.getElementById("scroll-logo");
  if (logo) {
    window.addEventListener("scroll", () => {
      const scrollY = window.scrollY;
      const section = document.querySelector(".section-logo-intro");
      if (!section) return;
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        const progress = (scrollY - sectionTop) / sectionHeight;
        const scale = 0.5 + progress * 0.7;
        logo.style.transform = `scale(${scale})`;
        logo.style.opacity = 0.8 + progress * 0.8;
      }
    });
  }

  /* === MODAL LEGAL === */
  let modalLegal = document.getElementById("modalLegal");
  if (!modalLegal && document.querySelector("footer")) {
    modalLegal = document.createElement("article");
    modalLegal.id = "modalLegal";
    modalLegal.className = "modal-cartel";
    modalLegal.style.display = "none";
    modalLegal.innerHTML = `
      <div class="modal-content">
        <span class="close-modal" id="cerrarLegalModal">&times;</span>
        <div id="contenidoLegal" class="legal-content"></div>
      </div>
    `;
    document.body.appendChild(modalLegal);
  }

  if (modalLegal) {
    const textosLegales = {
      privacidad: `
        <h1>Política de Privacidad</h1>
        <p>En cumplimiento de lo dispuesto en el Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018 (LOPDGDD), la <strong>Asociación Jorgazo Rock</strong> informa que los datos personales recabados a través de este sitio web o del formulario de reserva de merchandising serán tratados exclusivamente para gestionar la relación con socios/as y asistentes, tramitar reservas e informar sobre las actividades del festival.</p>
        <p><strong>Responsable:</strong> Asociación Jorgazo Rock (Cabeza la Vaca, Badajoz). <strong>Fines:</strong> Comunicación, gestión de reservas en el puesto oficial y actividades culturales. <strong>Legitimación:</strong> Consentimiento expreso del interesado. <strong>Destinatarios:</strong> No se cederán datos a terceros salvo obligación legal o proveedores técnicos estrictamente necesarios. <strong>Derechos:</strong> Acceso, rectificación, supresión, limitación y portabilidad escribiendo a <a href="mailto:asociacionjorgazorock@gmail.com">asociacionjorgazorock@gmail.com</a>.</p>
        <p><a href="${basePath}pages/privacidad/">Ver documento completo de Política de Privacidad</a></p>
      `,
      aviso: `
        <h1>Aviso Legal</h1>
        <p>En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y Comercio Electrónico (LSSI-CE), se exponen los siguientes datos identificativos:</p>
        <p><strong>Titular:</strong> Asociación Jorgazo Rock<br>
        <strong>Domicilio:</strong> Cabeza la Vaca, 06293, Badajoz (Extremadura)<br>
        <strong>Correo electrónico:</strong> <a href="mailto:asociacionjorgazorock@gmail.com">asociacionjorgazorock@gmail.com</a></p>
        <p>La asociación está inscrita en el Registro de Asociaciones de la Junta de Extremadura. El acceso a este sitio web atribuye la condición de USUARIO e implica la aceptación de las condiciones de uso publicadas.</p>
        <p><a href="${basePath}pages/avisolegal/">Ver documento completo de Aviso Legal</a></p>
      `,
      cookies: `
        <h1>Política de Cookies</h1>
        <p>Este sitio web utiliza almacenamiento técnico local para recordar tu aceptación o rechazo del banner de cookies y mantener tu cesta de reserva durante la sesión.</p>
        <p><strong>Tipos de tecnologías utilizadas:</strong><br>
        - <strong>Técnicas:</strong> Esenciales para el funcionamiento correcto de la web y la cesta de reserva.<br>
        - <strong>Terceros embebidos:</strong> Al interactuar con reproductores o mapas externos (Spotify, Google Maps) pueden aplicarse cookies de dichos servicios bajo sus propias políticas.</p>
        <p>Puedes revocar tu consentimiento o limpiar tus preferencias en cualquier momento desde la configuración de tu navegador.</p>
        <p><a href="${basePath}pages/cookies/">Ver documento completo de Política de Cookies</a></p>
      `,
      condicionesVenta: `
        <h1>Condiciones de Reserva de Merchandising</h1>
        <p>Las siguientes condiciones regulan la reserva previa de merchandising oficial de la <strong>Asociación Jorgazo Rock</strong>.</p>
        <p><strong>Exclusivamente recogida y pago en efectivo en el festival:</strong> No se realizan envíos postales ni cobros telemáticos previos. Al confirmar tu reserva tras validar tu correo, recibirás una referencia (<code>JORG-YYMMDD-XXXXXX</code>) para recoger y abonar tus prendas en el stand oficial durante el festival.</p>
        <p>Si no vas a poder asistir o quieres modificar tu reserva, avísanos con antelación escribiendo a <a href="mailto:asociacionjorgazorock@gmail.com">asociacionjorgazorock@gmail.com</a>.</p>
        <p><a href="${basePath}pages/condiciones-venta/">Ver texto completo de las condiciones de reserva</a></p>
      `
    };
    const abrirModalLegal = (tipo) => {
      const contenido = document.getElementById("contenidoLegal");
      if (!contenido) return;
      contenido.innerHTML = textosLegales[tipo] || '';
      modalLegal.style.display = "flex";
    };
    const cerrarModalLegal = () => {
      modalLegal.style.display = "none";
    };
    const closeLegalBtn = document.getElementById("cerrarLegalModal");
    if (closeLegalBtn) {
      closeLegalBtn.addEventListener("click", cerrarModalLegal);
    }
    modalLegal.addEventListener("click", (e) => {
      if (e.target === modalLegal) cerrarModalLegal();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modalLegal.style.display === "flex") {
        cerrarModalLegal();
      }
    });
    document.querySelectorAll("footer a").forEach(enlace => {
      enlace.addEventListener("click", e => {
        const href = enlace.getAttribute("href");
        const isLegalLink = href && !/^https?:/i.test(href) && (
          href.includes('privacidad') ||
          href.includes('avisolegal') ||
          href.includes('cookies') ||
          href.includes('condiciones-venta')
        );
        if (isLegalLink) {
          e.preventDefault();
          if (href.includes('privacidad')) abrirModalLegal("privacidad");
          else if (href.includes('avisolegal')) abrirModalLegal("aviso");
          else if (href.includes('cookies')) abrirModalLegal("cookies");
          else if (href.includes('condiciones-venta')) abrirModalLegal("condicionesVenta");
        }
      });
    });
  }

  /* === MODAL AMPLIACIÓN IMÁGENES (SimpleLightbox) === */
  if (typeof SimpleLightbox !== 'undefined') {
    const lightboxHome = new SimpleLightbox('.grid-jorgazo a, .storytelling-img a, .storytelling-horizontal-img a', {
      captionsData: 'title',
      captionDelay: 250,
      close: true,
      docClose: true,
      swipeTolerance: 50,
      scrollZoom: false
    });

    // Ocultar el botón del menú cuando se abre el lightbox
    lightboxHome.on('show.simplelightbox', function () {
      const menuTrigger = document.getElementById('menu-trigger');
      if (menuTrigger) menuTrigger.style.visibility = 'hidden';
    });
    lightboxHome.on('close.simplelightbox', function () {
      const menuTrigger = document.getElementById('menu-trigger');
      if (menuTrigger) menuTrigger.style.visibility = 'visible';
    });
  }

  /* === MODAL DE BANDAS Y CARGA DINÁMICA DE CARTELAZO (BENTO) === */
  const bandasGridContainer = document.getElementById("bandas-grid-container");
  const modalBanda = document.getElementById("modalBanda");
  const modalBandaBody = document.getElementById("modalBandaBody");
  
  if (bandasGridContainer && modalBanda) {
    let currentBands = [];

    const socialSvgIcons = {
      instagram: '<svg class="social-icon-svg" viewBox="0 0 448 512" aria-hidden="true"><path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/></svg>',
      facebook: '<svg class="social-icon-svg" viewBox="0 0 512 512" aria-hidden="true"><path d="M504 256C504 119 393 8 256 8S8 119 8 256c0 123.78 90.69 226.38 209.25 245V327.69h-63V256h63v-54.64c0-62.15 37-96.48 93.67-96.48 27.14 0 55.52 4.84 55.52 4.84v61h-31.28c-30.8 0-40.41 19.12-40.41 38.73V256h68.78l-11 71.69h-57.78V501C413.31 482.38 504 379.78 504 256z"/></svg>',
      youtube: '<svg class="social-icon-svg" viewBox="0 0 576 512" aria-hidden="true"><path d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z"/></svg>',
      spotify: '<svg class="social-icon-svg" viewBox="0 0 496 512" aria-hidden="true"><path d="M248 8C111.1 8 0 119.1 0 256s111.1 248 248 248 248-111.1 248-248S384.9 8 248 8zm100.7 364.9c-4.2 0-6.8-1.3-10.7-3.6-62.4-37.6-135-39.2-206.7-24.5-3.9 1-9 2.6-11.9 2.6-9.7 0-15.8-7.7-15.8-15.8 0-10.3 6.1-15.2 13.6-16.8 81.9-18.1 165.6-16.5 237 26.2 6.1 3.9 9.7 7.4 9.7 16.5s-7.1 15.4-15.2 15.4zm26.9-65.6c-5.2 0-8.7-2.3-12.3-4.2-62.5-37-155.7-51.9-238.6-29.4-4.8 1.3-7.4 2.6-11.9 2.6-10.7 0-19.4-8.7-19.4-19.4s5.2-17.8 15.5-20.7c27.8-7.8 56.2-13.6 97.8-13.6 64.9 0 127.6 16.1 177 45.5 8.1 4.8 11.3 11 11.3 19.7-.1 10.8-8.5 19.5-19.4 19.5zm31-76.2c-5.2 0-8.4-1.3-12.9-3.9-71.2-42.5-198.5-52.7-280.9-29.7-3.6 1-8.1 2.6-12.9 2.6-13.2 0-23.3-10.3-23.3-23.6 0-13.6 8.4-21.3 17.4-23.9 35.2-10.3 74.6-15.2 117.5-15.2 73 0 149.5 15.2 205.4 47.8 7.8 4.5 12.9 10.7 12.9 22.6 0 13.6-11 23.3-23.2 23.3z"/></svg>',
      bandcamp: '<svg class="social-icon-svg" viewBox="0 0 512 512" aria-hidden="true"><path d="M256,8C119,8,8,119,8,256S119,504,256,504,504,393,504,256,393,8,256,8Zm48.2,326.1h-181L207.9,178h181Z"/></svg>'
    };

    const buildSocialIcons = (social, useNofollow) => {
      if (!social || Object.keys(social).length === 0) return '';
      const rel = useNofollow ? 'rel="nofollow noopener noreferrer"' : 'rel="noopener noreferrer"';
      let html = '';
      if (social.instagram) html += `<a href="${utils.sanitizeUrl(social.instagram)}" target="_blank" ${rel} title="Instagram" aria-label="Instagram">${socialSvgIcons.instagram}</a>`;
      if (social.facebook) html += `<a href="${utils.sanitizeUrl(social.facebook)}" target="_blank" ${rel} title="Facebook" aria-label="Facebook">${socialSvgIcons.facebook}</a>`;
      if (social.youtube) html += `<a href="${utils.sanitizeUrl(social.youtube)}" target="_blank" ${rel} title="YouTube" aria-label="YouTube">${socialSvgIcons.youtube}</a>`;
      if (social.spotify) html += `<a href="${utils.sanitizeUrl(social.spotify)}" target="_blank" ${rel} title="Spotify" aria-label="Spotify">${socialSvgIcons.spotify}</a>`;
      if (social.bandcamp) html += `<a href="${utils.sanitizeUrl(social.bandcamp)}" target="_blank" ${rel} title="Bandcamp" aria-label="Bandcamp">${socialSvgIcons.bandcamp}</a>`;
      return html;
    };

    const loadCartelazo = async () => {
      try {
        const response = await fetch(basePath + 'data/ediciones.json');
        if (!response.ok) throw new Error("No se pudo cargar el archivo");
        const ediciones = await response.json();
        
        const currentEdition = ediciones.find(ed => ed.current === true);
        if (!currentEdition || !currentEdition.bands || currentEdition.bands.length === 0) {
          bandasGridContainer.innerHTML = '<p style="text-align:center; grid-column:1/-1;">Pronto anunciaremos el cartel...</p>';
          return;
        }

        // Ordenar por order si existe
        currentBands = currentEdition.bands.sort((a, b) => (a.order || 99) - (b.order || 99));
        
        let gridHtml = '';
        currentBands.forEach((banda, index) => {
          const socialHtml = buildSocialIcons(banda.social, true);
          
          gridHtml += `
            <article class="banda-card" data-index="${index}" data-aos="fade-up" data-aos-delay="${(index % 4) * 80}" tabindex="0">
              ${banda.image ? `<img src="${utils.sanitizeUrl(basePath + banda.image)}" alt="${utils.escapeHtml(banda.name)}" class="banda-bg-image" width="600" height="600" loading="lazy" decoding="async">` : ''}
              <div class="banda-content-overlay">
                <span class="banda-order">#${banda.order || (index + 1)}</span>
                <div class="banda-nombre">${utils.escapeHtml(banda.name)}</div>
                ${banda.origin ? `<div class="banda-origin">${utils.escapeHtml(banda.origin)}</div>` : ''}
                ${banda.style ? `<span class="banda-style-tag">${utils.escapeHtml(banda.style)}</span>` : ''}
                ${socialHtml ? `<div class="banda-social-icons">${socialHtml}</div>` : ''}
              </div>
            </article>
          `;
        });
        
        bandasGridContainer.innerHTML = gridHtml;

        // Listeners para abrir modal al clicar
        document.querySelectorAll(".banda-card").forEach(card => {
          const index = parseInt(card.getAttribute("data-index"));
          card.addEventListener("click", (e) => {
            // No abrir modal si clican en un enlace social
            if (e.target.closest('a')) return;
            openBandaModal(index);
          });
          card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              openBandaModal(index);
            }
          });
        });

      } catch (error) {
        console.error("Error al cargar el cartelazo:", error);
        bandasGridContainer.innerHTML = '<p style="text-align:center; grid-column:1/-1;">Error al cargar las bandas confirmadas.</p>';
      }
    };

    const openBandaModal = (index) => {
      const banda = currentBands[index];

      const socialLinksHtml = buildSocialIcons(banda.social, true);
      const socialBlock = socialLinksHtml ? `<div class="banda-social-links">${socialLinksHtml}</div>` : '';

      modalBandaBody.innerHTML = `
        <h3>${utils.escapeHtml(banda.name)}</h3>
        ${banda.origin ? `<p style="color:#aaa; font-style:italic; margin-bottom:0.5rem;">${utils.escapeHtml(banda.origin)}</p>` : ''}
        ${banda.style ? `<p style="color:#e60000; font-weight:bold; margin-bottom:1.5rem;">${utils.escapeHtml(banda.style)}</p>` : ''}
        <p>${utils.escapeHtml(banda.bio) || 'Preparando ruido para la proxima edicion.'}</p>
        ${socialBlock}
      `;

      modalBanda.style.display = "flex";
    };

    // Cerrar modal
    const closeModalBanda = document.querySelector(".close-modal-banda");
    if (closeModalBanda) {
      closeModalBanda.addEventListener("click", () => {
        modalBanda.style.display = "none";
      });
    }
    window.addEventListener("click", (e) => {
      if (e.target === modalBanda) modalBanda.style.display = "none";
    });

    loadCartelazo();
  }


  /* === LÓGICA COOKIE BANNER === */
  const cookieBanner = document.getElementById('cookie-banner');
  const acceptBtn = document.getElementById('cookie-accept');
  const rejectBtn = document.getElementById('cookie-reject');

  if (cookieBanner) {
    if (!localStorage.getItem('jorgazo-cookies')) {
      cookieBanner.style.display = 'block';
    }

    acceptBtn.addEventListener('click', () => {
      localStorage.setItem('jorgazo-cookies', 'accepted');
      cookieBanner.style.display = 'none';
    });

    rejectBtn.addEventListener('click', () => {
      localStorage.setItem('jorgazo-cookies', 'rejected');
      cookieBanner.style.display = 'none';
    });
  }

  /* === LÓGICA EL ALTAVOZ DEL JORGAZO (NOTICIAS Y COMENTARIOS) === */
  const loadAltavozContent = async () => {
    const blogContainer = document.getElementById('blog-container');
    const comentariosLista = document.getElementById('comentarios-lista');

    // Cargar Noticias
    if (blogContainer) {
      const renderNewsHome = (news) => {
        let newsHtml = '';
        news.slice(0, 1).forEach(item => {
          newsHtml += `
            <article class="blog-card-mini" data-aos="fade-right" data-id="${item.id}">
              <img src="${item.image || 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?q=80&w=600'}" alt="${utils.escapeHtml(item.title || 'Noticia')}" class="card-img ${item.imageFit === 'contain' ? 'card-img-contain' : ''}" loading="lazy" decoding="async">
              <div class="card-text">
                <span class="tag">${utils.escapeHtml(item.source).toUpperCase()}</span>
                <h3>${utils.escapeHtml(item.title)}</h3>
                <p>${utils.escapeHtml(item.homeSummary || item.summary) || ''}</p>
                <div class="card-actions">
                  <a href="${utils.sanitizeUrl(item.link)}" target="_blank" rel="noopener noreferrer" class="read-more">${utils.escapeHtml(item.linkText || 'Fuente original →')}</a>
                  <a href="${isSubpage ? '../actualidad/' : 'pages/actualidad/'}" class="read-more" style="border: 2px solid #e60000; color: #e60000; padding: 6px 12px; display: inline-block; margin-top: 8px; font-weight: bold; text-decoration: none; transition: all 0.2s ease;">Ver El Altavoz completo →</a>
                </div>
              </div>
            </article>
          `;
        });
        blogContainer.innerHTML = newsHtml;
      };

      // Si tenemos los datos cargados por el script (bypass CORS)
      if (typeof JORGAZO_NEWS !== 'undefined') {
        renderNewsHome(JORGAZO_NEWS);
      } else {
        // Fallback fetch
        try {
          const response = await fetch(basePath + 'data/news_staging.json');
          if (response.ok) {
            const news = await response.json();
            renderNewsHome(news);
          }
        } catch (e) {
          console.error("Error cargando noticias:", e);
        }
      }
    }

    // Cargar Comentarios
    if (comentariosLista) {
      try {
        const response = await fetch(basePath + 'data/comments.json');
        if (response.ok) {
          const comments = await response.json();
          let commentsHtml = '';
          // En la home mostramos los últimos 10 comentarios generales
          comments.slice(-10).reverse().forEach(c => {
            commentsHtml += `
              <div class="comentario-item" data-news-id="${utils.escapeHtml(c.news_id || '')}">
                <strong style="color:#e60000;">${utils.escapeHtml(c.name)}</strong> 
                <p>${utils.escapeHtml(c.text)}</p>
              </div>
            `;
          });
          if (comments.length > 0) {
            comentariosLista.innerHTML = commentsHtml;
          }
        }
      } catch (e) {
        console.error("Error cargando comentarios:", e);
      }
    }
  };

  loadAltavozContent();

  const commentForm = document.getElementById('comment-form');
  if (commentForm) {
    commentForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = commentForm.querySelector('input[name="nombre"]').value;

      // Simulación de envío punky
      alert(`¡Gracias ${name}! Hemos recibido tu mensaje. Lo revisaremos pronto para publicarlo en el Muro. 🤘`);
      commentForm.reset();
    });
  }
});
