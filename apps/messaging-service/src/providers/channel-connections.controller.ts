import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { JwtPayload } from '../auth/jwt.strategy';
import { ConnectTelegramDto } from './dto/connect-telegram.dto';
import {
  ChannelConnectionsService,
  type SafeChannelConnection,
} from './channel-connections.service';

@ApiTags('Channel connections')
@ApiBearerAuth('access-token')
@Controller('v1/channel-connections')
@UseGuards(JwtAuthGuard)
export class ChannelConnectionsController {
  constructor(private readonly connections: ChannelConnectionsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar ligações de canal do tenant' })
  @ApiResponse({ status: 200 })
  async list(@Req() req: Request & { user: JwtPayload }): Promise<SafeChannelConnection[]> {
    return this.connections.list(req.user.tenantId);
  }

  @Post('telegram')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Ligar bot Telegram',
    description:
      'Valida o token com getMe, persiste token encriptado, regista `setWebhook` para `PUBLIC_WEBHOOK_BASE_URL`.',
  })
  @ApiResponse({ status: 201 })
  async connectTelegram(
    @Body() dto: ConnectTelegramDto,
    @Req() req: Request & { user: JwtPayload },
  ): Promise<{ connection: SafeChannelConnection }> {
    return this.connections.connectTelegram(req.user.tenantId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhe de uma ligação (sem segredos)' })
  @ApiResponse({ status: 404 })
  async get(
    @Param('id') id: string,
    @Req() req: Request & { user: JwtPayload },
  ): Promise<SafeChannelConnection> {
    return this.connections.get(req.user.tenantId, id);
  }
}
