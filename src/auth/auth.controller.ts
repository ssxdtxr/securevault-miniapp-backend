// src/auth/auth.controller.ts
import { Body, Controller, Post, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signin')
  async signIn(@Body('initData') initData: string) {
    if (!initData || typeof initData !== 'string') {
      throw new BadRequestException('INITDATA_REQUIRED');
    }
    return this.authService.signIn(initData);
  }

  @Post('refresh')
  async refresh(@Body('refreshToken') refreshToken: string) {
    if (!refreshToken || typeof refreshToken !== 'string') {
      throw new BadRequestException('REFRESH_TOKEN_REQUIRED');
    }
    return this.authService.refreshTokens(refreshToken);
  }
}
