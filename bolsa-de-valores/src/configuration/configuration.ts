export default () => ({
  rabbitmq: {
    exchanges: {
      compra: process.env.RMQ_EXCHANGE_COMPRA || "compra",
      venda: process.env.RMQ_EXCHANGE_VENDA || "venda",
    },
    prefix: {
      compra: process.env.RMQ_PREFIX_COMPRA || "compra",
      venda: process.env.RMQ_PREFIX_VENDA || "venda",
    },
    user: process.env.RMQ_USER || "guest",
    password: process.env.RMQ_PASSWORD || "guest",
    url: process.env.RMQ_URL || "rabbitmq",
    port: process.env.RMQ_PORT || "5672",
  }
});
