import { connect, type ConfirmChannel } from 'amqplib';
import { assertRelayTopology } from './topology';

export type AmqpConnection = Awaited<ReturnType<typeof connect>>;

export async function createAmqpConnection(url: string): Promise<AmqpConnection> {
  return connect(url);
}

export async function createPublisherChannel(url: string): Promise<ConfirmChannel> {
  const conn = await createAmqpConnection(url);
  const ch = await conn.createConfirmChannel();
  await assertRelayTopology(ch);
  return ch;
}
