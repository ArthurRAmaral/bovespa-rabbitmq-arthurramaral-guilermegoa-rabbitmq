import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

const logger = new Logger('Main');

/**
 * @fucntion bootstrap
 * @description
 * Essa função inicia o nest microservice.
 * Esse metodo do NestFactory cria uma programa que independe da porta.
 */
async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule);
  app.listen(() => logger.log('Listening'));
}
bootstrap();
