import { Inject, Logger } from '@nestjs/common';
import { RedisKeys, type Redis } from '@relaydesk/redis';
import type { RealtimeOutboundPayload } from '@relaydesk/shared-types';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import { ConversationTenantService } from './conversation-tenant.service';
import { REALTIME_REDIS } from './realtime-redis.token';
import { WsEventRateLimiterService } from './ws-event-rate-limiter.service';
import { WsJwtService, type WsUser } from './ws-jwt.service';

@WebSocketGateway({
  namespace: '/realtime',
  cors: { origin: true, credentials: true },
  pingInterval: 25_000,
  pingTimeout: 20_000,
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(EventsGateway.name);

  constructor(
    private readonly wsJwt: WsJwtService,
    private readonly conversationTenant: ConversationTenantService,
    private readonly wsRate: WsEventRateLimiterService,
    @Inject(REALTIME_REDIS) private readonly redis: Redis,
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    try {
      const token =
        (client.handshake.auth?.token as string | undefined) ??
        (client.handshake.query?.token as string | undefined);
      if (!token) {
        client.disconnect(true);
        return;
      }
      const user = this.wsJwt.verify(token);
      (client.data as { user: WsUser }).user = user;
      await client.join(this.tenantRoom(user.tenantId));
      await this.redis.set(RedisKeys.presence(user.tenantId, user.sub), '1', 'EX', 120);
      this.server.to(this.tenantRoom(user.tenantId)).emit('presence:update', { userId: user.sub, online: true });
      this.logger.log(`WS conectado user=${user.sub} tenant=${user.tenantId}`);
    } catch {
      client.disconnect(true);
    }
  }

  async handleDisconnect(client: Socket): Promise<void> {
    const user = (client.data as { user?: WsUser }).user;
    if (!user) return;
    await this.redis.del(RedisKeys.presence(user.tenantId, user.sub));
    this.server.to(this.tenantRoom(user.tenantId)).emit('presence:update', { userId: user.sub, online: false });
  }

  /** Fan-out a partir do consumidor RabbitMQ (`RealtimeBridgeService`). */
  broadcastRelay(envelope: RealtimeOutboundPayload): void {
    if (!this.server) {
      this.logger.warn('Socket server ainda não inicializado');
      return;
    }
    this.server.to(this.tenantRoom(envelope.tenantId)).emit('relay:event', envelope);
    this.server.to(this.conversationRoom(envelope.conversationId)).emit('relay:event', envelope);
  }

  @SubscribeMessage('conversation:join')
  async joinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { conversationId: string },
  ): Promise<{ ok: boolean; error?: string }> {
    const user = (client.data as { user?: WsUser }).user;
    if (!user || !body?.conversationId) return { ok: false, error: 'unauthorized' };
    const allowed = await this.wsRate.allowConversationJoin(user.sub);
    if (!allowed) return { ok: false, error: 'rate_limited' };
    const ok = await this.conversationTenant.belongsToTenant(body.conversationId, user.tenantId);
    if (!ok) return { ok: false, error: 'forbidden' };
    await client.join(this.conversationRoom(body.conversationId));
    return { ok: true };
  }

  @SubscribeMessage('conversation:leave')
  async leaveConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { conversationId: string },
  ): Promise<void> {
    if (!body?.conversationId) return;
    await client.leave(this.conversationRoom(body.conversationId));
  }

  @SubscribeMessage('ping')
  handlePing(): { event: string; t: number } {
    return { event: 'pong', t: Date.now() };
  }

  @SubscribeMessage('typing:start')
  async typingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { conversationId: string },
  ): Promise<void> {
    const user = (client.data as { user?: WsUser }).user;
    if (!user || !body?.conversationId) return;
    const allowed = await this.wsRate.allowTyping(user.sub);
    if (!allowed) return;
    await this.redis.set(RedisKeys.typing(body.conversationId), user.sub, 'EX', 10);
    client.to(this.tenantRoom(user.tenantId)).emit('typing', {
      conversationId: body.conversationId,
      userId: user.sub,
      typing: true,
    });
  }

  @SubscribeMessage('typing:stop')
  async typingStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { conversationId: string },
  ): Promise<void> {
    const user = (client.data as { user?: WsUser }).user;
    if (!user || !body?.conversationId) return;
    await this.redis.del(RedisKeys.typing(body.conversationId));
    client.to(this.tenantRoom(user.tenantId)).emit('typing', {
      conversationId: body.conversationId,
      userId: user.sub,
      typing: false,
    });
  }

  private tenantRoom(tenantId: string): string {
    return `tenant:${tenantId}`;
  }

  private conversationRoom(conversationId: string): string {
    return `conversation:${conversationId}`;
  }
}
