import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { InboxService } from '../inbox/inbox.service';
import { InternalServiceGuard } from './internal-service.guard';

@ApiTags('Platform (internal)')
@ApiSecurity('internal-token')
@Controller('internal/v1/conversations')
@UseGuards(InternalServiceGuard)
export class InternalConversationsController {
  constructor(private readonly inbox: InboxService) {}

  @Get(':conversationId/tenants/:tenantId/membership')
  @ApiOperation({ summary: 'Validar que a conversa pertence ao tenant (machine-to-machine)' })
  @ApiResponse({ status: 200, description: 'Membro do tenant' })
  @ApiResponse({ status: 403, description: 'Token interno inválido' })
  @ApiResponse({ status: 404, description: 'Conversa não encontrada' })
  async membership(
    @Param('conversationId') conversationId: string,
    @Param('tenantId') tenantId: string,
  ): Promise<{ ok: true; conversationId: string }> {
    await this.inbox.assertConversationInTenant(conversationId, tenantId);
    return { ok: true, conversationId };
  }
}
