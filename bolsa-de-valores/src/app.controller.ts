import { AppService } from './app.service';
import { CompraDto } from './dto/compra.dto';
import { Controller, Logger } from '@nestjs/common';
import { Payload, MessagePattern } from '@nestjs/microservices';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private appService: AppService) {}

  @MessagePattern('compra')
  compra(@Payload() compraDto: CompraDto) {
    return this.appService.compra(compraDto);
  }
}
