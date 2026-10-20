const { readFileSync } = require('node:fs');
const { join } = require('node:path');

function restoreCustomApplication(html) {
  return html
    .replace('  <link rel="stylesheet" href="style/custom-application.css?v=1">\n', '')
    .replace('<a class="button secondary custom-application" href="https://form.typeform.com/to/Pr2IzxhM" target="_blank" rel="noopener noreferrer">Apply for coaching</a>', '<a class="button primary waitlist-cta" href="#waitlist" data-launch-text="Start Training">Join the Waitlist</a>\n        <!-- Replace the disabled application button with a link when the Custom Typeform URL is supplied. -->\n        <button class="button secondary" type="button" disabled>Apply for coaching</button>\n        <p class="application-note">Applications open soon.</p>');
}

// Historical checks still protect every byte outside the approved application and Pro links.
function readHomepageBeforePro(root) {
  return restoreCustomApplication(readFileSync(join(root, 'index.html'), 'utf8'))
    .replace('<a class="journey-item reveal" style="--i:2" href="programs/pro/">', '<a class="journey-item reveal" style="--i:2" href="#pro">')
    .replace('<a class="button primary" href="programs/pro/">Explore PRFM Pro</a>', '<a class="button primary waitlist-cta" href="#waitlist" data-launch-text="Start Training">Join the Waitlist</a>');
}

module.exports = { readHomepageBeforePro, restoreCustomApplication };
