import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { RelayDeskEnv } from '@relaydesk/config';
import { CircuitBreaker } from '@relaydesk/common';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ConversationTenantService {
  private readonly log = new Logger(ConversationTenantService.name);
  private readonly membershipBreaker = new CircuitBreaker({
    name: 'messaging-internal-membership',
    failureThreshold: 8,
    openDurationMs: 20_000,
    successThreshold: 2,
  });

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  async belongsToTenant(conversationId: string, tenantId: string): Promise<boolean> {
    const env = this.config.get<RelayDeskEnv>('relayEnv')!;
    const base = env.MESSAGING_SERVICE_BASE_URL.replace(/\/$/, '');
    const url = `${base}/internal/v1/conversations/${encodeURIComponent(conversationId)}/tenants/${encodeURIComponent(tenantId)}/membership`;
    try {
      return await this.membershipBreaker.execute(async () => {
        const res = await firstValueFrom(
          this.http.get<{ ok: boolean }>(url, {
            headers: { 'X-RelayDesk-Internal-Token': env.INTERNAL_SERVICE_TOKEN },
            validateStatus: (s) => s === 200 || s === 403 || s === 404,
            timeout: 5000,
          }),
        );
        return res.status === 200 && res.data?.ok === true;
      });
    } catch (e) {
      this.log.warn(
        `membership check failed: ${e instanceof Error ? e.message : String(e)} (breaker=${this.membershipBreaker.getState()})`,
      );
      return false;
    }
  }
}
