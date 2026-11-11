const entries = require('../content/faq.json');

function escapeHtml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderFaq() {
  const items = entries.map(({ question, answer }, index) => {
    const id = `faq-${index + 1}`;
    const paragraphs = answer.map(text => {
      const paragraph = escapeHtml(text).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      return `<p>${paragraph}</p>`;
    }).join('\n              ');
    return `        <div class="faq-item">
          <h3 class="faq-question">
            <button type="button" id="${id}-question" aria-controls="${id}-answer" aria-expanded="true" disabled>
              <span>${escapeHtml(question)}</span><span class="faq-icon" aria-hidden="true"></span>
            </button>
          </h3>
          <div class="faq-panel" id="${id}-answer">
            <div class="faq-panel-inner"><div class="faq-answer">
              ${paragraphs}
            </div></div>
          </div>
        </div>`;
  }).join('\n');

  return `    <section class="faq section-light" id="faq" aria-labelledby="faq-title">
      <div class="faq-inner">
        <div class="section-heading faq-heading">
          <p class="section-label">The details</p>
          <h2 id="faq-title">Frequently asked questions.</h2>
          <p>Everything you need to know about training with PRFM.</p>
        </div>
        <div class="faq-list" data-faq>
${items}
        </div>
        <div class="faq-contact">
          <div><h3>Still have questions?</h3><p>We're always happy to help. Get in touch and let's talk training.</p></div>
          <a class="button faq-contact-link" href="mailto:hello@prfmfitness.com?subject=Question%20about%20PRFM%20Fitness">Get in touch</a>
        </div>
      </div>
    </section>`;
}

module.exports = { renderFaq };
