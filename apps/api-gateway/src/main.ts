import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import {
  AllExceptionsFilter,
  createRelayValidationPipe,
  LoggingInterceptor,
  RelayLogger,
} from '@relaydesk/common';
import type { RelayDeskEnv } from '@relaydesk/config';
import { corsOriginsFromEnv } from '@relaydesk/config';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const config = app.get(ConfigService);
  const env = config.get<RelayDeskEnv>('relayEnv')!;
  const logger = new RelayLogger('api-gateway');
  app.useLogger(logger);
  app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
  app.enableCors({ origin: corsOriginsFromEnv(env.CORS_ORIGINS), credentials: true });
  app.setGlobalPrefix('v1');
  app.useGlobalPipes(createRelayValidationPipe());
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());
  const port = Number(process.env.PORT_API_GATEWAY ?? 4010);
  await app.listen(port);
  logger.log(`API Gateway em http://localhost:${port}/v1`);
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
