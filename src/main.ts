import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.enableCors({
    origin: [
      configService.get<string>('WEB_APP_URL'),
      configService.get<string>('LOC_APP_URL'),
    ],
    methods: ['GET', 'POST'],
    credentials: true,
  });
        
  await app.listen(process.env.PORT ?? 3000);

  console.log('Запустился на 3000 порту');
}
bootstrap();
