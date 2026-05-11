import { Module } from '@nestjs/common';
import { JwtAuthModule } from '../auth/jwt-auth.module';
import { MessagingModule } from '../messaging/messaging.module';
import { ChannelConnectionsController } from './channel-connections.controller';
import { ChannelConnectionsService } from './channel-connections.service';
import { TelegramApiClient } from './telegram/telegram-api.client';
import { TelegramInboundConsumerService } from './telegram/telegram-inbound-consumer.service';
import { TelegramOutboundConsumerService } from './telegram/telegram-outbound-consumer.service';
import { TelegramWebhookController } from './telegram/telegram-webhook.controller';

@Module({
  imports: [MessagingModule, JwtAuthModule],
  controllers: [TelegramWebhookController, ChannelConnectionsController],
  providers: [
    TelegramApiClient,
    ChannelConnectionsService,
    TelegramInboundConsumerService,
    TelegramOutboundConsumerService,
  ],
})
export class ProvidersModule {}
