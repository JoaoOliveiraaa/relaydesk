import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import {
  AllExceptionsFilter,
  createRelayValidationPipe,
  LoggingInterceptor,
  RelayLogger,
} from '@relaydesk/common';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const logger = new RelayLogger('messaging-service');
  app.useLogger(logger);
  app.useGlobalPipes(createRelayValidationPipe());
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());
  const port = Number(process.env.PORT_MESSAGING_SERVICE ?? 4012);
  await app.listen(port);
  logger.log(`Messaging service em http://localhost:${port}`);
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
