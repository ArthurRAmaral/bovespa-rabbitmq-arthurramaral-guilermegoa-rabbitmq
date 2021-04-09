import { Controller, Param, Post } from '@nestjs/common/decorators';
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
        urls: ['amqp://guest:guest@rabbitmq:5672/bovespa'],
        queue: 'corretora',
      },
    });
  }

  @Post(':text')
  saySomething(@Param('text') text: string) {
    return this.corretoraProxy.send('compra', text);
  }
}
