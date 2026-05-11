import { Injectable } from '@nestjs/common';
import { prisma } from '@relaydesk/database';

@Injectable()
export class ConversationTenantService {
  async belongsToTenant(conversationId: string, tenantId: string): Promise<boolean> {
    const row = await prisma.conversation.findFirst({
      where: { id: conversationId, tenantId, deletedAt: null },
      select: { id: true },
    });
    return !!row;
  }
}
