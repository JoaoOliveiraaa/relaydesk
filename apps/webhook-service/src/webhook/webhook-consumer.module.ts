import { Module } from '@nestjs/common';
import { WebhookConsumerService } from './webhook-consumer.service';

@Module({
  providers: [WebhookConsumerService],
})
export class WebhookConsumerModule {}
