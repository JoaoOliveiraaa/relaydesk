import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsIn, IsObject, IsOptional, IsString } from 'class-validator';
import { RELAY_CHANNELS } from '@relaydesk/shared-types';

export class IngestMessageDto {
  @ApiProperty({ example: 'ext-msg-001', description: 'Id idempotente do lado do provider' })
  @IsString()
  id!: string;

  @ApiProperty({ example: 'clxtenantid' })
  @IsString()
  tenantId!: string;

  @ApiProperty({ enum: [...RELAY_CHANNELS], example: 'whatsapp' })
  @IsIn([...RELAY_CHANNELS])
  channel!: (typeof RELAY_CHANNELS)[number];

  @ApiProperty({ example: '+351912345678' })
  @IsString()
  sender!: string;

  @ApiProperty({ example: 'Olá, preciso de ajuda com a minha encomenda.' })
  @IsString()
  content!: string;

  @ApiProperty({ example: '2026-05-11T12:00:00.000Z' })
  @IsDateString()
  timestamp!: string;

  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
