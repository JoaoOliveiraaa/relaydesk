import { PrismaClient, Channel, Plan, UserRole, ConversationStatus, MessageSenderType, MessageSource } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEMO_TENANT_SLUG = 'demo';
const DEMO_USER_EMAIL = 'owner@demo.relaydesk.local';
const DEMO_PASSWORD = 'Demo123456!';

async function main(): Promise<void> {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  const tenant = await prisma.tenant.upsert({
    where: { slug: DEMO_TENANT_SLUG },
    create: {
      name: 'Tenant Demo (seed)',
      slug: DEMO_TENANT_SLUG,
      plan: Plan.pro,
      metadata: { source: 'prisma-seed', purpose: 'local-staging-demo' },
    },
    update: {
      name: 'Tenant Demo (seed)',
      metadata: { source: 'prisma-seed', purpose: 'local-staging-demo' },
    },
  });

  const user = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: DEMO_USER_EMAIL } },
    create: {
      tenantId: tenant.id,
      email: DEMO_USER_EMAIL,
      passwordHash,
      role: UserRole.owner,
      metadata: { seed: true },
    },
    update: {
      passwordHash,
      role: UserRole.owner,
    },
  });

  const conversation = await prisma.conversation.upsert({
    where: { id: 'seed_demo_conversation_01' },
    create: {
      id: 'seed_demo_conversation_01',
      tenantId: tenant.id,
      channel: Channel.internal,
      customerName: 'Cliente Demo',
      status: ConversationStatus.open,
      lastMessageAt: new Date(),
      lastMessagePreview: 'Bem-vindo ao inbox demo (seed).',
      metadata: { seed: true },
    },
    update: {
      lastMessageAt: new Date(),
      lastMessagePreview: 'Bem-vindo ao inbox demo (seed).',
    },
  });

  await prisma.message.upsert({
    where: { id: 'seed_demo_message_01' },
    create: {
      id: 'seed_demo_message_01',
      conversationId: conversation.id,
      senderType: MessageSenderType.system,
      source: MessageSource.system,
      content: 'Conversa criada pelo seed Prisma — use para testes de inbox e realtime.',
      metadata: { seed: true },
    },
    update: {
      content: 'Conversa criada pelo seed Prisma — use para testes de inbox e realtime.',
    },
  });

  console.log('[seed] OK', {
    tenantId: tenant.id,
    slug: tenant.slug,
    userId: user.id,
    email: user.email,
    conversationId: conversation.id,
    demoPassword: DEMO_PASSWORD,
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
