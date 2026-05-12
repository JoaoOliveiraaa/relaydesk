/**
 * Base URL do API Gateway para o cliente axios (`lib/api.ts`).
 * Rotas são relativas a isto (ex.: `/auth/login` → …/v1/auth/login).
 *
 * Se `NEXT_PUBLIC_API_URL` for só a origem (ex. `http://localhost:4010`), acrescenta `/v1`
 * para coincidir com `app.setGlobalPrefix('v1')` no gateway.
 */
function normalizeGatewayApiBase(raw: string): string {
  const trimmed = raw.trim().replace(/\/$/, '');
  if (!trimmed) return trimmed;
  try {
    const url = new URL(trimmed);
    if (url.pathname === '' || url.pathname === '/') {
      url.pathname = '/v1';
    }
    return url.toString().replace(/\/$/, '');
  } catch {
    return trimmed;
  }
}

const defaultApi = 'http://127.0.0.1:4010/v1';

export const API_BASE =
  typeof window !== 'undefined'
    ? normalizeGatewayApiBase(process.env.NEXT_PUBLIC_API_URL ?? defaultApi)
    : '';

export const WS_BASE =
  typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_WS_URL ?? 'http://127.0.0.1:4013').replace(/\/$/, '')
    : '';
