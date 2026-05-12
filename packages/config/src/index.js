"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadEnv = loadEnv;
exports.corsOriginsFromEnv = corsOriginsFromEnv;
exports.relaydeskHttpCorsOptions = relaydeskHttpCorsOptions;
const zod_1 = require("zod");
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'test', 'production']).default('development'),
    DATABASE_URL: zod_1.z.string().min(1).optional(),
    REDIS_URL: zod_1.z.string().default('redis://localhost:6379'),
    RABBITMQ_URL: zod_1.z.string().default('amqp://relaydesk:relaydesk@localhost:5672'),
    /** Opcional: Management API (`http://127.0.0.1:15672`) para readiness de filas. */
    RABBITMQ_MANAGEMENT_URL: zod_1.z.string().url().optional(),
    /** Chaos-lite: simular falha de Redis no readiness. */
    RELAYDESK_SIM_REDIS_DOWN: zod_1.z.string().optional(),
    RELAYDESK_SIM_RABBIT_DOWN: zod_1.z.string().optional(),
    RELAYDESK_SIM_WEBHOOK_TIMEOUT_MS: zod_1.z.string().optional(),
    JWT_SECRET: zod_1.z.string().min(16).default('relaydesk-dev-secret-change-me'),
    JWT_EXPIRES_IN: zod_1.z.string().default('15m'),
    JWT_REFRESH_EXPIRES_IN: zod_1.z.string().default('7d'),
    /** Namespace Redis para isolamento multi-tenant em chaves compartilhadas */
    REDIS_KEY_PREFIX: zod_1.z.string().default('relaydesk'),
    /** Origens permitidas no gateway/ws (CSV) */
    CORS_ORIGINS: zod_1.z.string().default('http://localhost:3000'),
    /** Token partilhado machine-to-machine (gateway interno, workers). Mín. 32 caracteres em produção. */
    INTERNAL_SERVICE_TOKEN: zod_1.z
        .string()
        .min(32, 'INTERNAL_SERVICE_TOKEN deve ter pelo menos 32 caracteres')
        .default('relaydesk-internal-service-token-dev-only-32'),
    /** Base URL do messaging-service (ex.: validação de conversa a partir do websocket-gateway). */
    MESSAGING_SERVICE_BASE_URL: zod_1.z.string().url().default('http://127.0.0.1:4012'),
    /**
     * URL pública usada em `setWebhook` (Telegram, etc.). Deve apontar para o API Gateway ou edge TLS.
     * Ex.: `https://api.seudominio.com/v1`
     */
    PUBLIC_WEBHOOK_BASE_URL: zod_1.z.string().url().default('http://127.0.0.1:4010/v1'),
    /**
     * Chave AES-256 em hex (64 caracteres) para encriptar tokens de bots em `ChannelConnection.encryptedBotToken`.
     * Em produção é obrigatório definir um valor aleatório estável.
     */
    RELAYDESK_CREDENTIALS_ENCRYPTION_KEY: zod_1.z
        .string()
        .regex(/^[0-9a-fA-F]{64}$/)
        .optional(),
});
function loadEnv(processEnv = process.env) {
    const merged = { ...processEnv };
    const csv = merged.CORS_ORIGINS?.toString().trim();
    const single = merged.CORS_ORIGIN?.toString().trim();
    if ((!csv || csv === '') && single) {
        merged.CORS_ORIGINS = single;
    }
    const parsed = envSchema.safeParse(merged);
    if (!parsed.success) {
        const msg = parsed.error.flatten().fieldErrors;
        throw new Error(`Invalid environment: ${JSON.stringify(msg)}`);
    }
    return parsed.data;
}
function corsOriginsFromEnv(csv) {
    return csv
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
}
/** Opções alinhadas ao `enableCors` do Nest (Express) para browser + credenciais. */
function relaydeskHttpCorsOptions(originsCsv) {
    const origin = corsOriginsFromEnv(originsCsv);
    return {
        origin,
        credentials: true,
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'Accept',
            'X-Requested-With',
            'X-Internal-Service-Token',
            'X-Tenant-Id',
        ],
        exposedHeaders: ['Content-Disposition'],
        maxAge: 86400,
    };
}
//# sourceMappingURL=index.js.map