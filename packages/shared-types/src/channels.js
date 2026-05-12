"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RELAY_CHANNELS = void 0;
exports.isRelayChannel = isRelayChannel;
/** Canais omnichannel + interno (chat do produto). */
exports.RELAY_CHANNELS = [
    'whatsapp',
    'telegram',
    'instagram',
    'email',
    'internal',
];
function isRelayChannel(value) {
    return exports.RELAY_CHANNELS.includes(value);
}
//# sourceMappingURL=channels.js.map