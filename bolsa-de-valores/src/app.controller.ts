import { Controller, Logger } from '@nestjs/common';
import {
  Payload,
  Ctx,
  RmqContext,
  MessagePattern,
} from '@nestjs/microservices';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  @MessagePattern('compra')
  compra(@Payload() data: any, @Ctx() context: RmqContext) {
    this.logger.log(`Pattern: ${context.getPattern()}`);
    this.logger.log(`Payload: ${data}`);
    return 'recebido';
  }
}
