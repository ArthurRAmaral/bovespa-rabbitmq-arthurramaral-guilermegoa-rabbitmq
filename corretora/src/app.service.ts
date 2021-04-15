import { Injectable, Logger } from '@nestjs/common';
import { ClientVendaDto } from './dto/client-venda.dto';
import { ClientCompraDto } from './dto/client-compra.dto';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { BolsaCompraDto } from './dto/bolsa-compra.dto';
import { BolsaVendaDto } from './dto/bolsa-venda.dto';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class AppService {
  private logger: Logger;
  private readonly corretora: string;
  private readonly vendaExchange: string;
  private readonly vendaPrefix: string;
  private readonly compraExchange: string;
  private readonly compraPrefix: string;

  constructor(private readonly amqpConnection: AmqpConnection, private configService: ConfigService) {
    this.corretora = this.configService.get<string>('corretora')
    this.compraExchange = this.configService.get<string>('rabbitmq.exchanges.compra')
    this.compraPrefix = 'compra'
    this.vendaExchange = this.configService.get<string>('rabbitmq.exchanges.venda')
    this.vendaPrefix = 'venda'
    this.logger = new Logger(this.corretora)
  }

  async compra({ quantidade, valor, ativo }: ClientCompraDto) {
    const compraRequest: BolsaCompraDto = {
      corretora: this.corretora,
      quantidade, valor
    };

    this.logger.log(ativo, this.compraPrefix);

    const response = await this.amqpConnection.request({
      exchange: this.compraExchange,
      routingKey: `${this.compraPrefix}.${ativo}`,
      payload: compraRequest,
    });

    return response;
  }

  async venda({ quantidade, valor, ativo }: ClientVendaDto) {
    const vendaRequest: BolsaVendaDto = {
      corretora: this.corretora,
      quantidade, valor
    };

    this.logger.log(ativo, this.vendaPrefix);

    const response = await this.amqpConnection.request({
      exchange: this.vendaExchange,
      routingKey: `${this.vendaPrefix}.${ativo}`,
      payload: vendaRequest
    });

    return response;
  }
}
