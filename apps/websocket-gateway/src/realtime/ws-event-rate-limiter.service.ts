import { Inject, Injectable } from '@nestjs/common';
import { RedisKeys, slidingWindowAllow, type Redis } from '@relaydesk/redis';
import { REALTIME_REDIS } from './realtime-redis.token';

@Injectable()
export class WsEventRateLimiterService {
  constructor(@Inject(REALTIME_REDIS) private readonly redis: Redis) {}

  /** Limites por utilizador autenticado (janela deslizante no Redis). */
  async allowConversationJoin(userId: string): Promise<boolean> {
    const limit = Number(process.env.WS_RL_JOIN_PER_MIN ?? '45');
    const key = RedisKeys.wsThrottle(userId, 'conversation:join');
    return slidingWindowAllow(this.redis, key, 60_000, limit);
  }

  async allowTyping(userId: string): Promise<boolean> {
    const limit = Number(process.env.WS_RL_TYPING_PER_MIN ?? '120');
    const key = RedisKeys.wsThrottle(userId, 'typing');
    return slidingWindowAllow(this.redis, key, 60_000, limit);
  }
}
