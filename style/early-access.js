(function () {
  'use strict';
  const root = document.querySelector('[data-early-access-counters]');
  if (!root) return;
  const counters = Array.from(root.querySelectorAll('[data-early-access-target]')).map(element => ({
    element,
    target: Number.parseInt(element.getAttribute('data-early-access-target'), 10),
    suffix: element.getAttribute('data-suffix') || '',
    current: 0
  }));
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const format = new Intl.NumberFormat('en-NZ');
  let observer;
  let timer;
  let started = false;

  function finish() {
    started = true;
    window.clearInterval(timer);
    if (observer) observer.disconnect();
    counters.forEach(counter => {
      counter.element.textContent = `${format.format(counter.target)}${counter.suffix}`;
    });
    root.dataset.counterState = 'complete';
    if (preference.removeEventListener) preference.removeEventListener('change', motionChanged);
  }

  function motionChanged() {
    if (preference.matches) finish();
  }

  function start() {
    if (started) return;
    if (preference.matches) return finish();
    started = true;
    observer.disconnect();
    root.dataset.counterState = 'playing';
    counters.forEach(counter => { counter.element.textContent = `0${counter.suffix}`; });
    // Match the homepage's linear increments and 70 ms cadence, starting all three together.
    timer = window.setInterval(() => {
      if (preference.matches) return finish();
      counters.forEach(counter => {
        const step = Math.max(1, Math.round(counter.target / 24));
        counter.current = Math.min(counter.target, counter.current + step);
        counter.element.textContent = `${format.format(counter.current)}${counter.suffix}`;
      });
      if (counters.every(counter => counter.current >= counter.target)) finish();
    }, 70);
  }

  if (preference.matches || !('IntersectionObserver' in window)) return finish();
  root.dataset.counterState = 'waiting';
  observer = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) start();
  }, { threshold: .45 });
  observer.observe(root);
  if (preference.addEventListener) preference.addEventListener('change', motionChanged);
})();
