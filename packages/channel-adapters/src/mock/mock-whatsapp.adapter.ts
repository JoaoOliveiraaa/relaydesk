import type { IncomingMessage } from '@relaydesk/shared-types';
import type { ChannelInboundAdapter } from '../provider';

/** Simula payload Cloud API até integração real. */
export class MockWhatsappAdapter implements ChannelInboundAdapter {
  readonly channel = 'whatsapp' as const;

  normalizeInbound(raw: unknown): IncomingMessage {
    const r = raw as {
      id: string;
      tenantId: string;
      from: string;
      text: string;
      ts?: string;
    };
    return {
      id: r.id,
      tenantId: r.tenantId,
      channel: 'whatsapp',
      sender: r.from,
      content: r.text,
      timestamp: r.ts ? new Date(r.ts) : new Date(),
    };
  }
}
