import * as dotenv from 'dotenv';

export default () => {
  dotenv.config();
  return {
    port: +process.env.PORT || 3333,
    corretora: process.env.NOME_CORRETORA || 'DFLT',
    rabbitmq: {
      exchanges: {
        broker: process.env.RMQ_EXCHANGE_BROKER || 'BROKER',
        bolsaDeValores:
          process.env.RMQ_EXCHANGE_BOLSADEEVALORES || 'BOLSADEVALORES',
      },
      prefix: {
        compra: process.env.RMQ_PREFIX_COMPRA || 'compra',
        venda: process.env.RMQ_PREFIX_VENDA || 'venda',
        transacoes: process.env.RMQ_ROUTING_KEY_TRANSACAO || 'transacao',
      },
      user: process.env.RMQ_USER || 'guest',
      password: process.env.RMQ_PASSWORD || 'guest',
      url: process.env.RMQ_URL || 'rabbitmq:5672',
      amqpUrl: process.env.AMQP_URL || null,
    },
  };
};
