(function () {
  'use strict';
  if (!window.fetch || !window.FormData) return;
  document.querySelectorAll('form.waitlist-form').forEach(form => {
    if (form.dataset.waitlistInitialized) return;
    if (form.action !== 'https://formspree.io/f/xdarbjra') return;
    form.dataset.waitlistInitialized = 'true';
    const button = form.querySelector('button[type="submit"]');
    const status = form.querySelector('[data-waitlist-status]');
    if (!button || !status) return;
    const destination = new URL('thank-you/', window.location.href);
    let busy = false;
    let completed = false;
    const label = button.textContent;
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (busy || completed || !form.reportValidity()) return;
      const data = new FormData(form);
      if (data.get('_gotcha')) return;
      busy = true;
      button.disabled = true;
      button.textContent = 'Submitting...';
      form.setAttribute('aria-busy', 'true');
      status.textContent = '';
      status.removeAttribute('data-error');
      const tracker = window.PRFMTracking;
      let token = null;
      try { if (tracker) token = tracker.beginSubmission(); } catch (_) {}
      try {
        const response = await fetch(form.action, {
          method: 'POST', body: data, headers: { Accept: 'application/json' }, credentials: 'omit'
        });
        const result = await response.json();
        if (!response.ok || result.ok !== true || (result.errors && result.errors.length)) {
          throw new Error('Submission not confirmed');
        }
        completed = true;
        status.textContent = "You're on the waitlist. Thanks for joining PRFM!";
        form.reset();
        button.textContent = 'Joined';
      } catch (_) {
        status.dataset.error = 'true';
        status.textContent = 'Your signup could not be confirmed. Please try again. If this continues, email hello@prfmfitness.com.';
        button.textContent = label;
      } finally {
        busy = false;
        button.disabled = completed;
        form.removeAttribute('aria-busy');
      }
      if (!completed) return;
      try { if (tracker) tracker.completeSubmission(token); } catch (_) {}
      const next = document.createElement('a');
      next.href = destination.href;
      next.textContent = 'See what happens next';
      status.append(' ', next);
      try { window.location.assign(destination.href); } catch (_) { /* The link remains available. */ }
    });
  });
})();
