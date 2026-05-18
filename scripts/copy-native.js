import { execSync } from 'child_process';
import { copyFileSync, chmodSync, existsSync, mkdirSync, unlinkSync } from 'fs';
import { join } from 'path';
import { platform, arch } from 'os';

function isMusl() {
  if (platform() !== 'linux') return false;
  try {
    const result = execSync('ldd --version 2>&1 || true', { encoding: 'utf8' });
    return result.toLowerCase().includes('musl');
  } catch {
    return existsSync('/lib/ld-musl-x86_64.so.1') || existsSync('/lib/ld-musl-aarch64.so.1');
  }
}

function binaryName() {
  const os = platform();
  const cpu = arch();
  let osKey;
  switch (os) {
    case 'darwin':
      osKey = 'darwin';
      break;
    case 'linux':
      osKey = isMusl() ? 'linux-musl' : 'linux';
      break;
    case 'win32':
      osKey = 'win32';
      break;
    default:
      throw new Error(`Unsupported platform: ${os}-${cpu}`);
  }
  let archKey;
  switch (cpu) {
    case 'x64':
      archKey = 'x64';
      break;
    case 'arm64':
      archKey = 'arm64';
      break;
    default:
      throw new Error(`Unsupported architecture: ${os}-${cpu}`);
  }
  const ext = os === 'win32' ? '.exe' : '';
  return `repobridge-${osKey}-${archKey}${ext}`;
}

function sourceBinaryPath(binDir) {
  const primary = join(binDir, platform() === 'win32' ? 'repobridge.exe' : 'repobridge');
  const fallback = join(binDir, platform() === 'win32' ? 'repobridge' : 'repobridge.exe');
  if (existsSync(primary)) return primary;
  if (existsSync(fallback)) return fallback;
  return primary;
}

const binDir = join(process.cwd(), 'bin');
const source = sourceBinaryPath(binDir);
let target;
try {
  target = join(binDir, binaryName());
} catch (err) {
  console.error(err.message);
  process.exit(1);
}

if (!existsSync(source)) {
  console.error(`Missing built binary: ${source}`);
  process.exit(1);
}

mkdirSync(binDir, { recursive: true });
copyFileSync(source, target);
if (platform() !== 'win32') {
  chmodSync(target, 0o755);
}
console.log(`Copied ${source} to ${target}`);
if (source !== target) {
  unlinkSync(source);
  console.log(`Removed generic build artifact ${source}`);
}
