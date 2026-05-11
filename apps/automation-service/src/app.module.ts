import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { loadEnv } from '@relaydesk/config';
import { AutomationConsumerModule } from './automation/automation-consumer.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [() => ({ relayEnv: loadEnv(process.env) })],
    }),
    HealthModule,
    AutomationConsumerModule,
  ],
})
export class AppModule {}
