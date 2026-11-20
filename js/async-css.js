(() => {
  const activate = (link) => {
    if (link.media !== 'all') {
      link.media = 'all';
    }
  };
  document.querySelectorAll('link[data-async-css]').forEach((link) => {
    if (link.sheet) {
      activate(link);
    } else {
      link.addEventListener('load', () => activate(link), { once: true });
    }
  });
})();

