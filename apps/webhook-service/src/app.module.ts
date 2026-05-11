import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { loadEnv } from '@relaydesk/config';
import { HealthModule } from './health/health.module';
import { WebhookConsumerModule } from './webhook/webhook-consumer.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [() => ({ relayEnv: loadEnv(process.env) })],
    }),
    HealthModule,
    WebhookConsumerModule,
  ],
})
export class AppModule {}
