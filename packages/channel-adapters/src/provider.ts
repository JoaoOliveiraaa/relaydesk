import type { IncomingMessage, RelayChannel } from '@relaydesk/shared-types';

/**
 * Contrato para adapters de canais (WhatsApp Cloud API, Telegram Bot API, etc.).
 * Cada adapter traduz payloads nativos para {@link IncomingMessage}.
 */
export interface ChannelInboundAdapter {
  readonly channel: RelayChannel;
  normalizeInbound(raw: unknown): IncomingMessage | Promise<IncomingMessage>;
}
