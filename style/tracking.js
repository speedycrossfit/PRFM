(function () {
  'use strict';
  if (window.PRFMTracking) return;
  const config = window.PRFM_TRACKING_CONFIG;
  if (!config || !/^\d+$/.test(config.pixelId)) return;
  const controls = Array.from(document.querySelectorAll('[data-advertising-consent]'));
  const statuses = Array.from(document.querySelectorAll('[data-advertising-status]'));
  const production = location.protocol === 'https:' && config.hosts.includes(location.hostname);
  const key = config.consentKey;
  let consent = false;
  let expires = 0;
  let generation = 0;
  let initialized = false;
  let ready = false;
  let failed = false;
  let pageViewed = false;
  let pending = [];
  let foreignPixel = Boolean(window.fbq);
  const submissions = new WeakSet();
  const safeQuery = Array.from(new URLSearchParams(location.search).keys()).every(name =>
    ['fbclid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'test_event_code'].includes(name));

  function privacySignal() {
    return navigator.globalPrivacyControl === true || navigator.doNotTrack === '1';
  }

  function allowed() {
    return consent && expires > Date.now() && !privacySignal() && production && safeQuery && !foreignPixel && !failed;
  }

  function render() {
    controls.forEach(control => {
      control.checked = consent && expires > Date.now() && !privacySignal();
      control.disabled = privacySignal();
    });
    let message = consent ? 'Advertising tracking on. Uncheck to withdraw permission.' : 'Advertising tracking off.';
    if (!production) message = 'Advertising tracking is disabled on this preview.';
    if (foreignPixel || failed) message = 'Advertising tracking unavailable. Your website and forms still work.';
    if (!safeQuery) message = 'Advertising tracking off on this URL to protect unexpected query information.';
    if (privacySignal()) message = 'Advertising tracking off, respecting your browser privacy preference.';
    statuses.forEach(status => { status.textContent = message; });
  }

  function removeCookies() {
    const host = location.hostname;
    const domains = ['', host, '.' + host, '.prfmfitness.com'];
    ['_fbp', '_fbc'].forEach(name => domains.forEach(domain => {
      document.cookie = name + '=; Max-Age=0; path=/' + (domain ? '; domain=' + domain : '') + '; SameSite=Lax; Secure';
    }));
  }

  function readChoice() {
    try {
      const choice = JSON.parse(localStorage.getItem(key));
      if (choice && choice.version === 1 && typeof choice.granted === 'boolean' &&
          Number.isFinite(choice.expires) && choice.expires > Date.now() &&
          choice.expires <= Date.now() + config.consentDays * 86400000) {
        return choice;
      }
    } catch (_) { /* Storage may be unavailable; default to no tracking. */ }
    return { granted: false, expires: 0 };
  }

  function send(event, token) {
    if (!allowed() || token !== generation) return;
    if (!ready) {
      pending.push({ event, token });
      return;
    }
    if (event === 'PageView' && pageViewed) return;
    try {
      window.fbq('trackSingle', config.pixelId, event);
      if (event === 'PageView') pageViewed = true;
    } catch (_) { /* Advertising must never interrupt the website or forms. */ }
  }

  function start() {
    if (!allowed()) return;
    if (initialized) {
      window.fbq('consent', 'grant');
      send('PageView', generation);
      return;
    }
    if (window.fbq) {
      foreignPixel = true;
      render();
      return;
    }
    initialized = true;
    // Official Meta base-code queue, created only after explicit permission.
    const fbq = window.fbq = function () {
      fbq.callMethod ? fbq.callMethod.apply(fbq, arguments) : fbq.queue.push(arguments);
    };
    if (!window._fbq) window._fbq = fbq;
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = '2.0';
    fbq.queue = [];
    fbq('consent', 'grant');
    fbq('set', 'autoConfig', false, config.pixelId);
    fbq('init', config.pixelId);
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    script.onload = function () {
      ready = true;
      const events = pending;
      pending = [];
      events.forEach(item => send(item.event, item.token));
      render();
    };
    script.onerror = function () {
      failed = true;
      pending = [];
      render();
    };
    send('PageView', generation);
    document.head.appendChild(script);
  }

  function apply(granted, expiry) {
    generation += 1;
    pending = [];
    consent = granted === true && !privacySignal();
    expires = expiry;
    if (!consent) {
      if (initialized) window.fbq('consent', 'revoke');
      removeCookies();
    }
    render();
    start();
  }

  function changeChoice(granted) {
    const expiry = Date.now() + config.consentDays * 86400000;
    try {
      localStorage.setItem(key, JSON.stringify({ version: 1, granted: granted === true, expires: expiry }));
    } catch (_) { /* Permission lasts for this page only if storage is blocked. */ }
    apply(granted, expiry);
  }

  window.PRFMTracking = Object.freeze({
    beginSubmission: function () {
      if (!allowed()) return null;
      const token = Object.freeze({ generation });
      submissions.add(token);
      return token;
    },
    completeSubmission: function (token) {
      if (token && submissions.has(token)) {
        submissions.delete(token);
        send('Lead', token.generation);
      }
    }
  });
  controls.forEach(control => control.addEventListener('change', () => changeChoice(control.checked)));
  window.addEventListener('storage', event => {
    if (event.key !== key && event.key !== null) return;
    const choice = readChoice();
    apply(choice.granted, choice.expires);
  });
  function refresh() {
    if (privacySignal() || expires <= Date.now()) apply(false, 0);
  }
  window.addEventListener('pageshow', refresh);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
  const choice = readChoice();
  apply(choice.granted, choice.expires);
})();
