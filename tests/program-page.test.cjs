const assert = require('node:assert/strict');
const { existsSync, readFileSync, readdirSync } = require('node:fs');
const { dirname, join, resolve } = require('node:path');
const test = require('node:test');
const { createHash } = require('node:crypto');
const { readHomepageBeforePro } = require('./homepage-before-pro.cjs');

const root = join(__dirname, '..');
const pagePath = join(root, 'programs/strong/index.html');
const page = readFileSync(pagePath, 'utf8').replace('style/program.css?v=4.1', 'style/program.css?v=4');
const home = readHomepageBeforePro(root).replace('<a class="program-cta" href="programs/base/">Explore PRFM Base', '<a class="program-cta waitlist-cta" href="#waitlist" data-launch-text="Start Training">Join the Waitlist').replace('<a class="program-cta" href="programs/build/">Explore PRFM Build', '<a class="program-cta waitlist-cta" href="#waitlist" data-launch-text="Start Training">Join the Waitlist');
const homeBeforePrime = home.replace('<a class="program-cta" href="programs/prime/">Explore PRFM Prime', '<a class="program-cta waitlist-cta" href="#waitlist" data-launch-text="Start Training">Join the Waitlist');
const css = readFileSync(join(root, 'style/program.css'), 'utf8');
const script = readFileSync(join(root, 'style/program.js'), 'utf8');

test('All programme phone captions are centred without changing any other shared styling', () => {
  const original = css.replace('justify-content: center; text-align: center; min-height: 44px;', 'min-height: 44px;');
  assert.equal(createHash('sha256').update(original).digest('hex'), 'e34e2452caf9199d178beb9081d2c8402b5f67f9a4cd4ed48c387898febfe272');
  assert.match(css, /\.program-app-demo figcaption\s*\{[^}]*justify-content: center; text-align: center;/);
  for (const program of ['base', 'build', 'strong', 'capacity', 'prime']) {
    const html = readFileSync(join(root, 'programs', program, 'index.html'), 'utf8');
    assert.match(html, /href="\.\.\/\.\.\/style\/program.css\?v=4\.1"/);
    assert.match(html, /<figcaption id="app-demo-caption">The PRFM training app/);
  }
});

test('Strong adds only the shared ongoing panel, stylesheet link and top-alignment modifier', () => {
  const original = page
    .replace('  <link rel="stylesheet" href="../../style/program-ongoing.css?v=3">\n', '')
    .replace('class="program-difference-layout program-difference-layout-top"', 'class="program-difference-layout"')
    .replace(/^ +<aside class="program-ongoing"[\s\S]*?<\/aside>\n/gm, '');
  assert.equal(createHash('sha256').update(original).digest('hex'), '4c2ec2648ef0ebcfc5269f8d4bf1f406d47caac460f000b9e0280131270652e9');
  const panel = page.match(/<aside class="program-ongoing"[\s\S]*?<\/aside>/)[0];
  assert.match(panel, /<p class="section-label">Ongoing programming<\/p>/);
  assert.match(panel, /<h3 id="ongoing-title">Join anytime\. Keep progressing\.<\/h3>/);
  assert.equal(panel.match(/<p class="program-ongoing-copy">(.*?)<\/p>/)[1], 'PRFM Strong follows ongoing strength training cycles, not a fixed-length plan. Join at any point, train at your level and continue building strength and muscle as each new cycle begins.');
  assert.equal((panel.match(/<p\b/g) || []).length, 2);
  assert.doesNotMatch(panel, /<a |<button|<strong|closing/);
  assert.equal((page.match(/class="program-ongoing"/g) || []).length, 1);
  assert.match(page, /<\/figure>\s*<\/div>\s*<aside class="program-ongoing"/);
  assert.ok(page.indexOf('id="difference"') < page.indexOf('<aside class="program-ongoing"'));
  assert.ok(page.indexOf('<aside class="program-ongoing"') < page.indexOf('id="training"'));
});

test('Adding the Strong panel does not modify Capacity, the homepage or the approved shared panel styling', () => {
  const frozen = {
    'programs/capacity/index.html': '92d6f26ad32dfb4bbe34c14fab3af0db8beae748c0daea89f69d3f9d8ec2d23e',
    'index.html': '35abe4cd051543313d76f19a26fc2c49b503595085a51ee99bcb3e12950bd13f',
    'style/program-ongoing.css': 'aaa5fb1b24a2d3309c06adfcf31c44a5c2d5b5781feb5767f399516a3a2320c4'
  };
  for (const [file, hash] of Object.entries(frozen)) {
    const content = file === 'index.html' ? homeBeforePrime : readFileSync(join(root, file), 'utf8').replace('style/program.css?v=4.1', 'style/program.css?v=4');
    assert.equal(createHash('sha256').update(content).digest('hex'), hash, file);
  }
});

test('The approved homepage differs only by the new Capacity link, and the Strong hero is unchanged', () => {
  const hash = (value) => createHash('sha256').update(value).digest('hex');
  const beforeCapacity = homeBeforePrime.replace('<a class="program-cta" href="programs/capacity/">Explore PRFM Capacity', '<a class="program-cta waitlist-cta" href="#waitlist" data-launch-text="Start Training">Join the Waitlist');
  assert.equal(hash(beforeCapacity), '5b66d03b76a77f0ed8bc6529cbb9f362708c57b94e3cd7635e9af2f145a972fa');
  assert.equal(hash(page.match(/<section class="program-hero[\s\S]*?<\/section>/)[0]), 'a229cf524ba9dc366bfa82ec4302100dc87b2cb37c316ebec1c97b338d42c8b6');
  assert.equal(hash(css.split('.program-section')[0]), '402fd1a53cab5de9affe08f3885d088f6ad182847b072ee705f9301af7a3d880');
});

test('The approved closing section is unchanged and Strong uses the sharper copy of its full recording', () => {
  const hash = (value) => createHash('sha256').update(value).digest('hex');
  assert.equal(hash(page.match(/<section class="program-section section-light" id="pricing"[\s\S]*?<\/section>/)[0]), '1843620f29b8a6ae45097e905b88c134bcec380b6c28986861034ac2c0eeafdf');
  assert.equal(hash(readFileSync(join(root, 'media/prfm-strong-app-demo.mp4'))), '1fcdf4bfab999e049a262966cd31ea6fc4790db36f857359a8666b532b0e5e8b');
});

test('Version 4 preserves the overview, four benefits, feature cards and complete training section', () => {
  const hash = (value) => createHash('sha256').update(value).digest('hex');
  assert.equal(hash(page.match(/<dl class="program-specs"[\s\S]*?<\/dl>/)[0]), '5e7602fd72408382794066b1f3a933aab184b492b31a56e54dba2581c8e03a45');
  assert.equal(hash(page.match(/<div class="program-benefits">[\s\S]*?<\/ol>\s*<\/div>/)[0]), '768ba562d9b0236c00b83b4d13984176e88803c60707c61be27b1b3bfdf0e4f1');
  assert.equal(hash(page.slice(page.indexOf('<div class="program-feature-grid">'), page.indexOf('<figure class="program-app-demo"'))), '0b819d3d86df25b66d398ac25830c6c4c9b8c7ee079bf6ea0be1a2f46bfb1c9e');
  assert.equal(hash(page.match(/<section class="program-section section-dark" id="training"[\s\S]*?<\/section>/)[0]), 'd57399fa0c5be20e7cb5965fc97287122ca3e26ed2539df081b5221ae1983d43');
});

test('Version 4 description exactly matches the supplied three paragraphs and retains closing emphasis', () => {
  const copy = page.match(/<div class="program-body-copy">([\s\S]*?)<\/div>/)[1];
  const paragraphs = [...copy.matchAll(/<p>([\s\S]*?)<\/p>/g)].map(([, text]) => text.replace(/<[^>]+>/g, ''));
  assert.deepEqual(paragraphs, [
    'PRFM Strong is built for people who want more from their training. We combine proven strength and bodybuilding principles with functional movements to build muscle, develop real-world strength and improve physical performance.',
    "It's about building a body that doesn't just look strong, but performs that way too.",
    'No random workouts. No unnecessary complexity. Just purposeful training designed to keep you moving forward.'
  ]);
  assert.ok(copy.includes(`<p><strong>${paragraphs[2]}</strong></p>`));
});

test('Only the six approved programmes have dedicated pages, and the Strong homepage link is unchanged', () => {
  assert.deepEqual(readdirSync(join(root, 'programs')), ['base', 'build', 'capacity', 'prime', 'pro', 'strong']);
  const card = home.match(/<article[^>]*>\s*<p class="program-type">Strength-focused[\s\S]*?<\/article>/)[0];
  assert.match(card, /href="programs\/strong\/">Explore PRFM Strong/);
  assert.doesNotMatch(card, /waitlist-cta|data-launch-text/);
  assert.match(page, /href="\.\.\/\.\.\/index.html#programs"/);
});

test('Strong reuses the existing header and footer with homepage destinations', () => {
  for (const tag of ['header', 'footer']) {
    const fragment = new RegExp(`<${tag}[\\s\\S]*?<\\/${tag}>`);
    const shared = home.match(fragment)[0]
      .replaceAll('href="#', 'href="../../index.html#')
      .replaceAll('src="images/', 'src="../../images/')
      .replace(' data-launch-text="Start Training"', '');
    assert.equal(page.match(fragment)[0], shared);
  }
  assert.match(home, /action="https:\/\/formspree.io\/f\/xdarbjra" method="POST"/);
  const waitlistLinks = [...page.matchAll(/<a[^>]*class="[^"]*waitlist-cta"[^>]*>/g)];
  assert.equal(waitlistLinks.length, 3);
  waitlistLinks.forEach(([link]) => assert.match(link, /href="\.\.\/\.\.\/index.html#waitlist"/));
  assert.doesNotMatch(page, /<form|checkout|unlimited|response times|one-on-one|personalised programming/i);
});

test('Strong includes confirmed overview, core features, PDF exercise lists and one final offer', () => {
  assert.equal((page.match(/<li><span aria-hidden="true">/g) || []).length, 4);
  assert.equal((page.match(/<article class="program-feature">/g) || []).length, 3);
  assert.match(page, /Know exactly what you're doing\./);
  assert.match(page, /Train at your level\./);
  assert.match(page, /Real coaches\. Real support\./);
  assert.equal((page.match(/class="program-feature-icon lucide /g) || []).length, 3);
  assert.match(page, /lucide-sliders-horizontal/);
  assert.match(page, /lucide-message-circle/);
  assert.doesNotMatch(page, /program-feature-number/);
  assert.match(page, /Built for strength\.<br>Designed to perform\./);
  assert.doesNotMatch(page, /heavy compound lifting, muscle-building exercises|[\u2010-\u2015\u2212]|&[mn]dash;/);
  assert.match(page, /<strong>No random workouts\. No unnecessary complexity\. Just purposeful training designed to keep you moving forward\.<\/strong>/);
  for (const title of ['Build strength that transfers.', 'Build muscle with purpose.', 'Progress beyond your current level.', 'Train like an athlete, whatever your goals.']) {
    assert.ok(page.includes(`<h3>${title}</h3>`));
  }
  assert.match(page, /A look inside your training\./);
  assert.match(page, /Every session has a purpose\. PRFM Strong combines full-body training/);
  assert.match(page, /The full experience includes exercise demonstrations, scaling options and detailed training guidance\./);
  assert.match(page, /Strength &amp; Building Muscle/);
  assert.match(page, /Intermediate - Advanced/);
  assert.match(page, /<dt>Sessions per week<\/dt><dd>3-4<\/dd>/);
  assert.match(page, /Fully Equipped Gym/);
  assert.doesNotMatch(page, /Illustrative|program-final|id="final-title"/);
  assert.match(page, /Pricing announced at launch\./);
  assert.equal((page.match(/id="pricing-title"/g) || []).length, 1);
  assert.doesNotMatch(page, /\$\d|discount|billing|<details|role="tab/i);
  const sessions = [...page.matchAll(/<article class="quote-card program-session"[\s\S]*?<\/article>/g)];
  assert.equal(sessions.length, 3);
  const expected = [
    ['Movement Prep / Warm Up', 'Back Squat', 'Shoulder Press', 'DB Lunges', 'DB RDL', 'Weighted Sit Up', 'Goblet Squat', 'Strict Pull Up'],
    ['Movement Prep / Warm Up', 'Close Bench Press', 'DB Incline Press', 'Chin Up', 'Hip Thrust', 'Lat Pull Down', 'Dips'],
    ['Movement Prep / Warm Up', 'Deadlift', 'Leg Press', 'Bentover Row', 'Push Up', 'Hanging Leg Raises', 'DB Front Squat', 'Strict Pull Up']
  ];
  const titles = ['Full body / Lower body bias', 'Full body / Upper body bias', 'Full body'];
  sessions.forEach(([session], index) => {
    const rows = [...session.matchAll(/<li>([^<]+)<\/li>/g)];
    assert.deepEqual(rows.map(([, exercise]) => exercise), expected[index]);
    const title = session.match(/<h3[^>]*>([\s\S]*?)<\/h3>/)[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    assert.equal(title, titles[index]);
    assert.doesNotMatch(session, /<table|<img|sets|reps|rest|&times;|\d+\s*[x\u00d7]|percent/i);
  });
  assert.match(css, /grid-template-columns: repeat\(3, minmax\(0, 1fr\)\)/);
  assert.match(css, /flex: 0 0 83%/);
  assert.match(css, /scroll-snap-type: x mandatory/);
  assert.match(css, /prefers-reduced-motion: reduce/);
});

test('App recording is local, muted, inline and looping with a static fallback and no visible controls', () => {
  assert.match(page, /<video[^>]*muted loop playsinline preload="none"/);
  assert.doesNotMatch(page.match(/<video\b[^>]*>/)[0], /\bcontrols\b/);
  assert.match(page, /poster="\.\.\/\.\.\/images\/prfm-app-demo-poster.jpg\?v=3\.2"/);
  assert.match(page, /src="\.\.\/\.\.\/media\/prfm-strong-app-demo.mp4\?v=3\.3" type="video\/mp4"/);
  assert.doesNotMatch(page + css + script, /program-demo-toggle|data-play-icon|data-pause-icon|aria-controls="app-demo-video"|Play app demonstration|Pause app demonstration|manualMotion|userPaused/);
  assert.match(css, /\.program-app-demo figcaption\s*\{[^}]*min-height: 44px/);
  assert.match(css, /object-fit: contain/);
  assert.match(css, /\.program-app-demo video\s*\{\s*background:\s*#090909;/);
  assert.match(css, /\.program-app-demo\.has-played:not\(\.is-static\) \.program-phone-screen img\s*\{\s*visibility:\s*hidden;/);
});

test('Strong local assets and navigation targets resolve without a build or client-side routing', () => {
  for (const [, value] of page.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (/^https?:|^#/.test(value)) continue;
    const [pathname, fragment] = value.split('#');
    const target = resolve(dirname(pagePath), pathname.split('?')[0]);
    assert.ok(existsSync(target), `Missing local target: ${value}`);
    if (fragment) assert.match(readFileSync(target, 'utf8'), new RegExp(`id="${fragment}"`));
  }
  for (const [, srcset] of page.matchAll(/srcset="([^"]+)"/g)) {
    srcset.split(',').forEach((source) => assert.ok(existsSync(resolve(dirname(pagePath), source.trim().split(' ')[0]))));
  }
  assert.equal((page.match(/<h1\b/g) || []).length, 1);
});
