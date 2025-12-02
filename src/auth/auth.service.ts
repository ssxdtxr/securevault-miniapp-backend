import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from 'generated/prisma/client';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  private async getUserByTgId(telegram_id: number): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { telegram_id } });
  }

  private async createUser(user: {
    telegram_id: number;
    name: string;
    username: string;
  }): Promise<User> {
    return this.prisma.user.create({ data: user });
  }

  async signIn(initDataString: string) {
    // 1. Валидация initData
    const botToken = this.configService.get<string>('BOT_TOKEN');
    if (!botToken) {
      throw new Error('BOT_TOKEN is not set');
    }

    // ВРЕМЕННО отключите валидацию для тестов
    // const isValid = validateWebAppData(botToken, initDataString);
    // if (!isValid) {
    //   throw new BadRequestException('AUTH__INVALID_INITDATA');
    // }

    // 2. Парсинг данных вручную
    const params = new URLSearchParams(initDataString);
    const userStr = params.get('user');

    if (!userStr) {
      throw new BadRequestException('AUTH__INVALID_INITDATA');
    }

    let userData: { id: number; name: string; username: string };
    try {
      userData = JSON.parse(userStr);
    } catch (error) {
      throw new BadRequestException('AUTH__INVALID_USER_DATA');
    }

    const { id: telegram_id, name, username } = userData;
    if (typeof telegram_id !== 'number') {
      throw new BadRequestException('AUTH__INVALID_INITDATA');
    }

    let user = await this.getUserByTgId(telegram_id);
    if (!user) {
      user = await this.createUser({ telegram_id, name, username });
    }

    const payload = { id: user.id, telegram_id: user.telegram_id };

    const access = jwt.sign(
      payload,
      this.configService.get<string>('JWT_ACCESS_SECRET')!,
      { expiresIn: this.configService.get('JWT_ACCESS_EXPIRES_IN', '5m') },
    );

    const refresh = jwt.sign(
      payload,
      this.configService.get<string>('JWT_REFRESH_SECRET')!,
      { expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d') },
    );

    return {
      access,
      refresh,
    };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = jwt.verify(
        refreshToken,
        this.configService.get<string>('JWT_REFRESH_SECRET')!,
      ) as { telegram_id: number };

      const user = await this.getUserByTgId(payload.telegram_id);
      if (!user) {
        throw new BadRequestException('AUTH__USER_NOT_FOUND');
      }

      const newPayload = { id: user.id, telegram_id: user.telegram_id };

      const access = jwt.sign(
        newPayload,
        this.configService.get<string>('JWT_ACCESS_SECRET')!,
        { expiresIn: this.configService.get('JWT_ACCESS_EXPIRES_IN', '5m') },
      );

      const refresh = jwt.sign(
        newPayload,
        this.configService.get<string>('JWT_REFRESH_SECRET')!,
        { expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d') },
      );

      return { access, refresh };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new BadRequestException('AUTH__REFRESH_TOKEN_EXPIRED');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new BadRequestException('AUTH__INVALID_REFRESH_TOKEN');
      }
      throw new BadRequestException('AUTH__REFRESH_FAILED');
    }
  }
}
