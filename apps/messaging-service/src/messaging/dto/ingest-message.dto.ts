import { IsDateString, IsIn, IsObject, IsOptional, IsString } from 'class-validator';
import { RELAY_CHANNELS } from '@relaydesk/shared-types';

export class IngestMessageDto {
  @IsString()
  id!: string;

  @IsString()
  tenantId!: string;

  @IsIn([...RELAY_CHANNELS])
  channel!: (typeof RELAY_CHANNELS)[number];

  @IsString()
  sender!: string;

  @IsString()
  content!: string;

  @IsDateString()
  timestamp!: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
