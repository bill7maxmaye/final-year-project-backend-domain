import socketConfig from '@app/common//config/socket.config';
import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { NetworkingService } from '@pp/networking';
import { Server, Socket } from 'socket.io';

@WebSocketGateway(socketConfig().port, {
  path: socketConfig().path,
  cors: {
    origin: socketConfig().corsOrigin,
    credentials: true,
  },
})
export class SocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('SocketGateway');

  constructor(private readonly networking: NetworkingService) {}

  afterInit(server: Server) {
    this.logger.log('SocketGateway Initialized', server);
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id} ${args[0]}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }
}
