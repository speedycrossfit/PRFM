const { readFileSync } = require('node:fs');
const { join } = require('node:path');

// Historical checks still protect every byte outside the two approved Pro links.
function readHomepageBeforePro(root) {
  return readFileSync(join(root, 'index.html'), 'utf8')
    .replace('<a class="journey-item reveal" style="--i:2" href="programs/pro/">', '<a class="journey-item reveal" style="--i:2" href="#pro">')
    .replace('<a class="button primary" href="programs/pro/">Explore PRFM Pro</a>', '<a class="button primary waitlist-cta" href="#waitlist" data-launch-text="Start Training">Join the Waitlist</a>');
}

module.exports = { readHomepageBeforePro };
