import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Message } from '@relaydesk/database';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { JwtPayload } from '../auth/jwt.strategy';
import { SendAgentMessageDto } from './dto/send-agent-message.dto';
import { InboxService, type InboxConversationRow } from './inbox.service';

@Controller('inbox')
@UseGuards(JwtAuthGuard)
export class InboxController {
  constructor(private readonly inbox: InboxService) {}

  @Get('conversations')
  async list(@Req() req: Request & { user: JwtPayload }): Promise<InboxConversationRow[]> {
    return this.inbox.listConversations(req.user);
  }

  @Get('conversations/:conversationId/messages')
  async messages(
    @Param('conversationId') conversationId: string,
    @Req() req: Request & { user: JwtPayload },
  ): Promise<Message[]> {
    return this.inbox.listMessages(conversationId, req.user);
  }

  @Post('conversations/:conversationId/messages')
  async send(
    @Param('conversationId') conversationId: string,
    @Body() dto: SendAgentMessageDto,
    @Headers('x-correlation-id') correlationId: string | undefined,
    @Req() req: Request & { user: JwtPayload },
  ): Promise<Message> {
    return this.inbox.sendAgentMessage(conversationId, req.user, dto.content, correlationId);
  }
}
