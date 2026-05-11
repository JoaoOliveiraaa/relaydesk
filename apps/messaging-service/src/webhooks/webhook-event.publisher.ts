import { Injectable, Logger } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { prisma, WebhookSubscriptionState } from '@relaydesk/database';
import { AmqpPublisher } from '../infra/amqp.publisher';
import { RELAY_EVENT_ROUTING } from '@relaydesk/shared-types';
import type { WebhookEventType } from './dto/create-webhook.dto';
import { RELAYDESK_API_VERSION } from '@relaydesk/sdk';

/**
 * WebhookEventPublisher — called by domain services when something happens.
 *
 * Flow:
 *  1. Find all active subscriptions for (tenantId, eventType)
 *  2. Create a WebhookEngineDelivery record per subscription (persistent, idempotent)
 *  3. Enqueue a lightweight job to RabbitMQ (`webhook.delivery` routing key)
 *     The worker reads the delivery record and performs the actual HTTP call.
 */
@Injectable()
export class WebhookEventPublisher {
  private readonly logger = new Logger(WebhookEventPublisher.name);

  constructor(private readonly amqp: AmqpPublisher) {}

  async publish(
    tenantId: string,
    eventType: string,
    data: Record<string, unknown>,
    correlationId?: string,
  ): Promise<void> {
    const subscriptions = await prisma.webhookSubscription.findMany({
      where: {
        tenantId,
        state: WebhookSubscriptionState.active,
        deletedAt: null,
      },
      select: { id: true, eventTypes: true },
    });

    const matching = subscriptions.filter((s) => {
      const types = Array.isArray(s.eventTypes) ? (s.eventTypes as string[]) : [];
      return types.includes('*') || types.includes(eventType);
    });

    if (matching.length === 0) return;

    const eventId = `evt_${randomBytes(12).toString('hex')}`;
    const created = Math.floor(Date.now() / 1000);
    const payload = {
      id: eventId,
      object: 'event',
      type: eventType,
      created,
      apiVersion: RELAYDESK_API_VERSION,
      tenantId,
      data,
    };

    await Promise.all(
      matching.map(async (sub) => {
        const idempotencyKey = `${eventId}:${sub.id}`;
        try {
          const delivery = await prisma.webhookEngineDelivery.upsert({
            where: {
              subscriptionId_idempotencyKey: {
                subscriptionId: sub.id,
                idempotencyKey,
              },
            },
            create: {
              tenantId,
              subscriptionId: sub.id,
              eventType,
              idempotencyKey,
              payload,
              correlationId: correlationId ?? eventId,
            },
            update: {},
          });

          await this.amqp.publish(
            RELAY_EVENT_ROUTING.WEBHOOK_DELIVERY,
            { deliveryId: delivery.id, tenantId },
            {
              messageId: delivery.id,
              correlationId: correlationId ?? eventId,
              relaydesk: {
                tenantId,
                webhookDeliveryId: delivery.id,
                eventId,
              },
            },
          );
        } catch (err) {
          this.logger.error(`Failed to enqueue webhook delivery for sub ${sub.id}: ${String(err)}`);
        }
      }),
    );

    this.logger.debug(
      `Published webhook event ${eventType} (${eventId}) to ${matching.length} subscription(s) for tenant ${tenantId}`,
    );
  }
}
