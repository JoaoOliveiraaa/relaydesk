import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { SkipResponseEnvelope } from '@relaydesk/common';
import { GatewayService } from './gateway.service';

@SkipResponseEnvelope()
@ApiTags('Gateway')
@Controller()
export class GatewayController {
  constructor(private readonly gateway: GatewayService) {}

  @Get('meta')
  @ApiOperation({ summary: 'Metadados do API Gateway (sem envelope — proxy raw)' })
  @ApiResponse({ status: 200 })
  meta() {
    return {
      name: 'RelayDesk API Gateway',
      version: '0.1.0',
      services: ['auth', 'messaging', 'websocket', 'webhooks', 'automations', 'providers'],
    };
  }

  @Post('auth/register')
  async register(@Body() body: unknown, @Req() req: Request, @Res() res: Response) {
    const r = await this.gateway.proxyAuth('/v1/auth/register', 'POST', body, this.gateway.buildForwardHeaders(req));
    return res.status(r.status).json(r.data);
  }

  @Post('auth/login')
  async login(@Body() body: unknown, @Req() req: Request, @Res() res: Response) {
    const r = await this.gateway.proxyAuth('/v1/auth/login', 'POST', body, this.gateway.buildForwardHeaders(req));
    return res.status(r.status).json(r.data);
  }

  @Post('auth/refresh')
  async refresh(@Body() body: unknown, @Req() req: Request, @Res() res: Response) {
    const r = await this.gateway.proxyAuth('/v1/auth/refresh', 'POST', body, this.gateway.buildForwardHeaders(req));
    return res.status(r.status).json(r.data);
  }

  @Get('auth/me')
  async me(@Req() req: Request, @Res() res: Response) {
    const h = this.gateway.buildForwardHeaders(req);
    const r = await this.gateway.proxyAuth('/v1/auth/me', 'GET', undefined, h);
    return res.status(r.status).json(r.data);
  }

  @Post('messages/ingest')
  async ingest(@Body() body: unknown, @Req() req: Request, @Res() res: Response) {
    const r = await this.gateway.proxyMessaging('/v1/messages/ingest', 'POST', body, this.gateway.buildForwardHeaders(req));
    return res.status(r.status).json(r.data);
  }

  @Post('providers/telegram/webhook/:connectionId')
  @ApiTags('Providers · Telegram')
  @ApiOperation({ summary: 'Webhook público Telegram (proxy para messaging-service)' })
  @ApiParam({ name: 'connectionId' })
  async telegramWebhook(
    @Param('connectionId') connectionId: string,
    @Body() body: unknown,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const r = await this.gateway.proxyMessaging(
      `/v1/providers/telegram/webhook/${encodeURIComponent(connectionId)}`,
      'POST',
      body,
      this.gateway.buildForwardHeaders(req),
    );
    return res.status(r.status).json(r.data);
  }

  @Get('inbox/conversations')
  async inboxConversations(@Req() req: Request, @Res() res: Response) {
    const r = await this.gateway.proxyMessaging('/v1/inbox/conversations', 'GET', undefined, this.gateway.buildForwardHeaders(req));
    return res.status(r.status).json(r.data);
  }

  @Get('inbox/conversations/:conversationId/messages')
  async inboxMessages(
    @Param('conversationId') conversationId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const r = await this.gateway.proxyMessaging(
      `/v1/inbox/conversations/${encodeURIComponent(conversationId)}/messages`,
      'GET',
      undefined,
      this.gateway.buildForwardHeaders(req),
    );
    return res.status(r.status).json(r.data);
  }

  @Get('channel-connections')
  @ApiTags('Channel connections')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Listar ligações de canal' })
  async listChannelConnections(@Req() req: Request, @Res() res: Response) {
    const r = await this.gateway.proxyMessaging('/v1/channel-connections', 'GET', undefined, this.gateway.buildForwardHeaders(req));
    return res.status(r.status).json(r.data);
  }

  @Post('channel-connections/telegram')
  @ApiTags('Channel connections')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Ligar bot Telegram' })
  async connectTelegram(@Body() body: unknown, @Req() req: Request, @Res() res: Response) {
    const r = await this.gateway.proxyMessaging('/v1/channel-connections/telegram', 'POST', body, this.gateway.buildForwardHeaders(req));
    return res.status(r.status).json(r.data);
  }

  @Get('channel-connections/:id')
  @ApiTags('Channel connections')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Detalhe de ligação de canal' })
  @ApiParam({ name: 'id' })
  async getChannelConnection(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    const r = await this.gateway.proxyMessaging(
      `/v1/channel-connections/${encodeURIComponent(id)}`,
      'GET',
      undefined,
      this.gateway.buildForwardHeaders(req),
    );
    return res.status(r.status).json(r.data);
  }

  @Post('inbox/conversations/:conversationId/messages')
  async inboxSend(
    @Param('conversationId') conversationId: string,
    @Body() body: unknown,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const r = await this.gateway.proxyMessaging(
      `/v1/inbox/conversations/${encodeURIComponent(conversationId)}/messages`,
      'POST',
      body,
      this.gateway.buildForwardHeaders(req),
    );
    return res.status(r.status).json(r.data);
  }

  // ————— Webhooks —————

  @Post('webhooks')
  @ApiTags('Webhooks')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create a webhook subscription', description: 'Secret returned once — store it immediately.' })
  @ApiResponse({ status: 201 })
  async createWebhook(@Body() body: unknown, @Req() req: Request, @Res() res: Response) {
    const r = await this.gateway.proxyMessaging('/v1/webhooks', 'POST', body, this.gateway.buildForwardHeaders(req));
    return res.status(r.status).json(r.data);
  }

  @Get('webhooks')
  @ApiTags('Webhooks')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'List webhook subscriptions for the tenant' })
  async listWebhooks(@Req() req: Request, @Res() res: Response) {
    const r = await this.gateway.proxyMessaging('/v1/webhooks', 'GET', undefined, this.gateway.buildForwardHeaders(req));
    return res.status(r.status).json(r.data);
  }

  @Get('webhooks/:id')
  @ApiTags('Webhooks')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get a webhook subscription by ID' })
  @ApiParam({ name: 'id' })
  async getWebhook(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    const r = await this.gateway.proxyMessaging(`/v1/webhooks/${encodeURIComponent(id)}`, 'GET', undefined, this.gateway.buildForwardHeaders(req));
    return res.status(r.status).json(r.data);
  }

  @Patch('webhooks/:id')
  @ApiTags('Webhooks')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update a webhook subscription' })
  @ApiParam({ name: 'id' })
  async updateWebhook(@Param('id') id: string, @Body() body: unknown, @Req() req: Request, @Res() res: Response) {
    const r = await this.gateway.proxyMessaging(`/v1/webhooks/${encodeURIComponent(id)}`, 'PATCH', body, this.gateway.buildForwardHeaders(req));
    return res.status(r.status).json(r.data);
  }

  @Delete('webhooks/:id')
  @ApiTags('Webhooks')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Delete a webhook subscription' })
  @ApiParam({ name: 'id' })
  async deleteWebhook(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    const r = await this.gateway.proxyMessaging(`/v1/webhooks/${encodeURIComponent(id)}`, 'DELETE', undefined, this.gateway.buildForwardHeaders(req));
    return res.status(r.status).json(r.data);
  }

  @Post('webhooks/:id/rotate-secret')
  @ApiTags('Webhooks')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Rotate webhook signing secret' })
  @ApiParam({ name: 'id' })
  async rotateWebhookSecret(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    const r = await this.gateway.proxyMessaging(`/v1/webhooks/${encodeURIComponent(id)}/rotate-secret`, 'POST', undefined, this.gateway.buildForwardHeaders(req));
    return res.status(r.status).json(r.data);
  }

  @Post('webhooks/:id/test')
  @ApiTags('Webhooks')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Send a test event to a webhook subscription' })
  @ApiParam({ name: 'id' })
  async testWebhook(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    const r = await this.gateway.proxyMessaging(`/v1/webhooks/${encodeURIComponent(id)}/test`, 'POST', undefined, this.gateway.buildForwardHeaders(req));
    return res.status(r.status).json(r.data);
  }

  @Get('webhook-deliveries')
  @ApiTags('Webhook Deliveries')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'List webhook delivery attempts' })
  @ApiQuery({ name: 'subscriptionId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'offset', required: false })
  async listDeliveries(@Query() query: Record<string, string>, @Req() req: Request, @Res() res: Response) {
    const qs = new URLSearchParams(query).toString();
    const r = await this.gateway.proxyMessaging(`/v1/webhook-deliveries${qs ? `?${qs}` : ''}`, 'GET', undefined, this.gateway.buildForwardHeaders(req));
    return res.status(r.status).json(r.data);
  }

  @Get('webhook-deliveries/:id')
  @ApiTags('Webhook Deliveries')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get a single delivery attempt' })
  @ApiParam({ name: 'id' })
  async getDelivery(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    const r = await this.gateway.proxyMessaging(`/v1/webhook-deliveries/${encodeURIComponent(id)}`, 'GET', undefined, this.gateway.buildForwardHeaders(req));
    return res.status(r.status).json(r.data);
  }

  @Post('webhook-deliveries/:id/replay')
  @ApiTags('Webhook Deliveries')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Replay a webhook delivery' })
  @ApiParam({ name: 'id' })
  async replayDelivery(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    const r = await this.gateway.proxyMessaging(`/v1/webhook-deliveries/${encodeURIComponent(id)}/replay`, 'POST', undefined, this.gateway.buildForwardHeaders(req));
    return res.status(r.status).json(r.data);
  }
}
