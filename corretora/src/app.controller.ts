import { VendaDto } from './dto/venda.dto';
import { CompraDto } from './dto/compra.dto';
import { Controller } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern('compra')
  compra(@Payload() compraDto: CompraDto) {
    return this.appService.compra(compraDto);
  }

  @MessagePattern('venda')
  venda(@Payload() vendaDto: VendaDto) {
    return this.appService.venda(vendaDto);
  }
}
