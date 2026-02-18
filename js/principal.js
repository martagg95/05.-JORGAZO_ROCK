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
      const cartelURL = "assets/gallery/full/cartel/Jorgazo-Rock_X.webp";
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
        }
      });
    });
  }

  /* === MODAL AMPLIACIÓN IMÁGENES === */
  const imageModal = document.getElementById("imageModal");
  if (imageModal) {
    const openModal = (src) => {
      const modalImg = document.getElementById("modalImage");
      imageModal.style.display = "flex";
      modalImg.src = src;
    }
    const closeModal = () => {
      imageModal.style.display = "none";
    }
    document.querySelectorAll(".grid-jorgazo img, .storytelling-img img").forEach(img => {
      img.style.cursor = "zoom-in";
      img.addEventListener("click", () => openModal(img.src));
    });
    imageModal.querySelector('.modal-close').addEventListener('click', closeModal);
  }

  /* === MODAL DE BANDAS Y ACCESIBILIDAD TARJETAS === */
  const modalBanda = document.getElementById("modalBanda");
  if (modalBanda) {
    const bandasData = {
      "banda-1": {
        nombre: "Delírium Clownico Cirkabaret Musikal",
        bio: "¡Primera Actuación Jorgazo Rock! Ellos son los encargados de abrir la 10ª edición. Directamente desde Huelva, este dúo de payasos mezcla circo, teatro y música en un espectáculo único. ¡Humor y arte para empezar con fuerza!",
        link: "https://www.facebook.com/story.php?story_fbid=1202388761927602&id=100064694679305&mibextid=wwXIfr&rdid=CzLXXZl9IAw7Cj8B#",
        linkType: "facebook",
      },
      "banda-2": {
        nombre: "Vila MC YeuH",
        bio: "Vila MC YeuH es un artista de rap combativo, con letras potentes y un mensaje directo que resuena con la esencia del Jorgazo Rock. Su música es un puñetazo de libertad en cada rima.",
        link: "https://www.youtube.com/user/VilaMcyoou",
        linkType: "youtube",
        social: {
          instagram: "https://www.instagram.com/villa.mc/",
          facebook: "https://www.facebook.com/VilaMCYeuH/"
        }
      },
      "banda-3": {
        nombre: "River Hakes",
        bio: "Desde Cáceres, Extremadura, River Hakes trae su potente hardcore-metal al Jorgazo Rock. Formados en 2019, su energía en el escenario y sus letras contundentes prometen un directo inolvidable, fiel al espíritu rebelde del festival.",
        link: "https://www.youtube.com/@riverhakes",
        linkType: "youtube",
        social: {
          instagram: "https://www.instagram.com/riverhakes/",
          facebook: "https://www.facebook.com/riverhakescc"
        }
      },
      "banda-4": {
        nombre: "Bellotaris Fallecidos",
        bio: "Bellotaris Fallecidos es una banda de punk rock de Plasencia, Extremadura. Con un estilo enérgico y letras cargadas de humor y crítica social, son un guiño a bandas como The Dead Kennedys y Lendakaris Muertos. ¡Prepárate para una dosis de punk rock directo y sin filtros!",
        link: "https://bellotarisfallecidos.bandcamp.com/",
        linkType: "website",
        social: {
        }
      },
      "banda-5": {
        nombre: "26/H",
        bio: "26/H es una banda de hardcore punk de Badajoz. Fundada en 2011 y reformada en 2023, su sonido potente y sus letras directas son un reflejo de la escena hardcore de la región. ¡No te pierdas su energía en el Jorgazo Rock!",
        link: "https://www.youtube.com/@26HC",
        linkType: "youtube",
        social: {
          instagram: "https://www.instagram.com/26h_bdjz/",
          facebook: "https://www.facebook.com/veintiseis.barrah",
          spotify: "https://shre.ink/Spotify26H",
          bandcamp: "https://26hardcore.bandcamp.com/"
        }
      },
      "banda-7": {
        nombre: "Ehta Gente",
        bio: "Power trío sensacional de punk-rock, extremeños hasta la médula. Su música es un reflejo de la escena musical más alternativa y el movimiento okupa.",
        link: "https://ehtagente.bandcamp.com/",
        linkType: "website",
        social: {
          youtube: "https://www.youtube.com/@ehtagente15",
          instagram: "https://www.instagram.com/ehta.gente/",
        }
      },
      "banda-8": {
        nombre: "Chicalapapa",
        bio: "Artista musical con un estilo único. Sus canciones como \"Mil maneras de palmarla\" y \"Plástico y plastilina\" muestran su versatilidad y originalidad.",
        link: "https://www.youtube.com/@chicalapapa4853",
        linkType: "youtube",
        social: {
          instagram: "https://www.instagram.com/chicalapapaoficial"
        }
      },
      "banda-9": {
        nombre: "Ermitaño",
        bio: "Banda de rock fusión que vienen a darlo todo desde Ayamonte hasta Cabeza La Vaca. ¿Te los vas a perder?",
        link: "https://www.youtube.com/@srwilliestudios8849",
        linkType: "youtube",
        social: {
          instagram: "https://www.instagram.com/ermitano_music"
        }
      },
      "banda-10": {
        nombre: "Gatos Lokos",
        bio: "¡10ª actuación y última del Festival! El día 18/10 en Cabeza la Vaca, son los encargados de poner el broche final con su rave. ¡También son Extremeños!",
        link: "https://www.facebook.com/100064694679305/posts/1214059404093871/?mibextid=wwXIfr&rdid=Diw87T0suYPEZ2ry",
        linkType: "facebook",
        social: {
        }
      }
    };

    const modalBandaBody = document.getElementById("modalBandaBody");
    const closeModalBanda = document.querySelector(".close-modal-banda");

    const openBandaModal = (bandaId) => {
      const banda = bandasData[bandaId];
      let externalLinkContent = '';
      if (banda.link) {
        let buttonText = '';
        if (banda.linkType === 'facebook') {
          buttonText = 'Ver publicación en Facebook';
        } else if (banda.linkType === 'youtube') {
          buttonText = 'Ver canal de YouTube';
        } else if (banda.linkType === 'website') {
          buttonText = 'Ver sitio web';
        } else {
          buttonText = 'Ver más';
        }
        externalLinkContent = `<a href="${banda.link}" target="_blank" class="cta-button">${buttonText}</a>`;
      }

      let socialLinksContent = '';
      if (banda.social) {
        socialLinksContent = '<div class="banda-social-links">';
        if (banda.social.spotify && banda.social.spotify !== '#') {
          socialLinksContent += `<a href="${banda.social.spotify}" target="_blank"><i class="fab fa-spotify"></i></a>`;
        }
        if (banda.social.instagram && banda.social.instagram !== '#') {
          socialLinksContent += `<a href="${banda.social.instagram}" target="_blank"><i class="fab fa-instagram"></i></a>`;
        }
        if (banda.social.facebook && banda.social.facebook !== '#') {
          socialLinksContent += `<a href="${banda.social.facebook}" target="_blank"><i class="fab fa-facebook"></i></a>`;
        }
        if (banda.social.bandcamp && banda.social.bandcamp !== '#') {
          socialLinksContent += `<a href="${banda.social.bandcamp}" target="_blank"><i class="fab fa-bandcamp"></i></a>`;
        }
        socialLinksContent += '</div>';
      }

      modalBandaBody.innerHTML = `
        <h3>${banda.nombre}</h3>
        <p>${banda.bio}</p>
        <div class="banda-video">
          ${externalLinkContent}
        </div>
        ${socialLinksContent}
      `;

      modalBanda.style.display = "flex";
    }

    document.querySelectorAll(".banda-card").forEach(card => {
      const bandaId = card.getAttribute("data-banda");
      card.addEventListener("click", () => openBandaModal(bandaId));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openBandaModal(bandaId);
        }
      });
    });

    closeModalBanda.addEventListener("click", () => {
      modalBanda.style.display = "none";
    });

    window.addEventListener("click", (e) => {
      if (e.target === modalBanda) {
        modalBanda.style.display = "none";
      }
    });
  }

  /* === LÓGICA PARA EL TEASER DE LA GALERÍA EN HOME === */
  const homeGalleryContainer = document.getElementById('home-gallery-teaser-grid');
  if (homeGalleryContainer) {
    const loadHomeGallery = async () => {
      try {
        const response = await fetch('assets/gallery.json');
        if (!response.ok) return;
        const allImages = await response.json();

        // Filter out images with the "bandas" tag
        const nonBandImages = allImages.filter(image => !image.tags.includes('bandas'));

        // Seleccionar 12 imágenes aleatorias de las que no son de bandas
        const shuffled = nonBandImages.sort(() => 0.5 - Math.random());
        const selectedImages = shuffled.slice(0, 12);

        let html = '';
        selectedImages.forEach(image => {
          // Usamos una estructura similar a la original pero más simple
          html += `
            <div class="grid-item" data-aos="zoom-in-up">
              <img src="${image.thumb}" alt="${image.alt}" loading="lazy">
            </div>
          `;
        });
        homeGalleryContainer.innerHTML = html;

      } catch (error) {
        console.error("Error loading gallery teaser:", error);
        homeGalleryContainer.innerHTML = '<p>No se pudo cargar la galería de avance.</p>';
      }
    }
    loadHomeGallery();
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
                <span class="tag">${item.source.toUpperCase()}</span>
                <h3>${item.title}</h3>
                <p>${item.summary || ''}</p>
                <div class="card-actions">
                  <a href="${item.link}" target="_blank" class="read-more">Fuente original →</a>
                  <a href="pages/actualidad/" class="read-more" style="border: 2px solid #e60000; color: #e60000; padding: 6px 12px; display: inline-block; margin-top: 8px; font-weight: bold; text-decoration: none; transition: all 0.2s ease;">Ver El Altavoz completo →</a>
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
              <div class="comentario-item" data-news-id="${c.news_id || ''}">
                <strong style="color:#e60000;">${c.name}</strong> 
                <p>${c.text}</p>
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
