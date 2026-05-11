import {
  Controller,
  Get,
  Param,
  Post,
  HttpCode,
  HttpStatus,
  Query,
  Req,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { prisma } from '@relaydesk/database';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { JwtPayload } from '../auth/jwt.strategy';

@ApiTags('Webhook Deliveries')
@ApiBearerAuth('access-token')
@Controller('v1/webhook-deliveries')
@UseGuards(JwtAuthGuard)
export class WebhookDeliveriesController {
  @Get()
  @ApiOperation({
    summary: 'List webhook delivery attempts',
    description: 'Returns a paginated history of webhook delivery attempts for the tenant, newest first.',
  })
  @ApiQuery({ name: 'subscriptionId', required: false, description: 'Filter by subscription' })
  @ApiQuery({ name: 'status', required: false, enum: ['pending', 'sending', 'delivered', 'failed', 'dead'] })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({ name: 'offset', required: false, example: 0 })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        data: [
          {
            id: 'clx…',
            subscriptionId: 'clx…',
            eventType: 'conversation.created',
            status: 'delivered',
            attempts: 1,
            httpStatus: 200,
            latencyMs: 142,
            createdAt: '2026-05-11T00:00:00.000Z',
          },
        ],
        total: 1,
        limit: 20,
        offset: 0,
      },
    },
  })
  async list(
    @Req() req: Request & { user: JwtPayload },
    @Query('subscriptionId') subscriptionId?: string,
    @Query('status') status?: string,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit = 20,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset = 0,
  ) {
    const cappedLimit = Math.min(limit, 100);
    const where = {
      tenantId: req.user.tenantId,
      ...(subscriptionId && { subscriptionId }),
      ...(status && { status: status as never }),
    };

    const [rows, total] = await prisma.$transaction([
      prisma.webhookEngineDelivery.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: cappedLimit,
        skip: offset,
        select: {
          id: true,
          subscriptionId: true,
          eventType: true,
          idempotencyKey: true,
          status: true,
          attempts: true,
          httpStatus: true,
          responseSnippet: true,
          lastError: true,
          correlationId: true,
          nextAttemptAt: true,
          createdAt: true,
          updatedAt: true,
          // latencyMs stored in metadata
        },
      }),
      prisma.webhookEngineDelivery.count({ where }),
    ]);

    return { data: rows, total, limit: cappedLimit, offset };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single delivery attempt with full payload' })
  @ApiParam({ name: 'id', description: 'Delivery ID' })
  @ApiResponse({ status: 404, description: 'Delivery not found' })
  async findOne(
    @Param('id') id: string,
    @Req() req: Request & { user: JwtPayload },
  ) {
    const delivery = await prisma.webhookEngineDelivery.findFirst({
      where: { id, tenantId: req.user.tenantId },
    });
    if (!delivery) throw new NotFoundException(`Delivery ${id} not found`);
    return delivery;
  }

  @Post(':id/replay')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Replay a delivery',
    description: 'Re-enqueues a delivery attempt. Useful for recovering from endpoint downtime. A new idempotency key is generated.',
  })
  @ApiParam({ name: 'id', description: 'Delivery ID to replay' })
  @ApiResponse({ status: 202, schema: { example: { replayDeliveryId: 'clx…' } } })
  async replay(
    @Param('id') id: string,
    @Req() req: Request & { user: JwtPayload },
  ) {
    const original = await prisma.webhookEngineDelivery.findFirst({
      where: { id, tenantId: req.user.tenantId },
    });
    if (!original) throw new NotFoundException(`Delivery ${id} not found`);

    const { randomBytes } = await import('node:crypto');
    const replay = await prisma.webhookEngineDelivery.create({
      data: {
        tenantId: original.tenantId,
        subscriptionId: original.subscriptionId,
        eventType: original.eventType,
        idempotencyKey: `replay:${id}:${randomBytes(6).toString('hex')}`,
        payload: original.payload,
        correlationId: `replay:${original.correlationId ?? id}`,
      },
    });

    return { replayDeliveryId: replay.id };
  }
}
