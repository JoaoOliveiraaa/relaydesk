const AT = 'relaydesk_access_token';
const RT = 'relaydesk_refresh_token';
const SLUG = 'relaydesk_tenant_slug';

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AT);
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(RT);
}

export function getTenantSlug(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(SLUG);
}

export function setAuthSession(params: {
  accessToken: string;
  refreshToken: string;
  tenantSlug: string;
}): void {
  localStorage.setItem(AT, params.accessToken);
  localStorage.setItem(RT, params.refreshToken);
  localStorage.setItem(SLUG, params.tenantSlug);
}

export function clearAuthSession(): void {
  localStorage.removeItem(AT);
  localStorage.removeItem(RT);
  localStorage.removeItem(SLUG);
}
