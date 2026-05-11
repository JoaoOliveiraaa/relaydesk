import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { RelayDeskEnv } from '@relaydesk/config';

@Injectable()
export class InternalServiceGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<{
      headers: Record<string, string | string[] | undefined>;
    }>();
    const raw = req.headers['x-relaydesk-internal-token'];
    const token = Array.isArray(raw) ? raw[0] : raw;
    const expected = this.config.get<RelayDeskEnv>('relayEnv')!.INTERNAL_SERVICE_TOKEN;
    if (typeof token !== 'string' || token.length === 0 || token !== expected) {
      throw new ForbiddenException('invalid internal service token');
    }
    return true;
  }
}
