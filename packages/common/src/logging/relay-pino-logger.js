"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRelayPinoLogger = createRelayPinoLogger;
const pino_1 = __importDefault(require("pino"));
function createRelayPinoLogger(serviceName) {
    const logger = (0, pino_1.default)({
        level: process.env.LOG_LEVEL ?? (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
        base: { service: serviceName },
        messageKey: 'message',
        timestamp: pino_1.default.stdTimeFunctions.isoTime,
    });
    const format = (message) => typeof message === 'string' ? message : JSON.stringify(message);
    return {
        log(message, context) {
            logger.info({ context }, format(message));
        },
        error(message, trace, context) {
            logger.error({ context, trace }, format(message));
        },
        warn(message, context) {
            logger.warn({ context }, format(message));
        },
        debug(message, context) {
            logger.debug({ context }, format(message));
        },
        verbose(message, context) {
            logger.trace({ context }, format(message));
        },
        fatal(message, context) {
            logger.fatal({ context }, format(message));
        },
        setLogLevels() {
            /* noop: níveis via LOG_LEVEL / NODE_ENV */
        },
    };
}
//# sourceMappingURL=relay-pino-logger.js.map