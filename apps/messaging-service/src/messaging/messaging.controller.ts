import { Body, Controller, Headers, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IngestMessageDto } from './dto/ingest-message.dto';
import { MessagingService } from './messaging.service';

@ApiTags('Messaging')
@Controller('v1/messages')
export class MessagingController {
  constructor(private readonly messaging: MessagingService) {}

  @Post('ingest')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Ingestão omnichannel (contrato normalizado)' })
  @ApiHeader({ name: 'x-correlation-id', required: false })
  @ApiResponse({
    status: 201,
    description: 'Mensagem aceite para pipeline',
    schema: {
      example: {
        success: true,
        data: { ok: true, conversationId: 'clx…', messageId: 'clx…' },
        meta: { apiVersion: '2024-06-01', requestId: '…' },
      },
    },
  })
  ingest(
    @Body() dto: IngestMessageDto,
    @Headers('x-correlation-id') correlationId?: string,
  ) {
    return this.messaging.ingest(dto, correlationId);
  }
}
