"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllExceptionsFilter = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const constants_1 = require("../api/constants");
function normalizeHttpExceptionBody(status, message, path) {
    const code = `HTTP_${status}`;
    if (typeof message === 'string') {
        return { code, message, details: { path } };
    }
    const obj = message;
    const msg = typeof obj.message === 'string'
        ? obj.message
        : Array.isArray(obj.message)
            ? obj.message.join('; ')
            : 'Request failed';
    const { message: _m, error: _e, statusCode: _sc, ...rest } = obj;
    const details = Object.keys(rest).length ? rest : undefined;
    return { code, message: msg, details: details ?? { path } };
}
let AllExceptionsFilter = class AllExceptionsFilter {
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const res = ctx.getResponse();
        const req = ctx.getRequest();
        const status = exception instanceof common_1.HttpException
            ? exception.getStatus()
            : common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        const rawMessage = exception instanceof common_1.HttpException
            ? exception.getResponse()
            : exception instanceof Error
                ? exception.message
                : 'Internal error';
        const norm = normalizeHttpExceptionBody(status, rawMessage, req.url ?? '');
        const rid = req.headers['x-request-id'];
        const cid = req.headers['x-correlation-id'];
        const meta = {
            apiVersion: constants_1.RELAYDESK_API_VERSION,
            requestId: typeof rid === 'string' && rid ? rid : (0, crypto_1.randomUUID)(),
            correlationId: typeof cid === 'string' && cid ? cid : undefined,
        };
        const body = {
            success: false,
            error: {
                code: norm.code,
                message: norm.message,
                details: norm.details,
            },
            meta,
        };
        res.status(status).json(body);
    }
};
exports.AllExceptionsFilter = AllExceptionsFilter;
exports.AllExceptionsFilter = AllExceptionsFilter = __decorate([
    (0, common_1.Catch)()
], AllExceptionsFilter);
//# sourceMappingURL=all-exceptions.filter.js.map