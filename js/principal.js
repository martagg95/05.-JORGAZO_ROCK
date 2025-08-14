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
    body.classList.add('forceful-shake');
    menuTrigger.setAttribute('aria-expanded', 'true');
    setTimeout(() => {
      body.classList.remove('forceful-shake');
    }, 800);
    setTimeout(() => {
        menuClose.focus();
    }, 100);
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
      e.preventDefault();
      const targetId = link.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth'
        });
      }
      closeMenu();
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
      const cartelURL = "images/cartel_jorgazo_2025.jpg";
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
    const targetDate = new Date("2025-10-18T20:00:00");
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
  if(modalLegal) {
    const textosLegales = {
      privacidad: `<h1>Política de Privacidad</h1>...`,
      aviso: `<h1>Aviso Legal</h1>...`,
      cookies: `<h1>Política de Cookies</h1>...`
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
    document.querySelectorAll("footer a[href*='pages/']").forEach(enlace => {
      enlace.addEventListener("click", e => {
        e.preventDefault();
        const href = e.target.getAttribute("href");
        if (href.includes('privacidad')) abrirModalLegal("privacidad");
        else if (href.includes('avisolegal')) abrirModalLegal("aviso");
        else if (href.includes('cookies')) abrirModalLegal("cookies");
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
});
