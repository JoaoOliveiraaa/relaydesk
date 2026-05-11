import { IsString, MaxLength, MinLength } from 'class-validator';

export class SendAgentMessageDto {
  @IsString()
  @MinLength(1)
  @MaxLength(16000)
  content!: string;
}
