import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { loadEnv } from '@relaydesk/config';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { RedisInfraModule } from './infra/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [() => ({ relayEnv: loadEnv(process.env) })],
    }),
    RedisInfraModule,
    HealthModule,
    AuthModule,
  ],
})
export class AppModule {}
