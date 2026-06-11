document.addEventListener("DOMContentLoaded", () => {

  /* === LÓGICA MENÚ PUNK === */
  const menuTrigger = document.getElementById('menu-trigger');
  const menuOverlay = document.getElementById('punk-menu-overlay');
  const menuClose = document.getElementById('menu-close');
  const menuLinks = document.querySelectorAll('.menu-link');
  const body = document.body;

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
      if (targetId.startsWith('#')) {
        e.preventDefault();
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth'
          });
        }
        closeMenu();
      }
      // If it's a page (e.g., pages/tienda.html), let the default navigation happen
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

  /* === MODAL CARTEL / FECHA === */
  const modalCartel = document.getElementById("modalCartel");
  if (modalCartel) {
    window.addEventListener("load", function () {
      const cartelImg = document.getElementById("cartelImg");
      const fallback = document.getElementById("fallbackFecha");
      const isSubpage = window.location.pathname.includes('/pages/');
      const basePath = isSubpage ? '../../' : '';
      const cartelURL = basePath + "assets/gallery/full/cartel/Jorgazo-Rock_X.webp";
      fetch(cartelURL, { method: 'HEAD' })
        .then(res => {
          if (res.ok) {
            cartelImg.src = cartelURL;
            cartelImg.style.display = "block";
            fallback.style.display = "none";
          } else {
            fallback.style.display = "block";
          }
          modalCartel.style.display = "flex";
        })
        .catch(() => {
          fallback.style.display = "block";
          modalCartel.style.display = "flex";
        });
      document.getElementById("cerrarModal").addEventListener("click", () => {
        modalCartel.style.display = "none";
      });
      window.addEventListener("click", function (e) {
        if (e.target === modalCartel) {
          modalCartel.style.display = "none";
        }
      });
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
  const modalLegal = document.getElementById("modalLegal");
  if (modalLegal) {
    const textosLegales = {
      privacidad: `
        <h1>Política de Privacidad</h1>
        <p>En cumplimiento de lo dispuesto en el Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018 (LOPDGDD), la <strong>Asociación Jorgazo Rock</strong> informa que los datos personales recabados a través de este sitio web, incluyendo datos de navegación y analítica, serán tratados para gestionar la relación con socios y usuarios, así como para informar sobre las actividades del festival.</p>
        <p><strong>Responsable:</strong> Asociación Jorgazo Rock. <strong>Fines:</strong> Comunicación, gestión de actividades y analítica web. <strong>Tienda:</strong> En caso de transacciones comerciales futuras, se tratarán datos identificativos y de pago exclusivamente para la gestión del pedido. <strong>Legitimación:</strong> Consentimiento del interesado y ejecución de contrato/relación asociativa. <strong>Destinatarios:</strong> No se cederán datos a terceros salvo obligación legal o proveedores técnicos necesarios. <strong>Derechos:</strong> Acceso, rectificación, supresión y portabilidad enviando un correo a la dirección de contacto.</p>
        <p>Contacto: <a href="mailto:asociacionjorgazorock@gmail.com">asociacionjorgazorock@gmail.com</a></p>
      `,
      aviso: `
        <h1>Aviso Legal</h1>
        <p>En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y Comercio Electrónico (LSSI-CE), se exponen los siguientes datos identificativos:</p>
        <p><strong>Titular:</strong> Asociación Jorgazo Rock<br>
        <strong>CIF/NIF:</strong> [Pendiente Incluir si procede]<br>
        <strong>Domicilio:</strong> Cabeza la Vaca, 06293, Badajoz (Extremadura)<br>
        <strong>Correo electrónico:</strong> <a href="mailto:asociacionjorgazorock@gmail.com">asociacionjorgazorock@gmail.com</a></p>
        <p>La asociación está inscrita en el Registro de Asociaciones de la Junta de Extremadura. El acceso a este sitio web atribuye la condición de USUARIO e implica la plena aceptación de las condiciones de uso publicadas.</p>
      `,
      cookies: `
        <h1>Política de Cookies</h1>
        <p>Este sitio web utiliza cookies propias y de terceros para mejorar la experiencia de navegación, realizar análisis estadísticos de uso y ofrecer contenidos de interés.</p>
        <p><strong>Tipos de cookies utilizadas:</strong><br>
        - <strong>Técnicas:</strong> Esenciales para el funcionamiento correcto de la web.<br>
        - <strong>Analíticas:</strong> Utilizamos herramientas de medición (como Google Analytics o similares) para entender cómo interactúan los usuarios con la web, siempre respetando su privacidad.<br>
        - <strong>Preferencias:</strong> Permiten recordar opciones como el idioma o la aceptación del banner de cookies.</p>
        <p>Puedes revocar tu consentimiento o configurar tus preferencias en cualquier momento a través del banner de inicio o limpiando los datos de tu navegador.</p>
      `,
      condicionesVenta: `
        <h1>Condiciones de Venta</h1>
        <p>Las siguientes condiciones regulan la venta de merchandising de la <strong>Asociación Jorgazo Rock</strong>.</p>
        <p>El proceso de pago se realiza mediante <strong>Bizum</strong> tras la confirmación de la reserva. Los envíos se gestionarán según la opción seleccionada (Recogida en festival o Envío a domicilio).</p>
        <p><a href="pages/condiciones-venta/">Lee el texto completo de las condiciones de venta aquí</a>.</p>
      `
    };
    const abrirModalLegal = (tipo) => {
      const contenido = document.getElementById("contenidoLegal");
      contenido.innerHTML = textosLegales[tipo];
      modalLegal.style.display = "flex";
    }
    const cerrarModalLegal = () => {
      modalLegal.style.display = "none";
    }
    document.getElementById("cerrarLegalModal").addEventListener("click", cerrarModalLegal);
    document.querySelectorAll("footer a").forEach(enlace => {
      enlace.addEventListener("click", e => {
        const href = enlace.getAttribute("href");
        if (href && href.includes('pages/')) {
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

    const buildSocialIcons = (social, useNofollow) => {
      if (!social || Object.keys(social).length === 0) return '';
      const rel = useNofollow ? 'rel="nofollow noopener noreferrer"' : 'rel="noopener noreferrer"';
      let html = '';
      if (social.instagram) html += `<a href="${social.instagram}" target="_blank" ${rel} title="Instagram"><i class="fab fa-instagram"></i></a>`;
      if (social.facebook) html += `<a href="${social.facebook}" target="_blank" ${rel} title="Facebook"><i class="fab fa-facebook"></i></a>`;
      if (social.youtube) html += `<a href="${social.youtube}" target="_blank" ${rel} title="YouTube"><i class="fab fa-youtube"></i></a>`;
      if (social.spotify) html += `<a href="${social.spotify}" target="_blank" ${rel} title="Spotify"><i class="fab fa-spotify"></i></a>`;
      if (social.bandcamp) html += `<a href="${social.bandcamp}" target="_blank" ${rel} title="Bandcamp"><i class="fab fa-bandcamp"></i></a>`;
      return html;
    };

    const loadCartelazo = async () => {
      try {
        const response = await fetch('data/ediciones.json');
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
              ${banda.image ? `<img src="${banda.image}" alt="${banda.name}" class="banda-bg-image">` : ''}
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
              <img src="${item.image || 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?q=80&w=600'}" alt="Noticia" class="card-img">
              <div class="card-text">
                <span class="tag">${utils.escapeHtml(item.source).toUpperCase()}</span>
                <h3>${utils.escapeHtml(item.title)}</h3>
                <p>${utils.escapeHtml(item.summary) || ''}</p>
                <div class="card-actions">
                  <a href="${utils.sanitizeUrl(item.link)}" target="_blank" rel="noopener noreferrer" class="read-more">Fuente original →</a>
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
          const response = await fetch('data/news_staging.json');
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
        const response = await fetch('data/comments.json');
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
