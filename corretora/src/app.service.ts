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

const corretora = config.corretora;

const brokerExchange = config.rabbitmq.exchanges.broker;
const bolsaExchange = config.rabbitmq.exchanges.bolsaDeValores;

const vendaPrefix = config.rabbitmq.prefix.venda;
const compraPrefix = config.rabbitmq.prefix.compra;
const transacoesPrefix = config.rabbitmq.prefix.transacoes;

@Injectable()
export class AppService {
  private readonly indexOfAtivo = 1;
  private readonly logger: Logger;

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
      exchange: brokerExchange,
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
      exchange: brokerExchange,
      routingKey: `${vendaPrefix}.${ativo}`,
      payload: vendaRequest,
    });

    return response;
  }

  @RabbitSubscribe({
    exchange: bolsaExchange,
    routingKey: `${transacoesPrefix}.*`,
  })
  novaTransacao(message: string, amqpMsg) {
    this.logger.log(message, 'Novo Socket');
    this.socket.onTransaction({
      ativo: this.getAtivoFromRoutingKey(amqpMsg.fields.routingKey),
      message,
    });
  }

  private getAtivoFromRoutingKey(routingKey: string): string {
    return routingKey.split('.')[this.indexOfAtivo];
  }
}
