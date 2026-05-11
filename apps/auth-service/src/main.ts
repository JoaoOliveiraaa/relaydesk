import 'reflect-metadata';
import { registerRelaydeskOtel } from '@relaydesk/otel';
import { Reflector } from '@nestjs/core';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import {
  AllExceptionsFilter,
  createRelayPinoLogger,
  createRelayValidationPipe,
  LoggingInterceptor,
  RelayLogger,
  ResponseEnvelopeInterceptor,
} from '@relaydesk/common';
import { setupRelaydeskSwagger } from '@relaydesk/platform-nest';
import { corsOriginsFromEnv } from '@relaydesk/config';
import type { RelayDeskEnv } from '@relaydesk/config';
import { AppModule } from './app.module';

registerRelaydeskOtel({ serviceName: 'auth-service', prisma: true, redisIoredis: true });

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.enableShutdownHooks();
  const config = app.get(ConfigService);
  const env = config.get<RelayDeskEnv>('relayEnv')!;
  const usePino = process.env.USE_PINO_LOGGER !== '0';
  const logger = usePino ? createRelayPinoLogger('auth-service') : new RelayLogger('auth-service');
  app.useLogger(logger);
  app.enableCors({ origin: corsOriginsFromEnv(env.CORS_ORIGINS), credentials: true });
  app.useGlobalPipes(createRelayValidationPipe());
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new ResponseEnvelopeInterceptor(app.get(Reflector)), new LoggingInterceptor());

  setupRelaydeskSwagger(app, {
    serviceName: 'auth-service',
    title: 'RelayDesk · Auth API',
    version: '1.0.0',
    description:
      'Identidade, tenants e tokens. Todas as respostas seguem o **envelope RelayDesk** (`success`, `data`, `meta`).',
    extraDescription: '### Domínios\n- **Auth**: registo, login, refresh, perfil.\n',
  });

  const port = Number(process.env.PORT_AUTH_SERVICE ?? 4011);
  await app.listen(port);
  logger.log(`Auth service em http://localhost:${port}`);
  logger.log(`OpenAPI UI: http://localhost:${port}/docs · JSON: http://localhost:${port}/openapi.json`);
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
