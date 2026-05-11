import type { RelayChannel } from '../channels';

/**
 * Contrato universal para ingestão de mensagens de qualquer provider.
 * Providers (WhatsApp Cloud API, Telegram, etc.) normalizam para este formato.
 */
export interface IncomingMessage {
  id: string;
  tenantId: string;
  channel: RelayChannel;
  sender: string;
  content: string;
  timestamp: Date;
  /** Metadados brutos do provider (ids de mídia, reply_to, etc.). */
  metadata?: Record<string, unknown>;
}
