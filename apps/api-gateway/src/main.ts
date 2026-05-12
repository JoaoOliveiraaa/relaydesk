import 'reflect-metadata';
import { registerRelaydeskOtel } from '@relaydesk/otel';
import { RequestMethod } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { writeSync } from 'node:fs';
import type { AddressInfo } from 'node:net';
import {
  AllExceptionsFilter,
  createRelayPinoLogger,
  createRelayValidationPipe,
  LoggingInterceptor,
  RelayLogger,
  ResponseEnvelopeInterceptor,
} from '@relaydesk/common';
import type { RelayDeskEnv } from '@relaydesk/config';
import { relaydeskHttpCorsOptions } from '@relaydesk/config';
import { setupRelaydeskSwagger } from '@relaydesk/platform-nest';
import { AppModule } from './app.module';

/** Escreve sempre em stdout (síncrono). Turbo / stream não devem engolir isto antes de um exit abrupto. */
function bootLine(msg: string): void {
  const line = `[api-gateway ${new Date().toISOString()}] ${msg}\n`;
  try {
    writeSync(1, line);
  } catch {
    // último recurso
    console.log(line.trim());
  }
}

function bootErr(msg: string, err?: unknown): void {
  const extra = err instanceof Error ? `${err.message}\n${err.stack ?? ''}` : String(err);
  const line = `[api-gateway ${new Date().toISOString()}] ${msg}\n${extra}\n`;
  try {
    writeSync(2, line);
  } catch {
    console.error(line);
  }
}

let diagnosticsInstalled = false;

function installProcessDiagnostics(): void {
  if (diagnosticsInstalled) return;
  diagnosticsInstalled = true;
  process.on('uncaughtException', (err) => {
    bootErr('uncaughtException (processo vai sair)', err);
    process.exit(1);
  });
  process.on('unhandledRejection', (reason) => {
    bootErr('unhandledRejection (processo vai sair)', reason instanceof Error ? reason : new Error(String(reason)));
    process.exit(1);
  });
  process.on('exit', (code) => {
    bootLine(`process exit code=${String(code)}`);
  });
  process.on('SIGTERM', () => bootLine('SIGTERM recebido'));
  process.on('SIGINT', () => bootLine('SIGINT recebido'));
}

function resolveListenPort(raw: string | undefined, fallback: number): number {
  const trimmed = raw?.trim();
  if (!trimmed) return fallback;
  const n = Number(trimmed);
  if (!Number.isInteger(n) || n < 1 || n > 65_535) {
    throw new Error(`PORT_API_GATEWAY inválido: "${raw}" (esperado inteiro 1–65535 ou omitido para ${fallback})`);
  }
  return n;
}

async function trace<T>(label: string, fn: () => T | Promise<T>): Promise<T> {
  const t0 = Date.now();
  bootLine(`>>> ${label}`);
  try {
    const out = await fn();
    bootLine(`<<< ${label} OK (${Date.now() - t0}ms)`);
    return out;
  } catch (e) {
    bootErr(`<<< ${label} FALHOU (${Date.now() - t0}ms)`, e);
    throw e;
  }
}

async function bootstrap(): Promise<void> {
  installProcessDiagnostics();
  bootLine('bootstrap() entrada');

  const useBufferLogs = process.env.RELAYDESK_BOOT_BUFFER_LOGS !== '0';
  if (!useBufferLogs) {
    bootLine('RELAYDESK_BOOT_BUFFER_LOGS=0 → NestFactory bufferLogs=false (logs internos Nest antes de useLogger)');
  }

  await trace('registerRelaydeskOtel', () => {
    registerRelaydeskOtel({ serviceName: 'api-gateway', prisma: false, redisIoredis: true });
  });

  const app = await trace('NestFactory.create(AppModule)', () =>
    NestFactory.create(AppModule, { bufferLogs: useBufferLogs }),
  );

  await trace('app.enableShutdownHooks', () => {
    app.enableShutdownHooks();
  });

  const config = await trace('app.get(ConfigService)', () => app.get(ConfigService));

  const env = await trace("config.get<RelayDeskEnv>('relayEnv')", () => {
    const e = config.get<RelayDeskEnv>('relayEnv');
    if (!e) {
      throw new Error("ConfigService: 'relayEnv' está undefined — verifique ConfigModule.forRoot(load: relayEnv)");
    }
    return e;
  });
  bootLine(`relayEnv: NODE_ENV=${env.NODE_ENV} CORS_ORIGINS=${env.CORS_ORIGINS}`);

  const usePino = process.env.USE_PINO_LOGGER !== '0';
  const logger = await trace(usePino ? 'createRelayPinoLogger' : 'new RelayLogger', () =>
    usePino ? createRelayPinoLogger('api-gateway') : new RelayLogger('api-gateway'),
  );

  await trace('app.useLogger', () => {
    app.useLogger(logger);
  });

  await trace('app.enableCors', () => {
    app.enableCors(relaydeskHttpCorsOptions(env.CORS_ORIGINS));
  });

  await trace('app.use(helmet)', () => {
    app.use(
      helmet({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
        crossOriginResourcePolicy: { policy: 'cross-origin' },
      }),
    );
  });

  await trace('app.setGlobalPrefix', () => {
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
  });

  await trace('app.useGlobalPipes', () => {
    app.useGlobalPipes(createRelayValidationPipe());
  });

  await trace('app.useGlobalFilters', () => {
    app.useGlobalFilters(new AllExceptionsFilter());
  });

  await trace('app.useGlobalInterceptors', () => {
    app.useGlobalInterceptors(new ResponseEnvelopeInterceptor(app.get(Reflector)), new LoggingInterceptor());
  });

  await trace('setupRelaydeskSwagger', () => {
    setupRelaydeskSwagger(app, {
      serviceName: 'api-gateway',
      title: 'RelayDesk · Public Gateway',
      version: '1.0.0',
      description:
        'BFF público: autenticação, inbox e ingestão. As rotas devolvem o mesmo JSON que os microsserviços (normalmente **envelope RelayDesk**).',
      extraDescription:
        '### Notas\n- Prefixo HTTP público: `/v1/*`.\n- Documentação OpenAPI também em `/docs` na raiz (fora do prefixo).\n',
    });
  });

  const port = resolveListenPort(process.env.PORT_API_GATEWAY, 4010);
  bootLine(`app.listen(${port}) invocação iminente`);

  await trace(`app.listen(${port})`, () => app.listen(port));

  const server = app.getHttpServer();
  const addr = server.address() as AddressInfo | string | null;
  const bound =
    typeof addr === 'object' && addr
      ? `${addr.address}:${addr.port}`
      : typeof addr === 'string'
        ? addr
        : String(addr);
  bootLine(`HTTP bound address=${bound}`);
  logger.log(`API Gateway em http://localhost:${port}/v1`);
  logger.log(`OpenAPI UI: http://localhost:${port}/docs · JSON: http://localhost:${port}/openapi.json`);
}

bootstrap().catch((err) => {
  bootErr('bootstrap().catch — exceção não tratada no arranque', err);
  process.exit(1);
});
