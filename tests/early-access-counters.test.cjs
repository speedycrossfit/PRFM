const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const root = join(__dirname, '..');
const source = readFileSync(join(root, 'style/early-access.js'), 'utf8');

function environment({ reduced = false, intersection = true, present = true } = {}) {
  const elements = [18, 3, 1000].map((target, i) => ({
    textContent: String(target),
    getAttribute(name) { return name === 'data-early-access-target' ? String(target) : i === 1 ? '' : '+'; }
  }));
  const group = { dataset: {}, querySelectorAll: () => elements };
  const tasks = new Map();
  let nextId = 0;
  let callback;
  let disconnects = 0;
  let intervalStarts = 0;
  let preferenceCallback;
  const preference = { matches: reduced, addEventListener: (_, cb) => { preferenceCallback = cb; }, removeEventListener: () => { preferenceCallback = undefined; } };
  class IntersectionObserver {
    constructor(cb, options) { callback = cb; assert.equal(options.threshold, .45); }
    observe(element) { assert.equal(element, group); }
    disconnect() { disconnects++; }
  }
  vm.runInNewContext(source, {
    document: { querySelector: () => present ? group : null }, Intl, IntersectionObserver,
    window: {
      ...(intersection ? { IntersectionObserver } : {}), matchMedia: () => preference,
      setInterval(cb, delay) { assert.equal(delay, 70); intervalStarts++; const id = ++nextId; tasks.set(id, cb); return id; },
      clearInterval(id) { tasks.delete(id); }
    }
  });
  return {
    elements, group, tasks, starts: () => intervalStarts, disconnects: () => disconnects,
    enter: () => callback([{ isIntersecting: true }]),
    remainOutside: () => callback([{ isIntersecting: false }]),
    tick: () => [...tasks.values()].forEach(cb => cb()),
    reduce: () => { preference.matches = true; if (preferenceCallback) preferenceCallback(); }
  };
}

test('Counters start together on visibility, use homepage cadence and finish once without dropping suffixes', () => {
  const app = environment();
  assert.equal(app.group.dataset.counterState, 'waiting');
  assert.equal(app.starts(), 0);
  app.remainOutside();
  assert.equal(app.starts(), 0);
  app.enter();
  assert.deepEqual(app.elements.map(el => el.textContent), ['0+', '0', '0+']);
  assert.equal(app.starts(), 1);
  app.tick();
  assert.deepEqual(app.elements.map(el => el.textContent), ['1+', '1', '42+']);
  for (let i = 1; i < 24; i++) app.tick();
  assert.deepEqual(app.elements.map(el => el.textContent), ['18+', '3', '1,000+']);
  assert.equal(app.tasks.size, 0);
  assert.equal(app.group.dataset.counterState, 'complete');
  app.enter();
  assert.equal(app.starts(), 1);
});

test('Reduced motion and missing observer preserve readable final values; switching motion preference stops an active run', () => {
  for (const options of [{ reduced: true }, { intersection: false }]) {
    const app = environment(options);
    assert.deepEqual(app.elements.map(el => el.textContent), ['18+', '3', '1,000+']);
    assert.equal(app.starts(), 0);
  }
  const app = environment();
  app.enter(); app.tick(); app.reduce();
  assert.deepEqual(app.elements.map(el => el.textContent), ['18+', '3', '1,000+']);
  assert.equal(app.tasks.size, 0);
  app.enter();
  assert.equal(app.starts(), 1);
  assert.doesNotThrow(() => environment({ present: false }));
});

test('Early-access copy, benefit order, accessible final stats and reassurance follow the supplied brief', () => {
  const html = readFileSync(join(root, 'early-access/index.html'), 'utf8');
  const benefits = html.match(/<section class="early-access-benefits"[\s\S]*?<\/section>/)[0];
  assert.deepEqual([...benefits.matchAll(/<li>([^<]+)<\/li>/g)].map(x => x[1]), [
    'Structured workout programs tailored to your goals', 'Expert programming and progressions',
    'Video demonstrations for every exercise', 'Scaling options to suit your ability',
    'Direct access to experienced coaches', 'Train on your schedule, at your own gym'
  ]);
  const ordered = ['EXCLUSIVE EARLY ACCESS', '50% OFF', 'Performance-focused training for everyday humans.',
    'Expertly designed online training programs for people who want to get stronger, fitter, and more capable.',
    'WHAT YOU GET WITH PRFM:', 'data-early-access-counters', 'Secure early launch pricing and experience the PRFM difference.',
    'UNLOCK MY 50% OFF', 'No payment required. No obligation.', "Don't worry, we won't spam you. I hate spam just as much as you do.",
    'Plus, get your free eBook.', 'Performance Mindset. A practical guide to purposeful training.', 'Not quite ready? Explore PRFM Fitness.'];
  let previous = -1;
  for (const phrase of ordered) { const index = html.indexOf(phrase); assert.ok(index > previous, phrase); previous = index; }
  assert.equal((html.match(/data-early-access-target=/g) || []).length, 3);
  assert.equal((html.match(/class="sr-only">/g) || []).length, 3);
  assert.match(html, /href="\.\.\/index.html">Not quite ready\? Explore PRFM Fitness\.<\/a>/);
  assert.doesNotMatch(html, /\bprogrammes?\b|\u2014/i);
});
