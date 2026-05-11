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
| `packages/platform-nest` | Swagger RelayDesk (branding, JWT, internal token) |
| `packages/otel` | Bootstrap OpenTelemetry → OTLP (Jaeger / Tempo) |
| `packages/sdk` | Foundation de paths e versão de API (cliente TS futuro) |

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
pnpm db:migrate:deploy  # aplicar migrações
pnpm db:seed            # tenant demo (ver output do seed)
pnpm dev:services       # serviços Nest em watch
pnpm dev                # Next.js (outro terminal)
```

Copiar `.env.example` → `.env` na raiz e ajustar URLs/portas.

---

## SDK TypeScript

Pacote **`@relaydesk/sdk`**: constantes de versão e **paths estáveis** (`RelaydeskPaths`) para evoluir para um cliente HTTP gerado ou manual tipado. O README dos serviços OpenAPI é a fonte de verdade até haver geração automática a partir de `openapi.json`.

---

## Roadmap (alto nível)

1. **RBAC avançado** — permissões por recurso, policies estilo Slack/GitHub, guards WebSocket.
2. **Motor de webhooks** — assinaturas HMAC, backoff exponencial, DLQ de webhooks, replay idempotente (modelos já preparados).
3. **Audit pipeline** — escrita assíncrona a partir de eventos + UI de pesquisa por tenant.
4. **Métricas avançadas** — lag de filas, DLQ size, ligação a dashboards Grafana.
5. **SDK gerado** — a partir de `openapi.json` + publicação npm.

---

## Licença & contribuição

Projeto privado / portfólio — ajustar licença conforme a tua distribuição. Para contribuir: `pnpm build:all` antes de abrir PR; manter **envelopes** e **contratos** compatíveis ou bump explícito de `meta.apiVersion`.

---

**RelayDesk** — engenharia distribuída real: filas, realtime, multi-tenant, observabilidade e governação de API com a mesma barra que se espera numa **startup série A** em infraestrutura de mensagens e suporte.
