[![License: CC BY-NC-ND 4.0](https://img.shields.io/badge/License-CC%20BY--NC--ND%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-nd/4.0/)

# 🎸 Jorgazo Rock - Sitio web oficial

Este repositorio contiene la web del festival punk-rock **Jorgazo Rock**, un evento cultural y autogestionado que se celebra cada otoño en **Cabeza La Vaca (Badajoz)** desde 2013.

👉 Puedes ver la web en vivo aquí:  
[https://jorgazorock.es](https://jorgazorock.es)

---

## 🔥 Características

- Sitio 100% responsivo con diseño visual potente y accesible.
- HTML, CSS y JavaScript puro, sin frameworks ni dependencias en tiempo de ejecución innecesarias.
- Scroll suave con efecto visual tipo “pantalla por pantalla”.
- Modal dinámico de cartel con fallback automático y modales legales unificados en todas las páginas.
- Contador regresivo hasta el evento, cartel de bandas con horarios y sección de actualidad (**El Altavoz**).
- Tienda de reservas solidarias con verificación OTP por correo y recogida presencial.
- Galerías de imágenes, archivo de ediciones pasadas, bloques de storytelling y manifiesto.
- Integración con Spotify para vivir el ambiente del festival.
- Optimización visual y coherencia con el estilo alternativo del evento.

---

## 🛠 Tecnologías utilizadas

- **HTML5** – estructura semántica y accesible.
- **CSS3** – con uso avanzado de Flexbox, Grid, Media Queries y scroll-snap.
- **JavaScript vanilla** – sin dependencias de npm externas.
- **Google Apps Script + Google Sheets** – backend serverless para gestión de reservas de merchandising.
- **GitHub Pages** – usado como sistema de despliegue gratuito del sitio.

---

## 🛡️ Seguridad, Privacidad y Automatización

El sitio incorpora endurecimiento de seguridad orientado a arquitectura estática (GitHub Pages) + backend serverless:

- **Sanitización XSS y URLs**: validación estricta de esquemas (`utils.sanitizeUrl` y `utils.escapeHtml`) para bloquear esquemas peligrosos (`javascript:`, `data:`, `vbscript:`, rutas `//`) y prevenir inyección DOM en noticias, cartel de bandas y ediciones.
- **Dependencias fijadas y CSP**: CDN de AOS fijado a versión concreta (`aos@2.3.4`), política `Referrer-Policy: strict-origin-when-cross-origin` en todas las páginas, enlaces externos con `rel="noopener noreferrer"` y Content Security Policy en la tienda.
- **Integridad de reservas y hojas de cálculo**: validación de variantes y cantidades contra el catálogo antes de enviar pedidos, timeouts con `AbortController` (`15s`), y protección anti-CSV/Formula Injection (`=`, `+`, `-`, `@`) tanto en cliente como en servidor.
- **Modales legales compatibles con rastreadores**: las páginas `/pages/privacidad/`, `/pages/avisolegal/`, `/pages/cookies/` y `/pages/condiciones-venta/` existen como documentos HTML independientes para cumplimiento e indexación, pero al navegar desde el footer de la web se despliegan en el modal integrado para conservar la estética punk-rock.

---

## 📁 Estructura del proyecto

├── index.html                   # Página principal
├── css/                         # Estilos del sitio
├── js/                          # Funcionalidades JS y utilidades de seguridad
├── data/                        # Catálogo de tienda, noticias y ediciones
├── images/                      # Imágenes y carteles de la web
├── assets/                      # Galería, carteles de blog y otros assets
├── pages/                       # Secciones (tienda, galería, actualidad, ediciones, legales)
├── scripts/                     # Utilidades locales (sync tienda y automatización Altavoz)
├── robots.txt                   # Reglas para buscadores y rastreadores
├── llms.txt                     # Contexto y directrices para agentes IA
├── sitemap.xml                  # Mapa del sitio para indexación
└── README.md                    # Este documento

---

## 🙌 Créditos y agradecimientos

- 🎤 Proyecto desarrollado por **Marta GG** como iniciativa sin ánimo de lucro para dar visibilidad a Jorgazo Rock, con cariño, ética y estilo DIY.
- 📸 Imágenes y contenidos originales cedidos por la organización del festival.
- 📍 Gracias a la **Asociación Jorgazo Rock** por su labor continua promoviendo la cultura alternativa, inclusiva y familiar desde el corazón de Cabeza La Vaca.
- 🤘 A todas las bandas, artistas, asistentes y colaboradorxs que han hecho del Jorgazo lo que es hoy: **resistencia, alegría y comunidad**.

---
