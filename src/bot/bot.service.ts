import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf, Markup } from 'telegraf';

@Injectable()
export class BotService implements OnModuleInit {
  private bot: Telegraf | undefined;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const token = this.configService.get('BOT_TOKEN');
    const webAppUrl = this.configService.get('WEB_APP_URL');

    if (!token || !webAppUrl) {
      throw new Error('BOT_TOKEN или WEB_API_URL не заданы');
    }

    this.bot = new Telegraf(token);

    this.bot.command('start', (ctx) => {
      const user = ctx.from;
      console.log('[/start] from =', user);

      const url = new URL(webAppUrl);

      if (user?.first_name) url.searchParams.set('name', user.first_name);
      if (user?.username) url.searchParams.set('username', user.username);
      if (user?.id) url.searchParams.set('tg_id', String(user.id));

      const keyboard = Markup.keyboard([
        [Markup.button.webApp('Открыть хранилище', url.toString())],
      ]).resize();

      return ctx.reply('Добро пожаловать в SecureVault', {
        reply_markup: keyboard.reply_markup,
      });
    });

    this.bot.launch();
    console.log('Bot started');
  }
}