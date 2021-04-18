import { RabbitMQConfig } from '@golevelup/nestjs-rabbitmq';
import { ConfigModule, ConfigService } from '@nestjs/config';

export const rabbitMQConfig = {
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService): Promise<RabbitMQConfig> => {
    const brokerExchange = configService.get<string>(
      'rabbitmq.exchanges.broker',
    );
    const bolsaExchange = configService.get<string>(
      'rabbitmq.exchanges.bolsaDeValores',
    );

    const user = configService.get<string>('rabbitmq.user');
    const password = configService.get<string>('rabbitmq.password');
    const url = configService.get<string>('rabbitmq.url');

    const amqpUrl = configService.get<string>('rabbitmq.amqpUrl');

    return {
      exchanges: [
        {
          name: brokerExchange,
          type: 'topic',
        },
        {
          name: bolsaExchange,
          type: 'topic',
        },
      ],
      uri: amqpUrl || `amqp://${user}:${password}@${url}`,
    };
  },
  inject: [ConfigService],
};
