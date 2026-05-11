import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class RefreshDto {
  @ApiProperty({
    description: 'Opaque refresh token emitido no login/register.',
    example: 'relaydesk_rt_opaque_token_placeholder',
  })
  @IsString()
  @MinLength(10)
  refreshToken!: string;
}
