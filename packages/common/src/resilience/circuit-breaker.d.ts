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
export declare class CircuitBreaker {
    readonly name: string;
    private state;
    private failures;
    private successes;
    private openedAt;
    private readonly failureThreshold;
    private readonly openDurationMs;
    private readonly successThreshold;
    constructor(opts: CircuitBreakerOptions);
    getState(): CircuitState;
    execute<T>(fn: () => Promise<T>): Promise<T>;
    private onSuccess;
    private onFailure;
    private tripOpen;
}
//# sourceMappingURL=circuit-breaker.d.ts.map