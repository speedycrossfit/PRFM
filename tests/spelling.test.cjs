const assert = require('node:assert/strict');
const { readFileSync, readdirSync } = require('node:fs');
const { join } = require('node:path');
const test = require('node:test');

const root = join(__dirname, '..');

function websiteFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = join(directory, entry.name);
    if (entry.isDirectory()) return websiteFiles(file);
    return /\.(html|js)$/.test(entry.name) ? [file] : [];
  });
}

test('All website pages, metadata and scripted messages use American program spelling', () => {
  const files = [
    join(root, 'index.html'),
    join(root, 'mobile-preview.html'),
    ...websiteFiles(join(root, 'programs')),
    ...websiteFiles(join(root, 'style'))
  ];
  for (const file of files) {
    assert.doesNotMatch(readFileSync(file, 'utf8'), /\bprogrammes?\b/i, file);
  }
});
