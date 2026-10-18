const assert = require('node:assert/strict');
const { readFileSync, existsSync } = require('node:fs');
const { dirname, join, resolve } = require('node:path');
const { createHash } = require('node:crypto');
const test = require('node:test');
const { readHomepageBeforePro } = require('./homepage-before-pro.cjs');

const root = join(__dirname, '..');
const pagePath = join(root, 'programs/build/index.html');
const page = readFileSync(pagePath, 'utf8');
const base = readFileSync(join(root, 'programs/base/index.html'), 'utf8');
const strong = readFileSync(join(root, 'programs/strong/index.html'), 'utf8');
const home = readHomepageBeforePro(root);
const css = readFileSync(join(root, 'style/build.css'), 'utf8');
const hash = value => createHash('sha256').update(value).digest('hex');
const text = html => html.replace(/<[^>]*>/g, '').replaceAll('&amp;', '&').trim();
const normalizeBuildMedia = html => html
  .replaceAll('prfm-build-app-demo.mp4?v=1', 'prfm-strong-app-demo.mp4?v=3.3')
  .replaceAll('prfm-build-app-demo-poster.jpg?v=1', 'prfm-app-demo-poster.jpg?v=3.2');
const normalizeBuildHero = html => html
  .replace('style/build.css?v=1.1', 'style/build.css?v=1')
  .replace('sizes="100vw"', 'sizes="(max-width: 900px) 100vw, 74vw"');

test('Build preserves all approved program pages, shared code, Base assets and recordings byte-for-byte', () => {
  const frozen = {
    'programs/base/index.html': 'd44ac68e83d8d8820d52fcd0fcdf7011936f775ed01b85fa5533f769eb3c5f6b',
    'programs/strong/index.html': '93bc2b0d2ba6b41ac9124b969d017a4fb07b17f905d6ec9b59cf0da9ce84791b',
    'programs/capacity/index.html': 'bbb953e45e64694da5f5cb213d124d647663a3ca057303f4e8ee7a8a48e6f845',
    'programs/prime/index.html': '6f11a8fa0a7b12217efd707a4cb0525691c524d73b2790c024a02d252e8bca34',
    'style/base.css': '95df65cb0e44332d2fb563f02d3824bea65a178466cd417978092f8a19dd1f03',
    'style/program.css': 'f3b27c7e4926aee394bd95b8e9dc3cd7add7b0fa2dbe79badf0eec13e0880984',
    'style/program.js': '5fe8822d6c3e591e04239ef946f7b3f3d3361990c2c3866b22b3409243dbb01b',
    'style/program-ongoing.css': 'aaa5fb1b24a2d3309c06adfcf31c44a5c2d5b5781feb5767f399516a3a2320c4',
    'style/main.css': 'e8e8e8225c3b7309ca1084ecb2be67a624160ee264e3a6bb649c7830ab464be7',
    'style/main.js': 'dc5c988424aa361f54638cac73455bd031d72b844ab4aa8c529b857127e7057c',
    'images/hero-base-coaching.png': 'f3fa5ab3abae55c966df5e15f265e29f327c23638cae2ddf309c079f5a4e798e',
    'images/prfm-base-app-demo-poster.jpg': '3a6d00bd7e56295021ac577b5d4841655e2a373dc7a4f82b34e3a505f8c08def',
    'media/prfm-base-app-demo.mp4': '004c5ac7da1832e13f675cb631a1fce77c96c6603472c5c1c3184f6d5f205fdb',
    'media/prfm-strong-app-demo.mp4': '1fcdf4bfab999e049a262966cd31ea6fc4790db36f857359a8666b532b0e5e8b',
    'media/prfm-capacity-app-demo.mp4': 'bdc2fc06c928ca28c27e5be5949b856c56d4f0d4095cec6bb63a3f8e79364823',
    'media/prfm-prime-app-demo.mp4': '326b449ae89527cd777fb719f936b509069341aae27a636ab06a26c0d1152286'
  };
  for (const [file, expected] of Object.entries(frozen)) assert.equal(hash(readFileSync(join(root, file))), expected, file);
});

test('Only the existing Build homepage CTA changes, and header, footer and waitlist remain shared', () => {
  const original = home.replace('<a class="program-cta" href="programs/build/">Explore PRFM Build', '<a class="program-cta waitlist-cta" href="#waitlist" data-launch-text="Start Training">Join the Waitlist');
  assert.equal(hash(original), '576bd6bbcec94ec07f0fb15f32a5d940fadf46ef5e4f4d722256189f2fe3f879');
  for (const program of ['base', 'build', 'strong', 'capacity', 'prime']) assert.equal((home.match(new RegExp(`href="programs/${program}/"`, 'g')) || []).length, 1);
  for (const tag of ['header', 'footer']) {
    const fragment = new RegExp(`<${tag}[\\s\\S]*?<\\/${tag}>`);
    assert.equal(page.match(fragment)[0], base.match(fragment)[0]);
  }
  const links = [...page.matchAll(/<a[^>]*class="[^"]*waitlist-cta"[^>]*>/g)];
  assert.equal(links.length, 3);
  links.forEach(([link]) => assert.match(link, /href="\.\.\/\.\.\/index.html#waitlist"/));
  assert.match(home, /action="https:\/\/formspree.io\/f\/xdarbjra" method="POST"/);
});

test('Build uses the supplied image derivatives and exact hero copy with a full-bleed background', () => {
  assert.equal(hash(readFileSync(join(root, 'images/hero-build-deadlift.jpg'))), '8e61e7ef8d88cfb5512eebb2b94120a9feb34617ecea59df572e4f868fd66bbe');
  assert.equal(hash(readFileSync(join(root, 'images/hero-build-deadlift-small.jpg'))), '3ab6bd561d1ee458649d37749106d8e5db19dbce3611b18c3572228068025f9a');
  assert.match(page, /hero-build-deadlift-small.jpg 800w, .*hero-build-deadlift.jpg 1558w/);
  assert.match(page, /width="1558" height="1166" alt="Woman preparing a barbell deadlift during strength training in a gym\." fetchpriority="high"/);
  assert.match(page, /<h1 id="build-title">PRFM <span>Build<\/span><\/h1>/);
  assert.match(page, /<p class="program-headline">Build strength\.<br>Create momentum\.<\/p>/);
  assert.ok(page.includes('A structured four-week strength and fitness program designed to develop muscle, improve physical performance and take your training to the next level.'));
  assert.match(page, /sizes="100vw"/);
  assert.match(page, /style\/build.css\?v=1\.1/);
  const shared = readFileSync(join(root, 'style/program.css'), 'utf8');
  const imageRule = shared.match(/\.program-hero-photo \{([^}]+)\}/)[1];
  assert.match(imageRule, /inset: 0;/);
  assert.match(imageRule, /width: 100%;/);
  assert.match(imageRule, /height: 100%;/);
  assert.match(imageRule, /object-fit: cover;/);
  assert.match(css, /object-position: 50% top/);
  assert.match(css, /object-position: 45% top/);
  assert.doesNotMatch(css, /object-fit: contain|width: 74%|left: auto|height: auto|aspect-ratio/);
  assert.equal((css.match(/\.program-hero::after/g) || []).length, 1, 'Only the existing mobile gradient overrides the shared desktop blend');
});

test('The Build hero fix preserves all content, non-hero styling, approved media and homepage', () => {
  assert.equal(hash(normalizeBuildHero(page)), '4a99cab5cf4e7abef77a0148055262030a691abbf6a090471d1606167d44a96c');
  const originalCss = css
    .replace('.build-page .program-hero-photo { object-position: 50% top; }', '.build-page .program-hero-photo { left: auto; right: 0; width: 74%; object-fit: contain; object-position: right center; }\n.build-page .program-hero::after { background: linear-gradient(90deg, rgba(13,13,13,0.97), rgba(13,13,13,0.94) 27%, rgba(13,13,13,0.75) 40%, rgba(13,13,13,0.12) 60%, rgba(13,13,13,0.04)); }')
    .replace('.build-page .program-hero-photo { object-position: 45% top; }', '.build-page .program-hero-photo { width: 100%; height: auto; aspect-ratio: 1558 / 1166; object-position: center top; }');
  assert.equal(hash(originalCss), 'd81ac3fdb47f416d3e4bc7309cbede3fb5d326afda54ceff37648c159aad1327');
  assert.equal(hash(readFileSync(join(root, 'media/prfm-build-app-demo.mp4'))), '29c331cd772dff839e42088f10b9908ec52c663e5307d431a09d8c2489786a86');
  assert.equal(hash(home), '0fed48a7207a6d58b57f289486c6b5c9c796437193aada74036ca0d531d5a3dc');
});

test('Build preserves the supplied overview, top alignment, weekly frequency and compact practical details', () => {
  assert.match(page, /<h2 id="audience-title">Stronger foundations\. Greater potential\.<\/h2>/);
  assert.match(page, /program-summary base-summary section-light/);
  assert.match(page, /style\/base.css\?v=1/);
  const copy = page.match(/<div class="program-body-copy">([\s\S]*?)<\/div>/)[1];
  assert.deepEqual([...copy.matchAll(/<p>(.*?)<\/p>/g)].map(([, value]) => text(value)), [
    "PRFM Build is designed for people ready to take the next step in their training. Whether you've completed PRFM Base or already have some gym experience, this four-week program provides the structure to develop strength, build muscle and improve overall fitness.",
    'Introducing barbell training and fundamental compound movements such as squats, deadlifts and presses, PRFM Build combines proven strength training principles with functional exercises to develop a stronger, more capable body.',
    "Through progressive overload and purposeful training, you'll gradually increase the demands of your workouts while continuing to develop technique, confidence and physical capacity.",
    "Master the fundamentals. Build lasting strength. Prepare for what's next."
  ]);
  assert.match(copy, /<strong>Master the fundamentals\. Build lasting strength\. Prepare for what's next\.<\/strong>/);
  const specs = page.match(/<dl class="program-specs"[\s\S]*?<\/dl>/)[0];
  assert.deepEqual([...specs.matchAll(/<dt>(.*?)<\/dt><dd>(.*?)<\/dd>/g)].map(([, key, value]) => [text(key), text(value)]), [
    ['Training focus', 'General Strength & Fitness'], ['Experience', 'Beginner-Intermediate'], ['Program length', '4 Weeks'], ['Gym sessions', '4 Per Week']
  ]);
  const practical = page.match(/<dl class="base-practical"[\s\S]*?<\/dl>/)[0];
  assert.deepEqual([...practical.matchAll(/<dd>(.*?)<\/dd>/g)].map(([, value]) => text(value)), [
    'Approximately 40-50 Minutes', 'Barbells, Dumbbells, Kettlebells & Gym Machines', 'Compound Lifts, Functional Movements & Progressive Overload', 'No Separate Prescribed Cardio Sessions'
  ]);
});

test('All four Build benefits match the approved wording', () => {
  const benefits = page.match(/<ol class="program-benefit-list"[\s\S]*?<\/ol>/)[0];
  assert.deepEqual([...benefits.matchAll(/<h3>(.*?)<\/h3><p>(.*?)<\/p>/g)].map(([, heading, body]) => [heading, body]), [
    ['Build strength that lasts.', 'Develop full-body strength through fundamental compound lifts and structured, progressive training.'],
    ['Introduce progressive overload.', 'Gradually increase the demands of your training to encourage strength development and muscle growth.'],
    ['Develop complete fitness.', 'Combine strength training and functional movements to improve fitness, muscular endurance and physical capability.'],
    ['Prepare for your next challenge.', 'Build the confidence, movement skills and strength needed to progress towards more advanced PRFM programming.']
  ]);
});

test('Build retains the supplied three feature cards, approved Lucide icons and shared phone layout', () => {
  const features = [...page.matchAll(/<article class="program-feature">[\s\S]*?<\/article>/g)].map(([value]) => value);
  assert.equal(features.length, 3);
  assert.deepEqual(features.map(value => [text(value.match(/<h3>(.*?)<\/h3>/)[1]), text(value.match(/<p>(.*?)<\/p>/)[1])]), [
    ["Know exactly what you're doing", 'Every exercise includes a video demonstration, giving you clear guidance on technique and helping you train with confidence.'],
    ['Train at your level', 'Access exercise scaling options, including regressions and progressions, so you can adapt your training to your current ability and continue developing.'],
    ['Real coaches. Real support.', 'Get access to experienced coaches who can answer questions, provide guidance and help you make the most of your training.']
  ]);
  const icons = /<svg class="program-feature-icon[\s\S]*?<\/svg>/g;
  assert.deepEqual(page.match(icons), base.match(icons));
  const demo = /<figure class="program-app-demo"[\s\S]*?<\/figure>/;
  assert.equal(normalizeBuildMedia(page.match(demo)[0]), strong.match(demo)[0]);
  assert.doesNotMatch(page, /Temporary approved Strong recording|prfm-strong-app-demo|prfm-app-demo-poster\.jpg/);
  assert.match(page, /program-difference-layout program-difference-layout-top/);
  assert.match(page, /style\/program.js\?v=4/);
  assert.doesNotMatch(page, /\bcontrols\b|program-demo-toggle|<button/);
});

test('The dedicated Build recording changes only the three media references and obsolete placeholder comment', () => {
  const original = normalizeBuildMedia(normalizeBuildHero(page)).replace('          <figure class="program-app-demo"', '          <!-- Temporary approved Strong recording; replace the source, poster and fallback image together when Build\'s recording is supplied. -->\n          <figure class="program-app-demo"');
  assert.equal(hash(original), '4d9e11cf2b8fd81163b34e53a4a52a7b39f0caf399b8a7f37e7e531e51c7d3a5');
  assert.equal((page.match(/prfm-build-app-demo-poster\.jpg\?v=1/g) || []).length, 2);
  assert.equal((page.match(/prfm-build-app-demo\.mp4\?v=1/g) || []).length, 1);
  const video = readFileSync(join(root, 'media/prfm-build-app-demo.mp4'));
  assert.ok(video.includes(Buffer.from('ftyp')));
  assert.ok(video.includes(Buffer.from('avc1')), 'Web-compatible H.264 video');
  assert.ok(video.indexOf(Buffer.from('moov')) < video.indexOf(Buffer.from('mdat')), 'Metadata precedes video data for progressive playback');
  assert.notEqual(hash(video), hash(readFileSync(join(root, 'media/prfm-strong-app-demo.mp4'))));
  assert.notEqual(hash(readFileSync(join(root, 'images/prfm-build-app-demo-poster.jpg'))), hash(readFileSync(join(root, 'images/prfm-app-demo-poster.jpg'))));
});

test('Build uses the exact shared fixed-duration panel beneath both columns with no rolling-cycle claims', () => {
  assert.match(page, /<\/figure>\s*<\/div>\s*<aside class="program-ongoing"/);
  const panel = page.match(/<aside class="program-ongoing"[\s\S]*?<\/aside>/)[0];
  assert.match(panel, /Structured four-week program/);
  assert.match(panel, /Four weeks\. Build what's next\./);
  assert.equal(text(panel.match(/<p class="program-ongoing-copy">(.*?)<\/p>/)[1]), 'Follow a structured four-week training plan built around fundamental lifts, progressive overload and purposeful training that prepares you for the next stage of your fitness journey.');
  assert.match(page, /style\/program-ongoing.css\?v=3/);
  assert.doesNotMatch(page, /Ongoing programming|Join anytime|rolling cycle|subscription/i);
  assert.doesNotMatch(css, /program-phone|program-feature|program-ongoing|program-session-grid|program-benefit|font-size|@keyframes/);
});

test('Build shows three exact sample sessions without inventing prescriptions or reducing its four-session week', () => {
  const sessions = [...page.matchAll(/<article class="quote-card program-session"[\s\S]*?<\/article>/g)].map(([value]) => value);
  const expected = [
    ['Back Squat', 'DB Lunges', 'Push-Up', 'DB Shoulder Press', 'Sit-Up', 'Rows'],
    ['Bench Press', 'Lat Pulldown', 'Tricep Extension', 'Hanging Leg Raises', 'DB Bicep Curls', "Farmer's Carry"],
    ['Deadlift', 'Box Jumps', 'KB Swing', 'Hip Thrust', 'Pull-Ups', 'DB Incline Press']
  ];
  assert.equal(sessions.length, 3);
  sessions.forEach((session, index) => {
    assert.match(session, /<h3[^>]*>Full Body<\/h3>/);
    assert.match(session, /<p class="program-session-warmup">Warm Up \+ Movement Prep<\/p>/);
    assert.deepEqual([...session.matchAll(/<li>(.*?)<\/li>/g)].map(([, value]) => value), expected[index]);
    assert.doesNotMatch(session, /Day \d|<table|<h4|\bsets\b|\breps\b|\brest\b|\bRPE\b|\d+\s*(min|sec|kg|lb)/i);
  });
  assert.ok(page.includes('Get a feel for the training inside PRFM Build. These three sample sessions highlight the combination of foundational barbell lifts, traditional strength work and functional movements used throughout the program.'));
  assert.match(page, /<dt>Gym sessions<\/dt><dd>4 Per Week<\/dd>/);
  assert.match(page, /program-session-grid" tabindex="0" role="region"/);
});

test('The compact pathway includes both audiences and verified routes, with the existing approved one-off price', () => {
  const pathway = page.match(/<aside class="base-pathway"[\s\S]*?<\/aside>/)[0];
  assert.match(pathway, /Your training journey/);
  assert.match(pathway, /Build the foundation for what's next\./);
  assert.ok(pathway.includes("Whether you're progressing from PRFM Base or looking for more structure in your current training, Build prepares you to take on greater challenges. Once you've completed the program, explore PRFM Strong, Capacity or Prime based on your goals."));
  assert.deepEqual([...pathway.matchAll(/href="(.*?)"/g)].map(([, value]) => value), ['../strong/', '../capacity/', '../prime/']);
  assert.match(page, /Ready to build<br>what's next\?/);
  assert.ok(page.includes('Take the next step with four weeks of structured strength and fitness training designed to build muscle, improve performance and give you the confidence to keep progressing.'));
  assert.ok(readFileSync(join(root, 'HANDOFF.md'), 'utf8').includes('| Build | $89 one-time / 4 weeks |'));
  assert.equal((page.match(/NZ\$89 one-off/g) || []).length, 1);
  assert.doesNotMatch(page, /<form|checkout|Pricing announced|\$\d+\/(week|month)|[\u2010-\u2015\u2212]|&[mn]dash;/i);
});

test('Build metadata, assets, anchors, progression links and Mac mobile preview all resolve', () => {
  assert.match(page, /rel="canonical" href="https:\/\/www.prfmfitness.com\/programs\/build\/"/);
  for (const [, value] of page.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (/^https?:/.test(value)) continue;
    const [pathname, fragment] = value.split('#');
    const target = pathname ? resolve(dirname(pagePath), pathname.split('?')[0]) : pagePath;
    assert.ok(existsSync(target), value);
    if (fragment) assert.ok(readFileSync(target, 'utf8').includes(`id="${fragment}"`), value);
  }
  for (const [, value] of page.matchAll(/srcset="([^"]+)"/g)) value.split(',').forEach(source => assert.ok(existsSync(resolve(dirname(pagePath), source.trim().split(' ')[0]))));
  const ids = [...page.matchAll(/\bid="([^"]+)"/g)].map(([, value]) => value);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal((page.match(/<h1\b/g) || []).length, 1);
  const preview = readFileSync(join(dirname(pagePath), 'mobile-preview.html'), 'utf8');
  assert.match(preview, /noindex,nofollow/);
  assert.match(preview, /width: min\(390px, 100%\)/);
  assert.match(preview, /<iframe src="index.html\?version=1" title="PRFM Build mobile website preview"/);
});
