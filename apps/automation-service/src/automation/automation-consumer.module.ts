import { Module } from '@nestjs/common';
import { AutomationConsumerService } from './automation-consumer.service';

@Module({
  providers: [AutomationConsumerService],
})
export class AutomationConsumerModule {}
