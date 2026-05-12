import Redis from 'ioredis';
export { slidingWindowAllow } from './sliding-window';
export declare function createRedis(url: string, keyPrefix: string): Redis;
export declare const RedisKeys: {
    readonly session: (sessionId: string) => string;
    readonly rateLimit: (tenantId: string, bucket: string) => string;
    /** Limite distribuído por utilizador + tipo de evento WebSocket (janela deslizante). */
    readonly wsThrottle: (userId: string, eventKey: string) => string;
    readonly presence: (tenantId: string, userId: string) => string;
    readonly typing: (conversationId: string) => string;
    readonly idempotency: (key: string) => string;
    readonly wsUser: (userId: string) => string;
    readonly refreshToken: (opaque: string) => string;
};
export type { Redis };
//# sourceMappingURL=index.d.ts.map