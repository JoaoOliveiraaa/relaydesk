import type { LoggerService } from '@nestjs/common';
import pino from 'pino';

export function createRelayPinoLogger(serviceName: string): LoggerService {
  const logger = pino({
    level: process.env.LOG_LEVEL ?? (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
    base: { service: serviceName },
    messageKey: 'message',
    timestamp: pino.stdTimeFunctions.isoTime,
  });

  const format = (message: unknown): string =>
    typeof message === 'string' ? message : JSON.stringify(message);

  return {
    log(message: unknown, context?: string) {
      logger.info({ context }, format(message));
    },
    error(message: unknown, trace?: string, context?: string) {
      logger.error({ context, trace }, format(message));
    },
    warn(message: unknown, context?: string) {
      logger.warn({ context }, format(message));
    },
    debug(message: unknown, context?: string) {
      logger.debug({ context }, format(message));
    },
    verbose(message: unknown, context?: string) {
      logger.trace({ context }, format(message));
    },
    fatal(message: unknown, context?: string) {
      logger.fatal({ context }, format(message));
    },
    setLogLevels() {
      /* noop: níveis via LOG_LEVEL / NODE_ENV */
    },
  };
}
