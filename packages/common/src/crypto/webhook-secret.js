"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sha256Hex = sha256Hex;
exports.timingSafeEqualHex = timingSafeEqualHex;
const crypto_1 = require("crypto");
function sha256Hex(input) {
    return (0, crypto_1.createHash)('sha256').update(input, 'utf8').digest('hex');
}
function timingSafeEqualHex(a, b) {
    try {
        const ba = Buffer.from(a, 'hex');
        const bb = Buffer.from(b, 'hex');
        if (ba.length !== bb.length)
            return false;
        return (0, crypto_1.timingSafeEqual)(ba, bb);
    }
    catch {
        return false;
    }
}
//# sourceMappingURL=webhook-secret.js.map