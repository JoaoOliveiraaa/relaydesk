import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export enum WebhookEventType {
  // Conversations
  CONVERSATION_CREATED = 'conversation.created',
  CONVERSATION_UPDATED = 'conversation.updated',
  CONVERSATION_RESOLVED = 'conversation.resolved',
  CONVERSATION_ASSIGNED = 'conversation.assigned',
  // Messages
  MESSAGE_RECEIVED = 'message.received',
  MESSAGE_SENT = 'message.sent',
  // Contacts
  CONTACT_CREATED = 'contact.created',
  CONTACT_UPDATED = 'contact.updated',
  // System
  WEBHOOK_TEST = 'webhook.test',
}

export class RetryPolicyDto {
  @ApiProperty({ example: 5, description: 'Maximum delivery attempts (1-10)' })
  @IsInt()
  @Min(1)
  @Max(10)
  maxAttempts: number = 5;

  @ApiProperty({ example: 2, description: 'Exponential backoff base in seconds (1-60)' })
  @IsInt()
  @Min(1)
  @Max(60)
  backoffBase: number = 2;

  @ApiProperty({ example: 300, description: 'Maximum backoff cap in seconds (60-3600)' })
  @IsInt()
  @Min(60)
  @Max(3600)
  backoffCap: number = 300;

  @ApiProperty({ example: 30, description: 'HTTP request timeout in seconds (5-120)' })
  @IsInt()
  @Min(5)
  @Max(120)
  timeoutSeconds: number = 30;
}

export class CreateWebhookDto {
  @ApiProperty({
    example: 'https://example.com/webhooks/relaydesk',
    description: 'HTTPS endpoint that will receive webhook deliveries',
  })
  @IsUrl({ protocols: ['https', 'http'], require_tld: false })
  url: string;

  @ApiPropertyOptional({
    example: 'Production CRM integration',
    description: 'Human-readable description',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    enum: WebhookEventType,
    isArray: true,
    example: ['conversation.created', 'message.received'],
    description: 'List of event types this subscription listens to. Use ["*"] for all events.',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @IsString({ each: true })
  eventTypes: string[];

  @ApiPropertyOptional({
    description: 'Retry policy configuration. Defaults apply if omitted.',
    type: RetryPolicyDto,
  })
  @IsOptional()
  retryPolicy?: RetryPolicyDto;
}
