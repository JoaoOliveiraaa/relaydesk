import { Injectable } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'node:crypto';

export interface WebhookSignatureHeaders {
  'x-relaydesk-signature': string;
  'x-relaydesk-timestamp': string;
  'x-relaydesk-event': string;
  'x-relaydesk-delivery': string;
}

/**
 * HMAC SHA-256 signing for outbound webhooks — Stripe-style.
 *
 * Signature format: `t={timestamp},v1={hmac}`
 * Signed payload:   `{timestamp}.{body}`
 *
 * Replay attack prevention: consumers should reject requests where
 * `|now - timestamp| > 300s` (5 minutes).
 */
@Injectable()
export class HmacService {
  sign(
    secret: string,
    body: string,
    timestampSeconds: number,
  ): string {
    const toSign = `${timestampSeconds}.${body}`;
    const hmac = createHmac('sha256', secret).update(toSign).digest('hex');
    return `t=${timestampSeconds},v1=${hmac}`;
  }

  verify(
    secret: string,
    body: string,
    signatureHeader: string,
    toleranceSeconds = 300,
  ): boolean {
    const parts = Object.fromEntries(
      signatureHeader.split(',').map((p) => p.split('=')),
    ) as Record<string, string>;

    const timestamp = Number(parts['t']);
    const receivedHmac = parts['v1'];
    if (!timestamp || !receivedHmac) return false;

    const age = Math.abs(Math.floor(Date.now() / 1000) - timestamp);
    if (age > toleranceSeconds) return false;

    const expectedSig = this.sign(secret, body, timestamp);
    const expectedParts = Object.fromEntries(
      expectedSig.split(',').map((p) => p.split('=')),
    ) as Record<string, string>;

    try {
      return timingSafeEqual(
        Buffer.from(receivedHmac, 'utf8'),
        Buffer.from(expectedParts['v1'] ?? '', 'utf8'),
      );
    } catch {
      return false;
    }
  }

  buildHeaders(
    secret: string,
    body: string,
    eventType: string,
    deliveryId: string,
  ): WebhookSignatureHeaders {
    const timestamp = Math.floor(Date.now() / 1000);
    return {
      'x-relaydesk-signature': this.sign(secret, body, timestamp),
      'x-relaydesk-timestamp': String(timestamp),
      'x-relaydesk-event': eventType,
      'x-relaydesk-delivery': deliveryId,
    };
  }
}
