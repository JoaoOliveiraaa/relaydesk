import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import type { Request } from 'express';
import { Observable, tap } from 'rxjs';

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
    const ctx =
      typeof rid === 'string'
        ? typeof cid === 'string' && cid !== rid
          ? `[rid=${rid} cid=${cid}] `
          : `[rid=${rid}] `
        : '';
    const started = Date.now();
    return next.handle().pipe(
      tap({
        next: () => {
          const ms = Date.now() - started;
          this.logger.log(`${ctx}${method} ${url} ${ms}ms`);
        },
        error: (err: Error) => {
          const ms = Date.now() - started;
          this.logger.warn(`${ctx}${method} ${url} ${ms}ms — ${err.message}`);
        },
      }),
    );
  }
}
