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
  const button = { textContent: 'Join the Waitlist', disabled: false };
  const status = { textContent: '', dataset: {}, removeAttribute() { delete this.dataset.error; } };
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
  const tracker = { beginSubmission: () => token, completeSubmission(value) { leads.push(value); if (options.pixelThrows) throw new Error('Pixel'); } };
  const context = vm.createContext({
    window: { fetch, FormData, PRFMTracking: tracker }, fetch, FormData,
    document: { querySelectorAll: () => [form] }
  });
  vm.runInContext(source, context);
  return { button, status, requests, leads, form, token, context, resets: () => resets, submit: () => handler({ preventDefault() {} }) };
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

test('A Pixel failure never changes a successful signup to an error and initialization is idempotent', async () => {
  const app = harness({ pixelThrows: true });
  vm.runInContext(source, app.context);
  await app.submit();
  assert.match(app.status.textContent, /on the waitlist/);
  assert.equal(app.status.dataset.error, undefined);
  assert.equal(app.button.disabled, true);
});
