const LAUNCH_MODE = false;

if (LAUNCH_MODE) {
  document.querySelectorAll(".waitlist-cta").forEach((el) => {
    if (el.dataset.launchText) el.textContent = el.dataset.launchText;
  });
}

const revealEls = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("in-view");
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.14 });

  revealEls.forEach((el) => revealObserver.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add("in-view"));
}

const counters = document.querySelectorAll("[data-target]");
const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
const numberFormat = new Intl.NumberFormat("en-NZ");

function initializeProcessJourney(root) {
  const steps = Array.from(root.querySelectorAll(".process-step"));
  const timers = new Set();
  let started = false;
  let observer = null;

  const finish = () => {
    timers.forEach((timer) => window.clearTimeout(timer));
    timers.clear();
    started = true;
    steps.forEach((step) => step.classList.add("is-active", "is-connected"));
    root.classList.remove("is-sequenced");
    if (observer) observer.unobserve(root);
  };

  if (motionPreference.matches || !("IntersectionObserver" in window)) {
    finish();
    return;
  }

  root.classList.add("is-sequenced");
  const after = (delay, callback) => {
    const timer = window.setTimeout(() => {
      timers.delete(timer);
      callback();
    }, delay);
    timers.add(timer);
  };

  // Fill each connector before activating its destination; all text remains visible.
  const start = () => {
    if (started) return;
    started = true;
    steps.forEach((step, index) => {
      after(500 + index * 1000, () => step.classList.add("is-active"));
      if (index < steps.length - 1) {
        after(800 + index * 1000, () => step.classList.add("is-connected"));
      }
    });
    observer.unobserve(root);
  };

  observer = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) start();
  }, { threshold: 0.14 });
  observer.observe(root);
  motionPreference.addEventListener("change", () => {
    if (motionPreference.matches) finish();
  });
}

document.querySelectorAll("[data-process-journey]").forEach(initializeProcessJourney);

function countTo(el) {
  const target = Number.parseInt(el.getAttribute("data-target"), 10);
  const suffix = el.getAttribute("data-suffix") || "";
  if (motionPreference.matches) {
    el.textContent = `${numberFormat.format(target)}${suffix}`;
    return;
  }
  const step = Math.max(1, Math.round(target / 24));
  let current = 0;

  const timer = window.setInterval(() => {
    current = motionPreference.matches ? target : Math.min(target, current + step);
    el.textContent = `${numberFormat.format(current)}${current >= target ? suffix : ""}`;
    if (current >= target) window.clearInterval(timer);
  }, 70);
}

if ("IntersectionObserver" in window) {
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      countTo(entry.target);
      counterObserver.unobserve(entry.target);
    });
  }, { threshold: 0.45 });

  counters.forEach((el) => counterObserver.observe(el));
} else {
  counters.forEach(countTo);
}

const journalTrack = document.querySelector("#journal-track");
const journalButtons = document.querySelectorAll("[data-journal-direction]");

if (journalTrack) {
  const updateJournalButtons = () => {
    const end = journalTrack.scrollWidth - journalTrack.clientWidth;
    journalButtons.forEach((button) => {
      button.disabled = Number(button.dataset.journalDirection) < 0
        ? journalTrack.scrollLeft <= 1
        : journalTrack.scrollLeft >= end - 1;
    });
  };
  journalButtons.forEach((button) => {
    button.addEventListener("click", () => {
      journalTrack.scrollBy({
        left: Number(button.dataset.journalDirection) * (journalTrack.firstElementChild.offsetWidth + 20),
        behavior: motionPreference.matches ? "auto" : "smooth"
      });
    });
  });
  journalTrack.addEventListener("scroll", updateJournalButtons, { passive: true });
  window.addEventListener("resize", updateJournalButtons);
  updateJournalButtons();
}

function initializeWordRotator(root, { wordsAttribute, currentSelector, nextSelector, interval, transition }) {
  const words = JSON.parse(root.dataset[wordsAttribute]);
  const current = root.querySelector(currentSelector);
  const next = root.querySelector(nextSelector);
  let index = 0;
  let pendingIndex = null;
  let timer = null;
  let transitionTimer = null;
  let visible = !("IntersectionObserver" in window);

  const settle = () => {
    window.clearTimeout(transitionTimer);
    if (pendingIndex !== null) {
      index = pendingIndex;
      current.textContent = words[index];
      pendingIndex = null;
    }
    next.textContent = "";
    root.classList.remove("is-changing");
  };

  const stop = () => {
    window.clearTimeout(timer);
    settle();
  };

  const canAnimate = () => visible && !motionPreference.matches && !document.hidden;

  const schedule = () => {
    window.clearTimeout(timer);
    if (!canAnimate()) return;
    timer = window.setTimeout(() => {
      if (!canAnimate()) return;
      pendingIndex = (index + 1) % words.length;
      next.textContent = words[pendingIndex];
      root.classList.add("is-changing");
      transitionTimer = window.setTimeout(() => {
        settle();
        schedule();
      }, transition);
    }, interval - transition);
  };

  const updateMotion = () => {
    stop();
    if (motionPreference.matches) {
      index = 0;
      current.textContent = words[0];
    }
    schedule();
  };

  if ("IntersectionObserver" in window) {
    new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      stop();
      schedule();
    }, { threshold: 0.5 }).observe(root);
  }

  document.addEventListener("visibilitychange", () => {
    stop();
    schedule();
  });
  motionPreference.addEventListener("change", updateMotion);
  updateMotion();
}

function initializeBrandRotator(root) {
  initializeWordRotator(root, {
    wordsAttribute: "brandWords",
    currentSelector: ".brand-word-current",
    nextSelector: ".brand-word-next",
    interval: 2000,
    transition: 280
  });
}

function initializeTaglineRotator(root) {
  initializeWordRotator(root, {
    wordsAttribute: "taglineWords",
    currentSelector: ".tagline-word-current",
    nextSelector: ".tagline-word-next",
    interval: 2500,
    transition: 300
  });
}

document.querySelectorAll("[data-brand-rotator]").forEach(initializeBrandRotator);
document.querySelectorAll("[data-tagline-rotator]").forEach(initializeTaglineRotator);

function initializeHeroCarousel(root) {
  const slides = JSON.parse(root.dataset.heroSlides);
  const layers = root.querySelectorAll(".hero-slide");
  if (slides.length < 2 || layers.length !== 2) return;
  const hero = root.closest(".hero");
  let active = layers[0];
  let incoming = layers[1];
  let index = 0;
  let nextIndex = 1;
  let ready = false;
  let fading = false;
  let timer = null;
  let visible = !("IntersectionObserver" in window);
  let focused = false;

  const canAnimate = () => visible && !focused && !motionPreference.matches && !document.hidden;

  // Only the next image is prepared; a failed download never replaces the visible photo.
  const prepareNext = (candidate = (index + 1) % slides.length) => {
    if (!canAnimate() || candidate === index) return;
    ready = false;
    nextIndex = candidate;
    const slide = slides[candidate];
    const layer = incoming;
    layer.fetchPriority = "low";
    layer.onload = () => { if (layer === incoming) ready = layer.naturalWidth > 0; };
    layer.onerror = () => prepareNext((candidate + 1) % slides.length);
    layer.style.objectPosition = slide.position;
    layer.sizes = "100vw";
    layer.srcset = `${slide.small} 800w, ${slide.src} ${slide.width}w`;
    layer.src = slide.src;
    if (layer.complete && layer.naturalWidth > 0) ready = true;
  };

  const schedule = (delay = 3500) => {
    window.clearTimeout(timer);
    if (!canAnimate() || fading) return;
    timer = window.setTimeout(() => {
      if (!canAnimate()) return;
      if (!ready) {
        schedule();
        return;
      }
      fading = true;
      incoming.classList.add("is-active");
      active.classList.remove("is-active");
      window.setTimeout(() => {
        [active, incoming] = [incoming, active];
        index = nextIndex;
        ready = false;
        fading = false;
        prepareNext();
        schedule(2600);
      }, 900);
    }, delay);
  };

  const update = () => {
    window.clearTimeout(timer);
    if (canAnimate() && !fading) {
      if (!ready) prepareNext();
      schedule();
    }
  };

  if ("IntersectionObserver" in window) {
    new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      update();
    }, { threshold: 0.1 }).observe(hero);
  }
  hero.addEventListener("focusin", () => { focused = true; update(); });
  hero.addEventListener("focusout", (event) => {
    focused = hero.contains(event.relatedTarget);
    update();
  });
  document.addEventListener("visibilitychange", update);
  motionPreference.addEventListener("change", update);
  update();
}

document.querySelectorAll("[data-hero-carousel]").forEach(initializeHeroCarousel);
