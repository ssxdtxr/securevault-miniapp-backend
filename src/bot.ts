import { Telegraf } from 'telegraf';

export function initBot() {
  const token = process.env.BOT_TOKEN;
  const webAppUrl = process.env.WEB_API_URL;

  if (!(token && webAppUrl)) {
    console.error('Токен или URL - не заданы');
    return;
  }

  const bot = new Telegraf(token);

  bot.start((ctx) => {
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

  bot.launch();
  console.log('Bot started');
}
