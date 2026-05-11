import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { loadEnv } from '@relaydesk/config';
import { HealthModule } from './health/health.module';
import { NotificationConsumerModule } from './notification/notification-consumer.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [() => ({ relayEnv: loadEnv(process.env) })],
    }),
    HealthModule,
    NotificationConsumerModule,
  ],
})
export class AppModule {}
