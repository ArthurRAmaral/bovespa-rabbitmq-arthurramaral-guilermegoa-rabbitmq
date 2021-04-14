import { CompraDto } from './dto/compra.dto';
import { Injectable, Logger } from '@nestjs/common';
import { VendaDto } from './dto/venda.dto';
import { LivroOfertasService } from './livro-ofertas.service';

@Injectable()
export class AppService {
  logger = new Logger(AppService.name);
  constructor(private livroDeOfertas: LivroOfertasService) {}

  compra(compraDto: CompraDto): string {
    this.logger.log('Passou no service');
    const transacoes = this.livroDeOfertas.verificaCompra(
      compraDto,
      compraDto.ativo,
    );

    if (transacoes.length) {
      return `Compra efetuda ${transacoes.length}`;
    }
    
    return `Compra registrada`;
  }

  venda(vendaDto: VendaDto): string {
    this.logger.log('Passou no service');
    const transacoes = this.livroDeOfertas.verificaVenda(
      vendaDto,
      vendaDto.ativo,
    );

    if (transacoes.length) {
      return `Venda efetuda ${transacoes.length}`;
    }

    return `Venda registrada`;
  }
}
