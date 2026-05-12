"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SKIP_RESPONSE_ENVELOPE_KEY = void 0;
exports.SkipResponseEnvelope = SkipResponseEnvelope;
const common_1 = require("@nestjs/common");
exports.SKIP_RESPONSE_ENVELOPE_KEY = 'relaydesk:skipResponseEnvelope';
/** Desativa o envelope JSON (ex.: proxy no gateway com @Res(), streaming). */
function SkipResponseEnvelope() {
    return (0, common_1.SetMetadata)(exports.SKIP_RESPONSE_ENVELOPE_KEY, true);
}
//# sourceMappingURL=skip-envelope.decorator.js.map