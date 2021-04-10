import { Logger } from '@nestjs/common';
import { Body, Controller, Post } from '@nestjs/common/decorators';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { CompraDto } from './dto/compra.dto';
import { VendaDto } from './dto/venda.dto';

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
        queueOptions: {
          durable: true,
        },
      },
    });

    this.bolsaDeValoresProxy = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://guest:guest@rabbitmq:5672/bovespa'],
        queue: 'bolsa-de-valores',
        queueOptions: {
          durable: true,
        },
      },
    });
  }

  @Post('compra')
  compra(@Body() compraDto: CompraDto) {
    this.logger.log('compra', compraDto.corretora);
    return this.corretoraProxy.send('compra', compraDto);
  }

  @Post('venda')
  venda(@Body() vendaDto: VendaDto) {
    this.logger.log('venda', vendaDto.corretora);
    return this.corretoraProxy.send('venda', vendaDto);
  }
}
