"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseEnvelopeInterceptor = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const operators_1 = require("rxjs/operators");
const crypto_1 = require("crypto");
const constants_1 = require("../api/constants");
const skip_envelope_decorator_1 = require("../api/skip-envelope.decorator");
function shouldBypassEnvelope(url) {
    if (!url)
        return false;
    const path = url.split('?')[0] ?? '';
    return (/(^|\/)health(\/|$)/.test(path) ||
        /(^|\/)metrics(\/|$)/.test(path) ||
        /(^|\/)docs(\/|$)/.test(path) ||
        /(^|\/)openapi\.json$/.test(path));
}
function buildMeta(req) {
    const rid = req.headers['x-request-id'];
    const cid = req.headers['x-correlation-id'];
    return {
        apiVersion: constants_1.RELAYDESK_API_VERSION,
        requestId: typeof rid === 'string' && rid ? rid : (0, crypto_1.randomUUID)(),
        correlationId: typeof cid === 'string' && cid ? cid : undefined,
    };
}
let ResponseEnvelopeInterceptor = class ResponseEnvelopeInterceptor {
    reflector;
    constructor(reflector) {
        this.reflector = reflector;
    }
    intercept(context, next) {
        if (context.getType() !== 'http') {
            return next.handle();
        }
        const req = context.switchToHttp().getRequest();
        const url = req.originalUrl ?? req.url;
        if (shouldBypassEnvelope(url)) {
            return next.handle();
        }
        const handler = context.getHandler();
        const controller = context.getClass();
        const skip = this.reflector.getAllAndOverride(skip_envelope_decorator_1.SKIP_RESPONSE_ENVELOPE_KEY, [handler, controller]) === true;
        if (skip) {
            return next.handle();
        }
        return next.handle().pipe((0, operators_1.map)((body) => {
            const res = context.switchToHttp().getResponse();
            if (res.headersSent) {
                return body;
            }
            if (body === undefined || typeof body === 'string' || Buffer.isBuffer(body)) {
                return body;
            }
            if (body !== null &&
                typeof body === 'object' &&
                'success' in body &&
                body.success === false) {
                return body;
            }
            const envelope = {
                success: true,
                data: body,
                meta: buildMeta(req),
            };
            return envelope;
        }));
    }
};
exports.ResponseEnvelopeInterceptor = ResponseEnvelopeInterceptor;
exports.ResponseEnvelopeInterceptor = ResponseEnvelopeInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], ResponseEnvelopeInterceptor);
//# sourceMappingURL=response-envelope.interceptor.js.map