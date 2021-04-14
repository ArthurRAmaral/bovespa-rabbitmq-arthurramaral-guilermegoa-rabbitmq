import { CompraDto } from './dto/compra.dto';
import { VendaDto } from './dto/venda.dto';
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
        queueOptions: {
          durable: true,
        },
      },
    });
  }

  compra(compraDto: CompraDto) {
    compraDto.corretora = "CORRETORA"
    this.logger.log('compra', compraDto.corretora);
    return this.bolsaDeValoresProxy.send('compra', compraDto);
  }

  venda(vendaDto: VendaDto) {
    vendaDto.corretora = "CORRETORA"
    this.logger.log('venda', vendaDto.corretora);
    return this.bolsaDeValoresProxy.send('venda', vendaDto);
  }
}
