import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import {
  AllExceptionsFilter,
  LoggingInterceptor,
  RelayLogger,
} from '@relaydesk/common';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(new RelayLogger('ai-worker'));
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());
  const port = Number(process.env.PORT_AI_WORKER ?? 4016);
  await app.listen(port);
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
