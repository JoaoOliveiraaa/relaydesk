import { ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { prisma, UserRole } from '@relaydesk/database';
import { RedisKeys } from '@relaydesk/redis';
import type { Redis } from '@relaydesk/redis';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcryptjs';
import { AUTH_REDIS } from '../infra/redis.module';
import type { LoginDto } from './dto/login.dto';
import type { RegisterDto } from './dto/register.dto';

const REFRESH_TTL_SEC = 7 * 24 * 60 * 60;

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    @Inject(AUTH_REDIS) private readonly redis: Redis,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await prisma.tenant.findFirst({
      where: { slug: dto.tenantSlug, deletedAt: null },
    });
    if (existing) {
      throw new ConflictException('Slug de tenant já em uso');
    }
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const tenant = await prisma.tenant.create({
      data: {
        name: dto.tenantName,
        slug: dto.tenantSlug,
        users: {
          create: {
            email: dto.email.toLowerCase(),
            passwordHash,
            role: UserRole.owner,
          },
        },
      },
      include: { users: true },
    });
    const user = tenant.users[0];
    const accessToken = await this.signUser(user.id, user.tenantId, user.email, user.role);
    const refreshToken = await this.issueRefreshToken(user.id, user.tenantId);
    return {
      accessToken,
      refreshToken,
      tenant: { id: tenant.id, slug: tenant.slug, name: tenant.name },
    };
  }

  async login(dto: LoginDto) {
    const tenant = await prisma.tenant.findFirst({
      where: { slug: dto.tenantSlug, deletedAt: null },
    });
    if (!tenant) {
      throw new UnauthorizedException('Tenant ou credenciais inválidos');
    }
    const user = await prisma.user.findFirst({
      where: {
        tenantId: tenant.id,
        email: dto.email.toLowerCase(),
        deletedAt: null,
      },
    });
    if (!user) {
      throw new UnauthorizedException('Tenant ou credenciais inválidos');
    }
    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Tenant ou credenciais inválidos');
    }
    const accessToken = await this.signUser(user.id, user.tenantId, user.email, user.role);
    const refreshToken = await this.issueRefreshToken(user.id, user.tenantId);
    return {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, role: user.role, tenantId: tenant.id },
    };
  }

  async refresh(opaque: string) {
    const key = RedisKeys.refreshToken(opaque);
    const raw = await this.redis.get(key);
    if (!raw) {
      throw new UnauthorizedException('Refresh inválido ou expirado');
    }
    await this.redis.del(key);
    const parsed = JSON.parse(raw) as { userId: string; tenantId: string };
    const user = await prisma.user.findFirst({
      where: { id: parsed.userId, tenantId: parsed.tenantId, deletedAt: null },
    });
    if (!user) {
      throw new UnauthorizedException('Utilizador inválido');
    }
    const accessToken = await this.signUser(user.id, user.tenantId, user.email, user.role);
    const refreshToken = await this.issueRefreshToken(user.id, user.tenantId);
    return { accessToken, refreshToken };
  }

  async me(userId: string) {
    const user = await prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      include: { tenant: true },
    });
    if (!user || user.tenant.deletedAt) {
      throw new UnauthorizedException();
    }
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      tenant: { id: user.tenant.id, name: user.tenant.name, slug: user.tenant.slug, plan: user.tenant.plan },
    };
  }

  private async issueRefreshToken(userId: string, tenantId: string): Promise<string> {
    const opaque = randomUUID();
    await this.redis.set(
      RedisKeys.refreshToken(opaque),
      JSON.stringify({ userId, tenantId }),
      'EX',
      REFRESH_TTL_SEC,
    );
    return opaque;
  }

  private signUser(sub: string, tenantId: string, email: string, role: string): Promise<string> {
    return this.jwt.signAsync({ sub, tenantId, email, role });
  }
}
