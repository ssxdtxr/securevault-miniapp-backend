import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  console.log("Запустился на 3000 порту")
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
