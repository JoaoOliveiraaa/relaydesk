/** Decodifica payload JWT sem verificar assinatura — apenas para rate limiting / logging. Nunca usar para autorização. */
export type UnsafeJwtPayload = {
    sub?: string;
    tenantId?: string;
    email?: string;
    role?: string;
};
export declare function decodeJwtPayloadUnsafe(token: string | undefined): UnsafeJwtPayload | null;
//# sourceMappingURL=unsafe-jwt-payload.d.ts.map