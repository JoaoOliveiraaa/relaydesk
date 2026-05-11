-- CreateEnum
CREATE TYPE "ChannelWebhookStatus" AS ENUM ('not_configured', 'pending', 'active', 'error');

-- CreateEnum
CREATE TYPE "ProviderHealthStatus" AS ENUM ('unknown', 'healthy', 'degraded', 'unhealthy');

-- CreateEnum
CREATE TYPE "ProviderSyncState" AS ENUM ('idle', 'syncing', 'synced', 'error');

-- AlterTable
ALTER TABLE "ChannelConnection" ADD COLUMN     "encryptedBotToken" TEXT,
ADD COLUMN     "webhookSecretSha256" TEXT,
ADD COLUMN     "webhookStatus" "ChannelWebhookStatus" NOT NULL DEFAULT 'not_configured',
ADD COLUMN     "webhookConfiguredAt" TIMESTAMP(3),
ADD COLUMN     "webhookLastError" VARCHAR(1024),
ADD COLUMN     "providerHealth" "ProviderHealthStatus" NOT NULL DEFAULT 'unknown',
ADD COLUMN     "providerHealthCheckedAt" TIMESTAMP(3),
ADD COLUMN     "providerHealthDetail" VARCHAR(512),
ADD COLUMN     "syncState" "ProviderSyncState" NOT NULL DEFAULT 'idle',
ADD COLUMN     "inboundLastAt" TIMESTAMP(3),
ADD COLUMN     "outboundLastAt" TIMESTAMP(3);
