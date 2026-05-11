import { Injectable } from '@nestjs/common';
import { startActiveSpan } from '@relaydesk/otel';
import { SpanStatusCode } from '@opentelemetry/api';

type TelegramOk<T> = { ok: true; result: T };
type TelegramErr = {
  ok: false;
  error_code?: number;
  description?: string;
  parameters?: { retry_after?: number };
};

@Injectable()
export class TelegramApiClient {
  private baseUrl(botToken: string): string {
    return `https://api.telegram.org/bot${botToken}`;
  }

  async getMe(botToken: string): Promise<TelegramOk<{ id: number; username?: string; first_name?: string }> | TelegramErr> {
    const url = `${this.baseUrl(botToken)}/getMe`;
    const res = await fetch(url, { method: 'GET', signal: AbortSignal.timeout(15_000) });
    return (await res.json()) as TelegramOk<{ id: number; username?: string; first_name?: string }> | TelegramErr;
  }

  async setWebhook(
    botToken: string,
    webhookUrl: string,
    secretToken: string,
  ): Promise<TelegramOk<true> | TelegramErr> {
    const url = `${this.baseUrl(botToken)}/setWebhook`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        url: webhookUrl,
        secret_token: secretToken,
        allowed_updates: ['message', 'edited_message', 'channel_post', 'edited_channel_post'],
      }),
      signal: AbortSignal.timeout(20_000),
    });
    return (await res.json()) as TelegramOk<true> | TelegramErr;
  }

  async sendMessage(
    botToken: string,
    chatId: string,
    text: string,
  ): Promise<TelegramOk<{ message_id: number }> | TelegramErr> {
    return startActiveSpan(
      'relaydesk.telegram',
      'telegram.sendMessage',
      { attributes: { 'relaydesk.provider': 'telegram', 'telegram.chat_id': chatId } },
      async (span) => {
        const t0 = Date.now();
        try {
          const url = `${this.baseUrl(botToken)}/sendMessage`;
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text,
              disable_web_page_preview: true,
            }),
            signal: AbortSignal.timeout(25_000),
          });
          const body = (await res.json()) as TelegramOk<{ message_id: number }> | TelegramErr;
          span.setAttribute('relaydesk.telegram.http_status', res.status);
          span.setAttribute('relaydesk.telegram.latency_ms', Date.now() - t0);
          if (!body.ok) {
            span.setStatus({ code: SpanStatusCode.ERROR, message: body.description });
            span.setAttribute('telegram.error_code', body.error_code ?? 0);
          }
          return body;
        } catch (e) {
          span.recordException(e instanceof Error ? e : new Error(String(e)));
          span.setStatus({ code: SpanStatusCode.ERROR });
          throw e;
        }
      },
    );
  }
}
