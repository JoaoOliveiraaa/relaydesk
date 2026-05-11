import 'reflect-metadata';
import { registerRelaydeskOtel } from '@relaydesk/otel';
import { NestFactory } from '@nestjs/core';
import {
  AllExceptionsFilter,
  LoggingInterceptor,
  RelayLogger,
} from '@relaydesk/common';
import { AppModule } from './app.module';

registerRelaydeskOtel({ serviceName: 'webhook-service', prisma: true, redisIoredis: false });

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.enableShutdownHooks();
  app.useLogger(new RelayLogger('webhook-service'));
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());
  const port = Number(process.env.PORT_WEBHOOK_SERVICE ?? 4014);
  await app.listen(port);
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
