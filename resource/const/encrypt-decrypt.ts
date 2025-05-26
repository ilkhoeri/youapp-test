import crypto from 'crypto';

/**
 * 32 karakter untuk AES-256
 * - openssl rand -base64 32
 */
const SECRET_KEY = process.env.NEXT_PUBLIC_CIPHERIV as string;
const IV_LENGTH = 16; // Panjang IV harus 16 byte
const ALGORITHM = 'aes-256-cbc';

export function encrypt(text: string) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(SECRET_KEY), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted; // Gabungkan IV dan hasil enkripsi
}

export function decrypt(text: string | null | undefined): string {
  if (!text || typeof text !== 'string' || !text.includes(':')) {
    return '';
  }

  try {
    const parts = text.split(':');
    if (parts.length !== 2) return '';

    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = parts[1];

    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(SECRET_KEY), iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    return '';
  }
}
