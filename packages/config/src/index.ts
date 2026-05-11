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
