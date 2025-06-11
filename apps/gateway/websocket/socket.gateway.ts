import socketConfig from '@app/common//config/socket.config';
import { SOCKET_EVENTS } from '@app/common//enum/socket/socket.enum';
import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
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
    this.logger.log('SocketGateway Initialized');
  }

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      void client.join(userId); // Join personal room
      this.logger.log(`User ${userId} connected`);
    } else {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage(SOCKET_EVENTS.JOIN_ROOM)
  handleJoinRoom(client: Socket, roomId: string) {
    client.join(roomId);
    this.logger.log(`Client ${client.id} joined room ${roomId}`);
  }

  @SubscribeMessage(SOCKET_EVENTS.TYPING)
  handleTyping(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: Socket,
  ) {
    this.server.to(roomId).emit(SOCKET_EVENTS.TYPING, { socketId: client.id });
  }

  @SubscribeMessage(SOCKET_EVENTS.STOP_TYPING)
  handleStopTyping(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: Socket,
  ) {
    this.server
      .to(roomId)
      .emit(SOCKET_EVENTS.STOP_TYPING, { socketId: client.id });
  }
}
