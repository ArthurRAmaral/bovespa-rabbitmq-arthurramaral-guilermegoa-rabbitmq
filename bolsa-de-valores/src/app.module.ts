import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { rabbitMQConfig } from './configuration/config/rabbitmq.config';
import { LivroOfertasService } from './livro-ofertas.service';
import { ConfigurationModule } from './configuration/configuration.module';

/**
 * @class AppModile
 * @description
 * Essa é a classe principal do serviço onde define o modulo principal
 * usado no bootstrap.
 */
@Module({
  imports: [
    ConfigurationModule,
    RabbitMQModule.forRootAsync(RabbitMQModule, rabbitMQConfig),
    AppModule,
  ],
  controllers: [],
  providers: [AppService, LivroOfertasService],
})
export class AppModule {}
