import type { Instrumentation } from '@opentelemetry/instrumentation';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { PrismaInstrumentation } from '@prisma/instrumentation';

export interface RelaydeskOtelOptions {
  serviceName: string;
  /** OTLP HTTP traces endpoint (Jaeger OTLP ou Grafana Tempo). */
  tracesEndpoint?: string;
  /** Desativa SDK (testes ou ambientes sem collector). */
  disabled?: boolean;
  /** Inclui instrumentação Prisma (serviços com @prisma/client). */
  prisma?: boolean;
}

let sdkSingleton: NodeSDK | undefined;

/**
 * Inicializa OpenTelemetry (HTTP/Express, DNS, net, etc.) + OTLP para Jaeger/Tempo.
 * Chamar o mais cedo possível no bootstrap (antes de NestFactory.create).
 */
export function registerRelaydeskOtel(opts: RelaydeskOtelOptions): void {
  if (opts.disabled === true || process.env.OTEL_SDK_DISABLED === 'true' || process.env.OTEL_ENABLED === '0') {
    return;
  }
  if (sdkSingleton) {
    return;
  }

  const tracesEndpoint =
    opts.tracesEndpoint ??
    process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT ??
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT ??
    'http://127.0.0.1:4318/v1/traces';

  const instrumentations: Instrumentation[] = [
    ...getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': { enabled: false },
    }),
  ];
  if (opts.prisma === true) {
    instrumentations.push(new PrismaInstrumentation());
  }

  const exporter = new OTLPTraceExporter({ url: tracesEndpoint });

  const sdk = new NodeSDK({
    resource: new Resource({
      [ATTR_SERVICE_NAME]: opts.serviceName,
    }),
    traceExporter: exporter,
    instrumentations,
  });

  sdk.start();
  sdkSingleton = sdk;

  const shutdown = (): void => {
    void sdk
      .shutdown()
      .catch(() => undefined)
      .finally(() => {
        sdkSingleton = undefined;
      });
  };
  process.once('SIGTERM', shutdown);
  process.once('SIGINT', shutdown);
}
