import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
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
      services: ['auth', 'messaging', 'websocket', 'webhooks', 'automations'],
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
}
