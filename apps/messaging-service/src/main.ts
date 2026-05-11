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
import type { RelayDeskEnv } from '@relaydesk/config';
import { corsOriginsFromEnv } from '@relaydesk/config';
import { setupRelaydeskSwagger } from '@relaydesk/platform-nest';
import { AppModule } from './app.module';

registerRelaydeskOtel({ serviceName: 'messaging-service', prisma: true, redisIoredis: true });

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.enableShutdownHooks();
  const config = app.get(ConfigService);
  const env = config.get<RelayDeskEnv>('relayEnv')!;
  app.enableCors({ origin: corsOriginsFromEnv(env.CORS_ORIGINS), credentials: true });
  const usePino = process.env.USE_PINO_LOGGER !== '0';
  const logger = usePino ? createRelayPinoLogger('messaging-service') : new RelayLogger('messaging-service');
  app.useLogger(logger);
  app.useGlobalPipes(createRelayValidationPipe());
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new ResponseEnvelopeInterceptor(app.get(Reflector)), new LoggingInterceptor());

  setupRelaydeskSwagger(app, {
    serviceName: 'messaging-service',
    title: 'RelayDesk · Messaging API',
    version: '1.0.0',
    description:
      'Inbox, ingestão omnichannel e endpoints internos para outros serviços. Envelope RelayDesk em todas as respostas JSON.',
    extraDescription:
      '### Domínios\n- **Messaging**: ingestão de mensagens.\n- **Inbox**: conversas e mensagens autenticadas (JWT).\n- **Platform**: rotas internas (`X-RelayDesk-Internal-Token`).\n',
  });

  const port = Number(process.env.PORT_MESSAGING_SERVICE ?? 4012);
  await app.listen(port);
  logger.log(`Messaging service em http://localhost:${port}`);
  logger.log(`OpenAPI UI: http://localhost:${port}/docs · JSON: http://localhost:${port}/openapi.json`);
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
