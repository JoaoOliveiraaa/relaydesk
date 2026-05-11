# RelayDesk

Plataforma **SaaS multi-tenant** para operações de suporte e inbox em tempo real: **NestJS**, **Next.js**, **PostgreSQL**, **Prisma Migrate**, **Redis**, **RabbitMQ**, **Socket.IO**, **JWT** com refresh, **rate limiting distribuído**, **envelopes HTTP padronizados**, **OpenAPI/Swagger**, **OpenTelemetry (OTLP)** e **Prometheus**.

> Estado alvo: backend **production-grade**, observável e pronto para integrações externas reais — não um CRUD demo.

---

## Visão da arquitetura

```
[ Next.js ] ──HTTP──▶ [ API Gateway :4010 ] ──proxy──▶ [ Auth :4011 ] [ Messaging :4012 ]
                              │
                              └── WebSocket client ──▶ [ WebSocket Gateway :4013 ]
                                                              │
[Messaging] ──AMQP──▶ [ RabbitMQ ] ◀── consumers ── [ Workers / automação ]
     │                    │
     └── publish realtime ─┴──▶ [ WS Gateway ] ──Socket.IO──▶ browsers (tenant rooms)
```

- **API Gateway**: CORS, Helmet, throttling **Redis** (IP + utilizador + tenant), proxy para serviços, métricas Prometheus em `/metrics`.
- **Auth Service**: registo, login, refresh opaco (Redis), JWT.
- **Messaging Service**: inbox, ingestão omnichannel, filas, **internal API** para o WS gateway validar conversas.
- **WebSocket Gateway**: Socket.IO com adapter Redis, validação de membership via HTTP interno, rate limit WS em janela deslizante Redis.

### Integração Telegram (primeiro canal externo)

Fluxo **inbound**: Telegram → `POST /v1/providers/telegram/webhook/:connectionId` (API Gateway → messaging) → validação `X-Telegram-Bot-Api-Secret-Token` (SHA-256 do segredo registado) → publicação **`channel.inbound`** (RabbitMQ) → consumidor normaliza com `TelegramChannelAdapter` → `MessagingService.ingest` → `realtime.outbound` → inbox.

Fluxo **outbound**: agente no dashboard → `POST /v1/inbox/.../messages` → mensagem `pending` (Telegram) → **`channel.outbound`** → `sendMessage` (span `telegram.sendMessage`, métricas `relaydesk_telegram_*`) → `message.updated` em tempo real.

**Ligação do bot** (JWT): `POST /v1/channel-connections/telegram` com `{ "botToken": "…" }` — `getMe`, token guardado encriptado (AES-256-GCM), `setWebhook` com `secret_token` e URL pública.

Variáveis relevantes:

- `PUBLIC_WEBHOOK_BASE_URL` — base pública do gateway (ex. `https://api.exemplo.com/v1`) usada em `setWebhook`.
- `RELAYDESK_CREDENTIALS_ENCRYPTION_KEY` — hex 64 caracteres (32 bytes) recomendado em produção; em dev pode omitir-se (fallback derivado — ver `@relaydesk/common`).

Métricas Prometheus adicionais no messaging: `relaydesk_telegram_webhook_enqueued_total`, `relaydesk_telegram_inbound_processed_total`, `relaydesk_telegram_outbound_total`, `relaydesk_telegram_api_duration_seconds`.

---

## Monorepo (`pnpm` + `turbo`)

| Caminho | Função |
|--------|--------|
| `apps/api-gateway` | BFF público, Swagger em `/docs` |
| `apps/auth-service` | Identidade, Swagger em `/docs` |
| `apps/messaging-service` | Domínio mensagens/inbox, métricas AMQP, Swagger |
| `apps/websocket-gateway` | Realtime transport |
| `packages/database` | Prisma schema + **migrations versionadas** + seed |
| `packages/common` | Logger Pino, envelopes HTTP, filtros, interceptors |
| `packages/config` | `loadEnv` (Zod) partilhado |
| `packages/queue` | AMQP, contratos de routing |
| `packages/redis` | Cliente ioredis + rate limit janela deslizante (Lua) |
| `packages/shared-types` | Tipos + **Zod** para envelopes de eventos |
| `packages/channel-adapters` | Adapters omnichannel (Telegram, mock WhatsApp, …) → `IncomingMessage` |
| `packages/platform-nest` | Swagger RelayDesk (branding, JWT, internal token) |
| `packages/otel` | Bootstrap OpenTelemetry → OTLP (Jaeger / Tempo) |
| `apps/webhook-service` | Webhook delivery engine — HMAC, retries, DLQ, Prometheus |
| `packages/sdk` | Client TS: paths, typings, `verifyWebhookSignature`, `constructWebhookEvent` |
| `packages/integration-tests` | Vitest + Testcontainers (`RELAYDESK_RUN_INTEGRATION=1`) |
| `infra/observability` | Prometheus, Grafana, Loki, Tempo, Promtail (compose dedicado) |
| `deploy/kubernetes` | Exemplo de Deployment/Service com probes e `terminationGracePeriodSeconds` |

---

## Confiabilidade distribuída & observabilidade (nível produção)

### Tracing OpenTelemetry (ponta-a-ponta)

- **SDK** (`@relaydesk/otel`): HTTP/Express (inclui Axios via stack Node), **Prisma**, **ioredis** (onde activado), export OTLP HTTP → **Tempo** / Jaeger.
- **RabbitMQ** (`@relaydesk/queue`): `amqp.publish` e `amqp.consume` com spans; **propagação W3C `traceparent`** injectada nos headers AMQP e extraída no consume; headers semânticos `x-relaydesk-tenant-id`, `x-relaydesk-conversation-id`, `x-relaydesk-event-id`, `x-relaydesk-webhook-delivery-id` espelhados em atributos de span (`relaydesk.*`).
- **WebSocket**: spans `websocket.connect`, `websocket.disconnect`, `conversation:join`, `relay:event` (tenant, conversa, tipo, correlação).
- **Webhooks**: spans `webhook.delivery.http` com `relaydesk.webhook_delivery_id`, `relaydesk.event_type`, `http.status_code`.

Variável típica (stack local Grafana abaixo):

`OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=http://127.0.0.1:4318/v1/traces`

### Stack Grafana (Docker)

```bash
pnpm dev:obs
```

- **Grafana**: `http://localhost:3001` (user `relaydesk` / pass `relaydesk`)
- **Prometheus**: `http://localhost:9090`
- **Loki**: `http://localhost:3100`
- **Tempo** (OTLP HTTP): `http://localhost:4318`
- **Promtail** (logs de contentores Docker): `docker compose -f docker-compose.observability.yml --profile logs up -d` (Linux recomendado; requer socket Docker)

No Linux, acrescente `extra_hosts: ["host.docker.internal:host-gateway"]` ao serviço **prometheus** se `host.docker.internal` não existir por defeito.

Dashboard de exemplo: **RelayDesk · Overview** (AMQP publish rate/latency, webhook latency/DLQ).

### Filas & readiness

- Histograma **`relaydesk_amqp_publish_duration_seconds`** (messaging) + contador existente.
- **`GET /health/ready`** (messaging): Redis, Postgres, opcional **RabbitMQ Management API** (`RABBITMQ_MANAGEMENT_URL`, ex. `http://relaydesk:relaydesk@127.0.0.1:15672`) — devolve snapshot `rabbitQueues` com profundidade por fila.
- **Graceful shutdown**: consumidores AMQP cancelam a subscrição (`channel.cancel`) antes de fechar o canal (draining de novas mensagens).

### Circuit breakers & caos controlado

- **`CircuitBreaker`** (`@relaydesk/common`): membership HTTP no WebSocket gateway; publish AMQP no messaging; `fetch` HTTP no motor de webhooks.
- **Simulação** (`RELAYDESK_SIM_REDIS_DOWN`, `RELAYDESK_SIM_RABBIT_DOWN`, `RELAYDESK_SIM_WEBHOOK_TIMEOUT_MS`) para validar readiness, retries e timeouts.

### Kubernetes & imagens

- Exemplo: `deploy/kubernetes/messaging-service.example.yaml` — `livenessProbe` `/health/live`, `readinessProbe` `/health/ready`, `preStop` sleep, réplicas stateless.
- Dockerfile multi-stage: `apps/messaging-service/Dockerfile` (build com contexto na raiz do monorepo).

### Testes de integração

```bash
RELAYDESK_RUN_INTEGRATION=1 pnpm test:integration
```

Smoke **PostgreSQL** via Testcontainers; base para estender a Redis, RabbitMQ e fluxos e2e.

---

## API pública & developer platform

### Versionamento

- Prefixo HTTP estável: **`/v1`** (gateway e serviços expõem o mesmo prefixo nos controladores de domínio).
- Contrato documentado: campo **`meta.apiVersion`** (`2024-06-01`) em todas as respostas com envelope.

### Envelope JSON (governação)

**Sucesso**

```json
{
  "success": true,
  "data": { },
  "meta": {
    "apiVersion": "2024-06-01",
    "requestId": "uuid",
    "correlationId": "uuid-opcional"
  }
}
```

**Erro**

```json
{
  "success": false,
  "error": {
    "code": "HTTP_400",
    "message": "…",
    "details": { }
  },
  "meta": { "apiVersion": "2024-06-01", "requestId": "…" }
}
```

O **Next.js** (`lib/api.ts`) faz *unwrap* automático de `data` para o código da UI continuar simples.

### OpenAPI / Swagger

| Serviço | UI | JSON |
|---------|----|------|
| API Gateway | `http://localhost:4010/docs` | `http://localhost:4010/openapi.json` |
| Auth | `http://localhost:4011/docs` | `http://localhost:4011/openapi.json` |
| Messaging | `http://localhost:4012/docs` | `http://localhost:4012/openapi.json` |

- Autenticação **Bearer JWT** documentada (`access-token`).
- Endpoints internos: **`X-RelayDesk-Internal-Token`** (`internal-token`).

---

## Eventos (contratos)

- Tipo TypeScript `RelayEventEnvelope` + campo opcional **`namespace`** (`packages/shared-types`).
- Validação runtime: **`parseRelayEventEnvelope`** (Zod) para produtores/consumidores AMQP.
- Próximos passos naturais: *registry* de schemas por `schemaVersion`, testes de compatibilidade e políticas de evolução (deprecação / major bump).

---

## Observabilidade

### OpenTelemetry

Pacote `@relaydesk/otel` — ativar por defeito; desligar com `OTEL_ENABLED=0` ou `OTEL_SDK_DISABLED=true`.

Variáveis (ver `.env.example`):

- `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT` — típico **Jaeger OTLP** ou **Grafana Tempo** (`…/v1/traces`).

Instrumentação: HTTP/Node + **Prisma** (auth & messaging com `prisma: true`).

### Prometheus

- **API Gateway**: métricas default + path `/metrics` (fora do prefixo `v1`).
- **Messaging**: `relaydesk_amqp_published_total{routing_key="…"}` + métricas default.

---

## Base de dados & auditoria

- Fluxo principal: **`pnpm db:migrate:deploy`** (CI/prod) / **`pnpm db:migrate:dev`** (local).
- Seed demo: `pnpm db:seed`.
- Novos modelos (migração `20260512120000_audit_webhooks`):
  - **`AuditLog`**: trilho de auditoria por tenant (ator, ação, IP, `correlationId`, metadata).
  - **`WebhookSubscription`** + **`WebhookEngineDelivery`**: fundação para motor de webhooks estilo Stripe/GitHub (entregas, retries — lógica de negócio em roadmap).

---

## Setup local

**Requisitos:** Node ≥ 20, pnpm, Docker (opcional mas recomendado).

```bash
pnpm install
pnpm dev:infra          # Postgres + Redis + RabbitMQ
pnpm dev:obs            # opcional: Prometheus + Grafana + Loki + Tempo (+ Promtail com --profile logs)
pnpm db:migrate:deploy  # aplicar migrações
pnpm db:seed            # tenant demo (ver output do seed)
pnpm dev:services       # serviços Nest em watch
pnpm dev                # Next.js (outro terminal)
```

Copiar `.env.example` → `.env` na raiz e ajustar URLs/portas. Para **readiness de filas** no messaging, definir `RABBITMQ_MANAGEMENT_URL` (Management API). Para **tracing** local com o stack Grafana: `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=http://127.0.0.1:4318/v1/traces`.

---

## SDK TypeScript

Pacote **`@relaydesk/sdk`**: constantes de versão e **paths estáveis** (`RelaydeskPaths`) para evoluir para um cliente HTTP gerado ou manual tipado. O README dos serviços OpenAPI é a fonte de verdade até haver geração automática a partir de `openapi.json`.

---

## Webhook Engine (enterprise-grade)

### Arquitectura de delivery

```
Domain Event (message.received, conversation.created, …)
       │
       ▼
WebhookEventPublisher (messaging-service)
       │  fan-out: 1 delivery record per active subscription
       ▼
WebhookEngineDelivery  ─── persisted to PostgreSQL ───────────┐
       │                                                       │
       ▼                                                       │
RabbitMQ  q.webhook.delivery  (durable, DLX)                  │
       │                                                       │
       ▼                                                       │
webhook-service  WebhookDeliveryService                        │
       │  HMAC sign → HTTP POST → persist result ◀────────────┘
       ├── success  → status=delivered, AuditLog
       ├── failure  → exponential backoff retry (up to maxAttempts)
       └── dead     → status=dead, DLQ (q.webhook.delivery.dlq)
```

### HMAC Signature (Stripe-style)

Every delivery includes:

| Header | Example |
|--------|---------|
| `x-relaydesk-signature` | `t=1715385600,v1=abc123…` |
| `x-relaydesk-timestamp` | `1715385600` |
| `x-relaydesk-event` | `message.received` |
| `x-relaydesk-delivery` | `clx…` |

**Signed string**: `{timestamp}.{body}`

**Replay attack prevention**: reject if `|now − t| > 300s`.

**Verification (Node.js)**:

```ts
import { createHmac, timingSafeEqual } from 'node:crypto';

function verify(secret: string, body: string, header: string): boolean {
  const parts = Object.fromEntries(header.split(',').map(p => p.split('=')));
  const timestamp = Number(parts['t']);
  if (Math.abs(Date.now() / 1000 - timestamp) > 300) return false;
  const expected = createHmac('sha256', secret)
    .update(`${timestamp}.${body}`)
    .digest('hex');
  return timingSafeEqual(Buffer.from(parts['v1']), Buffer.from(expected));
}
```

Or use `@relaydesk/sdk`:

```ts
import { verifyWebhookSignature, constructWebhookEvent } from '@relaydesk/sdk';

const event = constructWebhookEvent(rawBody, req.headers['x-relaydesk-signature'], secret);
console.log(event.type);   // 'message.received'
console.log(event.data);   // typed payload
```

### Retry Strategy

| Attempt | Delay |
|---------|-------|
| 1 | 2s |
| 2 | 4s |
| 3 | 8s |
| 4 | 16s |
| 5 | 32s (cap: configurable, default 300s) |

Configurable per subscription via `retryPolicy`:

```json
{
  "maxAttempts": 5,
  "backoffBase": 2,
  "backoffCap": 300,
  "timeoutSeconds": 30
}
```

### DLQ Strategy

Deliveries exceeding `maxAttempts` are:
1. Marked `status=dead` in `WebhookEngineDelivery`
2. Written to `AuditLog` with action `webhook.dead`
3. NACK'd to RabbitMQ DLQ `q.webhook.delivery.dlq`
4. Available for manual replay via `POST /v1/webhook-deliveries/:id/replay`

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/v1/webhooks` | Create subscription (returns secret once) |
| `GET` | `/v1/webhooks` | List subscriptions |
| `GET` | `/v1/webhooks/:id` | Get subscription |
| `PATCH` | `/v1/webhooks/:id` | Update URL / events / retryPolicy / active |
| `DELETE` | `/v1/webhooks/:id` | Soft-delete |
| `POST` | `/v1/webhooks/:id/rotate-secret` | Rotate HMAC secret |
| `POST` | `/v1/webhooks/:id/test` | Send test event |
| `GET` | `/v1/webhook-deliveries` | List deliveries (filterable) |
| `GET` | `/v1/webhook-deliveries/:id` | Delivery detail + payload |
| `POST` | `/v1/webhook-deliveries/:id/replay` | Replay delivery |

All endpoints exposed via the API Gateway at `:4010/v1/…` with full Swagger docs.

### Prometheus Metrics (webhook-service `:4014/metrics`)

| Metric | Labels |
|--------|--------|
| `relaydesk_webhook_deliveries_total` | `event_type`, `status` |
| `relaydesk_webhook_delivery_latency_ms` | `event_type` |
| `relaydesk_webhook_retries_total` | `event_type` |
| `relaydesk_webhook_failures_total` | `event_type`, `reason` |
| `relaydesk_webhook_dlq_total` | `event_type` |

### Supported Event Types

```
conversation.created    conversation.updated
conversation.resolved   conversation.assigned
message.received        message.sent
contact.created         contact.updated
webhook.test
```

Use `["*"]` as `eventTypes` to subscribe to all events.

---

## Roadmap (alto nível)

1. **RBAC avançado** — permissões por recurso, policies estilo Slack/GitHub, guards WebSocket.
2. **Audit pipeline** — escrita assíncrona a partir de eventos + UI de pesquisa por tenant.
3. **Métricas avançadas** — profundidade de fila via Management API + dashboards Grafana (base já provisionada); exporters Rabbit dedicados em produção.
4. **SDK gerado** — a partir de `openapi.json` + publicação npm.
5. **Webhook filtering** — JSONPath / CEL expressions para filtrar eventos antes da entrega.

---

## Licença & contribuição

Projeto privado / portfólio — ajustar licença conforme a tua distribuição. Para contribuir: `pnpm build:all` antes de abrir PR; manter **envelopes** e **contratos** compatíveis ou bump explícito de `meta.apiVersion`.

---

**RelayDesk** — engenharia distribuída real: filas, realtime, multi-tenant, observabilidade e governação de API com a mesma barra que se espera numa **startup série A** em infraestrutura de mensagens e suporte.
