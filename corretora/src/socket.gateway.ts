import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
export class SocketGateway {
  @WebSocketServer()
  server: Server;

  onTransaction(payload: { ativo: string, message: string }) {
    return this.server.emit('transacoes', payload);
  }
}
