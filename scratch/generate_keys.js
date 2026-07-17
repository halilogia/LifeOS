import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

try {
  console.log('Generating RSA key pair...');
  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'der'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  });

  const base64Key = publicKey.toString('base64');
  console.log('Public key generated successfully.');

  // Calculate Extension ID using Chrome's formula
  const sha256 = crypto.createHash('sha256').update(publicKey).digest('hex');
  const extensionId = sha256
    .slice(0, 32)
    .split('')
    .map(char => String.fromCharCode(parseInt(char, 16) + 97))
    .join('');

  console.log(`\nNew Permanent Extension ID: ${extensionId}`);

  // Write private key file for developer backup
  const privateKeyPath = path.resolve('zentodo_private_key.pem');
  fs.writeFileSync(privateKeyPath, privateKey, 'utf8');
  console.log(`Private key backup saved to: ${privateKeyPath}`);

  // Load and update src/manifest.json
  const manifestPath = path.resolve('src/manifest.json');
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    manifest.key = base64Key;
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
    console.log(`Updated src/manifest.json with the new 'key' field.`);
  } else {
    console.error('Error: src/manifest.json not found!');
  }

  console.log('\nKeys generated and manifest updated successfully!');
} catch (error) {
  console.error('Key generation failed:', error);
}
