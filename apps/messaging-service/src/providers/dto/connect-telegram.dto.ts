import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class ConnectTelegramDto {
  @ApiProperty({ description: 'Token do bot (@BotFather)', example: '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11' })
  @IsString()
  @MinLength(20)
  botToken!: string;

  @ApiPropertyOptional({ description: 'Nome apresentado no dashboard' })
  @IsOptional()
  @IsString()
  displayName?: string;
}
