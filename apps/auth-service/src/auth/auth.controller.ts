import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Auth')
@Controller('v1/auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registar tenant + owner' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'Envelope de sucesso com tokens e resumo do tenant.',
    schema: {
      example: {
        success: true,
        data: {
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          refreshToken: 'opaque_refresh_token',
          tenant: { id: 'clx…', slug: 'acme', name: 'Acme Corp' },
        },
        meta: { apiVersion: '2024-06-01', requestId: '…', correlationId: '…' },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Slug já em uso',
    schema: {
      example: {
        success: false,
        error: { code: 'HTTP_409', message: 'Slug de tenant já em uso', details: {} },
        meta: { apiVersion: '2024-06-01', requestId: '…' },
      },
    },
  })
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login por tenant + email + password' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Envelope de sucesso com tokens e utilizador.',
    schema: {
      example: {
        success: true,
        data: {
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          refreshToken: 'opaque_refresh_token',
          user: { id: 'clx…', email: 'owner@demo.relaydesk.local', role: 'owner', tenantId: 'clx…' },
        },
        meta: { apiVersion: '2024-06-01', requestId: '…', correlationId: '…' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciais inválidas',
    schema: {
      example: {
        success: false,
        error: { code: 'HTTP_401', message: 'Tenant ou credenciais inválidos', details: {} },
        meta: { apiVersion: '2024-06-01', requestId: '…' },
      },
    },
  })
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Renovar access token (refresh opaco em Redis)' })
  @ApiBody({ type: RefreshDto })
  @ApiResponse({
    status: 200,
    description: 'Novos tokens',
    schema: {
      example: {
        success: true,
        data: { accessToken: '…', refreshToken: '…' },
        meta: { apiVersion: '2024-06-01', requestId: '…' },
      },
    },
  })
  refresh(@Body() dto: RefreshDto) {
    return this.auth.refresh(dto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Perfil do utilizador autenticado' })
  @ApiResponse({
    status: 200,
    description: 'Dados do utilizador',
    schema: {
      example: {
        success: true,
        data: { id: 'clx…', email: 'owner@demo.relaydesk.local', role: 'owner', tenantId: 'clx…' },
        meta: { apiVersion: '2024-06-01', requestId: '…' },
      },
    },
  })
  me(@Req() req: Request & { user: { sub: string; tenantId: string; email: string; role: string } }) {
    return this.auth.me(req.user.sub);
  }
}
