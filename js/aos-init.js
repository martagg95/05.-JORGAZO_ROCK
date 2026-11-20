const initAos = () => {
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 1000, // duración de la animación
      once: true,     // solo se anima una vez al aparecer
      offset: 100     // cuando empieza a activarse (en píxeles)
    });
  }
};

if ('requestIdleCallback' in window) {
  requestIdleCallback(initAos, { timeout: 1500 });
} else {
  window.addEventListener('load', initAos, { once: true });
}
