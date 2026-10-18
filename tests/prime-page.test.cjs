const assert = require('node:assert/strict');
const { readFileSync, existsSync } = require('node:fs');
const { join, dirname, resolve } = require('node:path');
const { createHash } = require('node:crypto');
const test = require('node:test');
const { readHomepageBeforePro } = require('./homepage-before-pro.cjs');

const root = join(__dirname, '..');
const pagePath = join(root, 'programs/prime/index.html');
const page = readFileSync(pagePath, 'utf8').replace('style/program.css?v=4.1', 'style/program.css?v=4');
const strong = readFileSync(join(root, 'programs/strong/index.html'), 'utf8').replace('style/program.css?v=4.1', 'style/program.css?v=4');
const home = readHomepageBeforePro(root).replace('<a class="program-cta" href="programs/base/">Explore PRFM Base', '<a class="program-cta waitlist-cta" href="#waitlist" data-launch-text="Start Training">Join the Waitlist').replace('<a class="program-cta" href="programs/build/">Explore PRFM Build', '<a class="program-cta waitlist-cta" href="#waitlist" data-launch-text="Start Training">Join the Waitlist');
const hash = value => createHash('sha256').update(value).digest('hex');
const text = html => html.replace(/<[^>]*>/g, '').replaceAll('&amp;', '&').trim();
const normalizePrimeMedia = html => html
  .replaceAll('prfm-prime-app-demo.mp4?v=1', 'prfm-strong-app-demo.mp4?v=3.3')
  .replaceAll('prfm-prime-app-demo-poster.jpg?v=1', 'prfm-app-demo-poster.jpg?v=3.2');

test('Prime preserves approved Strong, Capacity, shared styles, scripts and both videos byte-for-byte', () => {
  const frozen = {
    'programs/strong/index.html': '1ed429843c916f3cdccadae744125959a2f8f19c9998ee58a7a362cd2eb972cb',
    'programs/capacity/index.html': '92d6f26ad32dfb4bbe34c14fab3af0db8beae748c0daea89f69d3f9d8ec2d23e',
    'style/main.css': 'e8e8e8225c3b7309ca1084ecb2be67a624160ee264e3a6bb649c7830ab464be7',
    'style/main.js': 'dc5c988424aa361f54638cac73455bd031d72b844ab4aa8c529b857127e7057c',
    'style/program.css': 'f3b27c7e4926aee394bd95b8e9dc3cd7add7b0fa2dbe79badf0eec13e0880984',
    'style/program.js': '5fe8822d6c3e591e04239ef946f7b3f3d3361990c2c3866b22b3409243dbb01b',
    'style/program-ongoing.css': 'aaa5fb1b24a2d3309c06adfcf31c44a5c2d5b5781feb5767f399516a3a2320c4',
    'style/capacity.css': '73a4246db481e5db693e95707b7d28ec83db818a0397668f2c8c64cc486a4446',
    'media/prfm-strong-app-demo.mp4': '1fcdf4bfab999e049a262966cd31ea6fc4790db36f857359a8666b532b0e5e8b',
    'media/prfm-capacity-app-demo.mp4': 'bdc2fc06c928ca28c27e5be5949b856c56d4f0d4095cec6bb63a3f8e79364823'
  };
  for (const [file, expected] of Object.entries(frozen)) {
    const content = readFileSync(join(root, file));
    const normalized = file.endsWith('/index.html') ? content.toString().replace('style/program.css?v=4.1', 'style/program.css?v=4') : content;
    assert.equal(hash(normalized), expected, file);
  }
});

test('The only homepage edit is Prime navigation; header, footer and waitlist reuse the approved template', () => {
  const beforePrime = home.replace('<a class="program-cta" href="programs/prime/">Explore PRFM Prime', '<a class="program-cta waitlist-cta" href="#waitlist" data-launch-text="Start Training">Join the Waitlist');
  assert.equal(hash(beforePrime), '35abe4cd051543313d76f19a26fc2c49b503595085a51ee99bcb3e12950bd13f');
  assert.equal((home.match(/href="programs\/prime\/"/g) || []).length, 1);
  assert.match(home, /href="programs\/strong\/">Explore PRFM Strong/);
  assert.match(home, /href="programs\/capacity\/">Explore PRFM Capacity/);
  for (const tag of ['header', 'footer']) {
    const fragment = new RegExp(`<${tag}[\\s\\S]*?<\\/${tag}>`);
    assert.equal(page.match(fragment)[0], strong.match(fragment)[0]);
  }
  const links = [...page.matchAll(/<a[^>]*class="[^"]*waitlist-cta"[^>]*>/g)];
  assert.equal(links.length, 3);
  links.forEach(([link]) => assert.match(link, /href="\.\.\/\.\.\/index.html#waitlist"/));
  assert.match(home, /action="https:\/\/formspree.io\/f\/xdarbjra" method="POST"/);
});

test('Prime hero and confirmed four-item overview match the brief', () => {
  assert.match(page, /<h1 id="prime-title">PRFM <span>Prime<\/span><\/h1>/);
  assert.match(page, /<p class="program-headline">Stronger\. Fitter\.<br>Ready for anything\.<\/p>/);
  assert.ok(page.includes('Our premier strength and conditioning program, built to develop strength, improve fitness and create a more capable, athletic you.'));
  assert.match(page, /class="program-hero-photo"[^>]*hero-athlete\.jpg/);
  assert.match(page, /<h2 id="audience-title">The complete strength &amp; conditioning program\.<\/h2>/);
  const specs = page.match(/<dl class="program-specs"[\s\S]*?<\/dl>/)[0];
  assert.deepEqual([...specs.matchAll(/<dd>(.*?)<\/dd>/g)].map(([, value]) => text(value)), [
    'Strength & Conditioning', 'Intermediate - Advanced', '4-5', 'Fully Equipped Functional Gym'
  ]);
  assert.doesNotMatch(page, /capacity-zone|Training zones|microcycle|mesocycle|macrocycle/i);
});

test('Prime keeps the exact overview paragraphs, closing emphasis and four supplied benefits', () => {
  const copy = page.match(/<div class="program-body-copy">([\s\S]*?)<\/div>/)[1];
  assert.deepEqual([...copy.matchAll(/<p>([\s\S]*?)<\/p>/g)].map(([, paragraph]) => text(paragraph)), [
    'PRFM Prime is our premier strength and conditioning program, designed to build strength, develop fitness and improve overall athletic performance.',
    'Combining compound and Olympic lifting, skill development, accessory work and functional conditioning, each session has a clear purpose. From dedicated strength and power work to challenging conditioning sessions, every element is designed to develop well-rounded athletic performance.',
    "Built around progressive training cycles, each block builds on the last to develop your strength, fitness and physical capability over time. Whether you're training for sport, taking on new challenges or simply wanting to get into the best shape of your life, PRFM Prime prepares you for whatever comes next.",
    "Train for more than the gym. Build a body that's ready for life."
  ]);
  assert.match(copy, /<strong>Train for more than the gym\. Build a body that's ready for life\.<\/strong>/);
  const benefits = page.match(/<ol class="program-benefit-list"[\s\S]*?<\/ol>/)[0];
  assert.deepEqual([...benefits.matchAll(/<h3>(.*?)<\/h3><p>(.*?)<\/p>/g)].map(([, heading, body]) => [heading, body]), [
    ['Build real strength.', 'Develop full-body strength and power through compound lifting, Olympic lifting and progressive strength training.'],
    ['Develop complete fitness.', 'Improve cardiovascular fitness, muscular endurance and the ability to sustain and repeat physical efforts.'],
    ['Move like an athlete.', 'Develop coordination, movement quality, power and functional skills that carry beyond the gym.'],
    ['Be ready for anything.', 'Build the physical capability and confidence to take on everyday activities, sports and new challenges without feeling held back by your fitness.']
  ]);
});

test('Prime V2 changes only the overview copy and its scoped top alignment', () => {
  const unchanged = normalizePrimeMedia(page)
    .replace('  <link rel="stylesheet" href="../../style/prime-overview.css?v=2">\n', '')
    .replace('program-summary program-summary-prime section-light', 'program-summary section-light')
    .replace(/<div class="program-body-copy">[\s\S]*?<\/div>/, '<div class="program-body-copy">OVERVIEW COPY</div>');
  assert.equal(hash(unchanged), '626f19aff735852a2d58bd37c6a1a4d70630a7acff9b581bfe47d649a87e3fb3');
  assert.equal(hash(home), '057ef9f8328eabc54a75b712d7f48d13a4e6cb4eef645819b1c79a75fe0add26');
  assert.equal((page.match(/program-summary-prime/g) || []).length, 1);
  assert.match(page, /program-summary program-summary-prime section-light" aria-labelledby="audience-title"/);
  const overviewStyles = readFileSync(join(root, 'style/prime-overview.css'), 'utf8');
  assert.equal(overviewStyles.trim(), '.program-summary-prime .program-editorial {\n  align-items: start;\n}');
  assert.doesNotMatch(strong + readFileSync(join(root, 'programs/capacity/index.html'), 'utf8') + home, /prime-overview\.css|program-summary-prime/);
});

test('Prime Section 3 reuses the approved Strong layout, changing only dedicated media and ongoing copy', () => {
  const section = /<section class="program-section program-difference[\s\S]*?<\/section>/;
  const primeSection = normalizePrimeMedia(page.match(section)[0]).replace(
    'PRFM Prime follows ongoing strength and conditioning cycles, not a fixed-length plan. Join at any point, train at your level and continue building strength, fitness and athletic performance as each new cycle begins.',
    'PRFM Strong follows ongoing strength training cycles, not a fixed-length plan. Join at any point, train at your level and continue building strength and muscle as each new cycle begins.'
  );
  assert.equal(primeSection, strong.match(section)[0]);
  assert.match(page, /style\/program-ongoing.css\?v=3/);
  assert.match(page, /style\/program.js\?v=4/);
  assert.match(page, /<video[^>]*muted loop playsinline preload="none"/);
  assert.doesNotMatch(page, /\bcontrols\b|program-demo-toggle|unlimited|guaranteed response/i);
});

test('The Prime recording replacement changes only the three media references on the approved V2 page', () => {
  assert.equal(hash(normalizePrimeMedia(page)), '40288a0d8a1beec045784609361fd1c49fcc727d913f3bb050d47d0b694cfd32');
  assert.equal((page.match(/prfm-prime-app-demo-poster\.jpg\?v=1/g) || []).length, 2);
  assert.equal((page.match(/prfm-prime-app-demo\.mp4\?v=1/g) || []).length, 1);
  assert.doesNotMatch(page, /prfm-strong-app-demo|prfm-capacity-app-demo|prfm-app-demo-poster\.jpg/);
  const video = readFileSync(join(root, 'media/prfm-prime-app-demo.mp4'));
  assert.ok(video.includes(Buffer.from('ftyp')));
  assert.ok(video.includes(Buffer.from('avc1')), 'Web-compatible H.264 video');
  assert.ok(video.indexOf(Buffer.from('moov')) < video.indexOf(Buffer.from('mdat')), 'Metadata precedes video data for quick playback');
  assert.notEqual(hash(video), hash(readFileSync(join(root, 'media/prfm-strong-app-demo.mp4'))));
  assert.notEqual(hash(readFileSync(join(root, 'images/prfm-prime-app-demo-poster.jpg'))), hash(readFileSync(join(root, 'images/prfm-app-demo-poster.jpg'))));
});

test('All Prime session titles, A/B/C groups and exercises exactly match the supplied programming', () => {
  const sessions = [...page.matchAll(/<article class="quote-card program-session"[\s\S]*?<\/article>/g)].map(([session]) => session);
  const expected = [
    { title: 'Strength + Accessory + Conditioning', parts: [['Part A - Strength', ['Back Squat']], ['Part B - Accessory', ['Reverse Lunge', 'Bentover Row']], ['Part C - Conditioning', ['Pull-Ups', 'Push Press', 'Box Jump Over']]] },
    { title: 'Power + Conditioning', parts: [['Part A - Power', ['Power Cleans']], ['Part B - Conditioning', ['Running', 'KB Swing', 'Push-Up', 'T2B (Toes-to-Bar)']]] },
    { title: 'Strength + Skill + Conditioning', parts: [['Part A - Strength', ['Bench Press']], ['Part B - Skill', ['Pull-Up', 'Handstand Practice']], ['Part C - Conditioning', ['Thruster', 'Skipping', 'DB Snatch', 'Burpee']]] }
  ];
  assert.equal(sessions.length, 3);
  sessions.forEach((session, index) => {
    assert.equal(text(session.match(/<h3[^>]*>(.*?)<\/h3>/)[1]), expected[index].title);
    assert.match(session, /<p class="program-session-warmup">Movement Prep \/ Warm Up<\/p>/);
    const groups = [...session.matchAll(/<div class="program-session-part">\s*<h4>(.*?)<\/h4>\s*<ul class="program-exercises">(.*?)<\/ul>\s*<\/div>/g)];
    assert.deepEqual(groups.map(([, label, exercises]) => [text(label), [...exercises.matchAll(/<li>(.*?)<\/li>/g)].map(([, exercise]) => exercise)]), expected[index].parts);
    assert.doesNotMatch(session, /<table|<img|\bsets\b|\breps\b|\brest\b|\d+\s*(min|sec|kg|lb)|&times;|\d+\s*x/i);
  });
  const intro = page.match(/id="training"[\s\S]*?<div class="program-session-grid"/)[0];
  assert.deepEqual([...intro.matchAll(/<p>(.*?)<\/p>/g)].map(([, value]) => value), [
    'Every session has a purpose. PRFM Prime combines strength, power, skill development and functional conditioning to build well-rounded athletic performance.',
    'Some sessions focus on lifting and developing strength, others challenge your conditioning, while others bring multiple training elements together.',
    "Here's a snapshot of three sessions from the program. The full experience includes exercise demonstrations, scaling options and detailed training guidance."
  ]);
});

test('Prime uses the existing carousel geometry and only adds grouped-list typography', () => {
  const shared = readFileSync(join(root, 'style/program.css'), 'utf8');
  assert.match(shared, /grid-template-columns: repeat\(3, minmax\(0, 1fr\)\)/);
  assert.match(shared, /flex: 0 0 83%/);
  assert.match(shared, /scroll-snap-type: x mandatory/);
  const parts = readFileSync(join(root, 'style/program-session-parts.css'), 'utf8');
  assert.match(parts, /\.program-session-part h4/);
  assert.doesNotMatch(parts, /program-phone|program-feature|program-difference|program-session-grid|program-ongoing|animation/i);
  assert.doesNotMatch(strong + readFileSync(join(root, 'programs/capacity/index.html'), 'utf8'), /program-session-parts\.css/);
});

test('Prime has one approved closing offer, no new signup flow and no invented pricing', () => {
  assert.match(page, /Ready to train<br>for more\?/);
  assert.match(page, /Build strength, develop fitness and become a more capable athlete with structured training designed to keep you progressing\./);
  assert.equal((page.match(/Pricing announced at launch\./g) || []).length, 1);
  assert.equal((page.match(/class="program-offer"/g) || []).length, 1);
  assert.doesNotMatch(page, /<form|checkout|\$\d|discount|role="tab|<details|[\u2010-\u2015\u2212]|&[mn]dash;/i);
});

test('Prime metadata, local assets, anchors and Mac mobile preview all resolve', () => {
  assert.match(page, /rel="canonical" href="https:\/\/www.prfmfitness.com\/programs\/prime\/"/);
  for (const [, value] of page.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (/^https?:/.test(value)) continue;
    const [pathname, fragment] = value.split('#');
    const target = pathname ? resolve(dirname(pagePath), pathname.split('?')[0]) : pagePath;
    assert.ok(existsSync(target), value);
    if (fragment) assert.ok(readFileSync(target, 'utf8').includes(`id="${fragment}"`), value);
  }
  for (const [, value] of page.matchAll(/srcset="([^"]+)"/g)) value.split(',').forEach(source => assert.ok(existsSync(resolve(dirname(pagePath), source.trim().split(' ')[0]))));
  const ids = [...page.matchAll(/\bid="([^"]+)"/g)].map(([, id]) => id);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal((page.match(/<h1\b/g) || []).length, 1);
  const preview = readFileSync(join(dirname(pagePath), 'mobile-preview.html'), 'utf8');
  assert.match(preview, /noindex,nofollow/);
  assert.match(preview, /width: min\(390px, 100%\)/);
  assert.match(preview, /<iframe src="index.html\?version=1" title="PRFM Prime mobile website preview"/);
});
