-- CreateEnum
CREATE TYPE "WebhookSubscriptionState" AS ENUM ('active', 'paused');

-- CreateEnum
CREATE TYPE "WebhookEngineDeliveryStatus" AS ENUM ('pending', 'sending', 'delivered', 'failed', 'dead');

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "actorUserId" TEXT,
    "actorService" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "ip" VARCHAR(64),
    "userAgent" VARCHAR(512),
    "metadata" JSONB,
    "correlationId" VARCHAR(128),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookSubscription" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "description" VARCHAR(500),
    "signingSecret" TEXT NOT NULL,
    "eventTypes" JSONB NOT NULL,
    "state" "WebhookSubscriptionState" NOT NULL DEFAULT 'active',
    "metadata" JSONB,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebhookSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookEngineDelivery" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "idempotencyKey" VARCHAR(256),
    "payload" JSONB NOT NULL,
    "status" "WebhookEngineDeliveryStatus" NOT NULL DEFAULT 'pending',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "nextAttemptAt" TIMESTAMP(3),
    "httpStatus" INTEGER,
    "responseSnippet" VARCHAR(1024),
    "lastError" TEXT,
    "correlationId" VARCHAR(128),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebhookEngineDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuditLog_tenantId_createdAt_idx" ON "AuditLog"("tenantId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "AuditLog_correlationId_idx" ON "AuditLog"("correlationId");

-- CreateIndex
CREATE INDEX "AuditLog_tenantId_action_createdAt_idx" ON "AuditLog"("tenantId", "action", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "WebhookSubscription_tenantId_state_deletedAt_idx" ON "WebhookSubscription"("tenantId", "state", "deletedAt");

-- CreateIndex
CREATE INDEX "WebhookEngineDelivery_tenantId_status_createdAt_idx" ON "WebhookEngineDelivery"("tenantId", "status", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "WebhookEngineDelivery_subscriptionId_status_idx" ON "WebhookEngineDelivery"("subscriptionId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "WebhookEngineDelivery_subscriptionId_idempotencyKey_key" ON "WebhookEngineDelivery"("subscriptionId", "idempotencyKey");

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebhookSubscription" ADD CONSTRAINT "WebhookSubscription_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebhookEngineDelivery" ADD CONSTRAINT "WebhookEngineDelivery_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebhookEngineDelivery" ADD CONSTRAINT "WebhookEngineDelivery_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "WebhookSubscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;
