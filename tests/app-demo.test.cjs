const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const source = readFileSync(join(__dirname, '../style/program.js'), 'utf8');
const flush = async () => { await Promise.resolve(); await Promise.resolve(); await Promise.resolve(); };

function environment({ reduced = false, intersection = true, rejectNext = false, pendingPlay = false } = {}) {
  const emitter = (target = {}) => {
    const listeners = {};
    target.addEventListener = (name, callback) => { (listeners[name] ||= []).push(callback); };
    target.emit = (name) => (listeners[name] || []).forEach((callback) => callback());
    return target;
  };
  const classes = new Set();
  const root = {
    classList: {
      add: (name) => classes.add(name),
      toggle: (name, on) => on ? classes.add(name) : classes.delete(name)
    }
  };
  const status = { hidden: true };
  const mediaSource = emitter();
  const pendingAttempts = [];
  const video = emitter({
    paused: true, muted: false, controls: true, playCalls: 0,
    play() {
      this.playCalls++;
      if (rejectNext) { rejectNext = false; return Promise.reject(new Error('Autoplay denied')); }
      const start = () => { this.paused = false; this.emit('playing'); };
      if (pendingPlay) return new Promise((resolve, reject) => { pendingAttempts.push({ complete: () => { start(); resolve(); }, reject }); });
      start();
      return Promise.resolve();
    },
    pause() { if (!this.paused) { this.paused = true; this.emit('pause'); } },
    querySelector: () => mediaSource
  });
  const elements = { video, '.program-demo-status': status };
  root.querySelector = (selector) => elements[selector];
  const preference = emitter({ matches: reduced });
  const document = emitter({ hidden: false, querySelectorAll: () => [root] });
  let observer;
  const window = { matchMedia: () => preference };
  if (intersection) window.IntersectionObserver = class {
    constructor(callback) { observer = callback; }
    observe(target) { assert.equal(target, root); }
  };
  const context = { window, document, IntersectionObserver: window.IntersectionObserver, Promise };
  vm.runInNewContext(source, context);
  return {
    video, status, classes, mediaSource,
    visible: (on) => observer([{ isIntersecting: on }]),
    hidden: (on) => { document.hidden = on; document.emit('visibilitychange'); },
    reduce: (on) => { preference.matches = on; preference.emit('change'); },
    complete: (index = pendingAttempts.length - 1) => pendingAttempts[index].complete(),
    reject: (index) => pendingAttempts[index].reject(new Error('Play interrupted'))
  };
}

test('App video waits for visibility, plays muted and pauses off-screen or in a hidden tab', async () => {
  const e = environment();
  assert.equal(e.video.playCalls, 0);
  assert.equal(e.video.muted, true);
  assert.equal(e.video.controls, false);
  assert.equal(e.video.defaultMuted, true);
  e.visible(true);
  await flush();
  assert.equal(e.video.paused, false);
  assert.ok(e.classes.has('is-playing'));
  e.visible(false);
  assert.equal(e.video.paused, true);
  e.visible(true);
  await flush();
  e.hidden(true);
  assert.equal(e.video.paused, true);
  e.hidden(false);
  await flush();
  assert.equal(e.video.paused, false);
});

test('Playback remains permanently muted without visible controls', async () => {
  const e = environment();
  e.visible(true);
  await flush();
  e.video.muted = false;
  e.video.emit('volumechange');
  assert.equal(e.video.muted, true);
  e.visible(false);
  e.visible(true);
  e.hidden(true);
  e.hidden(false);
  await flush();
  assert.equal(e.video.paused, false);
  assert.equal(e.video.controls, false);
});

test('Reduced motion shows the poster without playing, and live preference changes are respected', async () => {
  const e = environment({ reduced: true });
  e.visible(true);
  assert.equal(e.video.playCalls, 0);
  assert.ok(e.classes.has('is-static'));
  e.reduce(false);
  await flush();
  assert.equal(e.video.paused, false);
  assert.ok(!e.classes.has('is-static'));
  e.reduce(true);
  assert.equal(e.video.paused, true);
  assert.ok(e.classes.has('is-static'));
});

test('Autoplay rejection retains a static preview without repeated attempts or replacement controls', async () => {
  const e = environment({ rejectNext: true });
  e.visible(true);
  await flush();
  assert.equal(e.video.paused, true);
  assert.ok(!e.classes.has('has-played'));
  assert.ok(e.classes.has('is-static'));
  e.visible(false);
  e.visible(true);
  assert.equal(e.video.playCalls, 1);
  assert.equal(e.video.paused, true);
});

test('An in-flight play cannot resume video after leaving the viewport or enabling reduced motion', async () => {
  for (const cancel of ['viewport', 'reduced']) {
    const e = environment({ pendingPlay: true });
    e.visible(true);
    if (cancel === 'viewport') e.visible(false);
    if (cancel === 'reduced') e.reduce(true);
    e.complete();
    await flush();
    assert.equal(e.video.paused, true, cancel);
  }
});

test('Media failure displays its fallback and does not repeatedly attempt playback', async () => {
  const e = environment();
  e.visible(true);
  await flush();
  e.mediaSource.emit('error');
  assert.equal(e.video.paused, true);
  assert.equal(e.status.hidden, false);
  assert.ok(e.classes.has('is-static'));
  e.visible(false);
  e.visible(true);
  assert.equal(e.video.playCalls, 1);
});

test('A cancelled play promise cannot block or override a newer play request', async () => {
  const e = environment({ pendingPlay: true });
  e.visible(true);
  assert.equal(e.video.playCalls, 1);
  e.visible(false);
  e.visible(true);
  assert.equal(e.video.playCalls, 2);
  e.reject(0);
  await flush();
  e.complete(1);
  await flush();
  assert.equal(e.video.paused, false);
  assert.ok(e.classes.has('is-playing'));
});

test('Browsers without IntersectionObserver retain playback and reduced-motion protection', async () => {
  const e = environment({ intersection: false });
  await flush();
  assert.equal(e.video.paused, false);
  const reduced = environment({ intersection: false, reduced: true });
  assert.equal(reduced.video.playCalls, 0);
  assert.ok(reduced.classes.has('is-static'));
});
