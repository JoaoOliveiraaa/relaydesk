import { trace, type Span, type SpanOptions, type Tracer } from '@opentelemetry/api';

const DEFAULT_TRACER = 'relaydesk';

export function getRelaydeskTracer(name = DEFAULT_TRACER): Tracer {
  return trace.getTracer(name);
}

/** Active span helper — span lifecycle managed by OpenTelemetry SDK. */
export function startActiveSpan<T>(
  tracerName: string,
  spanName: string,
  options: SpanOptions,
  fn: (span: Span) => Promise<T>,
): Promise<T> {
  return getRelaydeskTracer(tracerName).startActiveSpan(spanName, options, (span: Span) => fn(span));
}
