"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClientIp = getClientIp;
/** Cliente HTTP por trás de proxies (X-Forwarded-For primeiro IP). */
function getClientIp(req) {
    const xff = req.headers['x-forwarded-for'];
    if (typeof xff === 'string' && xff.length > 0) {
        const first = xff.split(',')[0]?.trim();
        if (first)
            return first;
    }
    if (Array.isArray(xff) && xff[0]) {
        return xff[0].split(',')[0]?.trim() || 'unknown';
    }
    const socketIp = req.socket?.remoteAddress;
    if (socketIp)
        return socketIp;
    return 'unknown';
}
//# sourceMappingURL=client-ip.js.map