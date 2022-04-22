import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // dto validation will start working
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  await app.listen(3333);
}
bootstrap();
