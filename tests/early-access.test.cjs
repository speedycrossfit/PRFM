const assert = require('node:assert/strict');
const { existsSync, readFileSync } = require('node:fs');
const { dirname, join, resolve } = require('node:path');
const test = require('node:test');
const { integratePage } = require('../scripts/site-integrations.cjs');

const root = join(__dirname, '..');

test('The advertising route has one shared Pixel, one waitlist handler and working local assets without exposing a guide download', () => {
  const path = 'early-access/index.html';
  const html = integratePage(readFileSync(join(root, path), 'utf8'), path);
  assert.equal((html.match(/data-prfm-integrations/g) || []).length, 1);
  assert.equal((html.match(/data-advertising-consent/g) || []).length, 1);
  assert.equal((html.match(/src="[^\"]*style\/waitlist.js/g) || []).length, 1);
  assert.match(html, /name="robots" content="noindex, follow"/);
  assert.match(html, /action="https:\/\/formspree.io\/f\/xdarbjra" method="POST" data-waitlist-destination="\.\.\/thank-you\/"/);
  assert.doesNotMatch(html, /href="[^\"]*\.pdf|<iframe|<video|style\/main.js|fbevents.js|fbq\(/);
  for (const [, url] of html.matchAll(/(?:href|src|srcset)="([^\"#]+)"/g)) {
    if (/^https?:/.test(url)) continue;
    assert.ok(existsSync(resolve(dirname(join(root, path)), url.split('?')[0])), url);
  }
  assert.match(readFileSync(join(root, 'thank-you/index.html'), 'utf8'), /href="https:\/\/www.prfmfitness.com\/">EXPLORE PRFM FITNESS<\/a>/);
});
