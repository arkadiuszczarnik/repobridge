import { execFileSync } from 'child_process';
import { chmodSync, existsSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';

const binDir = join(process.cwd(), 'bin');
const version = process.env.npm_package_version || 'dev';
const ldflags = `-X main.version=${version}`;

const targets = [
  { name: 'repobridge-darwin-x64', goos: 'darwin', goarch: 'amd64' },
  { name: 'repobridge-darwin-arm64', goos: 'darwin', goarch: 'arm64' },
  { name: 'repobridge-linux-x64', goos: 'linux', goarch: 'amd64' },
  { name: 'repobridge-linux-arm64', goos: 'linux', goarch: 'arm64' },
  { name: 'repobridge-linux-musl-x64', goos: 'linux', goarch: 'amd64' },
  { name: 'repobridge-linux-musl-arm64', goos: 'linux', goarch: 'arm64' },
  { name: 'repobridge-win32-x64.exe', goos: 'windows', goarch: 'amd64' },
  { name: 'repobridge-win32-arm64.exe', goos: 'windows', goarch: 'arm64' },
];

function removeGenericArtifacts() {
  rmSync(join(binDir, 'repobridge'), { force: true });
  rmSync(join(binDir, 'repobridge.exe'), { force: true });
}

mkdirSync(binDir, { recursive: true });
removeGenericArtifacts();

for (const target of targets) {
  const output = join(binDir, target.name);
  execFileSync(
    'go',
    ['build', '-ldflags', ldflags, '-o', output, './cmd/repobridge'],
    {
      stdio: 'inherit',
      env: {
        ...process.env,
        CGO_ENABLED: '0',
        GOOS: target.goos,
        GOARCH: target.goarch,
      },
    },
  );
  if (!target.name.endsWith('.exe')) {
    chmodSync(output, 0o755);
  }
  console.log(`Built ${target.name}`);
}

removeGenericArtifacts();

if (!existsSync(join(binDir, 'repobridge.js'))) {
  console.error('Missing npm shim: bin/repobridge.js');
  process.exit(1);
}
