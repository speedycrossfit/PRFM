const assert = require('node:assert/strict');
const { readFileSync, existsSync } = require('node:fs');
const { dirname, join, resolve } = require('node:path');
const test = require('node:test');
const { integratePage } = require('../scripts/site-integrations.cjs');
const root = join(__dirname, '..');

test('All published pages receive one shared tracking integration without changing any approved markup', () => {
  const pages = ['index.html', ...['base', 'build', 'strong', 'capacity', 'prime', 'pro'].map(name => `programs/${name}/index.html`)];
  for (const path of pages) {
    const source = readFileSync(join(root, path), 'utf8');
    const integrated = integratePage(source, path);
    assert.equal((integrated.match(/data-prfm-integrations/g) || []).length, 1, path);
    assert.equal((integrated.match(/data-advertising-consent/g) || []).length, 1, path);
    const original = integrated
      .replace(/^  <link rel="stylesheet" href="style\/faq.css\?v=1">\n/m, '')
      .replace(/^  <script src="style\/faq.js\?v=1" defer><\/script>\n/m, '')
      .replace(/    <section class="faq section-light" id="faq"[\s\S]*?<\/section>\n\n/, '')
      .replace(/^  <link rel="stylesheet" href="[^"]*style\/privacy.css\?v=1">\n/m, '')
      .replace(/^  <script src="[^"]*style\/(?:tracking-config|tracking|waitlist).js\?v=\d+"[^>]*><\/script>\n/gm, '')
      .replace(/\n  <aside class="prfm-privacy-controls"[\s\S]*?<\/aside>/, '')
      .replace(/^        <p class="prfm-waitlist-(?:privacy|status)"[^\n]*\n/gm, '');
    assert.equal(original, source, path);
  }
});

test('Privacy policy contains the confirmed business details, optional tracking and purpose-limited retention', () => {
  const path = join(root, 'privacy/index.html');
  const page = readFileSync(path, 'utf8');
  for (const text of ['PRFM Fitness Limited', '501 Waitati Valley Road', 'Dunedin', 'New Zealand',
    'hello@prfmfitness.com', 'on by default', '180 days', 'at least annually', 'no longer needed for a lawful purpose', 'not a record of your affirmative consent']) assert.ok(page.includes(text), text);
  assert.doesNotMatch(page, /\[confirm|\[privacy|indefinite|Local review copy/);
  for (const [, url] of page.matchAll(/(?:href|src)="([^"#]+)"/g)) {
    if (/^(https?:|mailto:)/.test(url)) continue;
    assert.ok(existsSync(resolve(dirname(path), url.split('?')[0])), url);
  }
  const built = integratePage(page, 'privacy/index.html');
  assert.equal((built.match(/href="..\/style\/privacy.css\?v=1"/g) || []).length, 1);
});
