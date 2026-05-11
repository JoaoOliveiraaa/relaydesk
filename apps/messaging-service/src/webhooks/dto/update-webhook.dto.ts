import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { RetryPolicyDto } from './create-webhook.dto';

export class UpdateWebhookDto {
  @ApiPropertyOptional({ example: 'https://new.example.com/hook' })
  @IsOptional()
  @IsUrl({ protocols: ['https', 'http'], require_tld: false })
  url?: string;

  @ApiPropertyOptional({ example: 'Updated description' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    isArray: true,
    example: ['conversation.created'],
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @IsString({ each: true })
  eventTypes?: string[];

  @ApiPropertyOptional({ example: true, description: 'Activate or pause delivery' })
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiPropertyOptional({ type: RetryPolicyDto })
  @IsOptional()
  retryPolicy?: RetryPolicyDto;
}
