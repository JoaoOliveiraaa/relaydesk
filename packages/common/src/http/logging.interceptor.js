"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggingInterceptor = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const client_ip_1 = require("./client-ip");
const unsafe_jwt_payload_1 = require("../jwt/unsafe-jwt-payload");
let LoggingInterceptor = class LoggingInterceptor {
    logger = new common_1.Logger('HTTP');
    intercept(context, next) {
        if (context.getType() !== 'http') {
            return next.handle();
        }
        const req = context.switchToHttp().getRequest();
        const { method, url } = req;
        const rid = req.headers['x-request-id'];
        const cid = req.headers['x-correlation-id'];
        const auth = req.headers.authorization;
        const jwtUnsafe = typeof auth === 'string' && auth.startsWith('Bearer ')
            ? (0, unsafe_jwt_payload_1.decodeJwtPayloadUnsafe)(auth.slice(7))
            : null;
        const structured = process.env.STRUCTURED_HTTP_LOGS === '1' ||
            (process.env.STRUCTURED_HTTP_LOGS !== '0' && process.env.NODE_ENV === 'production');
        const started = Date.now();
        return next.handle().pipe((0, rxjs_1.tap)({
            next: () => {
                const ms = Date.now() - started;
                if (structured) {
                    this.logger.log(JSON.stringify({
                        msg: 'http_access',
                        method,
                        url,
                        durationMs: ms,
                        requestId: typeof rid === 'string' ? rid : undefined,
                        correlationId: typeof cid === 'string' ? cid : undefined,
                        tenantId: jwtUnsafe?.tenantId,
                        userId: jwtUnsafe?.sub,
                        clientIp: (0, client_ip_1.getClientIp)(req),
                    }));
                }
                else {
                    const ctx = typeof rid === 'string'
                        ? typeof cid === 'string' && cid !== rid
                            ? `[rid=${rid} cid=${cid}] `
                            : `[rid=${rid}] `
                        : '';
                    this.logger.log(`${ctx}${method} ${url} ${ms}ms`);
                }
            },
            error: (err) => {
                const ms = Date.now() - started;
                if (structured) {
                    this.logger.warn(JSON.stringify({
                        msg: 'http_access_error',
                        method,
                        url,
                        durationMs: ms,
                        requestId: typeof rid === 'string' ? rid : undefined,
                        correlationId: typeof cid === 'string' ? cid : undefined,
                        tenantId: jwtUnsafe?.tenantId,
                        userId: jwtUnsafe?.sub,
                        clientIp: (0, client_ip_1.getClientIp)(req),
                        error: err.message,
                    }));
                }
                else {
                    const ctx = typeof rid === 'string'
                        ? typeof cid === 'string' && cid !== rid
                            ? `[rid=${rid} cid=${cid}] `
                            : `[rid=${rid}] `
                        : '';
                    this.logger.warn(`${ctx}${method} ${url} ${ms}ms — ${err.message}`);
                }
            },
        }));
    }
};
exports.LoggingInterceptor = LoggingInterceptor;
exports.LoggingInterceptor = LoggingInterceptor = __decorate([
    (0, common_1.Injectable)()
], LoggingInterceptor);
//# sourceMappingURL=logging.interceptor.js.map