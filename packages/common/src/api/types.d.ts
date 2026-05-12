import { RELAYDESK_API_VERSION } from './constants';
export type RelayDeskApiVersion = typeof RELAYDESK_API_VERSION;
export interface RelayDeskApiMeta {
    apiVersion: RelayDeskApiVersion;
    requestId?: string;
    correlationId?: string;
}
export interface RelayDeskErrorBody {
    code: string;
    message: string;
    details?: unknown;
}
export interface ApiSuccessEnvelope<T> {
    success: true;
    data: T;
    meta: RelayDeskApiMeta;
}
export interface ApiErrorEnvelope {
    success: false;
    error: RelayDeskErrorBody;
    meta: RelayDeskApiMeta;
}
export type ApiEnvelope<T> = ApiSuccessEnvelope<T> | ApiErrorEnvelope;
export interface RelayDeskPageMeta {
    page: number;
    pageSize: number;
    total: number;
    hasNext: boolean;
}
export interface PaginatedData<T> {
    items: T[];
    page: RelayDeskPageMeta;
}
//# sourceMappingURL=types.d.ts.map