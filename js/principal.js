/* MODAL CARTEL / FECHA */

window.addEventListener("load", function () {
  const modal = document.getElementById("modalCartel");
  const cartelImg = document.getElementById("cartelImg");
  const fallback = document.getElementById("fallbackFecha");

  // Cambia esta ruta si cambias el nombre o ubicación del cartel
  const cartelURL = "images/cartel_jorgazo_2025.jpg";

  // Comprobamos si la imagen del cartel existe
  fetch(cartelURL, { method: 'HEAD' })
    .then((res) => {
      if (res.ok) {
        cartelImg.src = cartelURL;
        cartelImg.style.display = "block";
        fallback.style.display = "none";
      } else {
        fallback.style.display = "block";
      }
      modal.style.display = "flex";
    })
    .catch(() => {
      fallback.style.display = "block";
      modal.style.display = "flex";
    });

  // Botón cerrar
  document.getElementById("cerrarModal").addEventListener("click", () => {
    modal.style.display = "none";
  });

  // Cerrar al hacer clic fuera
  window.addEventListener("click", function (e) {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });
});

/* CONTADOR */

const targetDate = new Date("2025-10-18T20:00:00");

function updateCountdown() {
  const now = new Date();
  const diff = targetDate - now;
  if (diff <= 0) {
    document.getElementById("countdown").innerHTML =
      "<p>¡El Jorgazo ha empezado!</p>";
    return;
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  document.getElementById("days").textContent = String(days).padStart(2, "0");
  document.getElementById("hours").textContent = String(hours).padStart(2, "0");
  document.getElementById("minutes").textContent = String(minutes).padStart(
    2,
    "0"
  );
  document.getElementById("seconds").textContent = String(seconds).padStart(
    2,
    "0"
  );
}
updateCountdown();
setInterval(updateCountdown, 1000);

// scrolling logo 

const logo = document.getElementById("scroll-logo");
  window.addEventListener("scroll", () => {
    const scrollY = window.scrollY;
    const windowH = window.innerHeight;
    const section = document.querySelector(".section-logo-intro");
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;

    if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
      const progress = (scrollY - sectionTop) / sectionHeight;
      const scale = 0.5 + progress * 0.7;
      logo.style.transform = `scale(${scale})`;
      logo.style.opacity = 0.8 + progress * 0.8;
    }
  });

/* === MODAL LEGAL === */

  const textosLegales = {
    privacidad: `
      <h1>Política de Privacidad</h1>

  <p>En cumplimiento de lo dispuesto en el Reglamento (UE) 2016/679, del Parlamento Europeo y del Consejo, de 27 de abril de 2016 (RGPD), y en la Ley Orgánica 3/2018, de Protección de Datos Personales y garantía de los derechos digitales (LOPDGDD), se informa a los usuarios de esta web sobre el tratamiento de sus datos personales.</p>

  <h2>1. Responsable del tratamiento</h2>
  <p><strong>Nombre de la entidad:</strong> Asociación Jorgazo Rock</p>
  <p><strong>CIF:</strong> <!-- COMPLETAR cuando esté disponible --></p>
  <p><strong>Domicilio:</strong> <!-- COMPLETAR (ej. Calle X, Cabeza la Vaca, Badajoz) --></p>
  <p><strong>Email de contacto:</strong> <!-- COMPLETAR (correo oficial para privacidad) --></p>

  <h2>2. Datos que se recopilan</h2>
  <p>Recopilamos los siguientes datos personales:</p>
  <ul>
    <li>Nombre y dirección de correo electrónico (a través de formularios o solicitudes de información).</li>
    <li>Datos técnicos como dirección IP, navegador, dispositivo, etc., mediante cookies y herramientas analíticas.</li>
  </ul>

  <h2>3. Finalidades del tratamiento</h2>
  <p>Los datos personales serán tratados con las siguientes finalidades:</p>
  <ul>
    <li>Responder a consultas a través del formulario de contacto.</li>
    <li>Gestionar el alta de socios y comunicaciones asociativas.</li>
    <li>Enviar información relacionada con el festival o actividades culturales asociadas.</li>
    <li>Analizar el comportamiento de los usuarios en la web para mejorar su experiencia.</li>
  </ul>

  <h2>4. Legitimación</h2>
  <p>El tratamiento de los datos se basa en el consentimiento expreso del usuario, otorgado al aceptar esta política mediante los mecanismos habilitados (checkboxes). También puede basarse en el cumplimiento de obligaciones legales o contractuales cuando proceda.</p>

  <h2>5. Destinatarios y encargados del tratamiento</h2>
  <p>Los datos podrán ser tratados por prestadores de servicios vinculados a esta web, como:</p>
  <ul>
    <li>Google Analytics (servicio de análisis web).</li>
    <li>Plataformas de pago como PayPal (en caso de activarse en el futuro).</li>
  </ul>
  <p>No se realizarán transferencias internacionales de datos fuera del Espacio Económico Europeo sin garantías adecuadas conforme al RGPD.</p>

  <h2>6. Conservación de los datos</h2>
  <p>Los datos personales se conservarán durante el tiempo mínimo necesario para cumplir con la finalidad para la que se recogen, o hasta que el usuario solicite su supresión, y en todo caso el periodo legal establecido por la normativa española y europea vigente.</p>

  <h2>7. Derechos de los usuarios</h2>
  <p>El usuario puede ejercer sus derechos de acceso, rectificación, supresión, limitación, oposición y portabilidad de sus datos dirigiéndose por escrito a:</p>
  <p><strong>Email:</strong> <!-- COMPLETAR (correo oficial para derechos ARSULIPO) --></p>
  <p>El ejercicio de estos derechos será atendido en el plazo legal establecido y de forma gratuita.</p>

  <h2>8. Seguridad</h2>
  <p>La Asociación Jorgazo Rock se compromete a aplicar las medidas de seguridad técnicas y organizativas necesarias para proteger los datos personales contra pérdida, uso indebido, acceso no autorizado o alteración.</p>

  <h2>9. Modificaciones</h2>
  <p>Nos reservamos el derecho de modificar esta política de privacidad en cualquier momento, para adaptarla a futuras novedades legislativas o jurisprudenciales. En caso de cambios sustanciales, se notificará debidamente en esta misma página.</p>
    `,
    aviso: `
      <h1>Aviso Legal</h1>

  <p>En cumplimiento con lo dispuesto en la Ley 34/2002, de 11 de julio, de servicios de la sociedad de la información y de comercio electrónico (LSSI-CE), se informa que este sitio web es propiedad de la Asociación Jorgazo Rock.</p>

  <h2>1. Datos identificativos</h2>
  <ul>
    <li><strong>Nombre de la entidad:</strong> Asociación Jorgazo Rock</li>
    <li><strong>Domicilio:</strong> <!-- COMPLETAR (ej. Dirección en Cabeza la Vaca) --></li>
    <li><strong>Email de contacto:</strong> <!-- COMPLETAR (correo de contacto oficial) --></li>
    <li><strong>Dominio web:</strong> <!-- COMPLETAR (ej. www.jorgazorock.org) --></li>
    <li><strong>CIF:</strong> <!-- COMPLETAR cuando esté disponible --></li>
  </ul>

  <h2>2. Objeto del sitio web</h2>
  <p>La finalidad del sitio web es ofrecer información sobre el festival Jorgazo Rock, promover actividades culturales y musicales, gestionar el alta de socios y difundir contenidos relacionados con la asociación organizadora.</p>

  <h2>3. Propiedad intelectual e industrial</h2>
  <p>Todos los contenidos del sitio web, incluyendo textos, imágenes, logos, diseños, vídeos y demás material, son propiedad de la Asociación Jorgazo Rock o de sus respectivos autores, y están protegidos por la legislación española e internacional sobre propiedad intelectual e industrial.</p>
  <p>Queda prohibida la reproducción, distribución o modificación de estos contenidos sin autorización expresa.</p>

  <h2>4. Enlaces externos</h2>
  <p>Este sitio web puede contener enlaces a páginas de terceros (Spotify, redes sociales, otros festivales, etc.). La Asociación Jorgazo Rock no se hace responsable de los contenidos, políticas de privacidad o prácticas de dichas páginas externas.</p>

  <h2>5. Responsabilidades</h2>
  <p>La Asociación Jorgazo Rock no se hace responsable de los posibles daños o perjuicios derivados del mal uso de la web, interrupciones del servicio, errores técnicos o virus informáticos.</p>

  <h2>6. Legislación aplicable y jurisdicción</h2>
  <p>La relación entre el usuario y la Asociación Jorgazo Rock se regirá por la legislación española y europea vigente. En caso de conflicto, las partes se someterán a los juzgados y tribunales que correspondan según el domicilio del usuario.</p>
    `,
    cookies: `
      <h1>Política de Cookies</h1>

  <p>Esta web, propiedad de la Asociación Jorgazo Rock, utiliza cookies y tecnologías similares para mejorar la experiencia de navegación, analizar el uso del sitio y personalizar el contenido, conforme a lo establecido en el Reglamento (UE) 2016/679 (RGPD), la Ley Orgánica 3/2018 (LOPDGDD) y la Ley 34/2002 (LSSI-CE).</p>

  <h2>1. ¿Qué son las cookies?</h2>
  <p>Las cookies son pequeños archivos de texto que los sitios web instalan en el dispositivo del usuario al visitarlos. Sirven para reconocer al usuario, recordar preferencias y ofrecer un servicio más personalizado.</p>

  <h2>2. Tipos de cookies utilizadas en esta web</h2>
  <p>En Jorgazo Rock utilizamos las siguientes categorías de cookies:</p>
  <ul>
    <li><strong>Cookies técnicas:</strong> necesarias para el funcionamiento básico del sitio.</li>
    <li><strong>Cookies de personalización:</strong> permiten recordar preferencias como idioma o región.</li>
    <li><strong>Cookies analíticas:</strong> recogen información sobre el uso del sitio para mejorar nuestros servicios (ej. Google Analytics).</li>
    <li><strong>Cookies de terceros:</strong> como las relacionadas con integraciones de redes sociales o reproductores embebidos (ej. Spotify, Instagram, etc.).</li>
  </ul>

  <h2>3. Cookies de terceros</h2>
  <p>Algunas cookies pueden ser instaladas por servicios de terceros, como:</p>
  <ul>
    <li>Google Analytics: para analizar estadísticas anónimas de navegación.</li>
    <li>Spotify: mediante embeds de reproductores musicales.</li>
    <li>Redes sociales: al interactuar con botones o contenidos incrustados de plataformas como Instagram o Facebook.</li>
  </ul>
  <p>Estas cookies están gestionadas por terceros y se rigen por sus propias políticas de privacidad.</p>

  <h2>4. Gestión del consentimiento</h2>
  <p>Al acceder por primera vez a nuestra web, se muestra un banner de cookies que permite:</p>
  <ul>
    <li>Aceptar todas las cookies.</li>
    <li>Rechazar todas las cookies no necesarias.</li>
    <li>Configurar preferencias específicas por categoría.</li>
  </ul>

  <p>El usuario puede modificar su consentimiento en cualquier momento desde el pie de página o limpiando las cookies desde su navegador.</p>

  <h2>5. ¿Cómo desactivar o eliminar cookies?</h2>
  <p>El usuario puede permitir, bloquear o eliminar las cookies desde las opciones de configuración de su navegador. A continuación, se facilitan enlaces a las instrucciones para los principales navegadores:</p>
  <ul>
    <li><a href="https://support.google.com/chrome/answer/95647?hl=es" target="_blank">Google Chrome</a></li>
    <li><a href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear" target="_blank">Mozilla Firefox</a></li>
    <li><a href="https://support.apple.com/es-es/HT201265" target="_blank">Safari</a></li>
    <li><a href="https://support.microsoft.com/es-es/help/17442/windows-internet-explorer-delete-manage-cookies" target="_blank">Internet Explorer / Edge</a></li>
  </ul>

  <h2>6. Modificaciones en la política de cookies</h2>
  <p>Esta política puede ser modificada en función de cambios legislativos o técnicos. Se recomienda consultarla periódicamente para mantenerse informado sobre el uso de cookies en este sitio web.</p>
    `
  };

  // === FUNCIONES DEL MODAL ===
  function abrirModalLegal(tipo) {
    const modal = document.getElementById("modalLegal");
    const contenido = document.getElementById("contenidoLegal");

    contenido.innerHTML = textosLegales[tipo];
    modal.style.display = "flex";
  }

  function cerrarModalLegal() {
    document.getElementById("modalLegal").style.display = "none";
  }

  document.addEventListener("DOMContentLoaded", () => {
    // Cerrar modal
    document.getElementById("cerrarLegalModal").addEventListener("click", cerrarModalLegal);

    // Enlaces legales del footer
    document.querySelectorAll("footer a").forEach(enlace => {
      enlace.addEventListener("click", e => {
        const href = e.target.getAttribute("href");

        if (href === "pages/privacidad.html") {
          e.preventDefault();
          abrirModalLegal("privacidad");
        } else if (href === "pages/avisolegal.html") {
          e.preventDefault();
          abrirModalLegal("aviso");
        } else if (href === "pages/cookies.html") {
          e.preventDefault();
          abrirModalLegal("cookies");
        }
      });
    });
  });

  /* === MODAL PARA AMPLIACIÓN DE IMÁGENES === */

  // Función para abrir el modal con la imagen
  function openModal(src) {
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("modalImage");
    modal.style.display = "flex";
    modalImg.src = src;
  }

  // Función para cerrar el modal
  function closeModal() {
    document.getElementById("imageModal").style.display = "none";
  }

  // Asociar clics a todas las imágenes de la galería
  document.addEventListener("DOMContentLoaded", function () {
    const imgs = document.querySelectorAll(".grid-jorgazo img, .storytelling-img img");
    imgs.forEach(img => {
      img.style.cursor = "zoom-in";
      img.addEventListener("click", () => openModal(img.src));
    });
  });
