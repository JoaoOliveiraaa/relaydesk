import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { loadEnv } from '@relaydesk/config';
import { HealthModule } from './health/health.module';
import { InfraModule } from './infra/infra.module';
import { InboxModule } from './inbox/inbox.module';
import { InternalModule } from './internal/internal.module';
import { MessagingModule } from './messaging/messaging.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { ProvidersModule } from './providers/providers.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [() => ({ relayEnv: loadEnv(process.env) })],
    }),
    InfraModule,
    HealthModule,
    MessagingModule,
    ProvidersModule,
    InboxModule,
    InternalModule,
    WebhooksModule,
  ],
})
export class AppModule {}
