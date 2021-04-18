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
const transacoesPrefix = config.rabbitmq.prefix.transacoes;
const corretora = config.corretora;
const vendaExchange = config.rabbitmq.exchanges.venda;
const vendaPrefix = config.rabbitmq.prefix.venda;
const compraExchange = config.rabbitmq.exchanges.compra;
const compraPrefix = config.rabbitmq.prefix.compra;

/**
 * @class AppService
 * @description 
 * Classe serve para instaciar os serviços da corretora.
*/

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

  /**
   * @function compra
   * @param quantidade
   * @param valor
   * @param ativo
   * @description
   * Metodo recebe os parametros para fazer uma compra, após  envia a mensagem de compra
   * para a bolsa de valores e receber a resposta ser compra foi feita ou não.
  */
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

    /**
   * @function venda
   * @param quantidade
   * @param valor
   * @param ativo
   * @description
   * Metodo recebe os parametros para fazer uma venda, após  envia a mensagem de venda
   * para a bolsa de valores e receber a resposta ser venda foi feita ou não.
  */
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

    /**
   * @function novaTransacao
   * @param message
   * @param amqpMsg
   * @description
   * Metodo serve para receber a mensagem de transação feita e transmitir via websocket
   * a transação.
  */
  @RabbitSubscribe({
    exchange: transacoesExchange,
    routingKey: `${transacoesPrefix}.*`,
  })
  novaTransacao(message: string, amqpMsg) {
    this.logger.log(message, 'Novo Socket');
    this.socket.onTransaction({ ativo: this.getAtivoFromRoutingKey(amqpMsg.fields.routingKey), message });
  }

  /**
   * @function getAtivoFromRoutingKey 
   * @param routingKey
   * @description
   * Metodo serve para pegar o ativo que vem o parametro routingKey.
  */
  private getAtivoFromRoutingKey(routingKey: string): string {
    return routingKey.split('.')[this.indexOfAtivo];
  }
}
