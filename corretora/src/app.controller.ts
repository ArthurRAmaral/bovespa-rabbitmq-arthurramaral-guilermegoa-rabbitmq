import { Controller, Get, Param, Post } from '@nestjs/common';
import { AppService } from './app.service';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
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

  @Get(':text')
  saySomething(@Param('text') text: string): string {
    this.corretoraProxy.emit('compra', text);
    return text;
  }
}
