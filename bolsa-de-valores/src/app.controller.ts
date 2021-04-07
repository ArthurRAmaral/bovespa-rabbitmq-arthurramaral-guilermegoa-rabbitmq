import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
  MessagePattern,
  Payload,
  Ctx,
  RmqContext,
} from '@nestjs/microservices';

@Controller()
export class AppController {
  corretoraProxy: ClientProxy;

  constructor(private readonly appService: AppService) {
    this.corretoraProxy = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://guest:guest@localhost:5672/cliente-corretora'],
      },
    });
  }

  @MessagePattern('compra')
  getNotifications(@Payload() data: number[], @Ctx() context: RmqContext) {
    console.log(`Pattern: ${context.getPattern()}`);
  }
}
