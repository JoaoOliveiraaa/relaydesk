import Redis from 'ioredis';

export { slidingWindowAllow } from './sliding-window';

export function createRedis(url: string, keyPrefix: string): Redis {
  return new Redis(url, {
    keyPrefix: `${keyPrefix}:`,
    maxRetriesPerRequest: 3,
  });
}

export const RedisKeys = {
  session: (sessionId: string) => `session:${sessionId}`,
  rateLimit: (tenantId: string, bucket: string) => `rl:${tenantId}:${bucket}`,
  /** Limite distribuído por utilizador + tipo de evento WebSocket (janela deslizante). */
  wsThrottle: (userId: string, eventKey: string) => `ws:rl:${userId}:${eventKey}`,
  presence: (tenantId: string, userId: string) => `presence:${tenantId}:${userId}`,
  typing: (conversationId: string) => `typing:${conversationId}`,
  idempotency: (key: string) => `idem:${key}`,
  wsUser: (userId: string) => `ws:user:${userId}`,
  refreshToken: (opaque: string) => `refresh:${opaque}`,
} as const;

export type { Redis };
