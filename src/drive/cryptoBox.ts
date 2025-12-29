/**
 * 加密/解密工具模块
 * 使用 WebCrypto API 实现 AES-GCM 加密
 */

/**
 * 将 ArrayBuffer 转换为 Base64 字符串
 */
function b64(bytes: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)));
}

/**
 * 将 Base64 字符串转换为 ArrayBuffer
 */
function unb64(s: string): ArrayBuffer {
  return Uint8Array.from(atob(s), (c) => c.charCodeAt(0)).buffer;
}

/**
 * 使用 PBKDF2 从密码派生密钥
 */
async function deriveKey(
  passphrase: string,
  salt: Uint8Array,
  iterations = 310_000
): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: salt as BufferSource, iterations, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * 加密数据的格式
 */
export type EncryptedPayload = {
  kdf: { name: "PBKDF2"; hash: "SHA-256"; iterations: number; saltB64: string };
  cipher: { name: "AES-GCM"; ivB64: string };
  ciphertextB64: string;
};

/**
 * 加密文本
 * @param passphrase - 用户设置的加密口令
 * @param plaintext - 要加密的明文
 * @returns 加密后的数据
 */
export async function encryptText(
  passphrase: string,
  plaintext: string
): Promise<EncryptedPayload> {
  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const iterations = 310_000;

  const key = await deriveKey(passphrase, salt, iterations);
  const ct = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(plaintext)
  );

  return {
    kdf: { name: "PBKDF2", hash: "SHA-256", iterations, saltB64: b64(salt.buffer) },
    cipher: { name: "AES-GCM", ivB64: b64(iv.buffer) },
    ciphertextB64: b64(ct),
  };
}

/**
 * 解密文本
 * @param passphrase - 用户设置的加密口令
 * @param payload - 加密后的数据
 * @returns 解密后的明文
 */
export async function decryptText(
  passphrase: string,
  payload: EncryptedPayload
): Promise<string> {
  const dec = new TextDecoder();
  const salt = new Uint8Array(unb64(payload.kdf.saltB64));
  const iv = new Uint8Array(unb64(payload.cipher.ivB64));
  const key = await deriveKey(passphrase, salt, payload.kdf.iterations);
  const pt = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    unb64(payload.ciphertextB64)
  );
  return dec.decode(pt);
}

