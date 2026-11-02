const { readFileSync, readdirSync, writeFileSync } = require('node:fs');
const { dirname, join, relative, sep } = require('node:path');

function integratePage(html, path) {
  if (!html.includes('</head>') || !html.includes('</footer>') || html.includes('data-prfm-integrations')) return html;
  if (/(?:^|\/)mobile-preview\.html$/.test(path)) return html;
  const prefix = relative(dirname(path), '.').split(sep).join('/');
  const base = prefix ? prefix + '/' : '';
  const privacy = base + 'privacy/';
  const css = html.includes(`href="${base}style/privacy.css?v=1"`) ? '' : `  <link rel="stylesheet" href="${base}style/privacy.css?v=1">\n`;
  const head = css +
    `  <script src="${base}style/tracking-config.js?v=1" defer></script>\n` +
    `  <script src="${base}style/tracking.js?v=1" data-prfm-integrations defer></script>\n`;
  const controls = `\n  <aside class="prfm-privacy-controls" aria-label="Privacy and advertising preferences">\n` +
    `    <div class="prfm-privacy-controls-inner">\n` +
    `      <a href="${privacy}">Privacy policy</a>\n` +
    `      <label><input type="checkbox" data-advertising-consent aria-describedby="prfm-advertising-description prfm-advertising-status"> Allow Meta advertising measurement and personalised ads</label>\n` +
    `      <p id="prfm-advertising-description">Optional. Allows Meta to receive page visits and confirmed waitlist signups using cookies and device identifiers. You can withdraw permission here anytime.</p>\n` +
    `      <p id="prfm-advertising-status" data-advertising-status role="status">Advertising tracking off.</p>\n` +
    `      <noscript>Advertising tracking is off because JavaScript is disabled.</noscript>\n` +
    `    </div>\n  </aside>`;
  html = html.replace('</head>', head + '</head>').replace('</footer>', '</footer>' + controls);
  if (html.includes('class="waitlist-form reveal"')) {
    html = html.replace('      </form>',
      `        <p class="prfm-waitlist-privacy">We use your name and email for the requested guide and launch updates. <a href="${privacy}">Privacy policy</a></p>\n` +
      '        <p class="prfm-waitlist-status" data-waitlist-status role="status" aria-live="polite" aria-atomic="true"></p>\n      </form>');
    html = html.replace('</head>', `  <script src="${base}style/waitlist.js?v=1" defer></script>\n</head>`);
  }
  return html;
}

function addSiteIntegrations(output) {
  function visit(folder) {
    for (const entry of readdirSync(folder, { withFileTypes: true })) {
      const file = join(folder, entry.name);
      if (entry.isDirectory()) visit(file);
      else if (entry.isFile() && entry.name.endsWith('.html')) {
        const html = readFileSync(file, 'utf8');
        const updated = integratePage(html, relative(output, file));
        if (updated !== html) writeFileSync(file, updated);
      }
    }
  }
  visit(output);
}

module.exports = { integratePage, addSiteIntegrations };
