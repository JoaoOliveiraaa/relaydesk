import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { RelayDeskEnv } from '@relaydesk/config';

export type WsUser = { sub: string; tenantId: string; email: string; role: string };

@Injectable()
export class WsJwtService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  verify(token: string): WsUser {
    try {
      const env = this.config.get<RelayDeskEnv>('relayEnv')!;
      return this.jwt.verify<WsUser>(token, { secret: env.JWT_SECRET });
    } catch {
      throw new UnauthorizedException('Token inválido');
    }
  }
}
