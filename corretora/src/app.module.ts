import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { rabbitMQConfig } from './configuration/config/rabbitmq.config';
import { ConfigurationModule } from './configuration/configuration.module';
import { ConfigModule } from '@nestjs/config';
import { SocketGateway } from './socket.gateway';

@Module({
  imports: [
    ConfigModule,
    ConfigurationModule,
    RabbitMQModule.forRootAsync(RabbitMQModule, rabbitMQConfig),
    AppModule,
  ],
  controllers: [AppController],
  providers: [AppService, SocketGateway],
})
export class AppModule {}
