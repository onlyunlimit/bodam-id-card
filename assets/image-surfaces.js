// Keep accessible image labels; the visible artwork is a CSS background, not an image source.
const blank =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/%3E';
export function initImageSurfaces() {
  const protect = (img) => {
    if (
      !(img instanceof HTMLImageElement) ||
      img.closest('.leaflet-container') ||
      !img.getAttribute('src') ||
      img.getAttribute('src') === blank
    )
      return;
    const source = img.getAttribute('src');
    img.dataset.imageUrl = source;
    img.style.backgroundImage = `url(${JSON.stringify(source)})`;
    img.draggable = false;
    img.removeAttribute('srcset');
    if (!img.width && !img.height) {
      img.style.aspectRatio = '2 / 3';
      const probe = new Image();
      probe.onload = () => {
        if (img.isConnected)
          img.style.aspectRatio = probe.naturalWidth + ' / ' + probe.naturalHeight;
      };
      probe.src = source;
    }
    img.src = blank;
  };
  const walk = (root) => {
    if (root instanceof HTMLImageElement) protect(root);
    root.querySelectorAll?.('img').forEach(protect);
  };
  walk(document);
  new MutationObserver((records) =>
    records.forEach((r) => {
      if (r.type === 'attributes') protect(r.target);
      else r.addedNodes.forEach(walk);
    }),
  ).observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['src'],
  });
  document.addEventListener('contextmenu', (e) => {
    if (e.target.closest('[data-image-url],.id-photo,.profile-photo-window,.gallery-lightbox'))
      e.preventDefault();
  });
  document.addEventListener('dragstart', (e) => {
    if (e.target.closest('[data-image-url]')) e.preventDefault();
  });
}
