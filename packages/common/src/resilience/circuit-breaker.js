"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircuitBreaker = void 0;
/**
 * Minimal circuit breaker (Hystrix / Resilience4j–style states).
 * Thread-safe enough for single-threaded Node event loop per instance.
 */
class CircuitBreaker {
    name;
    state = 'closed';
    failures = 0;
    successes = 0;
    openedAt = 0;
    failureThreshold;
    openDurationMs;
    successThreshold;
    constructor(opts) {
        this.name = opts.name;
        this.failureThreshold = opts.failureThreshold;
        this.openDurationMs = opts.openDurationMs;
        this.successThreshold = opts.successThreshold;
    }
    getState() {
        if (this.state === 'open' && Date.now() - this.openedAt >= this.openDurationMs) {
            this.state = 'half_open';
            this.successes = 0;
        }
        return this.state;
    }
    async execute(fn) {
        const st = this.getState();
        if (st === 'open') {
            throw new Error(`CircuitBreaker[${this.name}] is OPEN — fast-fail`);
        }
        try {
            const result = await fn();
            this.onSuccess();
            return result;
        }
        catch (e) {
            this.onFailure();
            throw e;
        }
    }
    onSuccess() {
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
    onFailure() {
        this.failures += 1;
        if (this.state === 'half_open') {
            this.tripOpen();
            return;
        }
        if (this.failures >= this.failureThreshold) {
            this.tripOpen();
        }
    }
    tripOpen() {
        this.state = 'open';
        this.openedAt = Date.now();
        this.failures = 0;
        this.successes = 0;
    }
}
exports.CircuitBreaker = CircuitBreaker;
//# sourceMappingURL=circuit-breaker.js.map