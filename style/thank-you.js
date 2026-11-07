(function () {
  'use strict';
  const sequence = document.querySelector('[data-thanks-sequence]');
  const steps = sequence && sequence.querySelector('.thanks-steps');
  if (!steps || !('IntersectionObserver' in window) || !window.matchMedia('(prefers-reduced-motion: no-preference)').matches) return;
  const introEndsAt = performance.now() + 1400;
  const observer = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    sequence.style.setProperty('--intro-delay', `${Math.max(0, introEndsAt - performance.now())}ms`);
    sequence.classList.add('is-playing');
    observer.disconnect();
  });
  observer.observe(steps);
})();
