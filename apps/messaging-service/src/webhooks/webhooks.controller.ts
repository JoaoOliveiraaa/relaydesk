import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { JwtPayload } from '../auth/jwt.strategy';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { UpdateWebhookDto } from './dto/update-webhook.dto';
import { WebhooksService } from './webhooks.service';

@ApiTags('Webhooks')
@ApiBearerAuth('access-token')
@Controller('v1/webhooks')
@UseGuards(JwtAuthGuard)
export class WebhooksController {
  constructor(private readonly webhooks: WebhooksService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a webhook subscription',
    description: `
Creates a new webhook endpoint for receiving real-time event notifications.

The response includes a **\`secret\`** field (\`whsec_…\`) — store it securely.
It is only returned once at creation. Use it to verify \`x-relaydesk-signature\` headers.

**Signature verification (Node.js)**:
\`\`\`ts
import { createHmac } from 'crypto';

function verify(secret: string, payload: string, timestamp: string, signature: string): boolean {
  const toSign = \`\${timestamp}.\${payload}\`;
  const expected = createHmac('sha256', secret).update(toSign).digest('hex');
  return \`t=\${timestamp},v1=\${expected}\` === signature;
}
\`\`\`
    `.trim(),
  })
  @ApiResponse({
    status: 201,
    description: 'Webhook created. Secret returned once — store immediately.',
    schema: {
      example: {
        id: 'clx…',
        url: 'https://example.com/webhooks',
        description: 'Production CRM',
        eventTypes: ['conversation.created', 'message.received'],
        state: 'active',
        secretHint: 'whsec_abc12...',
        secret: 'whsec_abc123456789fullsecrethere',
        retryPolicy: { maxAttempts: 5, backoffBase: 2, backoffCap: 300, timeoutSeconds: 30 },
        createdAt: '2026-05-11T00:00:00.000Z',
        updatedAt: '2026-05-11T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 409, description: 'Tenant has reached the 20 subscription limit' })
  async create(
    @Body() dto: CreateWebhookDto,
    @Req() req: Request & { user: JwtPayload },
  ) {
    return this.webhooks.create(dto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'List all webhook subscriptions for the tenant' })
  @ApiResponse({
    status: 200,
    description: 'Array of webhook subscriptions (secrets not included).',
    schema: {
      example: [
        {
          id: 'clx…',
          url: 'https://example.com/webhooks',
          eventTypes: ['conversation.created'],
          state: 'active',
          secretHint: 'whsec_abc12...',
        },
      ],
    },
  })
  async list(@Req() req: Request & { user: JwtPayload }) {
    return this.webhooks.list(req.user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a webhook subscription by ID' })
  @ApiParam({ name: 'id', description: 'Webhook subscription ID' })
  @ApiResponse({ status: 404, description: 'Subscription not found or not owned by tenant' })
  async findOne(
    @Param('id') id: string,
    @Req() req: Request & { user: JwtPayload },
  ) {
    return this.webhooks.findOne(id, req.user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a webhook subscription' })
  @ApiParam({ name: 'id', description: 'Webhook subscription ID' })
  @ApiResponse({ status: 200, description: 'Updated subscription' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateWebhookDto,
    @Req() req: Request & { user: JwtPayload },
  ) {
    return this.webhooks.update(id, dto, req.user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete (soft-delete) a webhook subscription' })
  @ApiParam({ name: 'id', description: 'Webhook subscription ID' })
  @ApiResponse({ status: 204, description: 'Subscription deleted' })
  async remove(
    @Param('id') id: string,
    @Req() req: Request & { user: JwtPayload },
  ) {
    await this.webhooks.remove(id, req.user);
  }

  @Post(':id/rotate-secret')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Rotate the signing secret',
    description: 'Generates a new HMAC secret. Old secret becomes invalid immediately. Store the returned secret securely — shown once.',
  })
  @ApiParam({ name: 'id', description: 'Webhook subscription ID' })
  @ApiResponse({
    status: 200,
    schema: { example: { secret: 'whsec_newSecretValue…' } },
  })
  async rotateSecret(
    @Param('id') id: string,
    @Req() req: Request & { user: JwtPayload },
  ) {
    return this.webhooks.rotateSecret(id, req.user);
  }

  @Post(':id/test')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Send a test event to the webhook endpoint',
    description: 'Enqueues a `webhook.test` delivery to verify your endpoint is reachable and processing signatures correctly.',
  })
  @ApiParam({ name: 'id', description: 'Webhook subscription ID' })
  @ApiResponse({
    status: 202,
    schema: { example: { deliveryId: 'clx…' } },
  })
  async sendTest(
    @Param('id') id: string,
    @Req() req: Request & { user: JwtPayload },
  ) {
    return this.webhooks.sendTest(id, req.user);
  }
}
