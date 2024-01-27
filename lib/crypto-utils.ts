import forge from "node-forge";

/**
 * Generates a random passphrase of the desired length.
 * @param {number} length - The desired length of the passphrase.
 * @returns {string} The generated passphrase.
 */
export function generatePassphrase(length: number): string {
  // Generate random bytes and convert to a base64 string to use as a passphrase
  return forge.util.encode64(forge.random.getBytesSync(length));
}

/**
 * Generates a random salt.
 * @returns {string} The generated salt.
 */
export function generateSalt(): string {
  // Salts are typically 16 bytes long, but you can adjust the size if needed.
  return forge.util.encode64(forge.random.getBytesSync(16));
}

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
 * The IV is derived from the passphrase and salt, so it does not need to be stored separately.
 * @param {string} key - The API key to be encrypted.
 * @param {string} passphrase - The passphrase for encryption.
 * @param {string} salt - The salt for encryption.
 * @returns {string} A combined string of the encrypted data and the tag.
 */
export function encryptKey(
  key: string,
  passphrase: string,
  salt: string
): string {
  const iterations = 10000; // Recommended number of iterations
  const keySize = 16; // For AES-256, key size is 32 bytes but 16 bytes for derivedKey is enough
  const ivSize = 12; // 12 bytes IV for GCM

  // Derive a key and IV using PBKDF2
  // The derivedBytes will be twice as long as needed to get both key and IV
  const derivedBytes = forge.pkcs5.pbkdf2(
    passphrase,
    salt,
    iterations,
    keySize + ivSize
  );
  const derivedKey = derivedBytes.substring(0, keySize);
  const iv = derivedBytes.substring(keySize, keySize + ivSize);

  const cipher = forge.cipher.createCipher("AES-GCM", derivedKey);
  cipher.start({ iv });
  cipher.update(forge.util.createBuffer(key));
  cipher.finish();

  const encrypted = cipher.output.getBytes();
  const tag = cipher.mode.tag.getBytes();

  // Combine encrypted data and tag into a single string and base64 encode it
  // No need to store the IV separately as it's derived from the passphrase and salt
  return forge.util.encode64(encrypted + tag);
}

/**
 * Decrypts a combined string of encrypted API key and tag.
 * @param {string} combined - The combined encrypted API key and tag.
 * @param {string} passphrase - The passphrase used for encryption.
 * @param {string} salt - The salt used for encryption.
 * @returns {string} The decrypted API key.
 */
export function decryptKey(
  combined: string,
  passphrase: string,
  salt: string
): string {
  const combinedBytes = forge.util.decode64(combined);

  // Assume that the tag is the last 16 bytes of the combinedBytes
  const encrypted = combinedBytes.substring(0, combinedBytes.length - 16);
  const tag = combinedBytes.substring(combinedBytes.length - 16);

  // Derive the key and IV as in the encryption function
  const iterations = 10000;
  const keySize = 16;
  const ivSize = 12;
  const derivedBytes = forge.pkcs5.pbkdf2(
    passphrase,
    salt,
    iterations,
    keySize + ivSize
  );
  const derivedKey = derivedBytes.substring(0, keySize);
  const iv = derivedBytes.substring(keySize, keySize + ivSize);

  const decipher = forge.cipher.createDecipher("AES-GCM", derivedKey);
  decipher.start({ iv, tag: forge.util.createBuffer(tag) });
  decipher.update(forge.util.createBuffer(encrypted));
  const result = decipher.finish(); // Check 'result' to make sure decryption was successful

  return decipher.output.getBytes();
}
