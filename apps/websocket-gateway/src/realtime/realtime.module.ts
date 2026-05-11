import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, type JwtModuleOptions } from '@nestjs/jwt';
import type { RelayDeskEnv } from '@relaydesk/config';
import { ConversationTenantService } from './conversation-tenant.service';
import { EventsGateway } from './events.gateway';
import { RealtimeBridgeService } from './realtime-bridge.service';
import { WsJwtService } from './ws-jwt.service';

@Module({
  imports: [
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
  providers: [EventsGateway, WsJwtService, ConversationTenantService, RealtimeBridgeService],
})
export class RealtimeModule {}
