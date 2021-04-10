import { CompraDto } from './dto/compra.dto';
import { Injectable, Logger } from '@nestjs/common';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';

@Injectable()
export class AppService {
  bolsaDeValoresProxy: ClientProxy;
  logger = new Logger(AppService.name);

  constructor() {
    this.bolsaDeValoresProxy = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://guest:guest@rabbitmq:5672/bovespa'],
        queue: 'bolsa-de-valores',
      },
    });
  }

  compra(compraDto: CompraDto) {
    this.logger.log('Passou no service');
    return this.bolsaDeValoresProxy.send('compra', compraDto);
  }
}
