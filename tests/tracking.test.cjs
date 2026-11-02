const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const { integratePage } = require('../scripts/site-integrations.cjs');

const root = join(__dirname, '..');
const source = readFileSync(join(root, 'style/tracking.js'), 'utf8');
const config = readFileSync(join(root, 'style/tracking-config.js'), 'utf8');
const consentKey = 'prfm-advertising-consent-v1';

function harness(options = {}) {
  const listeners = {};
  const scripts = [];
  const values = new Map();
  if (options.stored !== undefined) values.set(consentKey, options.stored);
  const control = { checked: false, disabled: false, addEventListener(name, callback) { this[name] = callback; } };
  const status = {};
  const document = {
    hidden: false,
    cookie: '',
    head: { appendChild(script) { scripts.push(script); } },
    createElement() { return {}; },
    querySelectorAll(selector) { return selector === '[data-advertising-consent]' ? [control] : [status]; },
    addEventListener(name, callback) { listeners[name] = callback; }
  };
  const window = {
    addEventListener(name, callback) { listeners[name] = callback; }
  };
  if (options.foreign) window.fbq = () => {};
  const context = vm.createContext({
    window, document,
    location: { protocol: 'https:', hostname: options.host || 'www.prfmfitness.com', search: options.search || '' },
    navigator: options.navigator || {}, URLSearchParams,
    localStorage: {
      getItem: key => { if (options.blockStorage) throw new Error('Blocked'); return values.get(key) || null; },
      setItem: (key, value) => { if (options.blockStorage) throw new Error('Blocked'); values.set(key, value); }
    }
  });
  vm.runInContext(config, context);
  vm.runInContext(source, context);
  return {
    window, control, status, scripts, listeners, values, context,
    choose(granted) { control.checked = granted; control.change(); },
    load() { scripts[0].onload(); },
    calls() { return window.fbq && window.fbq.queue ? Array.from(window.fbq.queue, args => Array.from(args)) : []; },
    events() { return this.calls().filter(args => args[0] === 'trackSingle').map(args => args[2]); }
  };
}

test('No Meta script, queue or events exist before explicit consent', () => {
  const app = harness();
  assert.equal(app.scripts.length, 0);
  assert.equal(app.window.fbq, undefined);
  assert.equal(app.control.checked, false);
  assert.equal(app.window.PRFMTracking.beginSubmission(), null);
  app.window.PRFMTracking.completeSubmission(null);
  assert.deepEqual(app.events(), []);
});

test('Opt-in loads official SDK once, disables automatic configuration and emits one standard PageView', () => {
  const app = harness();
  app.choose(true);
  assert.equal(app.scripts.length, 1);
  assert.equal(app.scripts[0].src, 'https://connect.facebook.net/en_US/fbevents.js');
  assert.deepEqual(app.calls().slice(0, 3), [
    ['consent', 'grant'], ['set', 'autoConfig', false, '610522118540785'], ['init', '610522118540785']
  ]);
  assert.deepEqual(app.events(), []);
  app.load();
  assert.deepEqual(app.events(), ['PageView']);
  app.choose(true);
  vm.runInContext(source, app.context);
  app.listeners.pageshow();
  assert.equal(app.scripts.length, 1);
  assert.deepEqual(app.events(), ['PageView']);
});

test('Confirmed submissions can emit one Lead each and never include form fields', () => {
  const app = harness();
  app.choose(true);
  app.load();
  const token = app.window.PRFMTracking.beginSubmission();
  app.window.PRFMTracking.completeSubmission(token);
  app.window.PRFMTracking.completeSubmission(token);
  app.window.PRFMTracking.completeSubmission({ generation: 1 });
  assert.deepEqual(app.events(), ['PageView', 'Lead']);
  assert.deepEqual(app.calls().filter(args => args[0] === 'trackSingle'), [
    ['trackSingle', '610522118540785', 'PageView'], ['trackSingle', '610522118540785', 'Lead']
  ]);
  const second = app.window.PRFMTracking.beginSubmission();
  app.window.PRFMTracking.completeSubmission(second);
  assert.deepEqual(app.events(), ['PageView', 'Lead', 'Lead']);
});

test('Withdrawal cancels pending events, revokes Meta permission and invalidates in-flight submission tokens', () => {
  const app = harness();
  app.choose(true);
  const token = app.window.PRFMTracking.beginSubmission();
  app.window.PRFMTracking.completeSubmission(token);
  app.choose(false);
  app.load();
  assert.deepEqual(app.events(), []);
  assert.ok(app.calls().some(args => args[0] === 'consent' && args[1] === 'revoke'));
  app.choose(true);
  const inFlight = app.window.PRFMTracking.beginSubmission();
  app.choose(false);
  app.choose(true);
  app.window.PRFMTracking.completeSubmission(inFlight);
  assert.deepEqual(app.events(), ['PageView']);
});

test('Unconsented submissions are not replayed when someone opts in later', () => {
  const app = harness();
  const token = app.window.PRFMTracking.beginSubmission();
  app.choose(true);
  app.load();
  app.window.PRFMTracking.completeSubmission(token);
  assert.deepEqual(app.events(), ['PageView']);
});

test('Stored consent resumes across pages, but expired, malformed or unavailable storage fails closed', () => {
  const stored = JSON.stringify({ version: 1, granted: true, expires: Date.now() + 86400000 });
  const app = harness({ stored });
  assert.equal(app.control.checked, true);
  app.load();
  assert.deepEqual(app.events(), ['PageView']);
  for (const value of ['bad JSON', '{}', JSON.stringify({ version: 1, granted: true, expires: Date.now() - 1 }),
    JSON.stringify({ version: 1, granted: 'true', expires: Date.now() + 10000 })]) {
    assert.equal(harness({ stored: value }).scripts.length, 0);
  }
  const blocked = harness({ blockStorage: true });
  blocked.choose(true);
  blocked.load();
  assert.deepEqual(blocked.events(), ['PageView']);
});

test('GPC and Do Not Track override saved consent; previews, existing trackers and unsafe query strings never load Meta', () => {
  for (const options of [
    { navigator: { globalPrivacyControl: true } }, { navigator: { doNotTrack: '1' } },
    { host: '127.0.0.1' }, { host: 'preview.vercel.app' }, { foreign: true }, { search: '?email=private@example.com' }
  ]) {
    const app = harness(options);
    app.choose(true);
    assert.equal(app.scripts.length, 0);
  }
  const campaign = harness({ search: '?utm_source=facebook&fbclid=abc' });
  campaign.choose(true);
  assert.equal(campaign.scripts.length, 1);
});

test('Cross-tab withdrawal and SDK load failure do not break forms or send events', () => {
  const app = harness();
  app.choose(true);
  app.values.delete(consentKey);
  app.listeners.storage({ key: consentKey });
  app.load();
  assert.equal(app.control.checked, false);
  assert.deepEqual(app.events(), []);
  const failed = harness();
  failed.choose(true);
  failed.scripts[0].onerror();
  assert.equal(failed.window.PRFMTracking.beginSubmission(), null);
  assert.match(failed.status.textContent, /unavailable/);
});

test('Shared build injection preserves original markup and adds opt-in only once at the correct relative paths', () => {
  const source = '<html><head></head><body><main>Approved content</main><footer></footer></body></html>';
  for (const [path, base] of [['index.html', ''], ['programs/strong/index.html', '../../'], ['privacy/index.html', '../']]) {
    const result = integratePage(source, path);
    assert.ok(result.includes(`src="${base}style/tracking.js?v=1"`));
    assert.ok(result.includes(`href="${base}privacy/"`));
    assert.ok(result.includes('<main>Approved content</main>'));
    assert.ok(result.includes('<input type="checkbox" data-advertising-consent'));
    assert.doesNotMatch(result, /checked|facebook.com\/tr|fbevents.js/);
    assert.equal(integratePage(result, path), result);
  }
  assert.equal(integratePage(source, 'mobile-preview.html'), source);
  assert.equal(integratePage(source, 'programs/base/mobile-preview.html'), source);
});

test('Waitlist handling and collection notice are injected only for the existing homepage form', () => {
  const html = '<head></head><form class="waitlist-form reveal">\n      </form><footer></footer>';
  const result = integratePage(html, 'index.html');
  assert.match(result, /data-waitlist-status/);
  assert.match(result, /src="style\/waitlist.js\?v=1"/);
  assert.match(result, /requested guide and launch updates/);
  const program = integratePage('<head></head><footer></footer>', 'programs/base/index.html');
  assert.doesNotMatch(program, /waitlist.js|data-waitlist-status/);
});
