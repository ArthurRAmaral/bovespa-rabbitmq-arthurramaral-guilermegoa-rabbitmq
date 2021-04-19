import { ClientVendaDto } from './dto/client-venda.dto';
import { ClientCompraDto } from './dto/client-compra.dto';
import { Body, Controller, Get, Post, Render } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';

/**
 * @class AppController
 * @description
 * Classe serve para iniciar a comunicação via HTTP criando um api que recer as requisições.
 */
@Controller()
export class AppController {
  corretora: string;

  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService,
  ) {
    this.corretora = this.configService.get<string>('corretora');
  }

  /**
   * @function root
   * @description
   * Metodo ddo tipo get que server para iniciar a pagina html, retornando os dados da corretora.
   */
  @Get()
  @Render('index')
  root() {
    return { corretora: this.corretora };
  }

  /**
   * @function compra
   * @param clientCompraDto
   * @description
   * Metodo do tipo post, que recebe um tipo ClinetCompraDto, o qual manda para o service a compra.
   */
  @Post('api/compra')
  compra(@Body() clientCompraDto: ClientCompraDto) {
    return this.appService.compra(clientCompraDto);
  }

  /**
   * @function venda
   * @param clientCompraDto
   * @description
   * Metodo do tipo post, que recebe um tipo ClientVendaDto, o qual manda para o service a venda.
   */
  @Post('api/venda')
  venda(@Body() clientVendaDto: ClientVendaDto) {
    return this.appService.venda(clientVendaDto);
  }
}
