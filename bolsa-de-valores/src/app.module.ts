import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { rabbitMQConfig } from './configuration/config/rabbitmq.config';
import { LivroOfertasService } from './livro-ofertas.service';
import { ConfigurationModule } from './configuration/configuration.module';

@Module({
  imports: [
    ConfigurationModule,
    RabbitMQModule.forRootAsync(RabbitMQModule, rabbitMQConfig),
    AppModule,
  ],
  controllers: [],
  providers: [AppService, LivroOfertasService],
})
export class AppModule { }
