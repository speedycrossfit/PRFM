const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const { integratePage } = require('../scripts/site-integrations.cjs');

const root = join(__dirname, '..');
const read = path => readFileSync(join(root, path), 'utf8');

test('All ten entries render before the waitlist, with a footer link that resolves from other pages', () => {
  const html = integratePage(read('index.html'), 'index.html');
  const section = html.match(/<section class="faq section-light"[\s\S]+?<\/section>/)[0];
  assert.equal((section.match(/class="faq-item"/g) || []).length, 10);
  assert.ok(html.indexOf(section) < html.indexOf('<section class="waitlist'));
  assert.match(section, /aria-controls="faq-1-answer"/);
  assert.match(section, /<strong>PRFM Prime:<\/strong>/);
  assert.match(section, /mailto:hello@prfmfitness\.com\?subject=Question%20about%20PRFM%20Fitness/);
  assert.match(html, /<a href="#faq">FAQ<\/a>/);
  for (const [path, href] of [['programs/base/index.html', '../../index.html#faq'], ['thank-you/index.html', '../index.html#faq']]) {
    const page = integratePage(read(path), path);
    assert.ok(page.includes(`<a href="${href}">FAQ</a>`));
    assert.doesNotMatch(page, /style\/faq\.js|class="faq-item"/);
  }
});

function accordion({ hover = true } = {}) {
  const createElement = () => ({
    attributes: {}, listeners: {},
    setAttribute(name, value) { this.attributes[name] = value; },
    addEventListener(name, handler) { this.listeners[name] = handler; },
    emit(name, pointerType = 'mouse') { this.listeners[name]?.({ pointerType }); }
  });
  const rows = Array.from({ length: 3 }, () => {
    const row = createElement();
    row.button = createElement();
    row.panel = createElement();
    row.querySelector = selector => selector === 'button' ? row.button : row.panel;
    return row;
  });
  const timers = new Map();
  let now = 0;
  let next = 0;
  const list = { querySelectorAll: () => rows, classList: { add() {} } };
  vm.runInNewContext(read('style/faq.js'), {
    document: { querySelector: () => list },
    window: { matchMedia: () => ({ matches: hover }) },
    setTimeout(callback, delay) { timers.set(++next, { callback, at: now + delay }); return next; },
    clearTimeout(id) { timers.delete(id); }
  });
  return {
    rows,
    advance(ms) {
      now += ms;
      for (const [id, { callback, at }] of timers) {
        if (at <= now) { timers.delete(id); callback(); }
      }
    },
    expanded() {
      for (const row of rows) {
        assert.equal(row.button.disabled, false);
        assert.equal(row.panel.attributes['aria-hidden'], row.button.attributes['aria-expanded'] === 'true' ? 'false' : 'true');
      }
      return rows.flatMap((row, index) => row.button.attributes['aria-expanded'] === 'true' ? [index] : []);
    }
  };
}

test('Hover intent delays opening, cancels on exit, and switches to one answer at a time', () => {
  const app = accordion();
  const [first, second] = app.rows;
  assert.deepEqual(app.expanded(), []);
  first.button.emit('pointermove');
  app.advance(174);
  assert.deepEqual(app.expanded(), []);
  first.emit('pointerleave');
  app.advance(200);
  assert.deepEqual(app.expanded(), []);
  first.button.emit('pointermove');
  app.advance(175);
  assert.deepEqual(app.expanded(), [0]);
  first.button.emit('pointerleave');
  app.advance(200);
  assert.deepEqual(app.expanded(), [0]);
  first.emit('pointerleave');
  second.button.emit('pointermove');
  app.advance(175);
  assert.deepEqual(app.expanded(), [1]);
  second.button.emit('click');
  second.button.emit('pointermove');
  app.advance(175);
  assert.deepEqual(app.expanded(), []);
});

test('Touch never triggers hover and activation toggles one answer even without hover capability', () => {
  for (const hover of [true, false]) {
    const app = accordion({ hover });
    const [first, second] = app.rows;
    first.button.emit('pointermove', 'touch');
    app.advance(300);
    assert.deepEqual(app.expanded(), []);
    first.button.emit('click');
    assert.deepEqual(app.expanded(), [0]);
    second.button.emit('click');
    assert.deepEqual(app.expanded(), [1]);
    second.button.emit('click');
    assert.deepEqual(app.expanded(), []);
  }
});
