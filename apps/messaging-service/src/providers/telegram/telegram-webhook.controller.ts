import {
  BadRequestException,
  Controller,
  ForbiddenException,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { randomUUID } from 'crypto';
import { sha256Hex, SkipResponseEnvelope, timingSafeEqualHex } from '@relaydesk/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import type { Counter } from 'prom-client';
import {
  RELAY_EVENT_ROUTING,
  type ChannelInboundPayload,
} from '@relaydesk/shared-types';
import { prisma } from '@relaydesk/database';
import { AmqpPublisher } from '../../infra/amqp.publisher';

@ApiTags('Providers · Telegram')
@SkipResponseEnvelope()
@Controller('v1/providers/telegram')
export class TelegramWebhookController {
  constructor(
    private readonly amqp: AmqpPublisher,
    @InjectMetric('relaydesk_telegram_webhook_enqueued_total')
    private readonly webhookEnqueued: Counter<string>,
  ) {}

  @Post('webhook/:connectionId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Webhook Telegram Bot API',
    description:
      'Endpoint público configurado via `setWebhook`. Valida `X-Telegram-Bot-Api-Secret-Token` e publica o update na fila `channel.inbound`.',
  })
  @ApiParam({ name: 'connectionId', description: 'ID da ChannelConnection' })
  @ApiResponse({ status: 200, description: 'Update aceite (processamento assíncrono)' })
  @ApiResponse({ status: 403, description: 'Segredo inválido' })
  async handleWebhook(
    @Param('connectionId') connectionId: string,
    @Headers('x-telegram-bot-api-secret-token') secretToken: string | undefined,
    @Req() req: Request,
  ): Promise<{ ok: true }> {
    const correlationId =
      (typeof req.headers['x-correlation-id'] === 'string' && req.headers['x-correlation-id']) || randomUUID();

    const row = await prisma.channelConnection.findFirst({
      where: { id: connectionId, channel: 'telegram', deletedAt: null },
    });
    if (!row || !row.webhookSecretSha256) {
      this.webhookEnqueued.inc({ outcome: 'unknown_connection' });
      throw new ForbiddenException('Conexão inválida');
    }
    if (!secretToken) {
      this.webhookEnqueued.inc({ outcome: 'missing_secret' });
      throw new ForbiddenException('Cabeçalho secret em falta');
    }
    const h = sha256Hex(secretToken);
    if (!timingSafeEqualHex(h, row.webhookSecretSha256)) {
      this.webhookEnqueued.inc({ outcome: 'bad_secret' });
      throw new ForbiddenException('Segredo inválido');
    }

    const body = req.body as unknown;
    if (!body || typeof body !== 'object') {
      this.webhookEnqueued.inc({ outcome: 'bad_body' });
      throw new BadRequestException('Corpo inválido');
    }

    const update = body as Record<string, unknown>;
    const payload: ChannelInboundPayload = {
      v: 1,
      provider: 'telegram',
      tenantId: row.tenantId,
      connectionId: row.id,
      update,
    };

    await this.amqp.publish(RELAY_EVENT_ROUTING.CHANNEL_INBOUND, payload, {
      messageId: `tg:${String(update.update_id ?? correlationId)}`,
      correlationId,
      relaydesk: {
        tenantId: row.tenantId,
        eventId: String(update.update_id ?? correlationId),
      },
    });
    this.webhookEnqueued.inc({ outcome: 'ok' });

    void prisma.channelConnection
      .update({
        where: { id: row.id },
        data: { inboundLastAt: new Date() },
      })
      .catch(() => undefined);

    return { ok: true };
  }
}
