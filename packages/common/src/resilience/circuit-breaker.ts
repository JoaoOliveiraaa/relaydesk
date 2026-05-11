export type CircuitState = 'closed' | 'open' | 'half_open';

export interface CircuitBreakerOptions {
  /** Identifier for logs / metrics */
  name: string;
  /** Consecutive failures before opening */
  failureThreshold: number;
  /** Time open circuit stays open before half-open trial (ms) */
  openDurationMs: number;
  /** Successful calls in half-open to close again */
  successThreshold: number;
}

/**
 * Minimal circuit breaker (Hystrix / Resilience4j–style states).
 * Thread-safe enough for single-threaded Node event loop per instance.
 */
export class CircuitBreaker {
  readonly name: string;
  private state: CircuitState = 'closed';
  private failures = 0;
  private successes = 0;
  private openedAt = 0;
  private readonly failureThreshold: number;
  private readonly openDurationMs: number;
  private readonly successThreshold: number;

  constructor(opts: CircuitBreakerOptions) {
    this.name = opts.name;
    this.failureThreshold = opts.failureThreshold;
    this.openDurationMs = opts.openDurationMs;
    this.successThreshold = opts.successThreshold;
  }

  getState(): CircuitState {
    if (this.state === 'open' && Date.now() - this.openedAt >= this.openDurationMs) {
      this.state = 'half_open';
      this.successes = 0;
    }
    return this.state;
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    const st = this.getState();
    if (st === 'open') {
      throw new Error(`CircuitBreaker[${this.name}] is OPEN — fast-fail`);
    }
    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (e) {
      this.onFailure();
      throw e;
    }
  }

  private onSuccess(): void {
    if (this.state === 'half_open') {
      this.successes += 1;
      if (this.successes >= this.successThreshold) {
        this.state = 'closed';
        this.failures = 0;
        this.successes = 0;
      }
      return;
    }
    this.failures = 0;
  }

  private onFailure(): void {
    this.failures += 1;
    if (this.state === 'half_open') {
      this.tripOpen();
      return;
    }
    if (this.failures >= this.failureThreshold) {
      this.tripOpen();
    }
  }

  private tripOpen(): void {
    this.state = 'open';
    this.openedAt = Date.now();
    this.failures = 0;
    this.successes = 0;
  }
}
