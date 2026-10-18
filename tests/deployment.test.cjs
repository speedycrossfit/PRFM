const assert = require('node:assert/strict');
const { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { dirname, join } = require('node:path');
const test = require('node:test');
const { buildStaticSite } = require('../scripts/build-static.cjs');

test('Vercel serves only the generated website directory after the tested build', () => {
  const config = JSON.parse(readFileSync(join(__dirname, '..', 'vercel.json'), 'utf8'));
  assert.equal(config.framework, null);
  assert.equal(config.buildCommand, 'node scripts/build-static.cjs');
  assert.equal(config.outputDirectory, 'public');
});

test('The static release preserves website bytes and excludes private files, archives and staging media', t => {
  const root = mkdtempSync(join(tmpdir(), 'prfm-release-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const website = ['index.html', 'mobile-preview.html', 'LUCIDE-LICENSE.txt', 'programs/base/index.html', 'programs/pro/mobile-preview.html', 'style/main.css', 'style/program.js', 'images/hero.jpg', 'media/app.mp4'];
  const excluded = ['README.md', 'HANDOFF.md', '.env', 'website.zip', 'tests/example.test.cjs', 'scripts/internal.cjs', 'media/app.mp4.sb-backup', 'images/.DS_Store', 'programs/notes.md', 'public/stale.html'];
  for (const file of [...website, ...excluded]) {
    mkdirSync(dirname(join(root, file)), { recursive: true });
    writeFileSync(join(root, file), Buffer.from(`Original bytes: ${file}\n`));
  }
  const output = buildStaticSite(root);
  for (const file of website) assert.deepEqual(readFileSync(join(output, file)), readFileSync(join(root, file)), file);
  for (const file of excluded) assert.equal(existsSync(join(output, file.replace(/^public\//, ''))), false, file);
  assert.equal(existsSync(join(output, '.git')), false);
});
