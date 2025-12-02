import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, User } from 'generated/prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { TelegramUserDto } from './dto/telegram-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserByTgId(tgId: number): Promise<User | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          telegram_id: tgId,
        },
      });

      return user;
    } catch (error) {
      throw new NotFoundException('USER_NOT_FOUND');
    }
  }

  async createUser(tgUser: TelegramUserDto): Promise<User> {
    try {
      const newUser = await this.prisma.user.create({
        data: {
          telegram_id: tgUser.telegram_id,
          username: tgUser.username,
          name: tgUser.name,
        },
      });

      return newUser;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError)
        if (error.code === 'P2002') {
          throw new ConflictException(
            `User with Telegram ID ${tgUser.telegram_id} already exists`,
          );
        }
      throw new BadRequestException('USER_CREATION_FAILED');
    }
  }
}
