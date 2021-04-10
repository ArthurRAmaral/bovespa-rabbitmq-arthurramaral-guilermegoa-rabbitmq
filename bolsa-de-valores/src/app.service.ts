import { CompraDto } from './dto/compra.dto';
import { Injectable, Logger } from '@nestjs/common';
import { VendaDto } from './dto/venda.dto';

@Injectable()
export class AppService {
  logger = new Logger(AppService.name);
  livroDeOfertas = { compras: [], vendas: [] };

  compra(compraDto: CompraDto): string {
    this.logger.log('Passou no service');
    this.livroDeOfertas.compras.push(compraDto);
    return `Compra registrada ${this.livroDeOfertas.compras.length}`;
  }

  venda(vendaDto: VendaDto): string {
    this.logger.log('Passou no service');
    this.livroDeOfertas.vendas.push(vendaDto);
    return `Venda registrada ${this.livroDeOfertas.vendas.length}`;
  }
}
