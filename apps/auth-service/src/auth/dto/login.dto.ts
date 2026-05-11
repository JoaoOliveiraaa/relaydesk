import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'demo', description: 'Slug do tenant (único globalmente).' })
  @IsString()
  @MinLength(2)
  tenantSlug!: string;

  @ApiProperty({ example: 'owner@demo.relaydesk.local' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Demo123456!', format: 'password' })
  @IsString()
  @MinLength(1)
  password!: string;
}
