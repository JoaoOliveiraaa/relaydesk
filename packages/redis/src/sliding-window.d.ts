import type Redis from 'ioredis';
export declare function slidingWindowAllow(redis: Redis, key: string, windowMs: number, limit: number): Promise<boolean>;
//# sourceMappingURL=sliding-window.d.ts.map