/** Canais omnichannel + interno (chat do produto). */
export const RELAY_CHANNELS = [
  'whatsapp',
  'telegram',
  'instagram',
  'email',
  'internal',
] as const;

export type RelayChannel = (typeof RELAY_CHANNELS)[number];

export function isRelayChannel(value: string): value is RelayChannel {
  return (RELAY_CHANNELS as readonly string[]).includes(value);
}
