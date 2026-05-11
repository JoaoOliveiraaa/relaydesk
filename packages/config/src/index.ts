import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().min(1).optional(),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  RABBITMQ_URL: z.string().default('amqp://relaydesk:relaydesk@localhost:5672'),
  JWT_SECRET: z.string().min(16).default('relaydesk-dev-secret-change-me'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  /** Namespace Redis para isolamento multi-tenant em chaves compartilhadas */
  REDIS_KEY_PREFIX: z.string().default('relaydesk'),
  /** Origens permitidas no gateway/ws (CSV) */
  CORS_ORIGINS: z.string().default('http://localhost:3000'),
  /** Token partilhado machine-to-machine (gateway interno, workers). Mín. 32 caracteres em produção. */
  INTERNAL_SERVICE_TOKEN: z
    .string()
    .min(32, 'INTERNAL_SERVICE_TOKEN deve ter pelo menos 32 caracteres')
    .default('relaydesk-internal-service-token-dev-only-32'),
  /** Base URL do messaging-service (ex.: validação de conversa a partir do websocket-gateway). */
  MESSAGING_SERVICE_BASE_URL: z.string().url().default('http://127.0.0.1:4012'),
});

export type RelayDeskEnv = z.infer<typeof envSchema>;

export function loadEnv(processEnv: NodeJS.ProcessEnv = process.env): RelayDeskEnv {
  const parsed = envSchema.safeParse(processEnv);
  if (!parsed.success) {
    const msg = parsed.error.flatten().fieldErrors;
    throw new Error(`Invalid environment: ${JSON.stringify(msg)}`);
  }
  return parsed.data;
}

export function corsOriginsFromEnv(csv: string): string[] {
  return csv
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}
