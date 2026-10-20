const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const test = require('node:test');
const { restoreSectionTwo } = require('./homepage-before-pro.cjs');

const root = join(__dirname, '..');
const home = readFileSync(join(root, 'index.html'), 'utf8');

test('Only the requested Section 2 headline, sentence and scoped stylesheet change the approved homepage', () => {
  assert.equal(createHash('sha256').update(restoreSectionTwo(home)).digest('hex'), 'f5a374d18c14a36df58fd402cbfc2077804710bdae897a76fe586f2a9be247ff');
  const section = home.match(/<section class="section-light principles">[\s\S]*?<\/section>/)[0];
  assert.match(section, /<p>Find and follow a plan that is right for you\. Make every session count\.<\/p>/);
  assert.match(section, /class="sr-only">Serious programming for everyday people, humans and athletes\./);
  assert.match(section, /aria-hidden="true">Serious programming for everyday/);
  assert.match(section, /class="tagline-word-measure">ATHLETES<\/span>/);
  assert.match(section, /class="tagline-word-current">PEOPLE<\/span>/);
  assert.doesNotMatch(section, /aria-live|Stop exercising\./);
  const css = readFileSync(join(root, 'style/principles.css'), 'utf8');
  assert.match(css, /\.principles-headline \.tagline-rotator \{ color: var\(--blue\); \}/);
  assert.match(css, /\.tagline-word-next::after \{ color: inherit; \}/);
  assert.doesNotMatch(css, /font-size|padding|margin|animation|transition/);
});
