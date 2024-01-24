import forge from "node-forge";

/**
 * Generates a random key for AES encryption.
 * @returns {string} The generated key.
 */
export function generateKey() {
  // 32 bytes for AES-256 encryption
  return forge.random.getBytesSync(32);
}

/**
 * Encrypts the API key using AES-GCM and returns a combined string of IV and encrypted data.
 * @param {string} key - The API key to be encrypted.
 * @param {string} passphrase - The passphrase for encryption.
 * @returns {string} A combined string of the IV and the encrypted data.
 */
export function encryptKey(key: string, passphrase: string): string {
  const salt = forge.random.getBytesSync(128); // Recommended to use a salt
  const iterations = 10000; // Recommended number of iterations
  const keySize = 32; // For AES-256

  // Derive a key using PBKDF2
  const derivedKey = forge.pkcs5.pbkdf2(passphrase, salt, iterations, keySize);

  const iv = forge.random.getBytesSync(12); // 12 bytes IV for GCM
  const cipher = forge.cipher.createCipher("AES-GCM", derivedKey);
  cipher.start({ iv });
  cipher.update(forge.util.createBuffer(key));
  cipher.finish();

  const encrypted = cipher.output.getBytes();
  const tag = cipher.mode.tag.getBytes();

  // Combine salt, IV, encrypted data, and tag into a single string and base64 encode it
  return forge.util.encode64(salt + iv + encrypted + tag);
}

/**
 * Decrypts a combined string of IV and encrypted API key.
 * @param {string} combined - The combined IV and encrypted API key.
 * @param {string} passphrase - The passphrase used for encryption.
 * @returns {string} The decrypted API key.
 */
export function decryptKey(combined: string, passphrase: string): string {
  const combinedBytes = forge.util.decode64(combined);

  // Extract IV, encrypted data, and tag from the combined string
  const iv = combinedBytes.substring(0, 12);
  const encrypted = combinedBytes.substring(12, combinedBytes.length - 16);
  const tag = combinedBytes.substring(combinedBytes.length - 16);

  const cryptoKey = forge.util.createBuffer(passphrase);

  const decipher = forge.cipher.createDecipher("AES-GCM", cryptoKey);
  decipher.start({ iv, tag: forge.util.createBuffer(tag) });
  decipher.update(forge.util.createBuffer(encrypted));
  const result = decipher.finish(); // Check 'result' to make sure decryption was successful

  return decipher.output.getBytes();
}
