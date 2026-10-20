const { readFileSync } = require('node:fs');
const { join } = require('node:path');

function restoreSectionTwo(html) {
  return html
    .replace('  <link rel="stylesheet" href="style/principles.css?v=1">\n', '')
    .replace('<h2 class="principles-headline"><span class="sr-only">Serious programming for everyday people, humans and athletes.</span><span aria-hidden="true">Serious programming for everyday <span class="tagline-ending"><span class="tagline-rotator" data-tagline-rotator data-tagline-words=\'["PEOPLE","HUMANS","ATHLETES"]\'><span class="tagline-word-measure">ATHLETES</span><span class="tagline-word-current">PEOPLE</span><span class="tagline-word-next"></span></span></span></span></h2>', '<h2>Serious programming for everyday athletes.</h2>')
    .replace('<p>Find and follow a plan that is right for you, make every session count.</p>', '<p>Stop exercising. Start training. Set a goal, follow a plan, and make every session count.</p>');
}

function restoreCustomApplication(html) {
  return html
    .replace('  <link rel="stylesheet" href="style/custom-application.css?v=1">\n', '')
    .replace('<a class="button primary custom-application" href="https://form.typeform.com/to/Pr2IzxhM" target="_blank" rel="noopener noreferrer">Apply for coaching</a>', '<a class="button primary waitlist-cta" href="#waitlist" data-launch-text="Start Training">Join the Waitlist</a>\n        <!-- Replace the disabled application button with a link when the Custom Typeform URL is supplied. -->\n        <button class="button secondary" type="button" disabled>Apply for coaching</button>\n        <p class="application-note">Applications open soon.</p>');
}

// Historical checks still protect every byte outside the approved application and Pro links.
function readHomepageBeforePro(root) {
  return restoreCustomApplication(restoreSectionTwo(readFileSync(join(root, 'index.html'), 'utf8')))
    .replace('<a class="journey-item reveal" style="--i:2" href="programs/pro/">', '<a class="journey-item reveal" style="--i:2" href="#pro">')
    .replace('<a class="button primary" href="programs/pro/">Explore PRFM Pro</a>', '<a class="button primary waitlist-cta" href="#waitlist" data-launch-text="Start Training">Join the Waitlist</a>');
}

module.exports = { readHomepageBeforePro, restoreCustomApplication, restoreSectionTwo };
