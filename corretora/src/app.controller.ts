import { ClientVendaDto } from './dto/client-venda.dto';
import { ClientCompraDto } from './dto/client-compra.dto';
import { Body, Controller, Get, Param, Post, Render } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';
import { SocketGateway } from './socket.gateway';

@Controller()
export class AppController {
  corretora: string;

  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService,
  ) {
    this.corretora = this.configService.get<string>('corretora');
  }

  @Get()
  @Render('index')
  root() {
    return { corretora: this.corretora };
  }

  @Post('api/compra')
  compra(@Body() clientCompraDto: ClientCompraDto) {
    return this.appService.compra(clientCompraDto);
  }

  @Post('api/venda')
  venda(@Body() clientVendaDto: ClientVendaDto) {
    return this.appService.venda(clientVendaDto);
  }
}
