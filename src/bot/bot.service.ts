import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf, Markup } from 'telegraf';

@Injectable()
export class BotService implements OnModuleInit {
  private bot: Telegraf;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const token = this.configService.get('BOT_TOKEN');
    const webAppUrl = this.configService.get('WEB_API_URL');

    if (!token || !webAppUrl) {
      throw new Error('BOT_TOKEN или WEB_API_URL не заданы');
    }

    this.bot = new Telegraf(token);

    this.bot.start((ctx) => {
      const keyboard = Markup.keyboard([
        [Markup.button.webApp('Открыть хранилище', webAppUrl)],
      ])
        .resize()
        .oneTime();

      return ctx.reply('Добро пожаловать в SecureVault', {
        reply_markup: keyboard.reply_markup,
      });
    });

    this.bot.launch();
    console.log('Bot started');
  }
}