import { z } from 'zod';
declare const envSchema: z.ZodObject<{
    NODE_ENV: z.ZodDefault<z.ZodEnum<["development", "test", "production"]>>;
    DATABASE_URL: z.ZodOptional<z.ZodString>;
    REDIS_URL: z.ZodDefault<z.ZodString>;
    RABBITMQ_URL: z.ZodDefault<z.ZodString>;
    /** Opcional: Management API (`http://127.0.0.1:15672`) para readiness de filas. */
    RABBITMQ_MANAGEMENT_URL: z.ZodOptional<z.ZodString>;
    /** Chaos-lite: simular falha de Redis no readiness. */
    RELAYDESK_SIM_REDIS_DOWN: z.ZodOptional<z.ZodString>;
    RELAYDESK_SIM_RABBIT_DOWN: z.ZodOptional<z.ZodString>;
    RELAYDESK_SIM_WEBHOOK_TIMEOUT_MS: z.ZodOptional<z.ZodString>;
    JWT_SECRET: z.ZodDefault<z.ZodString>;
    JWT_EXPIRES_IN: z.ZodDefault<z.ZodString>;
    JWT_REFRESH_EXPIRES_IN: z.ZodDefault<z.ZodString>;
    /** Namespace Redis para isolamento multi-tenant em chaves compartilhadas */
    REDIS_KEY_PREFIX: z.ZodDefault<z.ZodString>;
    /** Origens permitidas no gateway/ws (CSV) */
    CORS_ORIGINS: z.ZodDefault<z.ZodString>;
    /** Token partilhado machine-to-machine (gateway interno, workers). Mín. 32 caracteres em produção. */
    INTERNAL_SERVICE_TOKEN: z.ZodDefault<z.ZodString>;
    /** Base URL do messaging-service (ex.: validação de conversa a partir do websocket-gateway). */
    MESSAGING_SERVICE_BASE_URL: z.ZodDefault<z.ZodString>;
    /**
     * URL pública usada em `setWebhook` (Telegram, etc.). Deve apontar para o API Gateway ou edge TLS.
     * Ex.: `https://api.seudominio.com/v1`
     */
    PUBLIC_WEBHOOK_BASE_URL: z.ZodDefault<z.ZodString>;
    /**
     * Chave AES-256 em hex (64 caracteres) para encriptar tokens de bots em `ChannelConnection.encryptedBotToken`.
     * Em produção é obrigatório definir um valor aleatório estável.
     */
    RELAYDESK_CREDENTIALS_ENCRYPTION_KEY: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    NODE_ENV: "development" | "test" | "production";
    REDIS_URL: string;
    RABBITMQ_URL: string;
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
    JWT_REFRESH_EXPIRES_IN: string;
    REDIS_KEY_PREFIX: string;
    CORS_ORIGINS: string;
    INTERNAL_SERVICE_TOKEN: string;
    MESSAGING_SERVICE_BASE_URL: string;
    PUBLIC_WEBHOOK_BASE_URL: string;
    DATABASE_URL?: string | undefined;
    RABBITMQ_MANAGEMENT_URL?: string | undefined;
    RELAYDESK_SIM_REDIS_DOWN?: string | undefined;
    RELAYDESK_SIM_RABBIT_DOWN?: string | undefined;
    RELAYDESK_SIM_WEBHOOK_TIMEOUT_MS?: string | undefined;
    RELAYDESK_CREDENTIALS_ENCRYPTION_KEY?: string | undefined;
}, {
    NODE_ENV?: "development" | "test" | "production" | undefined;
    DATABASE_URL?: string | undefined;
    REDIS_URL?: string | undefined;
    RABBITMQ_URL?: string | undefined;
    RABBITMQ_MANAGEMENT_URL?: string | undefined;
    RELAYDESK_SIM_REDIS_DOWN?: string | undefined;
    RELAYDESK_SIM_RABBIT_DOWN?: string | undefined;
    RELAYDESK_SIM_WEBHOOK_TIMEOUT_MS?: string | undefined;
    JWT_SECRET?: string | undefined;
    JWT_EXPIRES_IN?: string | undefined;
    JWT_REFRESH_EXPIRES_IN?: string | undefined;
    REDIS_KEY_PREFIX?: string | undefined;
    CORS_ORIGINS?: string | undefined;
    INTERNAL_SERVICE_TOKEN?: string | undefined;
    MESSAGING_SERVICE_BASE_URL?: string | undefined;
    PUBLIC_WEBHOOK_BASE_URL?: string | undefined;
    RELAYDESK_CREDENTIALS_ENCRYPTION_KEY?: string | undefined;
}>;
export type RelayDeskEnv = z.infer<typeof envSchema>;
export declare function loadEnv(processEnv?: NodeJS.ProcessEnv): RelayDeskEnv;
export declare function corsOriginsFromEnv(csv: string): string[];
/** Opções alinhadas ao `enableCors` do Nest (Express) para browser + credenciais. */
export declare function relaydeskHttpCorsOptions(originsCsv: string): {
    origin: string[];
    credentials: true;
    methods: string[];
    allowedHeaders: string[];
    exposedHeaders: string[];
    maxAge: number;
};
export {};
//# sourceMappingURL=index.d.ts.map