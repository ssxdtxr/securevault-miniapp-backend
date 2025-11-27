import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import type { SyncUserDto } from './dto/sync-user.dto';
import { User } from 'generated/prisma/client';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('sync')
  async sync(@Body() dto: SyncUserDto): Promise<User> {
    return this.usersService.syncFromTelegram(dto);
  }
}
