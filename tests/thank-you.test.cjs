const assert = require('node:assert/strict');
const { existsSync, readFileSync } = require('node:fs');
const { join } = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const root = join(__dirname, '..');
const read = path => readFileSync(join(root, path), 'utf8');

test('The confirmation route contains seven static milestones and is excluded from search listings', () => {
  const html = read('thank-you/index.html');
  assert.match(html, /<meta name="robots" content="noindex">/);
  if (existsSync(join(root, 'sitemap.xml'))) assert.doesNotMatch(read('sitemap.xml'), /thank-you/);
  if (existsSync(join(root, 'robots.txt'))) assert.doesNotMatch(read('robots.txt'), /Disallow:.*thank-you/);
  assert.deepEqual([...html.matchAll(/class="thanks-status">([^<]+)/g)].map(match => match[1]), [
    'Complete', 'Next up', 'Upcoming', 'Upcoming', 'Upcoming', 'Upcoming', 'Upcoming'
  ]);
  assert.match(html, /I'll personally send you your free Performance Mindset guide/);
  assert.match(html, /Your first challenge starts now\./);
  assert.match(html, /The work starts soon\. The mindset starts now\./);
  assert.doesNotMatch(html, /<form\b|fbevents\.js/);
});

test('The timeline arms only when motion is allowed and disconnects after its first visible entry', () => {
  const source = read('style/thank-you.js');
  for (const motionAllowed of [false, true]) {
    let callback;
    let starts = 0;
    let disconnects = 0;
    const steps = {};
    const sequence = {
      querySelector: () => steps,
      style: { setProperty() {} },
      classList: { add: value => { assert.equal(value, 'is-playing'); starts++; } }
    };
    const IntersectionObserver = class {
      constructor(observe) { callback = observe; }
      observe(target) { assert.equal(target, steps); }
      disconnect() { disconnects++; }
    };
    vm.runInNewContext(source, {
      document: { querySelector: () => sequence }, IntersectionObserver,
      window: { IntersectionObserver, matchMedia: () => ({ matches: motionAllowed }) },
      performance: { now: () => 0 }
    });
    if (!motionAllowed) {
      assert.equal(callback, undefined);
      assert.equal(starts, 0);
      continue;
    }
    callback([{ isIntersecting: false }]);
    assert.equal(starts, 0);
    callback([{ isIntersecting: true }]);
    assert.equal(starts, 1);
    assert.equal(disconnects, 1);
  }
});
