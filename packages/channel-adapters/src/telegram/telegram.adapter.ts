import type { IncomingMessage } from '@relaydesk/shared-types';
import type { ChannelInboundAdapter, ChannelInboundContext } from '../provider';

type TgUser = { id?: number; username?: string; first_name?: string; last_name?: string };
type TgChat = { id?: number; type?: string; username?: string; first_name?: string; title?: string };

type TgMessage = {
  message_id?: number;
  date?: number;
  chat?: TgChat;
  from?: TgUser;
  text?: string;
  caption?: string;
};

type TgUpdate = {
  update_id?: number;
  message?: TgMessage;
  edited_message?: TgMessage;
  channel_post?: TgMessage;
  edited_channel_post?: TgMessage;
};

function pickMessage(u: TgUpdate): TgMessage | undefined {
  return (
    u.message ??
    u.edited_message ??
    u.channel_post ??
    u.edited_channel_post
  );
}

function displayName(from: TgUser | undefined, chat: TgChat | undefined): string {
  if (from?.username) return `@${from.username}`;
  if (from?.first_name) return [from.first_name, from.last_name].filter(Boolean).join(' ');
  if (chat?.username) return `@${chat.username}`;
  if (chat?.title) return chat.title;
  if (chat?.first_name) return chat.first_name;
  return 'Telegram user';
}

/**
 * Adapter oficial Telegram Bot API → {@link IncomingMessage}.
 * Ignora updates sem texto/caption utilizável (callbacks, stickers, etc.).
 */
export class TelegramChannelAdapter implements ChannelInboundAdapter {
  readonly channel = 'telegram' as const;

  normalizeInbound(raw: unknown, ctx: ChannelInboundContext): IncomingMessage | null {
    const u = raw as TgUpdate;
    const msg = pickMessage(u);
    if (!msg || u.update_id === undefined) return null;

    const chatId = msg.chat?.id;
    if (chatId === undefined) return null;

    const text = (msg.text ?? msg.caption ?? '').trim();
    if (!text) return null;

    const from = msg.from;
    const chat = msg.chat;
    const senderKey = String(from?.id ?? chatId);
    const customerLabel = displayName(from, chat);
    const chatType = chat?.type ?? 'private';
    const isGroup =
      chatType === 'group' || chatType === 'supergroup' || chatType === 'channel';

    const tsSec = msg.date ?? Math.floor(Date.now() / 1000);

    return {
      id: `telegram:${u.update_id}`,
      tenantId: ctx.tenantId,
      channel: 'telegram',
      sender: senderKey,
      customerDisplayName: customerLabel,
      conversationThreadKey: isGroup ? `telegram:chat:${chatId}` : undefined,
      content: text,
      timestamp: new Date(tsSec * 1000),
      metadata: {
        provider: 'telegram',
        channelConnectionId: ctx.channelConnectionId,
        telegramUpdateId: u.update_id,
        telegramMessageId: msg.message_id,
        telegramChatId: chatId,
        chatType,
      },
    };
  }
}
