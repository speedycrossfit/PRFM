const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { readFileSync, readdirSync } = require('node:fs');
const { join } = require('node:path');
const test = require('node:test');
const { restoreCustomApplication, restoreSectionTwo } = require('./homepage-before-pro.cjs');

const root = join(__dirname, '..');
const home = readFileSync(join(root, 'index.html'), 'utf8');
const application = '<a class="button primary custom-application" href="https://form.typeform.com/to/Pr2IzxhM" target="_blank" rel="noopener noreferrer">Apply for coaching</a>';

test('The Custom application is an enabled, safely isolated Typeform link with unchanged wording', () => {
  const custom = home.match(/<section[^>]*id="custom"[\s\S]*?<\/section>/)[0];
  assert.ok(custom.includes(application));
  assert.equal(home.split(application).length - 1, 1);
  assert.doesNotMatch(custom, /<button[^>]*disabled|aria-disabled|onclick=/);
  assert.doesNotMatch(custom, /waitlist-cta|href="#waitlist"|Applications open soon\./);
});

test('Only the Custom application markup and its appearance-preserving stylesheet change the homepage', () => {
  assert.equal(createHash('sha256').update(restoreCustomApplication(restoreSectionTwo(home))).digest('hex'), '22026905597ce4c4404226ec37cc230d16427467b59897789367e2bf1b244630');
  for (const name of readdirSync(join(root, 'programs'))) {
    assert.doesNotMatch(readFileSync(join(root, 'programs', name, 'index.html'), 'utf8'), /form\.typeform\.com|custom-application\.css/);
  }
  const css = readFileSync(join(root, 'style/custom-application.css'), 'utf8');
  assert.match(css, /display: flex; margin-top: 16px; min-height: 44px; font-size: 0\.85rem;/);
  assert.doesNotMatch(css, /background|color|opacity|animation|transition/);
});
