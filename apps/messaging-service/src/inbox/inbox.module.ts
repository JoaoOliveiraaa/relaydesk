import { Module } from '@nestjs/common';
import { JwtAuthModule } from '../auth/jwt-auth.module';
import { InboxController } from './inbox.controller';
import { InboxService } from './inbox.service';

@Module({
  imports: [JwtAuthModule],
  controllers: [InboxController],
  providers: [InboxService],
})
export class InboxModule {}
