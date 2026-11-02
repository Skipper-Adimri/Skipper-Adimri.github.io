// Enhance the ordinary image link; it still works when JavaScript is unavailable.
(() => {
  function init() {
    const link = document.getElementById('ndyag-enlarge-modes');
    if (!link || !('HTMLDialogElement' in window)) return;
    const dialog = document.createElement('dialog');
    dialog.className = 'ndyag-viewer-dialog';
    dialog.setAttribute('aria-label', 'Enlarged transverse laser modes');
    const image = document.createElement('img');
    image.className = 'ndyag-viewer-image';
    image.src = link.href;
    image.alt = 'Enlarged illustration of six transverse laser modes and intensity surfaces';
    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'ndyag-viewer-close';
    closeButton.setAttribute('aria-label', 'Close enlarged figure');
    closeButton.textContent = '×';
    dialog.append(image, closeButton);
    document.body.appendChild(dialog);
    link.addEventListener('click', (event) => {
      event.preventDefault();
      dialog.showModal();
      closeButton.focus();
    });
    closeButton.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener('close', () => link.focus());
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
