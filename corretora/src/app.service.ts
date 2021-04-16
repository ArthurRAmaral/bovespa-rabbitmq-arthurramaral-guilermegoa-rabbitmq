import { Injectable, Logger } from '@nestjs/common';
import { ClientVendaDto } from './dto/client-venda.dto';
import { ClientCompraDto } from './dto/client-compra.dto';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { BolsaCompraDto } from './dto/bolsa-compra.dto';
import { BolsaVendaDto } from './dto/bolsa-venda.dto';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { SocketGateway } from './socket.gateway';
import configuration from './configuration/configuration';

const config = configuration();

const transacoesExchange = config.rabbitmq.exchanges.transacoes;
const transacoesRountingKey = config.rabbitmq.routingKey.transacoes;
const corretora = config.corretora;
const vendaExchange = config.rabbitmq.exchanges.venda;
const vendaPrefix = config.rabbitmq.prefix.venda;
const compraExchange = config.rabbitmq.exchanges.compra;
const compraPrefix = config.rabbitmq.prefix.compra;

@Injectable()
export class AppService {
  private logger: Logger;

  constructor(
    private readonly amqpConnection: AmqpConnection,
    private readonly socket: SocketGateway,
  ) {
    this.logger = new Logger(corretora);
  }

  async compra({ quantidade, valor, ativo }: ClientCompraDto) {
    const compraRequest: BolsaCompraDto = {
      corretora,
      quantidade,
      valor,
    };

    this.logger.log(ativo, compraPrefix);

    const response = await this.amqpConnection.request({
      exchange: compraExchange,
      routingKey: `${compraPrefix}.${ativo}`,
      payload: compraRequest,
    });

    return response;
  }

  async venda({ quantidade, valor, ativo }: ClientVendaDto) {
    const vendaRequest: BolsaVendaDto = {
      corretora: corretora,
      quantidade,
      valor,
    };

    this.logger.log(ativo, vendaPrefix);

    const response = await this.amqpConnection.request({
      exchange: vendaExchange,
      routingKey: `${vendaPrefix}.${ativo}`,
      payload: vendaRequest,
    });

    return response;
  }

  @RabbitSubscribe({
    exchange: transacoesExchange,
    routingKey: transacoesRountingKey,
  })
  teste(msg: any) {
    this.logger.log(msg, 'Novo Socket');
    this.socket.onTransaction(msg);
  }
}
