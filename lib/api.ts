import axios, { type AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { API_BASE } from './env';
import {
  clearAuthSession,
  getAccessToken,
  getRefreshToken,
  getTenantSlug,
  setAuthSession,
} from './auth-storage';

export const api = axios.create({
  baseURL: API_BASE || 'http://127.0.0.1:4010/v1',
  timeout: 30_000,
});

function unwrapRelaydeskEnvelope<T>(payload: unknown): T {
  if (
    payload !== null &&
    typeof payload === 'object' &&
    'success' in payload &&
    (payload as { success?: boolean }).success === true &&
    'data' in payload
  ) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    config.headers['x-correlation-id'] = crypto.randomUUID();
  }
  return config;
});

type RetryCfg = InternalAxiosRequestConfig & { _relaydeskRetry?: boolean };

api.interceptors.response.use(
  (response: AxiosResponse) => {
    response.data = unwrapRelaydeskEnvelope(response.data);
    return response;
  },
  async (error: AxiosError) => {
    const original = error.config as RetryCfg | undefined;
    const status = error.response?.status;
    if (status === 401 && original && !original._relaydeskRetry) {
      const rt = getRefreshToken();
      if (rt) {
        original._relaydeskRetry = true;
        try {
          const refreshRes = await axios.post<unknown>(
            `${API_BASE || 'http://127.0.0.1:4010/v1'}/auth/refresh`,
            { refreshToken: rt },
          );
          const data = unwrapRelaydeskEnvelope<{
            accessToken: string;
            refreshToken: string;
          }>(refreshRes.data);
          setAuthSession({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            tenantSlug: getTenantSlug() ?? '',
          });
          original.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(original);
        } catch {
          clearAuthSession();
        }
      }
    }
    return Promise.reject(error);
  },
);
