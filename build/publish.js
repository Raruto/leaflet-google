const { execFileSync } = require('node:child_process');
const { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } = require('node:fs');
const { tmpdir } = require('node:os');
const path = require('node:path');

const source = path.resolve(__dirname, '..');
const { version } = JSON.parse(readFileSync(path.join(source, 'package.json'), 'utf8'));
if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(version)) {
  throw new Error(`Invalid package version: ${version}`);
}

const git = (cwd, ...args) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] }).trim();
const name = git(source, 'config', '--get', 'user.name');
const email = git(source, 'config', '--get', 'user.email');
const temporary = mkdtempSync(path.join(tmpdir(), 'leaflet-google-cdn-'));

try {
  const checkout = path.join(temporary, 'cdn');
  git(temporary, 'clone', '--quiet', 'https://github.com/Raruto/raruto.github.io.git', checkout);
  const directory = path.join('cdn', 'leaflet-google', version);
  mkdirSync(path.join(checkout, directory), { recursive: true });
  const files = ['leaflet-google.js', 'leaflet-google.min.js'];
  for (const file of files) {
    const contents = execFileSync('git', ['show', `v${version}:${file}`], { cwd: source });
    writeFileSync(path.join(checkout, directory, file), contents);
  }
  git(checkout, 'add', '--', ...files.map(file => path.join(directory, file)));
  if (git(checkout, 'diff', '--cached', '--name-only')) {
    git(checkout, '-c', `user.name=${name}`, '-c', `user.email=${email}`, 'commit', '-m', `Update leaflet-google ${version}`);
    git(checkout, 'push', 'origin', 'HEAD');
  }
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
