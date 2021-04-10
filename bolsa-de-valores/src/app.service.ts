import { CompraDto } from './dto/compra.dto';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AppService {
  logger = new Logger(AppService.name);
  livroDeOfertas = { compras: [], vendas: [] };

  compra(compraDto: CompraDto): string {
    this.logger.log('Passou no service');
    this.livroDeOfertas.compras.push(compraDto);
    return `Registrado ${this.livroDeOfertas.compras.length}`;
  }
}
