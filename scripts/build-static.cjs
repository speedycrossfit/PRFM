const { cpSync, lstatSync, mkdirSync, readdirSync, rmSync } = require('node:fs');
const { basename, join } = require('node:path');
const { spawnSync } = require('node:child_process');

function buildStaticSite(root) {
  const output = join(root, 'public');
  rmSync(output, { recursive: true, force: true });
  mkdirSync(output, { recursive: true });
  const filter = source => {
    const name = basename(source);
    const stat = lstatSync(source);
    if (name.startsWith('.') || name.includes('.sb-') || stat.isSymbolicLink()) return false;
    return stat.isDirectory() || /\.(html|css|js|png|jpe?g|webp|avif|gif|svg|ico|mp4|webm|woff2?)$/i.test(name);
  };
  for (const file of ['index.html', 'mobile-preview.html', 'LUCIDE-LICENSE.txt']) {
    cpSync(join(root, file), join(output, file));
  }
  for (const directory of ['programs', 'style', 'images', 'media']) {
    cpSync(join(root, directory), join(output, directory), { recursive: true, filter });
  }
  return output;
}

if (require.main === module) {
  const root = join(__dirname, '..');
  const tests = readdirSync(join(root, 'tests')).filter(file => file.endsWith('.test.cjs'));
  const result = spawnSync(process.execPath, ['--test', ...tests.map(file => join('tests', file))], { cwd: root, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
  console.log(`Static website prepared in ${buildStaticSite(root)}`);
}

module.exports = { buildStaticSite };
