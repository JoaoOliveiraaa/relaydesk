/** Canais omnichannel + interno (chat do produto). */
export declare const RELAY_CHANNELS: readonly ["whatsapp", "telegram", "instagram", "email", "internal"];
export type RelayChannel = (typeof RELAY_CHANNELS)[number];
export declare function isRelayChannel(value: string): value is RelayChannel;
//# sourceMappingURL=channels.d.ts.map