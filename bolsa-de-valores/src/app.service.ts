import { CompraDto } from './dto/compra.dto';
import { Injectable, Logger } from '@nestjs/common';
import { VendaDto } from './dto/venda.dto';
import { LivroOfertasService } from './livro-ofertas.service';

@Injectable()
export class AppService {
  logger = new Logger(AppService.name);

  constructor(private livroDeOfertas: LivroOfertasService) { }

  compra(compraDto: CompraDto) {
    this.livroDeOfertas.verificaCompra(compraDto, compraDto.ativo);
    return this.livroDeOfertas
  }

  venda(vendaDto: VendaDto) {
    this.livroDeOfertas.verificaVenda(vendaDto, vendaDto.ativo);
    return this.livroDeOfertas
  }
}
