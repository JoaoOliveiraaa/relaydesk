import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { RelayDeskEnv } from '@relaydesk/config';
import { randomBytes } from 'crypto';
import { encryptCredential, sha256Hex } from '@relaydesk/common';
import {
  Channel,
  ChannelConnectionStatus,
  ChannelWebhookStatus,
  Prisma,
  prisma,
  ProviderHealthStatus,
  ProviderSyncState,
} from '@relaydesk/database';
import { ConnectTelegramDto } from './dto/connect-telegram.dto';
import { TelegramApiClient } from './telegram/telegram-api.client';

export type SafeChannelConnection = {
  id: string;
  tenantId: string;
  channel: Channel;
  displayName: string;
  status: ChannelConnectionStatus;
  externalAccountId: string | null;
  metadata: Prisma.JsonValue | null;
  webhookStatus: ChannelWebhookStatus;
  webhookConfiguredAt: Date | null;
  webhookLastError: string | null;
  providerHealth: ProviderHealthStatus;
  providerHealthCheckedAt: Date | null;
  providerHealthDetail: string | null;
  syncState: ProviderSyncState;
  inboundLastAt: Date | null;
  outboundLastAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  webhookUrl: string;
};

@Injectable()
export class ChannelConnectionsService {
  private readonly logger = new Logger(ChannelConnectionsService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly telegramApi: TelegramApiClient,
  ) {}

  private publicBase(): string {
    const env = this.config.get<RelayDeskEnv>('relayEnv')!;
    return env.PUBLIC_WEBHOOK_BASE_URL.replace(/\/$/, '');
  }

  webhookUrlForTelegram(connectionId: string): string {
    return `${this.publicBase()}/providers/telegram/webhook/${connectionId}`;
  }

  async list(tenantId: string): Promise<SafeChannelConnection[]> {
    const rows = await prisma.channelConnection.findMany({
      where: { tenantId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        tenantId: true,
        channel: true,
        displayName: true,
        status: true,
        externalAccountId: true,
        metadata: true,
        webhookStatus: true,
        webhookConfiguredAt: true,
        webhookLastError: true,
        providerHealth: true,
        providerHealthCheckedAt: true,
        providerHealthDetail: true,
        syncState: true,
        inboundLastAt: true,
        outboundLastAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return rows.map((r) => ({
      ...r,
      webhookUrl: r.channel === Channel.telegram ? this.webhookUrlForTelegram(r.id) : '',
    }));
  }

  async connectTelegram(
    tenantId: string,
    dto: ConnectTelegramDto,
  ): Promise<{ connection: SafeChannelConnection }> {
    const token = dto.botToken.trim();
    if (!/^\d+:[A-Za-z0-9_-]+$/.test(token)) {
      throw new BadRequestException('Formato do bot token inválido');
    }

    const env = this.config.get<RelayDeskEnv>('relayEnv')!;
    const encKey = env.RELAYDESK_CREDENTIALS_ENCRYPTION_KEY;
    const encrypted = encryptCredential(token, encKey);

    const me = await this.telegramApi.getMe(token);
    if (!me.ok) {
      throw new BadRequestException('Token rejeitado pela Telegram API (getMe)');
    }

    const webhookSecret = randomBytes(32).toString('base64url');
    const secretHash = sha256Hex(webhookSecret);

    const displayName =
      dto.displayName?.trim() ||
      (me.result.username ? `@${me.result.username}` : me.result.first_name ?? 'Telegram');

    const row = await prisma.channelConnection.create({
      data: {
        tenantId,
        channel: Channel.telegram,
        displayName,
        status: ChannelConnectionStatus.active,
        externalAccountId: String(me.result.id),
        encryptedBotToken: encrypted,
        webhookSecretSha256: secretHash,
        webhookStatus: ChannelWebhookStatus.pending,
        syncState: ProviderSyncState.syncing,
        metadata: {
          telegramUsername: me.result.username ?? null,
        } as Prisma.InputJsonValue,
      },
    });

    const url = this.webhookUrlForTelegram(row.id);
    const sw = await this.telegramApi.setWebhook(token, url, webhookSecret);
    if (!sw.ok) {
      const desc = 'description' in sw ? sw.description : 'setWebhook failed';
      await prisma.channelConnection.update({
        where: { id: row.id },
        data: {
          webhookStatus: ChannelWebhookStatus.error,
          webhookLastError: desc?.slice(0, 1024) ?? 'setWebhook',
          syncState: ProviderSyncState.error,
          status: ChannelConnectionStatus.error,
        },
      });
      throw new BadRequestException(`Falha ao registar webhook: ${desc}`);
    }

    const updated = await prisma.channelConnection.update({
      where: { id: row.id },
      data: {
        webhookStatus: ChannelWebhookStatus.active,
        webhookConfiguredAt: new Date(),
        syncState: ProviderSyncState.synced,
        providerHealth: ProviderHealthStatus.healthy,
        providerHealthCheckedAt: new Date(),
      },
      select: {
        id: true,
        tenantId: true,
        channel: true,
        displayName: true,
        status: true,
        externalAccountId: true,
        metadata: true,
        webhookStatus: true,
        webhookConfiguredAt: true,
        webhookLastError: true,
        providerHealth: true,
        providerHealthCheckedAt: true,
        providerHealthDetail: true,
        syncState: true,
        inboundLastAt: true,
        outboundLastAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    this.logger.log(`Telegram conectado tenant=${tenantId} connection=${row.id}`);

    return {
      connection: {
        ...updated,
        webhookUrl: this.webhookUrlForTelegram(updated.id),
      },
    };
  }

  async get(tenantId: string, id: string): Promise<SafeChannelConnection> {
    const r = await prisma.channelConnection.findFirst({
      where: { id, tenantId, deletedAt: null },
      select: {
        id: true,
        tenantId: true,
        channel: true,
        displayName: true,
        status: true,
        externalAccountId: true,
        metadata: true,
        webhookStatus: true,
        webhookConfiguredAt: true,
        webhookLastError: true,
        providerHealth: true,
        providerHealthCheckedAt: true,
        providerHealthDetail: true,
        syncState: true,
        inboundLastAt: true,
        outboundLastAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!r) throw new NotFoundException('Conexão não encontrada');
    return {
      ...r,
      webhookUrl: r.channel === Channel.telegram ? this.webhookUrlForTelegram(r.id) : '',
    };
  }
}
