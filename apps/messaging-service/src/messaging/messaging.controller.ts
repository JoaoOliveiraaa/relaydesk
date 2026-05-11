import { Body, Controller, Headers, Post } from '@nestjs/common';
import { IngestMessageDto } from './dto/ingest-message.dto';
import { MessagingService } from './messaging.service';

@Controller('messages')
export class MessagingController {
  constructor(private readonly messaging: MessagingService) {}

  /** Ingestão universal — providers normalizam para este contrato */
  @Post('ingest')
  ingest(
    @Body() dto: IngestMessageDto,
    @Headers('x-correlation-id') correlationId?: string,
  ) {
    return this.messaging.ingest(dto, correlationId);
  }
}
