import { BadRequestException, Injectable } from '@nestjs/common';
import type { SyncUserDto } from './dto/sync-user.dto';
import { PrismaService } from 'prisma/prisma.service';
import { User } from 'generated/prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async syncFromTelegram(dto: SyncUserDto): Promise<User> {
    const { telegram_id, name, username } = dto;

    console.log(dto);

    if (!telegram_id) {
      throw new BadRequestException('telegram_id is required');
    }

    return this.prisma.user.upsert({
      where: { telegram_id },
      update: {
        username: username ?? null,
        name: name ?? null,
      },
      create: {
        telegram_id,
        username: username ?? null,
        name: name ?? null,
      },
    });
  }
}
