import { VendaDto } from './dto/venda.dto';
import { CompraDto } from './dto/compra.dto';
import { Body, Controller, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Post('compra')
  compra(@Body() compraDto: CompraDto) {
    return this.appService.compra(compraDto);
  }

  @Post('venda')
  venda(@Body() vendaDto: VendaDto) {
    return this.appService.venda(vendaDto);
  }
}
