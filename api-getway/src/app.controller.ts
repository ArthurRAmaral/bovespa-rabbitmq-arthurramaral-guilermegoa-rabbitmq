import { Controller, Param, Post } from '@nestjs/common';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';

@Controller('api')
export class AppController {
  corretoraProxy: ClientProxy;
  constructor() {
    this.corretoraProxy = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://guest:guest@localhost:5672/cliente-corretora'],
      },
    });
  }

  @Post(':text')
  saySomething(@Param('text') text: string): string {
    this.corretoraProxy.emit('say-something', text);
    return text;
  }
}
