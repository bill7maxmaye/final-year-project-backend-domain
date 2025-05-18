import { ACTION } from '@app/common//enum/action.enum';
import { CONTROLLER } from '@app/common//enum/controller.enum';
import { MICROSERVICE } from '@app/common//enum/microservice.enum';
import { Controller, Post } from '@nestjs/common';
import { NetworkingService } from '@pp/networking';
import { SocketGateway } from 'apps/gateway/websocket/socket.gateway';

@Controller('chat')
export class ChatController {
  constructor(
    private readonly networking: NetworkingService,
    private readonly socketGateway: SocketGateway,
  ) {}

  @Post('send-message')
  async sendMessage(body: any): Promise<any> {
    const res = await this.networking.send(
      `${MICROSERVICE.CHAT}.${CONTROLLER.MESSAGES}.${ACTION.CREATE}`,
      body,
    );

    this.socketGateway.server.emit('message', res);

    return '- - send message - -';
  }
}
