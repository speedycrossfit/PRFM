const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const source = readFileSync(join(__dirname, '../style/waitlist.js'), 'utf8');

function harness(options = {}) {
  let handler;
  const requests = [];
  const leads = [];
  const redirects = [];
  const order = [];
  const button = { textContent: 'Join the Waitlist', disabled: false };
  const status = { textContent: '', dataset: {}, removeAttribute() { delete this.dataset.error; }, append(_, link) { this.link = link; } };
  let resets = 0;
  const form = {
    action: 'https://formspree.io/f/xdarbjra', dataset: {},
    querySelector(selector) { return selector.startsWith('button') ? button : status; },
    addEventListener(name, callback) { handler = callback; },
    reportValidity() { return options.valid !== false; },
    setAttribute() {}, removeAttribute() {}, reset() { resets++; }
  };
  const fetch = async (url, request) => {
    requests.push({ url, ...request });
    if (options.reject) throw new Error('Network');
    if (options.pending) return options.pending;
    return { ok: options.ok !== false, json: async () => options.body || { ok: true } };
  };
  const FormData = class {
    constructor() { this.values = { first_name: 'Private', email: 'private@example.com', _gotcha: options.spam ? 'bot' : '' }; }
    get(key) { return this.values[key]; }
  };
  const token = {};
  const tracker = { beginSubmission() { if (options.beginThrows) throw new Error('Pixel'); return token; }, completeSubmission(value) { order.push('tracking'); leads.push(value); if (options.pixelThrows) throw new Error('Pixel'); } };
  const location = { href: 'https://www.prfmfitness.com/index.html?utm_source=facebook#waitlist', assign(url) {
    order.push('redirect'); redirects.push(url);
    if (options.redirectThrows) throw new Error('Navigation');
  } };
  const context = vm.createContext({
    window: { fetch, FormData, location, PRFMTracking: options.noTracker ? undefined : tracker }, fetch, FormData, URL,
    document: { querySelectorAll: () => [form], createElement: () => ({}) }
  });
  vm.runInContext(source, context);
  return { button, status, requests, leads, redirects, order, form, token, context, resets: () => resets, submit: () => handler({ preventDefault() {} }) };
}

test('Only a confirmed successful Formspree response produces one Lead, without passing form data', async () => {
  const app = harness();
  await app.submit();
  await app.submit();
  assert.equal(app.requests.length, 1);
  assert.equal(app.requests[0].url, 'https://formspree.io/f/xdarbjra');
  assert.equal(app.requests[0].headers.Accept, 'application/json');
  assert.equal(app.requests[0].credentials, 'omit');
  assert.deepEqual(app.leads, [app.token]);
  assert.deepEqual(app.order, ['tracking', 'redirect']);
  assert.deepEqual(app.redirects, ['https://www.prfmfitness.com/thank-you/']);
  assert.equal(app.requests[0].body.get('first_name'), 'Private');
  assert.equal(app.requests[0].body.get('email'), 'private@example.com');
  assert.equal(app.button.disabled, true);
  assert.equal(app.resets(), 1);
  assert.match(app.status.textContent, /on the waitlist/);
});

test('Invalid, honeypot, rejected, failed and unconfirmed submissions never produce Lead', async () => {
  for (const options of [{ valid: false }, { spam: true }, { reject: true }, { ok: false },
    { body: {} }, { body: { ok: false } }, { body: { ok: true, errors: [{ message: 'Rejected' }] } }]) {
    const app = harness(options);
    await app.submit();
    assert.deepEqual(app.leads, []);
    assert.deepEqual(app.redirects, []);
    assert.equal(app.resets(), 0);
    assert.equal(app.button.disabled, false);
  }
});

test('In-flight duplicate submissions are blocked and failures preserve entered data for a deliberate retry', async () => {
  let resolve;
  const pending = new Promise(done => { resolve = done; });
  const app = harness({ pending });
  const first = app.submit();
  await app.submit();
  assert.equal(app.requests.length, 1);
  assert.equal(app.button.disabled, true);
  resolve({ ok: false, json: async () => ({ ok: false }) });
  await first;
  assert.equal(app.resets(), 0);
  assert.equal(app.button.disabled, false);
  assert.match(app.status.textContent, /could not be confirmed/);
  await app.submit();
  assert.equal(app.requests.length, 2);
});

test('Tracking errors or absence do not block confirmation, and a failed navigation leaves a usable link', async () => {
  for (const options of [{ pixelThrows: true }, { beginThrows: true }, { noTracker: true }, { redirectThrows: true }]) {
    const app = harness(options);
    vm.runInContext(source, app.context);
    await app.submit();
    assert.match(app.status.textContent, /on the waitlist/);
    assert.equal(app.status.dataset.error, undefined);
    assert.equal(app.button.disabled, true);
    assert.equal(app.redirects.length, 1);
    assert.equal(app.status.link.href, app.redirects[0]);
    assert.equal(app.requests.length, 1);
  }
});
