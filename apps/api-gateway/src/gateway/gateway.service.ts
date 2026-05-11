import { HttpService } from '@nestjs/axios';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import type { Request } from 'express';
import { randomUUID } from 'crypto';
import { firstValueFrom } from 'rxjs';

function definedHeaders(h: Record<string, string | undefined>): Record<string, string> | undefined {
  const o: Record<string, string> = {};
  for (const [k, v] of Object.entries(h)) {
    if (v !== undefined && v !== '') o[k] = v;
  }
  return Object.keys(o).length ? o : undefined;
}

@Injectable()
export class GatewayService {
  constructor(private readonly http: HttpService) {}

  private authBase(): string {
    return process.env.AUTH_SERVICE_URL ?? 'http://127.0.0.1:4011';
  }

  private messagingBase(): string {
    return process.env.MESSAGING_SERVICE_URL ?? 'http://127.0.0.1:4012';
  }

  buildForwardHeaders(req: Request): Record<string, string | undefined> {
    const rid =
      (typeof req.headers['x-request-id'] === 'string' && req.headers['x-request-id']) ||
      randomUUID();
    const cid =
      typeof req.headers['x-correlation-id'] === 'string' ? req.headers['x-correlation-id'] : rid;
    const tgSecret =
      typeof req.headers['x-telegram-bot-api-secret-token'] === 'string'
        ? req.headers['x-telegram-bot-api-secret-token']
        : undefined;
    return {
      'x-request-id': rid,
      'x-correlation-id': cid,
      Authorization: req.headers.authorization,
      ...(tgSecret ? { 'x-telegram-bot-api-secret-token': tgSecret } : {}),
    };
  }

  async proxyAuth(
    path: string,
    method: string,
    body?: unknown,
    headers?: Record<string, string | undefined>,
  ) {
    const url = `${this.authBase()}${path}`;
    try {
      const res = await firstValueFrom(
        this.http.request({
          url,
          method: method as 'GET' | 'POST',
          data: body,
          headers: definedHeaders(headers ?? {}),
          validateStatus: () => true,
        }),
      );
      return { status: res.status, data: res.data };
    } catch {
      throw new ServiceUnavailableException('Auth service indisponível');
    }
  }

  async proxyMessaging(
    path: string,
    method: string,
    body?: unknown,
    headers?: Record<string, string | undefined>,
  ) {
    const url = `${this.messagingBase()}${path}`;
    try {
      const res = await firstValueFrom(
        this.http.request({
          url,
          method: method as 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
          data: body,
          headers: definedHeaders(headers ?? {}),
          validateStatus: () => true,
        }),
      );
      return { status: res.status, data: res.data };
    } catch {
      throw new ServiceUnavailableException('Messaging service indisponível');
    }
  }
}
