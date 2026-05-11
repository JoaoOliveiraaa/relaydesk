import 'reflect-metadata';
import { registerRelaydeskOtel } from '@relaydesk/otel';
import { RequestMethod } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
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

registerRelaydeskOtel({ serviceName: 'api-gateway', prisma: false, redisIoredis: true });

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.enableShutdownHooks();
  const config = app.get(ConfigService);
  const env = config.get<RelayDeskEnv>('relayEnv')!;
  const usePino = process.env.USE_PINO_LOGGER !== '0';
  const logger = usePino ? createRelayPinoLogger('api-gateway') : new RelayLogger('api-gateway');
  app.useLogger(logger);
  app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
  app.enableCors({ origin: corsOriginsFromEnv(env.CORS_ORIGINS), credentials: true });
  app.setGlobalPrefix('v1', {
    exclude: [
      { path: 'health', method: RequestMethod.ALL },
      { path: 'health/(.*)', method: RequestMethod.ALL },
      { path: 'metrics', method: RequestMethod.GET },
      { path: 'docs', method: RequestMethod.ALL },
      { path: 'docs/(.*)', method: RequestMethod.ALL },
      { path: 'openapi.json', method: RequestMethod.GET },
    ],
  });
  app.useGlobalPipes(createRelayValidationPipe());
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new ResponseEnvelopeInterceptor(app.get(Reflector)), new LoggingInterceptor());

  setupRelaydeskSwagger(app, {
    serviceName: 'api-gateway',
    title: 'RelayDesk · Public Gateway',
    version: '1.0.0',
    description:
      'BFF público: autenticação, inbox e ingestão. As rotas devolvem o mesmo JSON que os microsserviços (normalmente **envelope RelayDesk**).',
    extraDescription:
      '### Notas\n- Prefixo HTTP público: `/v1/*`.\n- Documentação OpenAPI também em `/docs` na raiz (fora do prefixo).\n',
  });

  const port = Number(process.env.PORT_API_GATEWAY ?? 4010);
  await app.listen(port);
  logger.log(`API Gateway em http://localhost:${port}/v1`);
  logger.log(`OpenAPI UI: http://localhost:${port}/docs · JSON: http://localhost:${port}/openapi.json`);
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
