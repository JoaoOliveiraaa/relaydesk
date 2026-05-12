"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.slidingWindowAllow = slidingWindowAllow;
/**
 * Janela deslizante atómica (Redis + Lua): até `limit` eventos por `windowMs` por chave.
 * Compatível com múltiplas réplicas (estado no Redis).
 */
const SLIDING_WINDOW_LUA = `
local key = KEYS[1]
local now = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local limit = tonumber(ARGV[3])
local member = ARGV[4]
redis.call('ZREMRANGEBYSCORE', key, 0, now - window)
local n = redis.call('ZCARD', key)
if n >= limit then
  return 0
end
redis.call('ZADD', key, now, member)
redis.call('PEXPIRE', key, window)
return 1
`;
async function slidingWindowAllow(redis, key, windowMs, limit) {
    const now = Date.now();
    const member = `${now}:${Math.random().toString(36).slice(2, 12)}`;
    const res = (await redis.eval(SLIDING_WINDOW_LUA, 1, key, String(now), String(windowMs), String(limit), member));
    return res === 1;
}
//# sourceMappingURL=sliding-window.js.map