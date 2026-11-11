(function () {
  'use strict';
  const list = document.querySelector('[data-faq]');
  if (!list) return;

  const hover = window.matchMedia('(any-hover: hover) and (any-pointer: fine)');
  let openItem = null;
  let hoveredItem = null;
  let hoverTimer;

  function setExpanded(item, expanded) {
    item.button.setAttribute('aria-expanded', String(expanded));
    item.panel.setAttribute('aria-hidden', String(!expanded));
  }

  function open(item) {
    list.classList.add('is-interactive');
    if (openItem) setExpanded(openItem, false);
    if (item) setExpanded(item, true);
    openItem = item;
  }

  list.querySelectorAll('.faq-item').forEach(row => {
    const item = { button: row.querySelector('button'), panel: row.querySelector('.faq-panel') };
    setExpanded(item, false);
    item.button.disabled = false;

    item.button.addEventListener('click', () => {
      clearTimeout(hoverTimer);
      open(openItem === item ? null : item);
    });

    // Real pointer movement starts hover intent. A row shifting during an animation does not.
    item.button.addEventListener('pointermove', event => {
      if (event.pointerType !== 'mouse' || !hover.matches || hoveredItem === item) return;
      clearTimeout(hoverTimer);
      hoveredItem = item;
      if (openItem !== item) {
        hoverTimer = setTimeout(() => {
          if (hover.matches && hoveredItem === item) open(item);
        }, 175);
      }
    });

    row.addEventListener('pointerleave', event => {
      if (event.pointerType !== 'mouse' || hoveredItem !== item) return;
      clearTimeout(hoverTimer);
      hoveredItem = null;
    });
  });
})();
