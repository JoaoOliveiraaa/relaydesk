import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { randomUUID } from 'crypto';
import { RELAYDESK_API_VERSION } from '../api/constants';
import type { ApiSuccessEnvelope } from '../api/types';
import { SKIP_RESPONSE_ENVELOPE_KEY } from '../api/skip-envelope.decorator';

function shouldBypassEnvelope(url: string | undefined): boolean {
  if (!url) return false;
  const path = url.split('?')[0] ?? '';
  return (
    /(^|\/)health(\/|$)/.test(path) ||
    /(^|\/)metrics(\/|$)/.test(path) ||
    /(^|\/)docs(\/|$)/.test(path) ||
    /(^|\/)openapi\.json$/.test(path)
  );
}

function buildMeta(req: Request): ApiSuccessEnvelope<unknown>['meta'] {
  const rid = req.headers['x-request-id'];
  const cid = req.headers['x-correlation-id'];
  return {
    apiVersion: RELAYDESK_API_VERSION,
    requestId: typeof rid === 'string' && rid ? rid : randomUUID(),
    correlationId: typeof cid === 'string' && cid ? cid : undefined,
  };
}

@Injectable()
export class ResponseEnvelopeInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }
    const req = context.switchToHttp().getRequest<Request>();
    const url = req.originalUrl ?? req.url;
    if (shouldBypassEnvelope(url)) {
      return next.handle();
    }
    const handler = context.getHandler();
    const controller = context.getClass();
    const skip =
      this.reflector.getAllAndOverride<boolean>(SKIP_RESPONSE_ENVELOPE_KEY, [handler, controller]) === true;
    if (skip) {
      return next.handle();
    }

    return next.handle().pipe(
      map((body: unknown) => {
        const res = context.switchToHttp().getResponse<Response>();
        if (res.headersSent) {
          return body;
        }
        if (body === undefined || typeof body === 'string' || Buffer.isBuffer(body)) {
          return body;
        }
        if (
          body !== null &&
          typeof body === 'object' &&
          'success' in body &&
          (body as { success?: boolean }).success === false
        ) {
          return body;
        }
        const envelope: ApiSuccessEnvelope<unknown> = {
          success: true,
          data: body,
          meta: buildMeta(req),
        };
        return envelope;
      }),
    );
  }
}
