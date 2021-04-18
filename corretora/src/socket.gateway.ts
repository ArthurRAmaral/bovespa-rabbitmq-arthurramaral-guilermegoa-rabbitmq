import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

/**
 * @class SocketGateway
 * @description 
 * Essa classe serve para mandar as novas transações para o front-end consumir.            
 */

@WebSocketGateway()
export class SocketGateway {
  /**
   * @description 
   * Aqui se inicia a server websocket.
  */
  @WebSocketServer()
  server: Server;

  /**
   * @function onTransaction
   * @param payload 
   * Esse paremetro manda para quem estiver consumindo a rota do websocketdentro do 
   * payload  o ativo e a mensagem.
   * @description Envia ativo e mensagem de transação.
  */
  onTransaction(payload: { ativo: string, message: string }) {
    return this.server.emit('transacoes', payload);
  }
}
