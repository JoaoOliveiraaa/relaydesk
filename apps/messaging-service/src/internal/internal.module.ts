import { Module } from '@nestjs/common';
import { InboxModule } from '../inbox/inbox.module';
import { InternalConversationsController } from './internal-conversations.controller';
import { InternalServiceGuard } from './internal-service.guard';

@Module({
  imports: [InboxModule],
  controllers: [InternalConversationsController],
  providers: [InternalServiceGuard],
})
export class InternalModule {}
