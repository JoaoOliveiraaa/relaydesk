/**
 * Encripta texto com AES-256-GCM. Formato: `v1:` + base64(iv || ciphertext+tag).
 */
export declare function encryptCredential(plain: string, encryptionKeyHex?: string): string;
export declare function decryptCredential(blob: string, encryptionKeyHex?: string): string;
//# sourceMappingURL=aes-credentials.d.ts.map