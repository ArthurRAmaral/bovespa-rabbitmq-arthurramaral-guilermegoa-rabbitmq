import { Logger } from '@nestjs/common';
import { Body, Controller, Post } from '@nestjs/common/decorators';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { CompraDto } from './dto/compra.dto';

@Controller('api')
export class AppController {
  corretoraProxy: ClientProxy;
  bolsaDeValoresProxy: ClientProxy;
  logger = new Logger(AppController.name);

  constructor() {
    this.corretoraProxy = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://guest:guest@rabbitmq:5672/bovespa'],
        queue: 'corretora',
      },
    });

    this.bolsaDeValoresProxy = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://guest:guest@rabbitmq:5672/bovespa'],
        queue: 'bolsa-de-valores',
      },
    });
  }

  @Post('compra')
  compra(@Body() compraDto: CompraDto) {
    this.logger.log('compra', compraDto.nome);
    return this.corretoraProxy.send('compra', compraDto);
  }
}
