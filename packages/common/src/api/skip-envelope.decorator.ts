import { SetMetadata } from '@nestjs/common';

export const SKIP_RESPONSE_ENVELOPE_KEY = 'relaydesk:skipResponseEnvelope';

/** Desativa o envelope JSON (ex.: proxy no gateway com @Res(), streaming). */
export function SkipResponseEnvelope(): ClassDecorator & MethodDecorator {
  return SetMetadata(SKIP_RESPONSE_ENVELOPE_KEY, true);
}
