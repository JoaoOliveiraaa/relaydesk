import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Acme Corp' })
  @IsString()
  @MinLength(2)
  tenantName!: string;

  @ApiProperty({ example: 'acme' })
  @IsString()
  @MinLength(2)
  tenantSlug!: string;

  @ApiProperty({ example: 'owner@acme.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Str0ngP@ss!', format: 'password', minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;
}
