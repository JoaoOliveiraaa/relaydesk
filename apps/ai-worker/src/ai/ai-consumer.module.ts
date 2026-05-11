import { Module } from '@nestjs/common';
import { AiConsumerService } from './ai-consumer.service';

@Module({
  providers: [AiConsumerService],
})
export class AiConsumerModule {}
