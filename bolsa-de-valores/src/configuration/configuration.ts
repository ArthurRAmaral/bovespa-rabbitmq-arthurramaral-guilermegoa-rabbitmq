import * as dotenv from 'dotenv';

export default () => {
  dotenv.config();
  return {
    rabbitmq: {
      exchanges: {
        compra: process.env.RMQ_EXCHANGE_COMPRA || 'compra',
        venda: process.env.RMQ_EXCHANGE_VENDA || 'venda',
        transacoes: process.env.RMQ_EXCHANGE_TRANSACOES || 'transacoes',
      },
      prefix: {
        compra: process.env.RMQ_PREFIX_COMPRA || 'compra',
        venda: process.env.RMQ_PREFIX_VENDA || 'venda',
        transacoes: process.env.RMQ_ROUTING_KEY_TRANSACOES || 'novas-transacoes',
      },
      user: process.env.RMQ_USER || 'guest',
      password: process.env.RMQ_PASSWORD || 'guest',
      url: process.env.RMQ_HOST || 'rabbitmq',
      port: process.env.RMQ_PORT || '5672',
    },
  };
};
