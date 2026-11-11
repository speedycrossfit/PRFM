const assert = require('node:assert/strict');
const { existsSync, readFileSync } = require('node:fs');
const { join } = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const root = join(__dirname, '..');
const read = path => readFileSync(join(root, path), 'utf8');

test('The confirmation route contains seven static milestones and is excluded from search listings', () => {
  const html = read('thank-you/index.html');
  assert.match(html, /<meta name="robots" content="noindex">/);
  if (existsSync(join(root, 'sitemap.xml'))) assert.doesNotMatch(read('sitemap.xml'), /thank-you/);
  if (existsSync(join(root, 'robots.txt'))) assert.doesNotMatch(read('robots.txt'), /Disallow:.*thank-you/);
  assert.deepEqual([...html.matchAll(/class="thanks-status">([^<]+)/g)].map(match => match[1]), [
    'Complete', 'Next up', 'Upcoming', 'Upcoming', 'Upcoming', 'Upcoming', 'Upcoming'
  ]);
  assert.match(html, /Keep an eye on your inbox for a personal welcome email from me\./);
  assert.match(html, /Before we jump on a call, have a think about what you'd really like to achieve over the next 12 months\./);
  assert.match(html, /It doesn't need to be anything complicated\. Just something that matters to you\./);
  assert.match(html, /We'll use that goal as our North Star when we start planning your training journey together\./);
  assert.match(html, /Your first challenge starts now\./);
  assert.match(html, /The work starts soon\. The mindset starts now\./);
  assert.doesNotMatch(html, /<form\b|fbevents\.js/);
});

test('The guide link opens the supplied PDF inline in a new tab, and the form/tracking scripts retain their approved bytes', () => {
  const { createHash } = require('node:crypto');
  const html = read('thank-you/index.html');
  assert.match(html, /href="\.\.\/performance-mindset\.pdf" target="_blank" rel="noopener noreferrer">Download The Performance Mindset<\/a>/);
  const link = html.match(/<a class="button primary thanks-guide-button"[^>]*>/)[0];
  assert.doesNotMatch(link, /\sdownload(?:="[^"]*")?(?:\s|>)/i);
  const pdf = readFileSync(join(root, 'performance-mindset.pdf'));
  assert.equal(pdf.subarray(0, 5).toString(), '%PDF-');
  assert.equal(createHash('sha256').update(pdf).digest('hex'), '1f533081ee461fce069961d8b9c45a8fc465c4407a9363e49a30c90365f7e748');
  const headers = JSON.parse(read('vercel.json')).headers.find(rule => rule.source === '/performance-mindset.pdf').headers;
  assert.ok(headers.some(header => header.key === 'Content-Type' && header.value === 'application/pdf'));
  assert.ok(headers.some(header => header.key === 'Content-Disposition' && header.value.startsWith('inline;')));
  for (const [file, hash] of [
    ['style/tracking.js', '5587e587ce7505a2e8d0d010e35307718770b3f943a6dc0a06f4d28bf20f87eb'],
    ['style/waitlist.js', 'a62b4ffbe51a57f0416512f1e5511c50ea4b9881a9a0d48c3727615fdd87c215'],
    ['style/thank-you.js', 'ced44edc91115a354cb62bcbfb3bbdb91c8496ee16027d895a0507482be7214c']
  ]) assert.equal(createHash('sha256').update(readFileSync(join(root, file))).digest('hex'), hash, file);
});

test('The timeline arms only when motion is allowed and disconnects after its first visible entry', () => {
  const source = read('style/thank-you.js');
  for (const motionAllowed of [false, true]) {
    let callback;
    let starts = 0;
    let disconnects = 0;
    const steps = {};
    const sequence = {
      querySelector: () => steps,
      style: { setProperty() {} },
      classList: { add: value => { assert.equal(value, 'is-playing'); starts++; } }
    };
    const IntersectionObserver = class {
      constructor(observe) { callback = observe; }
      observe(target) { assert.equal(target, steps); }
      disconnect() { disconnects++; }
    };
    vm.runInNewContext(source, {
      document: { querySelector: () => sequence }, IntersectionObserver,
      window: { IntersectionObserver, matchMedia: () => ({ matches: motionAllowed }) },
      performance: { now: () => 0 }
    });
    if (!motionAllowed) {
      assert.equal(callback, undefined);
      assert.equal(starts, 0);
      continue;
    }
    callback([{ isIntersecting: false }]);
    assert.equal(starts, 0);
    callback([{ isIntersecting: true }]);
    assert.equal(starts, 1);
    assert.equal(disconnects, 1);
  }
});
