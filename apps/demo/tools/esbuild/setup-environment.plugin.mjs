import crypto from 'node:crypto';

const password = '***';
const algorithm = 'aes-256-cbc';

const key = crypto.scryptSync(password, 'salt', 32);

const encrypted = 'cf08b049c1ad744e4c4861c456f68636';
const ivHex = 'd1d409a4e9c3fae0a766f71c55796aac';

function decrypt() {
  const decipher = crypto.createDecipheriv(
    algorithm,
    key,
    Buffer.from(ivHex, 'hex'),
  );
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

export default {
  name: 'setup-environment',
  setup(build) {
    const define = (build.initialOptions.define ??= {});
    define.captureKey = JSON.stringify(decrypt());
  },
};
