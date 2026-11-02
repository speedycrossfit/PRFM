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
      const token = tracker ? tracker.beginSubmission() : null;
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
        // Only this confirmed-success branch can produce a Lead. No form values are passed.
        try { if (tracker) tracker.completeSubmission(token); } catch (_) {}
      } catch (_) {
        status.dataset.error = 'true';
        status.textContent = 'Your signup could not be confirmed. Please try again. If this continues, email hello@prfmfitness.com.';
        button.textContent = label;
      } finally {
        busy = false;
        button.disabled = completed;
        form.removeAttribute('aria-busy');
      }
    });
  });
})();
