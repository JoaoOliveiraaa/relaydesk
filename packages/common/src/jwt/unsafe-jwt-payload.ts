/** Decodifica payload JWT sem verificar assinatura — apenas para rate limiting / logging. Nunca usar para autorização. */
export type UnsafeJwtPayload = { sub?: string; tenantId?: string; email?: string; role?: string };

export function decodeJwtPayloadUnsafe(token: string | undefined): UnsafeJwtPayload | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length < 2) return null;
  try {
    const json = Buffer.from(parts[1], 'base64url').toString('utf8');
    const payload = JSON.parse(json) as Record<string, unknown>;
    return {
      sub: typeof payload.sub === 'string' ? payload.sub : undefined,
      tenantId: typeof payload.tenantId === 'string' ? payload.tenantId : undefined,
      email: typeof payload.email === 'string' ? payload.email : undefined,
      role: typeof payload.role === 'string' ? payload.role : undefined,
    };
  } catch {
    return null;
  }
}
