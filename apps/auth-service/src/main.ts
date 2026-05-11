import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import {
  AllExceptionsFilter,
  createRelayValidationPipe,
  LoggingInterceptor,
  RelayLogger,
} from '@relaydesk/common';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const config = app.get(ConfigService);
  const logger = new RelayLogger('auth-service');
  app.useLogger(logger);
  app.useGlobalPipes(createRelayValidationPipe());
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  const port = Number(process.env.PORT_AUTH_SERVICE ?? 4011);
  await app.listen(port);
  logger.log(`Auth service em http://localhost:${port}`);
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
