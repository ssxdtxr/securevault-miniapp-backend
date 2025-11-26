import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf } from 'telegraf';

@Injectable()
export class BotService implements OnModuleInit {
  private bot: Telegraf;
  constructor(private readonly configServise: ConfigService) {}

  onModuleInit() {
    const token = process.env.BOT_TOKEN;
    const webAppUrl = process.env.WEB_API_URL;

    if (!(token && webAppUrl)) {
      console.error('Токен или URL - не заданы');
      return;
    }

    this.bot = new Telegraf(token);

    this.bot.start((ctx) => {
      ctx.reply('Добро пожаловать в SecureVault', {
        reply_markup: {
          keyboard: [
            [
              {
                text: 'Открыть хранилище',
                web_app: {
                  url: webAppUrl,
                },
              },
            ],
          ],
        },
      });
    });

    this.bot.launch();
    console.log('Bot started');
  }
}
