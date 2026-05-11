import { Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { WebhookDeliveriesController } from './webhook-deliveries.controller';
import { WebhookEventPublisher } from './webhook-event.publisher';

@Module({
  controllers: [WebhooksController, WebhookDeliveriesController],
  providers: [WebhooksService, WebhookEventPublisher],
  exports: [WebhooksService, WebhookEventPublisher],
})
export class WebhooksModule {}
