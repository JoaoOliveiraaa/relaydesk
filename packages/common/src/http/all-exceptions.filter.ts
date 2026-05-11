import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { RELAYDESK_API_VERSION } from '../api/constants';
import type { ApiErrorEnvelope, RelayDeskApiMeta } from '../api/types';

function normalizeHttpExceptionBody(
  status: number,
  message: string | object,
  path: string,
): { code: string; message: string; details?: unknown } {
  const code = `HTTP_${status}`;
  if (typeof message === 'string') {
    return { code, message, details: { path } };
  }
  const obj = message as Record<string, unknown>;
  const msg =
    typeof obj.message === 'string'
      ? obj.message
      : Array.isArray(obj.message)
        ? (obj.message as string[]).join('; ')
        : 'Request failed';
  const { message: _m, error: _e, statusCode: _sc, ...rest } = obj;
  const details = Object.keys(rest).length ? rest : undefined;
  return { code, message: msg, details: details ?? { path } };
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const rawMessage =
      exception instanceof HttpException
        ? exception.getResponse()
        : exception instanceof Error
          ? exception.message
          : 'Internal error';

    const norm = normalizeHttpExceptionBody(status, rawMessage, req.url ?? '');

    const rid = req.headers['x-request-id'];
    const cid = req.headers['x-correlation-id'];
    const meta: RelayDeskApiMeta = {
      apiVersion: RELAYDESK_API_VERSION,
      requestId: typeof rid === 'string' && rid ? rid : randomUUID(),
      correlationId: typeof cid === 'string' && cid ? cid : undefined,
    };

    const body: ApiErrorEnvelope = {
      success: false,
      error: {
        code: norm.code,
        message: norm.message,
        details: norm.details,
      },
      meta,
    };

    res.status(status).json(body);
  }
}
