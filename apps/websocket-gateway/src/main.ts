import 'reflect-metadata';
import { registerRelaydeskOtel } from '@relaydesk/otel';
import { NestFactory } from '@nestjs/core';

registerRelaydeskOtel({ serviceName: 'websocket-gateway', prisma: false });
import { ConfigService } from '@nestjs/config';
import { createRelayPinoLogger, RelayLogger } from '@relaydesk/common';
import type { RelayDeskEnv } from '@relaydesk/config';
import { corsOriginsFromEnv } from '@relaydesk/config';
import { AppModule } from './app.module';
import { RedisIoAdapter } from './realtime/redis-io.adapter';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.enableShutdownHooks();
  const config = app.get(ConfigService);
  const env = config.get<RelayDeskEnv>('relayEnv')!;
  const usePino = process.env.USE_PINO_LOGGER !== '0';
  const logger = usePino ? createRelayPinoLogger('websocket-gateway') : new RelayLogger('websocket-gateway');
  app.useLogger(logger);
  app.enableCors({ origin: corsOriginsFromEnv(env.CORS_ORIGINS), credentials: true });

  const redisUrl = env.REDIS_URL;
  app.useWebSocketAdapter(new RedisIoAdapter(app, redisUrl));

  const port = Number(process.env.PORT_WEBSOCKET_GATEWAY ?? 4013);
  await app.listen(port);
  logger.log(`WebSocket gateway (HTTP/Socket.IO) em http://localhost:${port}`);
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
