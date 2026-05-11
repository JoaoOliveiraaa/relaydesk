import { Module } from '@nestjs/common';
import { NotificationConsumerService } from './notification-consumer.service';

@Module({
  providers: [NotificationConsumerService],
})
export class NotificationConsumerModule {}
