const assert = require('node:assert/strict');
const { readFileSync, existsSync } = require('node:fs');
const { dirname, join, resolve } = require('node:path');
const { createHash } = require('node:crypto');
const test = require('node:test');
const { readHomepageBeforePro } = require('./homepage-before-pro.cjs');

const root = join(__dirname, '..');
const pagePath = join(root, 'programs/base/index.html');
const page = readFileSync(pagePath, 'utf8');
const prime = readFileSync(join(root, 'programs/prime/index.html'), 'utf8');
const home = readHomepageBeforePro(root).replace('<a class="program-cta" href="programs/build/">Explore PRFM Build', '<a class="program-cta waitlist-cta" href="#waitlist" data-launch-text="Start Training">Join the Waitlist');
const css = readFileSync(join(root, 'style/base.css'), 'utf8');
const hash = value => createHash('sha256').update(value).digest('hex');
const text = html => html.replace(/<[^>]*>/g, '').replaceAll('&amp;', '&').trim();
const normalizeBasePathway = html => html
  .replace('<a class="program-back base-next-link" href="../build/">PRFM Build</a>', 'PRFM Build')
  .replace('style/base.css?v=1.1', 'style/base.css?v=1');
const normalizeBaseMedia = html => html
  .replaceAll('prfm-base-app-demo.mp4?v=1', 'prfm-prime-app-demo.mp4?v=1')
  .replaceAll('prfm-base-app-demo-poster.jpg?v=1', 'prfm-prime-app-demo-poster.jpg?v=1');
const restorePlaceholderComment = html => html.replace('          <figure class="program-app-demo"', '          <!-- Temporary existing Prime recording; replace these three media URLs when the Base recording is supplied. -->\n          <figure class="program-app-demo"');

test('Base leaves all approved program pages, shared styles, scripts and recordings byte-identical', () => {
  const frozen = {
    'programs/strong/index.html': '93bc2b0d2ba6b41ac9124b969d017a4fb07b17f905d6ec9b59cf0da9ce84791b',
    'programs/capacity/index.html': 'bbb953e45e64694da5f5cb213d124d647663a3ca057303f4e8ee7a8a48e6f845',
    'programs/prime/index.html': '6f11a8fa0a7b12217efd707a4cb0525691c524d73b2790c024a02d252e8bca34',
    'style/program.css': 'f3b27c7e4926aee394bd95b8e9dc3cd7add7b0fa2dbe79badf0eec13e0880984',
    'style/program.js': '5fe8822d6c3e591e04239ef946f7b3f3d3361990c2c3866b22b3409243dbb01b',
    'style/main.css': 'e8e8e8225c3b7309ca1084ecb2be67a624160ee264e3a6bb649c7830ab464be7',
    'style/main.js': 'dc5c988424aa361f54638cac73455bd031d72b844ab4aa8c529b857127e7057c',
    'style/program-ongoing.css': 'aaa5fb1b24a2d3309c06adfcf31c44a5c2d5b5781feb5767f399516a3a2320c4',
    'style/prime-overview.css': '1f1d0b47160f9b56db7c8e174f9919af4c4a3d53f5b085e9b5648e9349c86572',
    'style/program-session-parts.css': '4b755ff5b2c57941ceb272033daf813b055981972ab4a162bee1493bf6412c15',
    'media/prfm-strong-app-demo.mp4': '1fcdf4bfab999e049a262966cd31ea6fc4790db36f857359a8666b532b0e5e8b',
    'media/prfm-capacity-app-demo.mp4': 'bdc2fc06c928ca28c27e5be5949b856c56d4f0d4095cec6bb63a3f8e79364823',
    'media/prfm-prime-app-demo.mp4': '326b449ae89527cd777fb719f936b509069341aae27a636ab06a26c0d1152286'
  };
  for (const [file, expected] of Object.entries(frozen)) assert.equal(hash(readFileSync(join(root, file))), expected, file);
});

test('Base changes only its own homepage CTA and retains the existing header, footer and waitlist', () => {
  const original = home.replace('<a class="program-cta" href="programs/base/">Explore PRFM Base', '<a class="program-cta waitlist-cta" href="#waitlist" data-launch-text="Start Training">Join the Waitlist');
  assert.equal(hash(original), '057ef9f8328eabc54a75b712d7f48d13a4e6cb4eef645819b1c79a75fe0add26');
  for (const program of ['base', 'strong', 'capacity', 'prime']) assert.equal((home.match(new RegExp(`href="programs/${program}/"`, 'g')) || []).length, 1);
  for (const tag of ['header', 'footer']) {
    const fragment = new RegExp(`<${tag}[\\s\\S]*?<\\/${tag}>`);
    assert.equal(page.match(fragment)[0], prime.match(fragment)[0]);
  }
  const links = [...page.matchAll(/<a[^>]*class="[^"]*waitlist-cta"[^>]*>/g)];
  assert.equal(links.length, 3);
  links.forEach(([link]) => assert.match(link, /href="\.\.\/\.\.\/index.html#waitlist"/));
  assert.match(home, /action="https:\/\/formspree.io\/f\/xdarbjra" method="POST"/);
});

test('Base uses the supplied coaching image directly and preserves the approved hero copy', () => {
  assert.equal(hash(readFileSync(join(root, 'images/hero-base-coaching.png'))), 'f3fa5ab3abae55c966df5e15f265e29f327c23638cae2ddf309c079f5a4e798e');
  assert.match(page, /class="program-hero-photo" src="\.\.\/\.\.\/images\/hero-base-coaching.png\?v=2"/);
  assert.match(page, /hero-base-coaching-small.jpg\?v=2 800w, .*hero-base-coaching.png\?v=2 1536w/);
  assert.match(page, /width="1536" height="1024" alt="A PRFM-branded coach kneeling beside a woman and guiding her dumbbell lunge in a gym"/);
  assert.match(page, /<h1 id="base-title">PRFM <span>Base<\/span><\/h1>/);
  assert.match(page, /<p class="program-headline">Start strong\.<br>Build your foundation\.<\/p>/);
  assert.ok(page.includes('A four-week introduction to strength and functional fitness, designed to help you build confidence, learn the fundamentals and feel comfortable training in the gym.'));
  assert.match(css, /\.base-page \.program-hero-photo[^}]*object-fit: contain/);
});

test('The replacement Base hero leaves all page content and layout unchanged', () => {
  const original = restorePlaceholderComment(normalizeBaseMedia(normalizeBasePathway(page))).replaceAll('hero-base-coaching.png?v=2', 'hero-base-coaching.png').replaceAll('hero-base-coaching-small.jpg?v=2', 'hero-base-coaching-small.jpg');
  assert.equal(hash(original), 'f1c5cbf6701f11d027c6e0011b0de586e973fe43b3c1330eaae2cfdffc8c2334');
});

test('Base keeps exact overview copy, bold closing, four specifications and recommended activity', () => {
  assert.match(page, /<h2 id="audience-title">Every strong foundation starts somewhere\.<\/h2>/);
  assert.match(css, /\.base-summary \.program-editorial \{ align-items: start; \}/);
  const copy = page.match(/<div class="program-body-copy">([\s\S]*?)<\/div>/)[1];
  assert.deepEqual([...copy.matchAll(/<p>(.*?)<\/p>/g)].map(([, value]) => text(value)), [
    'PRFM Base is designed for people who are new to the gym and want to learn how to train properly from day one.',
    "Over four weeks, you'll develop strength, improve movement quality and build confidence through structured sessions using bodyweight exercises, dumbbells and kettlebells. No barbells, complicated routines or unnecessary intensity.",
    "With three full-body gym sessions each week, supported by regular walking and gradual progression, PRFM Base introduces you to the fundamentals of strength training at a pace that's appropriate for beginners.",
    'Learn the movements. Understand your training. Build the confidence to keep progressing.'
  ]);
  assert.match(copy, /<strong>Learn the movements\. Understand your training\. Build the confidence to keep progressing\.<\/strong>/);
  const specs = page.match(/<dl class="program-specs"[\s\S]*?<\/dl>/)[0];
  assert.deepEqual([...specs.matchAll(/<dt>(.*?)<\/dt><dd>(.*?)<\/dd>/g)].map(([, label, value]) => [text(label), text(value)]), [
    ['Training focus', 'Foundational Strength & Functional Fitness'], ['Experience', 'Beginner / First-Time Gym-Goer'],
    ['Program length', '4 Weeks'], ['Gym sessions', '3 Full-Body Sessions / Week']
  ]);
  const practical = page.match(/<dl class="base-practical"[\s\S]*?<\/dl>/)[0];
  assert.ok(practical.includes('Approximately 30-40 minutes'));
  assert.ok(practical.includes('2-3 additional walks per week, approximately 20-30 minutes each'));
  assert.ok(practical.includes('Recommended walking'));
  assert.ok(practical.includes('Bodyweight, dumbbells &amp; kettlebells'));
  assert.ok(practical.includes('Standard gym or functional fitness gym'));
});

test('Base retains the exact four beginner benefit headings and descriptions', () => {
  const benefits = page.match(/<ol class="program-benefit-list"[\s\S]*?<\/ol>/)[0];
  assert.deepEqual([...benefits.matchAll(/<h3>(.*?)<\/h3><p>(.*?)<\/p>/g)].map(([, heading, body]) => [heading, body]), [
    ['Learn to train with confidence.', 'Build familiarity with fundamental exercises, equipment and gym training through clear instruction and structured sessions.'],
    ['Build strength from the ground up.', 'Develop strength and movement quality through beginner-friendly exercises and gradual progression.'],
    ['Create healthy training habits.', 'Combine three weekly gym sessions with recommended walks to develop consistency, support recovery and gradually improve cardiovascular fitness.'],
    ["Understand what you're doing.", 'Learn gym terminology, training intensity and fundamental training principles through short, easy-to-follow educational videos.']
  ]);
});

test('Three beginner feature cards retain the approved phone, centred caption and playback lifecycle', () => {
  const features = [...page.matchAll(/<article class="program-feature">[\s\S]*?<\/article>/g)].map(([value]) => value);
  assert.equal(features.length, 3);
  ['Follow clear exercise demonstrations and guidance so you can approach each movement with greater confidence.', 'Every exercise includes appropriate scaling options, helping you train at a level that suits your current ability.', 'Get guidance from an experienced PRFM coach through the training app when you have questions about your program.'].forEach((copy, index) => assert.ok(features[index].includes(copy)));
  assert.match(features[0], /RPE \(Rate of Perceived Exertion\): a simple guide to how hard you're working/);
  assert.doesNotMatch(features.join(''), /\d+ videos|unlimited|immediate replies|personal training sessions/i);
  const demo = /<figure class="program-app-demo"[\s\S]*?<\/figure>/;
  assert.equal(normalizeBaseMedia(page.match(demo)[0]), prime.match(demo)[0]);
  assert.match(page, /program-difference-layout program-difference-layout-top/);
  assert.match(page, /style\/program.js\?v=4/);
  assert.match(page, /style\/program.css\?v=4\.1/);
  assert.doesNotMatch(page, /\bcontrols\b|program-demo-toggle|<button/);
});

test('The dedicated Base recording changes only its media references and obsolete placeholder comment', () => {
  assert.equal(hash(restorePlaceholderComment(normalizeBaseMedia(normalizeBasePathway(page)))), 'bf57648bfa93fe3cee97232a68fffaebb1cfe4fa89df0d180329aa941b83a4e9');
  assert.equal((page.match(/prfm-base-app-demo-poster\.jpg\?v=1/g) || []).length, 2);
  assert.equal((page.match(/prfm-base-app-demo\.mp4\?v=1/g) || []).length, 1);
  assert.doesNotMatch(page, /prfm-prime-app-demo|Temporary existing Prime recording/);
  const video = readFileSync(join(root, 'media/prfm-base-app-demo.mp4'));
  assert.ok(video.includes(Buffer.from('ftyp')));
  assert.ok(video.includes(Buffer.from('avc1')), 'Web-compatible H.264 encoding');
  assert.ok(video.indexOf(Buffer.from('moov')) < video.indexOf(Buffer.from('mdat')), 'Metadata is ready before the video download completes');
  assert.notEqual(hash(video), hash(readFileSync(join(root, 'media/prfm-prime-app-demo.mp4'))));
  assert.notEqual(hash(readFileSync(join(root, 'images/prfm-base-app-demo-poster.jpg'))), hash(readFileSync(join(root, 'images/prfm-prime-app-demo-poster.jpg'))));
});

test('The exact shared delivery panel describes a fixed four-week program beneath both columns', () => {
  const panel = page.match(/<aside class="program-ongoing"[\s\S]*?<\/aside>/)[0];
  assert.match(page, /<\/figure>\s*<\/div>\s*<aside class="program-ongoing"/);
  assert.match(panel, /Structured four-week program/);
  assert.match(panel, /Four weeks\. One strong foundation\./);
  assert.equal(text(panel.match(/<p class="program-ongoing-copy">(.*?)<\/p>/)[1]), 'Start at Week 1 and follow a clear, beginner-friendly training plan that gradually builds your strength, confidence and understanding of the gym.');
  assert.doesNotMatch(page, /Join anytime|Ongoing programming|rolling cycle|subscription/i);
  assert.match(page, /style\/program-ongoing.css\?v=3/);
  assert.doesNotMatch(css, /program-ongoing|program-phone|program-feature|program-session-grid|program-benefit/);
});

test('The three simple Base sessions match the source with the confirmed DB bench-press correction', () => {
  const sessions = [...page.matchAll(/<article class="quote-card program-session"[\s\S]*?<\/article>/g)].map(([value]) => value);
  const expected = [
    ['Squats', 'Push-Up', 'Lunges', 'Shoulder Press', 'Plank', "Farmer's Carry"],
    ['KB Deadlift', 'Shoulder Taps', 'Ring Row', 'Step-Ups', 'Suitcase Carry', 'Sit-Ups'],
    ['DB Bench Press', 'Lunges', 'KB Swing', 'Side Plank', 'Hip Thrust', 'Push-Up']
  ];
  assert.equal(sessions.length, 3);
  sessions.forEach((session, index) => {
    assert.equal(text(session.match(/<h3[^>]*>(.*?)<\/h3>/)[1]), 'Full Body');
    assert.match(session, /<p class="program-session-warmup">Warm Up \+ Movement Prep<\/p>/);
    assert.deepEqual([...session.matchAll(/<li>(.*?)<\/li>/g)].map(([, value]) => value), expected[index]);
    assert.doesNotMatch(session, /barbell|<li>Bench Press<|<table|<h4|\bsets\b|\breps\b|\brest\b|\bRPE\b|\d+\s*(min|sec|kg|lb)/i);
  });
  const training = page.match(/id="training"[\s\S]*?<div class="program-session-grid"/)[0];
  assert.ok(training.includes('Three full-body sessions each week introduce fundamental strength and functional movements in a structured, beginner-friendly way.'));
  assert.ok(training.includes("Here's a look at three sessions from PRFM Base. Every exercise includes video guidance and options to help you train at your level."));
});

test('Base links its existing next-step copy to Build without changing other content or adding checkout', () => {
  const pathway = page.match(/<aside class="base-pathway"[\s\S]*?<\/aside>/)[0];
  assert.match(pathway, /Your next step: PRFM Build\./);
  assert.ok(text(pathway).includes("Once you've completed Base, you'll have the foundation to take the next step with PRFM Build."));
  assert.match(pathway, /<a class="program-back base-next-link" href="\.\.\/build\/">PRFM Build<\/a>/);
  assert.equal((pathway.match(/<a\b/g) || []).length, 1);
  assert.equal(hash(normalizeBasePathway(page)), '6564fd053972fa60d01004125a5bb7eadb9ef941d6089f72692db5ef102ede78');
  assert.match(css, /\.base-page \.base-next-link \{ display: inline; min-height: 0; font-size: inherit; white-space: nowrap; \}/);
  assert.equal(hash(css.replace('.base-page .base-next-link { display: inline; min-height: 0; font-size: inherit; white-space: nowrap; }\n', '')), '3d7b7318e84f26199d857209b94d17f871199db7821a7efc22eb907ac3326eb6');
  assert.doesNotMatch(pathway, /automatically|enrol/i);
  assert.match(page, /Ready to build<br>your foundation\?/);
  assert.equal((page.match(/NZ\$89 one-off/g) || []).length, 1);
  assert.ok(page.includes('Start your training journey with a structured four-week program designed to help you build strength, learn the fundamentals and train with confidence.'));
  assert.doesNotMatch(page, /<form|checkout|Pricing announced|\$\d+\/(week|month)|[\u2010-\u2015\u2212]|&[mn]dash;/i);
});

test('Base route, metadata, local assets, internal anchors and Mac mobile preview resolve', () => {
  assert.match(page, /rel="canonical" href="https:\/\/www.prfmfitness.com\/programs\/base\/"/);
  for (const [, value] of page.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (/^https?:/.test(value)) continue;
    const [pathname, fragment] = value.split('#');
    const target = pathname ? resolve(dirname(pagePath), pathname.split('?')[0]) : pagePath;
    assert.ok(existsSync(target), value);
    if (fragment) assert.ok(readFileSync(target, 'utf8').includes(`id="${fragment}"`), value);
  }
  for (const [, value] of page.matchAll(/srcset="([^"]+)"/g)) value.split(',').forEach(source => assert.ok(existsSync(resolve(dirname(pagePath), source.trim().split(' ')[0].split('?')[0]))));
  const ids = [...page.matchAll(/\bid="([^"]+)"/g)].map(([, value]) => value);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal((page.match(/<h1\b/g) || []).length, 1);
  const preview = readFileSync(join(dirname(pagePath), 'mobile-preview.html'), 'utf8');
  assert.match(preview, /noindex,nofollow/);
  assert.match(preview, /width: min\(390px, 100%\)/);
  assert.match(preview, /<iframe src="index.html\?version=1" title="PRFM Base mobile website preview"/);
});
