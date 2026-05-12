"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisKeys = exports.slidingWindowAllow = void 0;
exports.createRedis = createRedis;
const ioredis_1 = __importDefault(require("ioredis"));
var sliding_window_1 = require("./sliding-window");
Object.defineProperty(exports, "slidingWindowAllow", { enumerable: true, get: function () { return sliding_window_1.slidingWindowAllow; } });
function createRedis(url, keyPrefix) {
    return new ioredis_1.default(url, {
        keyPrefix: `${keyPrefix}:`,
        maxRetriesPerRequest: 3,
    });
}
exports.RedisKeys = {
    session: (sessionId) => `session:${sessionId}`,
    rateLimit: (tenantId, bucket) => `rl:${tenantId}:${bucket}`,
    /** Limite distribuído por utilizador + tipo de evento WebSocket (janela deslizante). */
    wsThrottle: (userId, eventKey) => `ws:rl:${userId}:${eventKey}`,
    presence: (tenantId, userId) => `presence:${tenantId}:${userId}`,
    typing: (conversationId) => `typing:${conversationId}`,
    idempotency: (key) => `idem:${key}`,
    wsUser: (userId) => `ws:user:${userId}`,
    refreshToken: (opaque) => `refresh:${opaque}`,
};
//# sourceMappingURL=index.js.map