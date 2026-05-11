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
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Message } from '@relaydesk/database';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { JwtPayload } from '../auth/jwt.strategy';
import { SendAgentMessageDto } from './dto/send-agent-message.dto';
import { InboxService, type InboxConversationRow } from './inbox.service';

@ApiTags('Inbox')
@ApiBearerAuth('access-token')
@Controller('v1/inbox')
@UseGuards(JwtAuthGuard)
export class InboxController {
  constructor(private readonly inbox: InboxService) {}

  @Get('conversations')
  @ApiOperation({ summary: 'Listar conversas do tenant (inbox)' })
  @ApiResponse({
    status: 200,
    description: 'Lista de conversas (envelope RelayDesk).',
    schema: {
      example: {
        success: true,
        data: [
          {
            id: 'clx…',
            channel: 'internal',
            customerName: 'Cliente',
            status: 'open',
            lastMessagePreview: 'Olá',
            unreadCount: 0,
          },
        ],
        meta: { apiVersion: '2024-06-01', requestId: '…', correlationId: '…' },
      },
    },
  })
  async list(@Req() req: Request & { user: JwtPayload }): Promise<InboxConversationRow[]> {
    return this.inbox.listConversations(req.user);
  }

  @Get('conversations/:conversationId/messages')
  @ApiOperation({ summary: 'Listar mensagens de uma conversa' })
  @ApiResponse({ status: 404, description: 'Conversa inexistente ou fora do tenant' })
  async messages(
    @Param('conversationId') conversationId: string,
    @Req() req: Request & { user: JwtPayload },
  ): Promise<Message[]> {
    return this.inbox.listMessages(conversationId, req.user);
  }

  @Post('conversations/:conversationId/messages')
  @ApiOperation({ summary: 'Enviar mensagem de agente (inbox web)' })
  @ApiHeader({ name: 'x-correlation-id', required: false })
  @ApiResponse({ status: 201, description: 'Mensagem criada' })
  async send(
    @Param('conversationId') conversationId: string,
    @Body() dto: SendAgentMessageDto,
    @Headers('x-correlation-id') correlationId: string | undefined,
    @Req() req: Request & { user: JwtPayload },
  ): Promise<Message> {
    return this.inbox.sendAgentMessage(conversationId, req.user, dto.content, correlationId);
  }
}
