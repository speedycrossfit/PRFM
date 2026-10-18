const assert = require('node:assert/strict');
const { existsSync, readFileSync } = require('node:fs');
const { dirname, join, resolve } = require('node:path');
const { createHash } = require('node:crypto');
const test = require('node:test');
const { readHomepageBeforePro } = require('./homepage-before-pro.cjs');

const root = join(__dirname, '..');
const pagePath = join(root, 'programs/capacity/index.html');
const page = readFileSync(pagePath, 'utf8').replace('style/program.css?v=4.1', 'style/program.css?v=4');
const strong = readFileSync(join(root, 'programs/strong/index.html'), 'utf8').replace('style/program.css?v=4.1', 'style/program.css?v=4');
const home = readHomepageBeforePro(root);
const css = readFileSync(join(root, 'style/capacity.css'), 'utf8');
const text = (html) => html.replace(/<[^>]*>/g, '').replaceAll('&amp;', '&').trim();
const normalizeCapacityMedia = (html) => html
  .replaceAll('prfm-capacity-app-demo-poster.jpg?v=2.1', 'prfm-app-demo-poster.jpg?v=3.2')
  .replaceAll('prfm-capacity-app-demo.mp4?v=2.2', 'prfm-strong-app-demo.mp4?v=3.2');
const normalizeStrongMedia = (html) => html.replace('prfm-strong-app-demo.mp4?v=3.3', 'prfm-strong-app-demo.mp4?v=3.2');
const withoutProgrammingFeature = (html) => html
  .replace(/^ +<aside class="program-ongoing"[\s\S]*?<\/aside>\n/gm, '')
  .replace('class="program-difference-layout program-difference-layout-top"', 'class="program-difference-layout"');

test('Capacity preserves the approved page apart from its headlines, media, group hero and ongoing feature', () => {
  const original = normalizeCapacityMedia(withoutProgrammingFeature(page))
    .replace('  <link rel="stylesheet" href="../../style/program-ongoing.css?v=3">\n', '')
    .replace('<meta property="og:image" content="https://www.prfmfitness.com/images/hero-coaches-la.jpg">', '<meta property="og:image" content="https://www.prfmfitness.com/images/hero-woman-tyre.jpg">')
    .replace('style/capacity.css?v=2', 'style/capacity.css?v=1')
    .replace('<img class="program-hero-photo" src="../../images/hero-coaches-la.jpg" srcset="../../images/hero-coaches-la-small.jpg 800w, ../../images/hero-coaches-la.jpg 1600w" sizes="100vw" width="1600" height="1200" alt="Ben and three fellow coaches together on an athletics field in Los Angeles" fetchpriority="high">', '<img class="program-hero-photo" src="../../images/hero-woman-tyre.jpg" srcset="../../images/hero-woman-tyre-small.jpg 800w, ../../images/hero-woman-tyre.jpg 1254w" sizes="100vw" width="1254" height="836" alt="Athlete pushing a tyre during functional conditioning training" fetchpriority="high">')
    .replace('<p class="program-headline">Build your engine.<br>Expand your capacity.</p>', '<p class="program-headline">Build endurance.<br>Sustain performance.</p>')
    .replace('<h2 id="audience-title">More than endurance.<br>Conditioning with purpose.</h2>', '<h2 id="audience-title">Build your engine.<br>Expand your capacity.</h2>');
  assert.equal(createHash('sha256').update(original).digest('hex'), 'a67a92e59b5d0e05f0c23f4a29380182c3844ade323287852ac1160b4949bbc1');
});

test('Ongoing programming spans beneath both Section 3 columns with the exact revised copy', () => {
  const feature = page.match(/<aside class="program-ongoing" aria-labelledby="ongoing-title">([\s\S]*?)<\/aside>/);
  assert.ok(feature);
  assert.equal((page.match(/class="program-ongoing"/g) || []).length, 1);
  assert.match(feature[1], /<p class="section-label">Ongoing programming<\/p>/);
  assert.match(feature[1], /<h3 id="ongoing-title">Join anytime\. Keep progressing\.<\/h3>/);
  assert.equal(feature[1].match(/<p class="program-ongoing-copy">(.*?)<\/p>/)[1], 'PRFM Capacity follows ongoing training cycles, not a fixed-length plan. Join at any point, train at your level and continue progressing as each new cycle begins.');
  assert.equal((feature[1].match(/<p\b/g) || []).length, 2);
  assert.doesNotMatch(page, /program-ongoing-closing|Unlike fixed-length training plans|No waiting for a start date|Each cycle has a clear focus/);
  const summary = page.match(/<section class="program-section program-summary[\s\S]*?<\/section>/)[0];
  assert.doesNotMatch(summary, /program-ongoing|ongoing-title|program-demo-column/);
  const difference = page.match(/<section class="program-section program-difference[\s\S]*?<\/section>/)[0];
  assert.doesNotMatch(difference, /program-demo-column/);
  assert.match(difference, /<div class="program-difference-layout program-difference-layout-top">/);
  assert.match(difference, /<\/figure>\s*<\/div>\s*<aside class="program-ongoing"/);
  assert.ok(page.indexOf('id="difference"') < feature.index);
  assert.ok(feature.index < page.indexOf('id="training"'));
  assert.doesNotMatch(feature[0], /<button|<a |<video|<script|animation/i);
  assert.doesNotMatch(home, /program-ongoing|ongoing-title/);
  assert.match(page, /href="\.\.\/\.\.\/style\/program-ongoing.css\?v=3"/);
  const componentCss = readFileSync(join(root, 'style/program-ongoing.css'), 'utf8');
  assert.match(componentCss, /text-align: left/);
  assert.match(componentCss, /\.program-difference-layout-top \{ align-items: start; \}/);
  assert.match(componentCss, /grid-template-columns: minmax\(0, 1fr\) minmax\(0, 1fr\)/);
  assert.match(componentCss, /@media \(max-width: 900px\)[\s\S]*grid-template-columns: minmax\(0, 1fr\)/);
  assert.match(componentCss, /width: 100%/);
  assert.match(componentCss, /font-size: 1\.65rem/);
  assert.match(componentCss, /font-size: 1rem/);
  assert.doesNotMatch(componentCss, /max-width: 440px|program-demo-column/);
  assert.doesNotMatch(componentCss, /capacity-page|strong|animation|transition|program-phone|program-session-grid|height:\s*\d+vh/);
});

test('Approved Strong content and shared files are preserved apart from its video version and approved ongoing panel', () => {
  const frozen = {
    'programs/strong/index.html': '7c417bdedd8b9cadd86b7e95fa6b97552af5ae3096d64a5e80e5f235851ff52c',
    'programs/strong/mobile-preview.html': '3daa3dcde2ba959780eee34dd9a6d3ca63f52bf11f9e32e6dd013004808675be',
    'style/main.css': 'e8e8e8225c3b7309ca1084ecb2be67a624160ee264e3a6bb649c7830ab464be7',
    'style/main.js': 'dc5c988424aa361f54638cac73455bd031d72b844ab4aa8c529b857127e7057c',
    'style/program.css': 'f3b27c7e4926aee394bd95b8e9dc3cd7add7b0fa2dbe79badf0eec13e0880984',
    'style/program.js': '5fe8822d6c3e591e04239ef946f7b3f3d3361990c2c3866b22b3409243dbb01b'
  };
  for (const [file, hash] of Object.entries(frozen)) {
    const content = file === 'programs/strong/index.html'
      ? normalizeStrongMedia(withoutProgrammingFeature(strong)).replace('  <link rel="stylesheet" href="../../style/program-ongoing.css?v=3">\n', '')
      : readFileSync(join(root, file));
    assert.equal(createHash('sha256').update(content).digest('hex'), hash, file);
  }
  assert.doesNotMatch(strong + home, /capacity\.css/);
});

test('Capacity is linked only from its existing homepage card and keeps the approved navigation', () => {
  const card = home.match(/<article[^>]*>\s*<p class="program-type">Conditioning-focused[\s\S]*?<\/article>/)[0];
  assert.match(card, /href="programs\/capacity\/">Explore PRFM Capacity/);
  assert.doesNotMatch(card, /waitlist-cta|data-launch-text/);
  for (const tag of ['header', 'footer']) {
    const fragment = new RegExp(`<${tag}[\\s\\S]*?<\\/${tag}>`);
    assert.equal(page.match(fragment)[0], strong.match(fragment)[0]);
  }
  const links = [...page.matchAll(/<a[^>]*class="[^"]*waitlist-cta"[^>]*>/g)];
  assert.equal(links.length, 3);
  links.forEach(([link]) => assert.match(link, /href="\.\.\/\.\.\/index.html#waitlist"/));
  assert.match(home, /action="https:\/\/formspree.io\/f\/xdarbjra" method="POST"/);
});

test('Capacity hero and overview contain the supplied conditioning positioning and specifications', () => {
  assert.match(page, /<h1 id="capacity-title">PRFM <span>Capacity<\/span><\/h1>/);
  assert.match(page, /<p class="program-headline">Build your engine\.<br>Expand your capacity\.<\/p>/);
  assert.ok(page.includes('Structured conditioning designed to develop your engine, improve movement efficiency and increase your ability to perform and recover across different training demands.'));
  assert.match(page, /class="program-hero-photo"[^>]*hero-coaches-la\.jpg/);
  assert.match(page, /hero-coaches-la-small\.jpg 800w, [^"]*hero-coaches-la\.jpg 1600w/);
  assert.match(page, /property="og:image" content="https:\/\/www.prfmfitness.com\/images\/hero-coaches-la\.jpg"/);
  assert.match(css, /\.capacity-page \.program-hero-photo \{ object-position: 50% 90%; \}/);
  assert.match(page, /<h2 id="audience-title">More than endurance\.<br>Conditioning with purpose\.<\/h2>/);
  const body = page.match(/<div class="program-body-copy">([\s\S]*?)<\/div>/)[1];
  assert.deepEqual([...body.matchAll(/<p>([\s\S]*?)<\/p>/g)].map(([, paragraph]) => text(paragraph)), [
    'PRFM Capacity is built for people who want to improve how much work they can perform, how efficiently they move and how well they recover between efforts.',
    'Drawing on traditional endurance training principles, the program combines structured training zones 1-5 with functional movements and targeted conditioning to develop both aerobic and anaerobic fitness.',
    'From sustained aerobic efforts to high-intensity intervals and movement efficiency work, every session has a purpose. Build the ability to maintain output, recover between efforts and perform across a broad range of time and movement demands.',
    "It's not just about working harder. It's about increasing your capacity to perform."
  ]);
  assert.match(body, /<strong>It's not just about working harder\. It's about increasing your capacity to perform\.<\/strong>/);
  const specs = page.match(/<dl class="program-specs"[\s\S]*?<\/dl>/)[0];
  assert.deepEqual([...specs.matchAll(/<dd>(.*?)<\/dd>/g)].map(([, value]) => text(value)), [
    'Aerobic & Anaerobic Conditioning', 'Beginner - Advanced', '3-4', 'Fully Equipped Gym / Functional Fitness Facility'
  ]);
});

test('Capacity retains all four supplied benefit headings and descriptions', () => {
  const benefits = page.match(/<ol class="program-benefit-list"[\s\S]*?<\/ol>/)[0];
  assert.deepEqual([...benefits.matchAll(/<h3>(.*?)<\/h3><p>(.*?)<\/p>/g)].map(([, heading, copy]) => [text(heading), copy]), [
    ['Build your aerobic & anaerobic engine.', 'Develop the ability to sustain longer efforts and produce repeatable high-intensity output through structured conditioning.'],
    ['Recover faster. Perform again.', 'Improve your ability to recover between efforts, maintain performance across repeated intervals and tolerate greater volumes of training.'],
    ['Move better. Work more efficiently.', 'Develop movement quality, technique and repetition speed so you can maintain output with less wasted energy, even as fatigue builds.'],
    ['Expand your work capacity.', "Build the ability to perform across different durations, intensities and movement types, whether you're training for HYROX, functional fitness competitions or personal performance goals."]
  ]);
});

test('The five zones are semantic, compact and responsive, without invented prescriptions', () => {
  const zones = page.match(/<ol class="capacity-zone-scale">([\s\S]*?)<\/ol>/)[1];
  assert.deepEqual([...zones.matchAll(/<li><span>(.*?)<\/span><strong>(.*?)<\/strong><\/li>/g)].map(([, zone, label]) => [zone, label]), [
    ['Zone 1', 'Recovery'], ['Zone 2', 'Aerobic Base'], ['Zone 3', 'Steady / Tempo'], ['Zone 4', 'Threshold'], ['Zone 5', 'High Intensity']
  ]);
  assert.match(page, /Different intensities\. Different adaptations\. One stronger engine\./);
  assert.match(css, /grid-template-columns: repeat\(5, minmax\(0, 1fr\)\)/);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*capacity-zone-scale \{ grid-template-columns: 1fr/);
  assert.doesNotMatch(page + css, /heart.rate|animation:|<canvas|<table/i);
  assert.doesNotMatch(zones, /\d+\s*%/);
});

test('The complete Section 3 layout matches Strong exactly apart from program-specific media and ongoing copy', () => {
  const section = /<section class="program-section program-difference[\s\S]*?<\/section>/;
  const capacitySection = normalizeCapacityMedia(page.match(section)[0]).replace(
    'PRFM Capacity follows ongoing training cycles, not a fixed-length plan. Join at any point, train at your level and continue progressing as each new cycle begins.',
    'PRFM Strong follows ongoing strength training cycles, not a fixed-length plan. Join at any point, train at your level and continue building strength and muscle as each new cycle begins.'
  );
  assert.equal(capacitySection, normalizeStrongMedia(strong.match(section)[0]));
  assert.match(page, /src="\.\.\/\.\.\/style\/program.js\?v=4"/);
  assert.match(page, /<video[^>]*muted loop playsinline preload="none"/);
  assert.doesNotMatch(page, /<button|\bcontrols\b|program-demo-toggle/);
});

test('Capacity and Strong keep separate, higher-resolution recordings and their approved static posters', () => {
  assert.match(page, /src="\.\.\/\.\.\/media\/prfm-capacity-app-demo.mp4\?v=2\.2"/);
  assert.match(page, /poster="\.\.\/\.\.\/images\/prfm-capacity-app-demo-poster.jpg\?v=2\.1"/);
  assert.match(page, /<img src="\.\.\/\.\.\/images\/prfm-capacity-app-demo-poster.jpg\?v=2\.1"/);
  assert.doesNotMatch(page, /prfm-strong-app-demo|prfm-app-demo-poster\.jpg/);
  const hash = (file) => createHash('sha256').update(readFileSync(join(root, file))).digest('hex');
  assert.equal(hash('media/prfm-capacity-app-demo.mp4'), 'bdc2fc06c928ca28c27e5be5949b856c56d4f0d4095cec6bb63a3f8e79364823');
  assert.equal(hash('images/prfm-capacity-app-demo-poster.jpg'), '2a99d75fa64006bb4cbad43687a3c279a8d6f3722fd10e73fe39d901243b4c12');
  assert.equal(hash('media/prfm-strong-app-demo.mp4'), '1fcdf4bfab999e049a262966cd31ea6fc4790db36f857359a8666b532b0e5e8b');
  assert.equal(hash('images/prfm-app-demo-poster.jpg'), '3a608cdda1faf2cb9778d062a66140e5ff061cff8d1ace815f731e1c92f8fd47');
  assert.notEqual(hash('media/prfm-capacity-app-demo.mp4'), hash('media/prfm-strong-app-demo.mp4'));
});

test('The three Capacity previews preserve all exercise groups, supplied zones and duration', () => {
  const sessions = [...page.matchAll(/<article class="quote-card program-session"[\s\S]*?<\/article>/g)].map(([session]) => session);
  assert.equal(sessions.length, 3);
  const expected = [
    { title: 'Anaerobic + Skill', groups: ['Part A - Skill', 'Part B - Anaerobic Conditioning Intervals'], exercises: ['Wall Balls', 'Pull-Ups', 'Run', 'KB Swing', 'Sled Push', 'Rowing', 'Burpees'] },
    { title: 'Aerobic', groups: ['40 Min Aerobic Pace - Zone 3'], exercises: ['BikeErg', 'Sit-Up', 'SkiErg', 'Walking Lunge', 'Run', 'Box Jump'] },
    { title: 'Work Capacity', groups: ['Part A - Skill & Movement Efficiency', 'Part B - Interval Threshold Capacity'], exercises: ['DB Snatch', 'Burpee Broad Jump', 'Run + Wall Ball', 'Assault Bike + Push-Up', 'Run + KB Swing', 'Assault Bike + Burpee'] }
  ];
  sessions.forEach((session, index) => {
    assert.equal(text(session.match(/<h3[^>]*>(.*?)<\/h3>/)[1]), expected[index].title);
    assert.match(session, /<p class="capacity-warmup">Movement Prep \/ Warm Up<\/p>/);
    assert.deepEqual([...session.matchAll(/<h4>(.*?)<\/h4>/g)].map(([, heading]) => text(heading)), expected[index].groups);
    assert.deepEqual([...session.matchAll(/<li>(.*?)<\/li>/g)].map(([, exercise]) => text(exercise)), expected[index].exercises);
    assert.doesNotMatch(session, /<table|<img|sets|reps|rest|\d+\s*x|percent/i);
  });
  assert.match(sessions[0], /<p class="capacity-session-detail">Zone 4\+<\/p>/);
  assert.doesNotMatch(sessions[2], /zone|\d+ min/i);
  assert.match(page, /Every session has a purpose\. PRFM Capacity combines aerobic conditioning, high-intensity intervals and movement efficiency work to develop your ability to perform across different training demands\./);
  assert.match(page, /Here's a snapshot of three sessions from the program\. The full experience includes exercise demonstrations, scaling options and detailed training guidance\./);
  assert.doesNotMatch(css, /program-session-grid|\.program-phone|\.program-app-demo/);
});

test('Capacity has one final pricing placeholder and no new form, checkout or unrelated program', () => {
  assert.match(page, /Ready to build<br>your capacity\?/);
  assert.match(page, /Build a stronger engine, improve your movement efficiency and develop the ability to perform across every training demand\./);
  assert.equal((page.match(/Pricing announced at launch\./g) || []).length, 1);
  assert.equal((page.match(/class="program-offer"/g) || []).length, 1);
  assert.doesNotMatch(page, /<form|checkout|\$\d|discount|<details|role="tab|[\u2010-\u2015\u2212]|&[mn]dash;/i);
});

test('Capacity assets, internal anchors, metadata and Mac mobile-preview destinations resolve', () => {
  for (const [, value] of page.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (/^https?:/.test(value)) continue;
    const [pathname, fragment] = value.split('#');
    const target = pathname ? resolve(dirname(pagePath), pathname.split('?')[0]) : pagePath;
    assert.ok(existsSync(target), `Missing: ${value}`);
    if (fragment) assert.ok(readFileSync(target, 'utf8').includes(`id="${fragment}"`));
  }
  for (const [, value] of page.matchAll(/srcset="([^"]+)"/g)) {
    value.split(',').forEach((source) => assert.ok(existsSync(resolve(dirname(pagePath), source.trim().split(' ')[0]))));
  }
  const ids = [...page.matchAll(/\bid="([^"]+)"/g)].map(([, id]) => id);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal((page.match(/<h1\b/g) || []).length, 1);
  assert.match(page, /rel="canonical" href="https:\/\/www.prfmfitness.com\/programs\/capacity\/"/);
  const preview = readFileSync(join(dirname(pagePath), 'mobile-preview.html'), 'utf8');
  assert.match(preview, /noindex,nofollow/);
  assert.match(preview, /width: min\(390px, 100%\)/);
  assert.match(preview, /<iframe src="index.html\?version=1" title="PRFM Capacity mobile website preview"/);
});
