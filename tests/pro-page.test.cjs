const assert = require('node:assert/strict');
const { readFileSync, existsSync } = require('node:fs');
const { join, dirname, resolve } = require('node:path');
const { createHash } = require('node:crypto');
const test = require('node:test');
const { readHomepageBeforePro, restoreCustomApplication, restoreSectionTwo } = require('./homepage-before-pro.cjs');

const root = join(__dirname, '..');
const pagePath = join(root, 'programs/pro/index.html');
const page = readFileSync(pagePath, 'utf8');
const home = readFileSync(join(root, 'index.html'), 'utf8');
const css = readFileSync(join(root, 'style/pro.css'), 'utf8');
const hash = value => createHash('sha256').update(value).digest('hex');
const text = html => html.replace(/<[^>]*>/g, '').replaceAll('&amp;', '&').trim();

test('Pro leaves all five approved program pages, their hero assets and all shared functionality unchanged', () => {
  const frozen = {
    'programs/base/index.html': 'd44ac68e83d8d8820d52fcd0fcdf7011936f775ed01b85fa5533f769eb3c5f6b',
    'programs/build/index.html': '50917a9c1441b236c40ddbbd567119ea1f20346be4da7a6a5d0a8b6b1c777042',
    'programs/strong/index.html': '93bc2b0d2ba6b41ac9124b969d017a4fb07b17f905d6ec9b59cf0da9ce84791b',
    'programs/capacity/index.html': 'bbb953e45e64694da5f5cb213d124d647663a3ca057303f4e8ee7a8a48e6f845',
    'programs/prime/index.html': '6f11a8fa0a7b12217efd707a4cb0525691c524d73b2790c024a02d252e8bca34',
    'style/base.css': '95df65cb0e44332d2fb563f02d3824bea65a178466cd417978092f8a19dd1f03',
    'style/build.css': '75f3967b1861cec800e5db4f2d2f3c19e6a534fea584df5814cf0139430cc91b',
    'style/capacity.css': '73a4246db481e5db693e95707b7d28ec83db818a0397668f2c8c64cc486a4446',
    'style/prime-overview.css': '1f1d0b47160f9b56db7c8e174f9919af4c4a3d53f5b085e9b5648e9349c86572',
    'style/main.css': 'e8e8e8225c3b7309ca1084ecb2be67a624160ee264e3a6bb649c7830ab464be7',
    'style/main.js': 'dc5c988424aa361f54638cac73455bd031d72b844ab4aa8c529b857127e7057c',
    'style/program.css': 'f3b27c7e4926aee394bd95b8e9dc3cd7add7b0fa2dbe79badf0eec13e0880984',
    'style/program.js': '5fe8822d6c3e591e04239ef946f7b3f3d3361990c2c3866b22b3409243dbb01b',
    'style/program-ongoing.css': 'aaa5fb1b24a2d3309c06adfcf31c44a5c2d5b5781feb5767f399516a3a2320c4',
    'images/hero-athlete.jpg': 'c7271841708f43d4ed8dad31e0ca18e9ed7050893e12eca4f043b0e38138c70b',
    'images/hero-athlete-small.jpg': '7d60b00e69e2aeca48bc7870d7df5d9a270d199b5cdbaa6b7df8ca37ad210c9f',
    'images/hero-coaches-la.jpg': '41b21e0f48a73900397bfbf81bc1ab739d744d20299a4726b56e83a4e81704f2',
    'images/hero-coaches-la-small.jpg': '05e478141f268b67c333a3e4c5a98a06a6ffc0949f04625585e837d096b7038f',
    'images/hero-woman-barbell.jpg': 'af1a3c086fa2f56ac9c2a868d81d69e862d61943ba02af693801b66f102080c5',
    'images/hero-woman-barbell-small.jpg': 'f0412dd29bab10f1d4277897f9e058c5fb71c2c5a9b2c063250049666d1e0482'
  };
  for (const [file, expected] of Object.entries(frozen)) assert.equal(hash(readFileSync(join(root, file))), expected, file);
  for (const name of ['base', 'build', 'strong', 'capacity', 'prime']) {
    assert.doesNotMatch(readFileSync(join(root, 'programs', name, 'index.html'), 'utf8'), /images\/pro-|style\/pro\.css/);
  }
});

test('The homepage changes only its two existing Pro entry points, preserving Recommended styling and Formspree', () => {
  assert.equal(hash(restoreCustomApplication(restoreSectionTwo(home))), '22026905597ce4c4404226ec37cc230d16427467b59897789367e2bf1b244630');
  assert.equal(hash(readHomepageBeforePro(root)), '0fed48a7207a6d58b57f289486c6b5c9c796437193aada74036ca0d531d5a3dc');
  assert.equal((home.match(/href="programs\/pro\/"/g) || []).length, 2);
  assert.match(home, /<a class="journey-item reveal" style="--i:2" href="programs\/pro\/">/);
  const panel = home.match(/<div class="pro-panel reveal"[\s\S]*?<\/ul>\s*<\/div>/)[0];
  assert.match(panel, /section-label recommended-label/);
  assert.match(panel, /<a class="button primary" href="programs\/pro\/">Explore PRFM Pro<\/a>/);
  assert.match(home, /action="https:\/\/formspree.io\/f\/xdarbjra" method="POST"/);
});

test('Pro uses only the three supplied photographs in its hero and showcase, with responsive derivatives', () => {
  const photos = [
    ['pro-strong-squat', 'f3806c1375b85c5b526502f13c40e747a72469a09f9625b264a1a24eb67f5e38', '691e2ac6bc64540391f1d761c1ba4e1269450ec550981bf7d762d0dca5822215'],
    ['pro-capacity-rowing', '13ac9e743b01c8eafb5371ece81f1ee1dae3f60dcd7299dae4e5cc10c15b8395', 'ba3d790834ed3bd43e0c408c16e02b825fa54aa48c07a3dae8e0bc513c5a2a72'],
    ['pro-prime-overhead', 'ba48753d2064dbc9a15a3a2d39ad24280c99605723ca5dd15a16719fd84dc6c2', '42d2f4e1b5c41744231e39ad924a3bfbb8580a809bc7993ccfec697b86ae4992']
  ];
  for (const [name, full, small] of photos) {
    assert.equal(hash(readFileSync(join(root, 'images', name + '.jpg'))), full);
    assert.equal(hash(readFileSync(join(root, 'images', name + '-small.jpg'))), small);
    assert.equal((page.match(new RegExp(`src="../../images/${name}.jpg"`, 'g')) || []).length, 2);
  }
  assert.match(page, /class="pro-hero-art" aria-hidden="true"/);
  assert.equal((page.match(/class="pro-hero-(strong|capacity|prime)"/g) || []).length, 3);
  assert.match(css, /mask-image: linear-gradient/);
  assert.match(css, /object-fit: cover/);
  assert.doesNotMatch(css, /filter:|blur\(|@keyframes|background-attachment/);
  assert.doesNotMatch(page, /images\/hero-athlete|images\/hero-coaches-la|images\/hero-woman-barbell/);
});

test('The Pro hero and editorial overview retain every supplied paragraph and emphasis', () => {
  assert.match(page, /<h1 id="pro-title">PRFM <span>Pro<\/span><\/h1>/);
  assert.match(page, /Every program\.<br>Every possibility\./);
  assert.ok(page.includes('Three complete programs. One membership. Follow one, switch anytime, or combine sessions to train your way.'));
  const overview = page.match(/<section[^>]*pro-overview[\s\S]*?<\/section>/)[0];
  assert.match(overview, /Three programs\.<br>One complete training experience\./);
  const body = overview.match(/<div class="program-body-copy">([\s\S]*?)<\/div>/)[1];
  assert.deepEqual([...body.matchAll(/<p>(.*?)<\/p>/g)].map(([, p]) => text(p)), [
    'PRFM Pro brings together our three ongoing training programs into one complete membership, giving you access to structured strength, conditioning and functional fitness training.',
    "Whether you're focused on building muscle, improving endurance or developing well-rounded performance, Pro gives you the programming and flexibility to keep progressing as your goals evolve.",
    'More options. More freedom. One place to progress.'
  ]);
  assert.match(body, /<strong>More options\. More freedom\. One place to progress\.<\/strong>/);
});

test('The showcase includes exactly three complete programs and real keyboard-accessible destination links', () => {
  const cards = [...page.matchAll(/<article class="pro-program-card"[\s\S]*?<\/article>/g)].map(([card]) => card);
  assert.equal(cards.length, 3);
  const expected = [
    ['strong', 'Build strength. Develop muscle.', 'Structured strength training combining heavy compound lifting, hypertrophy work and functional movements to build strength that carries beyond the gym.'],
    ['capacity', 'Build your engine. Expand your capacity.', 'Purposeful conditioning designed to develop aerobic and anaerobic fitness, improve endurance and expand your physical capacity.'],
    ['prime', 'Stronger. Fitter. Ready for anything.', 'Our complete strength and conditioning program, combining compound lifting, athletic development and functional conditioning to build well-rounded physical performance.']
  ];
  cards.forEach((card, index) => {
    const [name, subtitle, description] = expected[index];
    assert.ok(card.includes(subtitle));
    assert.ok(card.includes(description));
    assert.match(card, /Included in Pro/);
    assert.ok(card.includes(`href="../${name}/"`));
    assert.match(card, /loading="lazy" decoding="async"/);
    assert.doesNotMatch(card, /tabindex="-1"|onclick=|<button/);
  });
  assert.match(css, /grid-template-columns: repeat\(3, minmax\(0, 1fr\)\)/);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*\.pro-program-grid \{ grid-template-columns: minmax\(0, 1fr\)/);
  assert.match(css, /\.pro-program-card:focus-within/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
});

test('Training flexibility and long-term philosophy preserve the supplied positioning without contractual claims', () => {
  for (const copy of [
    'Your goals change.<br>Your training can too.',
    'Follow Strong when strength is your priority. Focus on Capacity when you want to build your engine. Train with Prime for complete strength and conditioning.',
    'Or combine sessions across all three to suit your goals, schedule and training environment.',
    'All three programs remain available inside your PRFM app, giving you the freedom to move between them whenever you choose.',
    'Freedom to choose how you train, backed by structured programming that gives every session a purpose.',
    "Great training isn't about what you can achieve in four weeks. It's about what you can build through months of consistent, purposeful work.",
    "PRFM Pro is designed for people who want to make training a lasting part of their lives. We encourage you to think in terms of the next 12 months, not the next 12 weeks.",
    'No minimum commitment. Just a program worth committing to.'
  ]) assert.ok(page.includes(copy), copy);
  assert.equal((page.match(/class="pro-flex-icon lucide/g) || []).length, 3);
  assert.doesNotMatch(page, /serious athletes only|guaranteed|minimum 12-month commitment|results in 30 days|exclusive coach|unlimited coaching|cancel any time|cancellation fee/i);
});

test('Pro reuses the exact authentic Prime phone, caption, poster and shared accessible playback implementation', () => {
  const prime = readFileSync(join(root, 'programs/prime/index.html'), 'utf8');
  const figure = /<figure class="program-app-demo"[\s\S]*?<\/figure>/;
  assert.equal(page.match(figure)[0], prime.match(figure)[0]);
  assert.match(page, /program-difference-layout program-difference-layout-top/);
  assert.match(page, /style\/program.js\?v=4/);
  assert.match(page, /style\/program.css\?v=4.1/);
  assert.equal((page.match(/<article class="program-feature">/g) || []).length, 3);
  for (const copy of [
    'Every exercise includes a video demonstration, giving you clear guidance on technique and helping you train with confidence.',
    'Every exercise comes with scaling options, including regressions and progressions, so you can train at the right level for you and keep challenging yourself as you improve.',
    'Message an experienced PRFM coach through the app whenever you need advice, answers or training guidance.'
  ]) assert.ok(page.includes(copy));
  assert.match(page, /<h3>Every exercise\. Every level\.<\/h3>/);
  assert.doesNotMatch(css, /\.program-phone|\.program-app-demo|\.program-feature/);
  assert.doesNotMatch(page, /\bcontrols\b|program-demo-toggle|<canvas|<iframe/);
});

test('Weekly and monthly billing have no public prices or selection requirement and share one waitlist CTA', () => {
  const pricing = page.match(/<section[^>]*id="pricing"[\s\S]*?<\/section>/)[0];
  const options = [...pricing.matchAll(/<article class="pro-price-option[^>]*>[\s\S]*?<\/article>/g)].map(([card]) => card);
  assert.equal(options.length, 2);
  assert.match(options[0], /<h3 id="weekly-title">Weekly billing<\/h3>/);
  assert.match(options[0], /A straightforward weekly membership payment\./);
  assert.match(options[1], /<h3 id="monthly-title">Monthly billing<\/h3>/);
  assert.match(options[1], /Pay monthly in a larger instalment and receive a small saving compared with weekly billing\./);
  assert.match(options[1], /Better value/);
  options.forEach(option => assert.doesNotMatch(option, /<a\b|<button|<input|role="radio"/));
  assert.match(pricing, /Both options include complete access to PRFM Strong, Capacity and Prime, with the same training features and coach support\./);
  assert.match(pricing, /No minimum commitment\./);
  assert.match(pricing, /One membership\.<br>Two ways to pay\./);
  assert.equal((pricing.match(/waitlist-cta/g) || []).length, 1);
  const benefits = pricing.match(/<ul class="pro-inclusion-list"[\s\S]*?<\/ul>/)[0];
  assert.deepEqual([...benefits.matchAll(/<li><h4>(.*?)<\/h4><p>(.*?)<\/p><\/li>/g)].map(([, heading, copy]) => [heading, copy]), [
    ['All three programs', 'Complete access to PRFM Strong, Capacity and Prime.'],
    ['Complete training flexibility', 'Follow one program, switch between programs or combine sessions to suit your goals.'],
    ['Exercise guidance and scaling', 'Video demonstrations and exercise regressions and progressions to support training at your level.'],
    ['Real coach support', 'Access to experienced PRFM coaches through the app when you need advice or guidance.']
  ]);
  assert.equal((benefits.match(/<li>/g) || []).length, 4);
  assert.doesNotMatch(page, /NZ\$|\$\s*\d|\b55\b|\b219\b|with (weekly|monthly) billing"/);
  assert.doesNotMatch(page, /<form|checkout|Stripe|countdown|limited spots|\d+%|role="switch"|<button/i);
  const waitlist = [...page.matchAll(/<a[^>]*class="[^"]*\bwaitlist-cta\b[^"]*"[^>]*>/g)];
  assert.equal(waitlist.length, 4);
  waitlist.forEach(([a]) => assert.match(a, /href="\.\.\/\.\.\/index.html#waitlist"/));
});

test('The closing CTA, shared navigation, responsive preview, metadata, assets and internal links resolve', () => {
  for (const tag of ['header', 'footer']) {
    const fragment = new RegExp(`<${tag}[\\s\\S]*?<\\/${tag}>`);
    assert.equal(page.match(fragment)[0], readFileSync(join(root, 'programs/prime/index.html'), 'utf8').match(fragment)[0]);
  }
  assert.match(page, /Ready to train<br>without limits\?/);
  assert.ok(page.includes('Get complete access to PRFM Strong, Capacity and Prime in one membership. Build strength, improve fitness and train with the flexibility to adapt as your goals evolve.'));
  assert.match(page, /Weekly or monthly billing available/);
  assert.match(page, /rel="canonical" href="https:\/\/www.prfmfitness.com\/programs\/pro\/"/);
  for (const [, value] of page.matchAll(/(?:href|src|poster)="([^"]+)"/g)) {
    if (/^https?:/.test(value)) continue;
    const [pathname, fragment] = value.split('#');
    const target = pathname ? resolve(dirname(pagePath), pathname.split('?')[0]) : pagePath;
    assert.ok(existsSync(target), value);
    if (fragment) assert.ok(readFileSync(target, 'utf8').includes(`id="${fragment}"`), value);
  }
  for (const [, srcset] of page.matchAll(/srcset="([^"]+)"/g)) {
    for (const source of srcset.split(',')) assert.ok(existsSync(resolve(dirname(pagePath), source.trim().split(' ')[0])));
  }
  const ids = [...page.matchAll(/\bid="([^"]+)"/g)].map(([, id]) => id);
  assert.equal(ids.length, new Set(ids).size);
  assert.equal((page.match(/<h1\b/g) || []).length, 1);
  assert.doesNotMatch(page, /&[mn]dash;|[\u2013\u2014]/);
  const preview = readFileSync(join(dirname(pagePath), 'mobile-preview.html'), 'utf8');
  assert.match(preview, /noindex,nofollow/);
  assert.match(preview, /width: min\(390px, 100%\)/);
  assert.match(preview, /title="PRFM Pro mobile website preview"/);
  assert.match(preview, /src="index.html\?version=2"/);
});

test('Mobile rower reframing is scoped to Pro while the desktop photographic composition remains approved', () => {
  assert.equal(hash(css.split('.pro-hero-inner')[0]), 'e724280e6ef6879f3a3b4246b832882dc37a67040093e9dc14e5acf39ce68a59');
  const mobile = css.slice(css.indexOf('@media (max-width: 760px)'));
  assert.match(mobile, /\.pro-hero-art \.pro-hero-capacity \{ top: -28px; left: 14%; width: 56%; height: calc\(100% \+ 28px\); object-position: 100% center; mask-image: linear-gradient/);
  assert.match(mobile, /\.pro-showcase-capacity \{ object-position: 100% center; \}/);
  assert.match(page, /style\/pro.css\?v=2/);
  assert.doesNotMatch(css, /object-fit: contain|filter:|@keyframes/);
});

test('Trust the Process is one concise full-width feature beneath the existing app layout, without promises or extra controls', () => {
  const section = page.match(/<section[^>]*pro-experience[\s\S]*?<\/section>/)[0];
  assert.match(section, /<\/figure>\s*<\/div>\s*<aside class="pro-trust"/);
  const feature = section.match(/<aside class="pro-trust"[\s\S]*?<\/aside>/)[0];
  assert.equal(text(feature.match(/<h3 id="trust-title">([\s\S]*?)<\/h3>/)[1]), 'Show up. Put in the work. Trust the process.');
  assert.ok(feature.includes("No more second-guessing what to train or wondering whether you're doing enough. Your programming is already taken care of. Follow the sessions, put in consistent effort and let purposeful training build results over time."));
  assert.ok(feature.includes('We take care of the programming. You focus on the training.'));
  assert.equal((page.match(/class="pro-trust"/g) || []).length, 1);
  assert.doesNotMatch(feature, /<a\b|<button|<img|<video|guarantee|transformation|12 months/i);
  assert.match(css, /\.pro-trust \{ display: grid; grid-template-columns: minmax\(0, 1.1fr\) minmax\(0, 1fr\)/);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*\.pro-trust \{ grid-template-columns: minmax\(0, 1fr\)/);
});

test('V2 preserves showcase markup, flexibility and the long-term philosophy byte-for-byte', () => {
  const frozen = {
    'pro-collection': '7ca4d6c68c6bb4d6a8e328f57599986dd951b989f510f4c7645069c8e7ffd6e4',
    'pro-flexibility': 'e1c0d910fae221e7aa7d0502f5e9c418a080a82f7fdf71cd21ef4f37a07cb2b4',
    'pro-philosophy': '080dab82c14eefe750325274d56b239fef2f7f2ccad8579982e325900b891b10'
  };
  for (const [name, expected] of Object.entries(frozen)) {
    assert.equal(hash(page.match(new RegExp(`<section[^>]*${name}[\\s\\S]*?<\\/section>`))[0]), expected, name);
  }
});

test('Pro has a dedicated complete-membership social image with matching Open Graph and Twitter metadata', () => {
  const source = 'https://www.prfmfitness.com/images/prfm-pro-social.jpg';
  assert.ok(page.includes(`<meta property="og:image" content="${source}">`));
  assert.ok(page.includes(`<meta name="twitter:image" content="${source}">`));
  assert.match(page, /og:image:width" content="1200"/);
  assert.match(page, /og:image:height" content="630"/);
  assert.match(page, /og:image:alt" content="PRFM Pro\. Every program\. Every possibility\./);
  assert.match(page, /name="twitter:title" content="PRFM Pro \| Every Program\. Every Possibility\."/);
  assert.match(page, /name="twitter:description"/);
  assert.doesNotMatch(page, /og:image" content="[^"]*pro-capacity-rowing/);
  const image = readFileSync(join(root, 'images/prfm-pro-social.jpg'));
  assert.equal(hash(image), '8ab18658d61b0093f7e3be2e8c3f463b12aa38be6e67793d4ec4149a26a1a5ba');
  assert.ok(image.subarray(0, 2).equals(Buffer.from([0xff, 0xd8])));
  assert.ok(image.length > 20000 && image.length < 750000);
});
