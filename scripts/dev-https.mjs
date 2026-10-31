import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync, chmodSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const directory = join(root, '.local', 'https');
const key = join(directory, 'localhost-key.pem');
const cert = join(directory, 'localhost.pem');
const config = join(directory, 'openssl.cnf');
mkdirSync(directory, { recursive: true, mode: 0o700 });

let valid = existsSync(key) && existsSync(cert);
if (valid) {
  try {
    execFileSync('openssl', ['x509', '-checkend', '86400', '-noout', '-in', cert], { stdio: 'ignore' });
  } catch {
    valid = false;
  }
}
if (!valid) {
  writeFileSync(config, `[req]
distinguished_name = subject
x509_extensions = extensions
prompt = no
[subject]
CN = localhost
[extensions]
subjectAltName = DNS:localhost,IP:127.0.0.1,IP:::1
basicConstraints = critical,CA:FALSE
keyUsage = critical,digitalSignature,keyEncipherment
extendedKeyUsage = serverAuth
`);
  execFileSync('openssl', [
    'req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-sha256', '-days', '30',
    '-keyout', key, '-out', cert, '-config', config,
  ], { stdio: 'pipe' });
  chmodSync(key, 0o600);
}

console.log('Local HTTPS uses a self-signed certificate; your browser may ask you to accept it.');
execFileSync(process.execPath, [
  join(root, 'node_modules/astro/bin/astro.mjs'), 'dev', '--background', '--host', 'localhost', '--port', '4443',
], {
  cwd: root,
  stdio: 'inherit',
  env: { ...process.env, COOKIEBEAR_LOCAL_HTTPS: '1' },
});
