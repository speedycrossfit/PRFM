const assert = require('node:assert/strict');
const { existsSync, readFileSync } = require('node:fs');
const { join } = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const source = readFileSync(join(__dirname, '../style/main.js'), 'utf8');
const html = readFileSync(join(__dirname, '../index.html'), 'utf8');
const heroSlides = JSON.parse(html.match(/data-hero-slides='([^']+)'/)[1]);

test('Version 5 preserves photo order, pre-launch form and program copy while applying the approved refinements', () => {
  assert.deepEqual(heroSlides.map((slide) => slide.src), [
    'images/hero-athlete.jpg', 'images/hero-coaches-la.jpg', 'images/hero-woman-back.jpg',
    'images/hero-woman-barbell.jpg', 'images/hero-woman-tyre.jpg', 'images/hero-man-rowing.jpg'
  ]);
  for (const slide of heroSlides) {
    assert.ok(existsSync(join(__dirname, '..', slide.src)));
    assert.ok(existsSync(join(__dirname, '..', slide.small)));
  }
  assert.deepEqual(JSON.parse(html.match(/data-tagline-words='([^']+)'/)[1]), ['HUMANS', 'ATHLETES', 'PEOPLE']);
  assert.match(html, /Stop exercising\. Start training\. Set a goal, follow a plan, and make every session count\./);
  assert.match(html, /Build your foundations, follow a structured plan, or get access to the complete training system\./);
  assert.match(html, /Four-week programs designed to build a strong foundation, develop consistency and create momentum in your training\./);
  assert.equal((html.match(/One-time program/g) || []).length, 2);
  assert.doesNotMatch(html, /Start with foundations, move into ongoing programming|The Athlete Mindset|\bprogrammes?\b/i);
  assert.equal((html.match(/The Performance Mindset/g) || []).length, 2);
  assert.match(html, /action="https:\/\/formspree\.io\/f\/xdarbjra" method="POST"/);
  assert.ok(existsSync(join(__dirname, '../images/ben-handstand-coaching.jpg')));
  assert.ok(existsSync(join(__dirname, '../images/ben-handstand-coaching-small.jpg')));
  assert.match(html, /alt="Ben Thompson supporting an athlete through a handstand exercise"/);
  assert.doesNotMatch(html, /&[mn]dash;|[\u2013\u2014]/);
  assert.match(html, /Built by real coaches,<br>not AI/);
  assert.match(html, /data-process-journey/);
  assert.match(html, /images\/testimonial-josh-landscape\.jpg/);
  assert.ok(existsSync(join(__dirname, '../images/testimonial-josh-landscape.jpg')));
});

function environment({ reduced = false, failedImages = [], intersection = true } = {}) {
  let now = 0;
  let id = 0;
  const tasks = new Map();
  const observers = [];
  const listeners = {};
  const preferenceListeners = [];
  const eventListeners = {};
  const preference = {
    matches: reduced,
    addEventListener: (_, callback) => { preferenceListeners.push(callback); },
    change: () => preferenceListeners.forEach((callback) => callback())
  };
  const document = {
    hidden: false,
    querySelectorAll: () => [],
    querySelector: () => null,
    addEventListener: (name, callback) => {
      (eventListeners[name] ||= []).push(callback);
      listeners[name] = () => eventListeners[name].forEach((handler) => handler());
    }
  };
  const schedule = (callback, delay, interval = false) => {
    const key = ++id;
    tasks.set(key, { callback, at: now + delay, delay, interval });
    return key;
  };
  function IntersectionObserver(callback) {
    observers.push(callback);
    this.observe = () => {};
    this.unobserve = () => {};
  }
  const context = vm.createContext({
    document, Intl, IntersectionObserver,
    window: {
      ...(intersection ? { IntersectionObserver } : {}),
      matchMedia: () => preference,
      setTimeout: (fn, delay) => schedule(fn, delay),
      clearTimeout: (key) => tasks.delete(key),
      setInterval: (fn, delay) => schedule(fn, delay, true),
      clearInterval: (key) => tasks.delete(key)
    }
  });
  vm.runInContext(source, context);
  const classes = (...initial) => {
    const values = new Set(initial);
    return { add: (...items) => items.forEach((x) => values.add(x)), remove: (x) => values.delete(x), contains: (x) => values.has(x) };
  };
  const image = (active = false) => {
    let src = active ? heroSlides[0].src : '';
    const element = { classList: classes(...(active ? ['is-active'] : [])), style: {}, complete: active, naturalWidth: active ? 100 : 0 };
    Object.defineProperty(element, 'src', {
      get: () => src,
      set: (value) => {
        src = value;
        element.complete = false;
        element.naturalWidth = 0;
        schedule(() => {
          if (src !== value) return;
          element.complete = true;
          if (failedImages.includes(value)) element.onerror();
          else { element.naturalWidth = 100; element.onload(); }
        }, 10);
      }
    });
    return element;
  };
  const advance = (duration) => {
    const end = now + duration;
    while (true) {
      const next = [...tasks.entries()].filter(([, task]) => task.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
      if (!next) break;
      const [key, task] = next;
      now = task.at;
      if (task.interval) task.at += task.delay;
      else tasks.delete(key);
      task.callback();
    }
    now = end;
  };
  return { context, document, preference, listeners, observers, classes, image, advance };
}

function brand(env) {
  const words = ['BASE', 'BUILD', 'STRONG', 'CAPACITY', 'PRIME', 'PRO', 'CUSTOM'];
  const current = { textContent: 'BASE' };
  const next = { textContent: '' };
  const root = {
    dataset: { brandWords: JSON.stringify(words) },
    classList: env.classes(),
    querySelector: (selector) => selector === '.brand-word-current' ? current : next
  };
  env.context.initializeBrandRotator(root);
  env.observers.at(-1)([{ isIntersecting: true }]);
  return { current, next, words };
}

function processJourney(env) {
  const steps = Array.from({ length: 5 }, () => ({ classList: env.classes() }));
  const root = { classList: env.classes(), querySelectorAll: () => steps };
  env.context.initializeProcessJourney(root);
  return { root, steps, activated: () => steps.filter((step) => step.classList.contains('is-active')).length };
}

test('journey waits for the viewport and activates one step per second, filling each connector first', () => {
  const env = environment();
  const journey = processJourney(env);
  env.advance(10000);
  assert.equal(journey.activated(), 0);
  const observe = env.observers.at(-1);
  observe([{ isIntersecting: true }]);
  env.advance(499);
  assert.equal(journey.activated(), 0);
  env.advance(1);
  assert.equal(journey.activated(), 1);
  for (let index = 0; index < 4; index++) {
    assert.equal(journey.steps[index].classList.contains('is-connected'), false);
    env.advance(300);
    assert.equal(journey.steps[index].classList.contains('is-connected'), true);
    assert.equal(journey.activated(), index + 1);
    env.advance(699);
    assert.equal(journey.activated(), index + 1);
    env.advance(1);
    assert.equal(journey.activated(), index + 2);
  }
  observe([{ isIntersecting: false }]);
  observe([{ isIntersecting: true }]);
  env.advance(10000);
  assert.equal(journey.activated(), 5);
  assert.ok(journey.steps.slice(0, 4).every((step) => step.classList.contains('is-connected')));
});

test('journey is complete immediately for reduced motion or browsers without IntersectionObserver', () => {
  for (const options of [{ reduced: true }, { intersection: false }]) {
    const env = environment(options);
    const journey = processJourney(env);
    assert.equal(journey.activated(), 5);
    assert.equal(journey.root.classList.contains('is-sequenced'), false);
    env.advance(10000);
    assert.equal(journey.activated(), 5);
  }
});

test('enabling reduced motion completes an in-progress journey and prevents replay', () => {
  const env = environment();
  const journey = processJourney(env);
  const observe = env.observers.at(-1);
  observe([{ isIntersecting: true }]);
  env.advance(1700);
  assert.equal(journey.activated(), 2);
  env.preference.matches = true;
  env.preference.change();
  assert.equal(journey.activated(), 5);
  assert.equal(journey.root.classList.contains('is-sequenced'), false);
  env.preference.matches = false;
  env.preference.change();
  observe([{ isIntersecting: true }]);
  env.advance(10000);
  assert.equal(journey.activated(), 5);
});

function tagline(env) {
  const words = ['HUMANS', 'ATHLETES', 'PEOPLE'];
  const current = { textContent: words[0] };
  const next = { textContent: '' };
  const root = {
    dataset: { taglineWords: JSON.stringify(words) },
    classList: env.classes(),
    querySelector: (selector) => selector === '.tagline-word-current' ? current : next
  };
  env.context.initializeTaglineRotator(root);
  env.observers.at(-1)([{ isIntersecting: true }]);
  return { current, next, words };
}

function hero(env) {
  const events = {};
  const section = { addEventListener: (name, callback) => { events[name] = callback; }, contains: () => false };
  const layers = [env.image(true), env.image()];
  const root = { dataset: { heroSlides: JSON.stringify(heroSlides) }, querySelectorAll: () => layers, closest: () => section };
  env.context.initializeHeroCarousel(root);
  env.observers.at(-1)([{ isIntersecting: true }]);
  return { layers, events, visible: () => layers.find((x) => x.classList.contains('is-active')).src };
}

test('brand advances every two seconds in the requested order and loops', () => {
  const env = environment();
  const b = brand(env);
  for (const word of [...b.words.slice(1), 'BASE']) {
    env.advance(1999);
    assert.notEqual(b.current.textContent, word);
    env.advance(1);
    assert.equal(b.current.textContent, word);
    assert.equal(b.next.textContent, '');
  }
});

test('brand is static with reduced motion, including live preference changes', () => {
  const env = environment({ reduced: true });
  const b = brand(env);
  env.advance(5000);
  assert.equal(b.current.textContent, 'BASE');
  env.preference.matches = false;
  env.preference.change();
  env.advance(2000);
  assert.equal(b.current.textContent, 'BUILD');
  env.preference.matches = true;
  env.preference.change();
  env.advance(5000);
  assert.equal(b.current.textContent, 'BASE');
});

test('brand pauses off-screen and in hidden tabs', () => {
  const env = environment();
  const b = brand(env);
  env.observers.at(-1)([{ isIntersecting: false }]);
  env.advance(5000);
  assert.equal(b.current.textContent, 'BASE');
  env.observers.at(-1)([{ isIntersecting: true }]);
  env.document.hidden = true;
  env.listeners.visibilitychange();
  env.advance(5000);
  assert.equal(b.current.textContent, 'BASE');
});

test('tagline fades through HUMANS, ATHLETES and PEOPLE every 2.5 seconds and loops', () => {
  const env = environment();
  const t = tagline(env);
  for (const word of ['ATHLETES', 'PEOPLE', 'HUMANS']) {
    env.advance(2499);
    assert.notEqual(t.current.textContent, word);
    assert.equal(t.next.textContent, word);
    env.advance(1);
    assert.equal(t.current.textContent, word);
    assert.equal(t.next.textContent, '');
  }
});

test('tagline is static with reduced motion and pauses off-screen or in hidden tabs', () => {
  const env = environment({ reduced: true });
  const t = tagline(env);
  env.advance(10000);
  assert.equal(t.current.textContent, 'HUMANS');
  env.preference.matches = false;
  env.preference.change();
  env.advance(2500);
  assert.equal(t.current.textContent, 'ATHLETES');
  env.observers.at(-1)([{ isIntersecting: false }]);
  env.advance(10000);
  assert.equal(t.current.textContent, 'ATHLETES');
  env.observers.at(-1)([{ isIntersecting: true }]);
  env.document.hidden = true;
  env.listeners.visibilitychange();
  env.advance(10000);
  assert.equal(t.current.textContent, 'ATHLETES');
  env.preference.matches = true;
  env.preference.change();
  assert.equal(t.current.textContent, 'HUMANS');
});

test('all three hero animations react together to live reduced-motion changes', () => {
  const env = environment();
  const b = brand(env);
  const t = tagline(env);
  const h = hero(env);
  env.advance(5000);
  env.preference.matches = true;
  env.preference.change();
  const photo = h.visible();
  env.advance(10000);
  assert.equal(b.current.textContent, 'BASE');
  assert.equal(t.current.textContent, 'HUMANS');
  assert.equal(h.visible(), photo);
});

test('hero retains all six photos in order, crossfades every 3.5 seconds and loops', () => {
  const env = environment();
  const h = hero(env);
  env.advance(3499);
  assert.equal(h.visible(), heroSlides[0].src);
  env.advance(1);
  assert.equal(h.visible(), heroSlides[1].src);
  for (const expected of [...heroSlides.slice(2), heroSlides[0]].map((slide) => slide.src)) {
    env.advance(3500);
    assert.equal(h.visible(), expected);
  }
});

test('hero skips failed images without replacing the current image with an error', () => {
  const env = environment({ failedImages: [heroSlides[1].src] });
  const h = hero(env);
  env.advance(3500);
  assert.equal(h.visible(), heroSlides[2].src);
});

test('hero is static and does not preload extra photos with reduced motion', () => {
  const env = environment({ reduced: true });
  const h = hero(env);
  env.advance(30000);
  assert.equal(h.visible(), heroSlides[0].src);
  assert.equal(h.layers[1].src, '');
});

test('hero pauses off-screen, in hidden tabs and while interacting with hero content', () => {
  const env = environment();
  const h = hero(env);
  env.observers.at(-1)([{ isIntersecting: false }]);
  env.advance(5000);
  assert.equal(h.visible(), heroSlides[0].src);
  env.observers.at(-1)([{ isIntersecting: true }]);
  env.document.hidden = true;
  env.listeners.visibilitychange();
  env.advance(5000);
  assert.equal(h.visible(), heroSlides[0].src);
  env.document.hidden = false;
  env.listeners.visibilitychange();
  h.events.focusin();
  env.advance(5000);
  assert.equal(h.visible(), heroSlides[0].src);
  h.events.focusout({ relatedTarget: null });
  env.advance(3500);
  assert.equal(h.visible(), heroSlides[1].src);
});

test('credibility counters retain their targets, formatting and reduced-motion behaviour', () => {
  for (const reduced of [false, true]) {
    const env = environment({ reduced });
    for (const [target, suffix, expected] of [['17', '+', '17+'], ['3', '', '3'], ['1000', '+', '1,000+']]) {
      const element = { getAttribute: (name) => name === 'data-target' ? target : suffix, textContent: '' };
      env.context.countTo(element);
      env.advance(2000);
      assert.equal(element.textContent, expected);
    }
  }
});
