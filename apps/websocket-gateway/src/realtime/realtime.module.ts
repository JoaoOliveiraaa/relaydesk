import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, type JwtModuleOptions } from '@nestjs/jwt';
import type { RelayDeskEnv } from '@relaydesk/config';
import { createRedis, type Redis } from '@relaydesk/redis';
import { ConversationTenantService } from './conversation-tenant.service';
import { EventsGateway } from './events.gateway';
import { REALTIME_REDIS } from './realtime-redis.token';
import { RealtimeBridgeService } from './realtime-bridge.service';
import { WsEventRateLimiterService } from './ws-event-rate-limiter.service';
import { WsJwtService } from './ws-jwt.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 8000,
      maxRedirects: 0,
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): JwtModuleOptions => {
        const env = config.get<RelayDeskEnv>('relayEnv')!;
        return {
          secret: env.JWT_SECRET,
          signOptions: { expiresIn: env.JWT_EXPIRES_IN },
        } as JwtModuleOptions;
      },
    }),
  ],
  providers: [
    {
      provide: REALTIME_REDIS,
      inject: [ConfigService],
      useFactory: (config: ConfigService): Redis => {
        const env = config.get<RelayDeskEnv>('relayEnv')!;
        return createRedis(env.REDIS_URL, env.REDIS_KEY_PREFIX);
      },
    },
    EventsGateway,
    WsJwtService,
    ConversationTenantService,
    RealtimeBridgeService,
    WsEventRateLimiterService,
  ],
})
export class RealtimeModule {}
