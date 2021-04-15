import { RabbitMQConfig } from '@golevelup/nestjs-rabbitmq';
import { ConfigModule, ConfigService } from '@nestjs/config';

export const rabbitMQConfig = {
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService): Promise<RabbitMQConfig> => {
    const compraExchange = configService.get<string>('rabbitmq.exchanges.compra');
    const vendaExchange = configService.get<string>('rabbitmq.exchanges.venda');
    const user = configService.get<string>('rabbitmq.user');
    const password = configService.get<string>('rabbitmq.password');
    const url = configService.get<string>('rabbitmq.url');
    const port = configService.get<string>('rabbitmq.port');

    return {
      exchanges: [
        {
          name: compraExchange,
          type: 'topic'
        },
        {
          name: vendaExchange,
          type: 'topic'
        },
      ],
      uri: `amqp://${user}:${password}@${url}:${port}`,
    }
  },
  inject: [ConfigService],
};
