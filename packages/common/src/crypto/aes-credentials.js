"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encryptCredential = encryptCredential;
exports.decryptCredential = decryptCredential;
const crypto_1 = require("crypto");
const ALGO = 'aes-256-gcm';
const IV_LEN = 12;
const TAG_LEN = 16;
function keyFromHex(hex64) {
    return Buffer.from(hex64, 'hex');
}
/** Deriva chave de 32 bytes a partir de uma string (apenas fallback de desenvolvimento). */
function devKeyFromPassphrase(passphrase) {
    return (0, crypto_1.scryptSync)(passphrase, 'relaydesk-credentials', 32);
}
function resolveKey(explicitHex) {
    if (explicitHex && /^[0-9a-fA-F]{64}$/.test(explicitHex)) {
        return keyFromHex(explicitHex);
    }
    const dev = process.env.JWT_SECRET ?? 'relaydesk-dev-secret-change-me';
    return devKeyFromPassphrase(dev);
}
/**
 * Encripta texto com AES-256-GCM. Formato: `v1:` + base64(iv || ciphertext+tag).
 */
function encryptCredential(plain, encryptionKeyHex) {
    const key = resolveKey(encryptionKeyHex);
    const iv = (0, crypto_1.randomBytes)(IV_LEN);
    const cipher = (0, crypto_1.createCipheriv)(ALGO, key, iv, { authTagLength: TAG_LEN });
    const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    const packed = Buffer.concat([iv, enc, tag]);
    return `v1:${packed.toString('base64url')}`;
}
function decryptCredential(blob, encryptionKeyHex) {
    const key = resolveKey(encryptionKeyHex);
    if (!blob.startsWith('v1:')) {
        throw new Error('credential_blob_unsupported_version');
    }
    const raw = Buffer.from(blob.slice(3), 'base64url');
    if (raw.length < IV_LEN + TAG_LEN + 1) {
        throw new Error('credential_blob_invalid');
    }
    const iv = raw.subarray(0, IV_LEN);
    const tag = raw.subarray(raw.length - TAG_LEN);
    const data = raw.subarray(IV_LEN, raw.length - TAG_LEN);
    const decipher = (0, crypto_1.createDecipheriv)(ALGO, key, iv, { authTagLength: TAG_LEN });
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
}
//# sourceMappingURL=aes-credentials.js.map