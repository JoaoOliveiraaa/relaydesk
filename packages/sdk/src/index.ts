/**
 * @relaydesk/sdk — foundation para cliente HTTP tipado.
 * A documentação OpenAPI vive em `/openapi.json` de cada serviço; este pacote centraliza paths estáveis.
 */

/** Versão de contrato HTTP alinhada com `@relaydesk/common` / envelopes. */
export const RELAYDESK_API_VERSION = '2024-06-01' as const;

export const RelaydeskPaths = {
  auth: {
    register: '/v1/auth/register',
    login: '/v1/auth/login',
    refresh: '/v1/auth/refresh',
    me: '/v1/auth/me',
  },
  messaging: {
    ingest: '/v1/messages/ingest',
    inboxConversations: '/v1/inbox/conversations',
    inboxMessages: (conversationId: string) =>
      `/v1/inbox/conversations/${encodeURIComponent(conversationId)}/messages`,
  },
  internal: {
    conversationMembership: (conversationId: string, tenantId: string) =>
      `/internal/v1/conversations/${encodeURIComponent(conversationId)}/tenants/${encodeURIComponent(tenantId)}/membership`,
  },
} as const;

export type RelaydeskPathsType = typeof RelaydeskPaths;
