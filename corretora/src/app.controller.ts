import { ClientVendaDto } from './dto/client-venda.dto';
import { ClientCompraDto } from './dto/client-compra.dto';
import { Body, Controller, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('compra')
  compra(@Body() clientCompraDto: ClientCompraDto) {
    return this.appService.compra(clientCompraDto);
  }

  @Post('venda')
  venda(@Body() clientVendaDto: ClientVendaDto) {
    return this.appService.venda(clientVendaDto);
  }
}
