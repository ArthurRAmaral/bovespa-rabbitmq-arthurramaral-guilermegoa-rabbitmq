import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './configuration';

/**
 * @class Module
 * @description
 * Essa é a classe principal do serviço onde define o modulo de configuração
 * usado no bootstrap.
*/
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
  ],
})
export class ConfigurationModule { }
