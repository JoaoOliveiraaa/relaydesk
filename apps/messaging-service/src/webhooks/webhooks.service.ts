import {
  ConflictException,
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { randomBytes, createHmac } from 'node:crypto';
import { prisma, WebhookSubscriptionState } from '@relaydesk/database';
import type { CreateWebhookDto } from './dto/create-webhook.dto';
import type { UpdateWebhookDto } from './dto/update-webhook.dto';
import type { JwtPayload } from '../auth/jwt.strategy';

const DEFAULT_RETRY_POLICY = {
  maxAttempts: 5,
  backoffBase: 2,
  backoffCap: 300,
  timeoutSeconds: 30,
};

export interface WebhookSubscriptionView {
  id: string;
  tenantId: string;
  url: string;
  description: string | null;
  eventTypes: string[];
  state: WebhookSubscriptionState;
  retryPolicy: typeof DEFAULT_RETRY_POLICY;
  /** Masked secret — only first 8 chars revealed + '...' (never expose full secret via API) */
  secretHint: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  async create(dto: CreateWebhookDto, user: JwtPayload): Promise<WebhookSubscriptionView & { secret: string }> {
    const count = await prisma.webhookSubscription.count({
      where: { tenantId: user.tenantId, deletedAt: null },
    });
    if (count >= 20) {
      throw new ConflictException('Maximum of 20 webhook subscriptions per tenant reached');
    }

    const secret = `whsec_${randomBytes(32).toString('hex')}`;
    const retryPolicy = { ...DEFAULT_RETRY_POLICY, ...(dto.retryPolicy ?? {}) };

    const sub = await prisma.webhookSubscription.create({
      data: {
        tenantId: user.tenantId,
        url: dto.url,
        description: dto.description ?? null,
        signingSecret: secret,
        eventTypes: dto.eventTypes,
        state: WebhookSubscriptionState.active,
        metadata: { retryPolicy, createdByUserId: user.sub },
      },
    });

    this.logger.log(`Webhook subscription created: ${sub.id} for tenant ${user.tenantId}`);

    return {
      ...this.toView(sub, retryPolicy),
      secret,
    };
  }

  async list(user: JwtPayload): Promise<WebhookSubscriptionView[]> {
    const subs = await prisma.webhookSubscription.findMany({
      where: { tenantId: user.tenantId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    return subs.map((s) => this.toView(s, this.extractRetryPolicy(s.metadata)));
  }

  async findOne(id: string, user: JwtPayload): Promise<WebhookSubscriptionView> {
    const sub = await this.findOrThrow(id, user.tenantId);
    return this.toView(sub, this.extractRetryPolicy(sub.metadata));
  }

  async update(id: string, dto: UpdateWebhookDto, user: JwtPayload): Promise<WebhookSubscriptionView> {
    const sub = await this.findOrThrow(id, user.tenantId);
    const currentRetry = this.extractRetryPolicy(sub.metadata);
    const retryPolicy = { ...currentRetry, ...(dto.retryPolicy ?? {}) };

    const updated = await prisma.webhookSubscription.update({
      where: { id },
      data: {
        ...(dto.url !== undefined && { url: dto.url }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.eventTypes !== undefined && { eventTypes: dto.eventTypes }),
        ...(dto.active !== undefined && {
          state: dto.active
            ? WebhookSubscriptionState.active
            : WebhookSubscriptionState.paused,
        }),
        metadata: {
          ...(sub.metadata as Record<string, unknown>),
          retryPolicy,
        },
      },
    });

    this.logger.log(`Webhook subscription updated: ${id} for tenant ${user.tenantId}`);
    return this.toView(updated, retryPolicy);
  }

  async remove(id: string, user: JwtPayload): Promise<void> {
    await this.findOrThrow(id, user.tenantId);
    await prisma.webhookSubscription.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    this.logger.log(`Webhook subscription deleted: ${id} for tenant ${user.tenantId}`);
  }

  async rotateSecret(id: string, user: JwtPayload): Promise<{ secret: string }> {
    await this.findOrThrow(id, user.tenantId);
    const secret = `whsec_${randomBytes(32).toString('hex')}`;
    await prisma.webhookSubscription.update({
      where: { id },
      data: { signingSecret: secret },
    });
    this.logger.log(`Webhook secret rotated: ${id} for tenant ${user.tenantId}`);
    return { secret };
  }

  /** Dispatch a test ping to a subscription to verify endpoint reachability */
  async sendTest(id: string, user: JwtPayload): Promise<{ deliveryId: string }> {
    const sub = await this.findOrThrow(id, user.tenantId);
    if (sub.state !== WebhookSubscriptionState.active) {
      throw new ConflictException('Cannot send test to paused webhook subscription');
    }

    const delivery = await prisma.webhookEngineDelivery.create({
      data: {
        tenantId: user.tenantId,
        subscriptionId: sub.id,
        eventType: 'webhook.test',
        idempotencyKey: `test:${id}:${Date.now()}`,
        payload: {
          id: `evt_test_${randomBytes(8).toString('hex')}`,
          object: 'event',
          type: 'webhook.test',
          created: Math.floor(Date.now() / 1000),
          data: {
            message: 'This is a test webhook delivery from RelayDesk.',
            subscriptionId: id,
          },
        },
        correlationId: `test:${randomBytes(8).toString('hex')}`,
      },
    });

    return { deliveryId: delivery.id };
  }

  // ————— helpers —————

  private async findOrThrow(id: string, tenantId: string) {
    const sub = await prisma.webhookSubscription.findFirst({
      where: { id, tenantId, deletedAt: null },
    });
    if (!sub) throw new NotFoundException(`Webhook subscription ${id} not found`);
    return sub;
  }

  private toView(
    sub: { id: string; tenantId: string; url: string; description: string | null; signingSecret: string; eventTypes: unknown; state: WebhookSubscriptionState; createdAt: Date; updatedAt: Date },
    retryPolicy: typeof DEFAULT_RETRY_POLICY,
  ): WebhookSubscriptionView {
    return {
      id: sub.id,
      tenantId: sub.tenantId,
      url: sub.url,
      description: sub.description,
      eventTypes: Array.isArray(sub.eventTypes) ? (sub.eventTypes as string[]) : [],
      state: sub.state,
      retryPolicy,
      secretHint: `${sub.signingSecret.slice(0, 12)}...`,
      createdAt: sub.createdAt,
      updatedAt: sub.updatedAt,
    };
  }

  private extractRetryPolicy(metadata: unknown): typeof DEFAULT_RETRY_POLICY {
    if (metadata && typeof metadata === 'object' && 'retryPolicy' in metadata) {
      return { ...DEFAULT_RETRY_POLICY, ...(metadata as Record<string, unknown>).retryPolicy as object };
    }
    return { ...DEFAULT_RETRY_POLICY };
  }
}
