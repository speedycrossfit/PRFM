/* ============================================================
     LAUNCH DAY SWITCH — the ONLY edit needed to flip every
     "Join waitlist" button site-wide to its launch-day text.

     HOW TO USE:
       1. Change the line below from `false` to `true`.
       2. Save the file. Refresh the page. Done.

     This affects every button/link with class="waitlist-cta" —
     that's every purchase and signup button on the page (nav,
     hero, orange strip, programme CTAs, final CTA). Each
     one already has its launch-day text pre-written in its
     data-launch-text="..." attribute in the HTML, so nothing
     else needs to be touched.

     To go back to pre-launch/waitlist mode later, set it back
     to `false`.
     ============================================================ */
  const LAUNCH_MODE = false;

  if (LAUNCH_MODE) {
    document.querySelectorAll('.waitlist-cta').forEach(el => {
      if (el.dataset.launchText) el.textContent = el.dataset.launchText;
    });
  }

  // scroll reveal
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in-view'); io.unobserve(e.target); } });
  }, { threshold: 0.15 });
  revealEls.forEach(el => io.observe(el));

  // count-up stats (Coach Ben section)
  const counters = document.querySelectorAll('[data-target]');
  const cio = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseInt(el.getAttribute('data-target'), 10);
      const suffix = el.getAttribute('data-suffix') || '';
      let cur = 0;
      const step = Math.max(1, Math.round(target / 20));
      const t = setInterval(() => {
        cur = Math.min(target, cur + step);
        el.textContent = cur >= target ? (target + suffix) : cur;
        if (cur >= target) clearInterval(t);
      }, 40);
      cio.unobserve(el);
    });
  }, { threshold: 0.4 });
  counters.forEach(el => cio.observe(el));

  // Blog carousel
  (function(){
    const track = document.getElementById('blog-track');
    const wrap  = document.getElementById('blog-wrap');
    const dotsEl = document.getElementById('blog-dots');
    const cards = Array.from(track.querySelectorAll('.blog-card'));
    const total = cards.length;
    let current = Math.floor(total / 2); // start on center card

    // Build dots
    cards.forEach((_, i) => {
      const d = document.createElement('div');
      d.className = 'blog-dot';
      d.addEventListener('click', () => goTo(i));
      dotsEl.appendChild(d);
    });

    function goTo(idx) {
      current = Math.max(0, Math.min(total - 1, idx));
      render();
    }

    function render() {
      cards.forEach((c, i) => {
        const dist = i - current;
        c.classList.remove('center', 'side');
        if (dist === 0) {
          c.classList.add('center');
          c.style.order = 2;
        } else {
          c.classList.add('side');
          c.style.order = dist < 0 ? 1 : 3;
        }
        // Only show -1, 0, +1 positions; hide anything further
        c.style.display = Math.abs(dist) > 1 ? 'none' : '';
      });
      // Dots
      Array.from(dotsEl.children).forEach((d, i) => {
        d.classList.toggle('active', i === current);
      });
    }

    document.getElementById('blog-prev').addEventListener('click', () => goTo(current - 1));
    document.getElementById('blog-next').addEventListener('click', () => goTo(current + 1));

    // Drag / swipe
    let startX = 0, isDragging = false;
    wrap.addEventListener('pointerdown', e => { startX = e.clientX; isDragging = true; wrap.setPointerCapture(e.pointerId); });
    wrap.addEventListener('pointermove', e => { if (!isDragging) return; });
    wrap.addEventListener('pointerup', e => {
      if (!isDragging) return;
      isDragging = false;
      const delta = e.clientX - startX;
      if (Math.abs(delta) > 40) goTo(current + (delta < 0 ? 1 : -1));
    });

    render();
  })();
