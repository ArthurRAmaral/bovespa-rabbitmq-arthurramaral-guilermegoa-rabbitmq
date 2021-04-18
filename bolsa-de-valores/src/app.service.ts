import { VendaDto } from './dto/venda.dto';
import { CompraDto } from './dto/compra.dto';
import { Injectable, Logger } from '@nestjs/common';
import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { LivroOfertasService } from './livro-ofertas.service';
import configuration from './configuration/configuration';

/**
 * @init
 * inicializa variáveis de ambiente
 */
const config = configuration();

const brokerExchange = config.rabbitmq.exchanges.broker;
const compraPrefix = config.rabbitmq.prefix.compra;
const vendaPrefix = config.rabbitmq.prefix.venda;

/**
 * @class AppService
 * @description
 * Essa é a classe é serviço pricipal da aplicação que conecta as filas
 * da exchange BROKER do RabbitMQ e ecaminha para o serviço específico.
 */
@Injectable()
export class AppService {
  private readonly indexOfAtivo = 1;
  private readonly logger = new Logger(AppService.name);

  constructor(private livroDeOfertas: LivroOfertasService) {}

  /**
   * @function compra
   * @param compraDto recebe o corpo da requisição com os dados da
   * compra do ativo 
   * @param amqpMsg recebe os dados da mensagem para pegar o ativo
   * @description
   * Esse método e acionado quando chega uma mensagem, na exchange
   * BROCKER, de tópico com a binding key compra.ativo.
   */
  @RabbitRPC({
    exchange: brokerExchange,
    routingKey: `${compraPrefix}.*`,
    queue: brokerExchange,
  })
  compra(compraDto: CompraDto, amqpMsg) {
    const ativo = this.getAtivoFromRoutingKey(amqpMsg.fields.routingKey);
    this.logger.log(ativo, compraPrefix);

    /**
     * Esse trecho adiciona o pedido de compra na lista e depois
     * verifica se alguma transação pode ser criada. 
     */
    this.livroDeOfertas.addCompra(compraDto, ativo);
    this.livroDeOfertas.verifica(ativo);

    return `${ativo} := <quant: ${compraDto.quantidade}, val: ${compraDto.valor}, corretora: ${compraDto.corretora}>`;
  }

  /**
   * @function venda
   * @param vendaDto recebe o corpo da requisição com os dados da
   * venda do ativo
   * @param amqpMsg recebe os dados da mensagem para pegar o ativo
   * @description
   * Esse método e acionado quando chega uma mensagem, na exchange
   * BROCKER, de tópico com a binding key venda.ativo.
   */
  @RabbitRPC({
    exchange: brokerExchange,
    routingKey: `${vendaPrefix}.*`,
    queue: brokerExchange,
  })
  venda(vendaDto: VendaDto, amqpMsg) {
    const ativo = this.getAtivoFromRoutingKey(amqpMsg.fields.routingKey);
    this.logger.log(ativo, vendaPrefix);

    /**
     * Esse trecho adiciona o pedido de compra na lista e depois
     * verifica se alguma transação pode ser criada. 
     */
    this.livroDeOfertas.addVenda(vendaDto, ativo);
    this.livroDeOfertas.verifica(ativo);

    return `${ativo} := <quant: ${vendaDto.quantidade}, val: ${vendaDto.valor}, corretora: ${vendaDto.corretora}>`;
  }

  /**
   * @function getAtivoFromRoutingKey
   * @param compraDto recebe o routingKey para poder retirar o noe do ativo
   * @description
   * Esse método retorna o nome do ativo;
   */
  private getAtivoFromRoutingKey(routingKey: string): string {
    return routingKey.split('.')[this.indexOfAtivo];
  }
}
