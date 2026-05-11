import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import type { Request } from 'express';
import { Observable, tap } from 'rxjs';
import { getClientIp } from './client-ip';
import { decodeJwtPayloadUnsafe } from '../jwt/unsafe-jwt-payload';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }
    const req = context.switchToHttp().getRequest<Request>();
    const { method, url } = req;
    const rid = req.headers['x-request-id'];
    const cid = req.headers['x-correlation-id'];
    const auth = req.headers.authorization;
    const jwtUnsafe =
      typeof auth === 'string' && auth.startsWith('Bearer ')
        ? decodeJwtPayloadUnsafe(auth.slice(7))
        : null;
    const structured =
      process.env.STRUCTURED_HTTP_LOGS === '1' ||
      (process.env.STRUCTURED_HTTP_LOGS !== '0' && process.env.NODE_ENV === 'production');
    const started = Date.now();
    return next.handle().pipe(
      tap({
        next: () => {
          const ms = Date.now() - started;
          if (structured) {
            this.logger.log(
              JSON.stringify({
                msg: 'http_access',
                method,
                url,
                durationMs: ms,
                requestId: typeof rid === 'string' ? rid : undefined,
                correlationId: typeof cid === 'string' ? cid : undefined,
                tenantId: jwtUnsafe?.tenantId,
                userId: jwtUnsafe?.sub,
                clientIp: getClientIp(req),
              }),
            );
          } else {
            const ctx =
              typeof rid === 'string'
                ? typeof cid === 'string' && cid !== rid
                  ? `[rid=${rid} cid=${cid}] `
                  : `[rid=${rid}] `
                : '';
            this.logger.log(`${ctx}${method} ${url} ${ms}ms`);
          }
        },
        error: (err: Error) => {
          const ms = Date.now() - started;
          if (structured) {
            this.logger.warn(
              JSON.stringify({
                msg: 'http_access_error',
                method,
                url,
                durationMs: ms,
                requestId: typeof rid === 'string' ? rid : undefined,
                correlationId: typeof cid === 'string' ? cid : undefined,
                tenantId: jwtUnsafe?.tenantId,
                userId: jwtUnsafe?.sub,
                clientIp: getClientIp(req),
                error: err.message,
              }),
            );
          } else {
            const ctx =
              typeof rid === 'string'
                ? typeof cid === 'string' && cid !== rid
                  ? `[rid=${rid} cid=${cid}] `
                  : `[rid=${rid}] `
                : '';
            this.logger.warn(`${ctx}${method} ${url} ${ms}ms — ${err.message}`);
          }
        },
      }),
    );
  }
}
