export const API_BASE =
  typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:4010/v1').replace(/\/$/, '')
    : '';

export const WS_BASE =
  typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_WS_URL ?? 'http://127.0.0.1:4013').replace(/\/$/, '')
    : '';
