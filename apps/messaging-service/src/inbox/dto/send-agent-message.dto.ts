import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class SendAgentMessageDto {
  @ApiProperty({ example: 'Bom dia! Já verificámos o estado da sua encomenda.', maxLength: 16000 })
  @IsString()
  @MinLength(1)
  @MaxLength(16000)
  content!: string;
}
