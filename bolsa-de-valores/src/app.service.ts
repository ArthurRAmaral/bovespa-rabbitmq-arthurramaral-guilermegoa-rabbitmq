import { VendaDto } from './dto/venda.dto';
import { CompraDto } from './dto/compra.dto';
import { Injectable, Logger } from '@nestjs/common';
import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { LivroOfertasService } from './livro-ofertas.service';
import configuration from './configuration/configuration';
import * as dotenv from 'dotenv';

dotenv.config();

const config = configuration();

const compraExchange = config.rabbitmq.exchanges.compra;
const compraPrefix = config.rabbitmq.prefix.compra;
const vendaExchange = config.rabbitmq.exchanges.venda;
const vendaPrefix = config.rabbitmq.prefix.venda;

@Injectable()
export class AppService {
  private readonly indexOfAtivo = 1;
  private readonly logger = new Logger(AppService.name);

  constructor(private livroDeOfertas: LivroOfertasService) {}

  @RabbitRPC({
    exchange: compraExchange,
    routingKey: `${compraPrefix}.*`,
  })
  compra(compraDto: CompraDto, amqpMsg) {
    const ativo = this.getAtivoFromRoutingKey(amqpMsg.fields.routingKey);
    this.logger.log(ativo, compraPrefix);
    this.livroDeOfertas.verificaCompra(compraDto, ativo);
    return `${ativo} := <quant: ${compraDto.quantidade}, val: ${compraDto.valor}, corretora: ${compraDto.corretora}>`;
  }

  @RabbitRPC({
    exchange: vendaExchange,
    routingKey: `${vendaPrefix}.*`,
  })
  venda(vendaDto: VendaDto, amqpMsg) {
    const ativo = this.getAtivoFromRoutingKey(amqpMsg.fields.routingKey);
    this.logger.log(ativo, vendaPrefix);
    this.livroDeOfertas.verificaVenda(vendaDto, ativo);
    return `${ativo} := <quant: ${vendaDto.quantidade}, val: ${vendaDto.valor}, corretora: ${vendaDto.corretora}>`;
  }

  private getAtivoFromRoutingKey(routingKey: string): string {
    return routingKey.split('.')[this.indexOfAtivo];
  }
}
