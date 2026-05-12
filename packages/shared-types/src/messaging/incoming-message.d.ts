import type { RelayChannel } from '../channels';
/**
 * Contrato universal para ingestão de mensagens de qualquer provider.
 * Providers (WhatsApp Cloud API, Telegram, etc.) normalizam para este formato.
 */
export interface IncomingMessage {
    id: string;
    tenantId: string;
    channel: RelayChannel;
    /** Identificador do remetente no provider (ex.: user id Telegram). */
    sender: string;
    /** Nome legível para o inbox (opcional). */
    customerDisplayName?: string;
    /**
     * Chave estável da thread (ex.: `chat:-100…` em grupos). Quando ausente, usa-se `sender`
     * para agrupar a conversa.
     */
    conversationThreadKey?: string;
    content: string;
    timestamp: Date;
    /** Metadados brutos do provider (ids de mídia, reply_to, etc.). */
    metadata?: Record<string, unknown>;
}
//# sourceMappingURL=incoming-message.d.ts.map