import { ActiveUser } from '@app/common//decorators/active-user-decorator';
import { User } from '@app/common//entities/user/user-entity';
import { ACTION } from '@app/common//enum/action.enum';
import { CONTROLLER } from '@app/common//enum/controller.enum';
import { MICROSERVICE } from '@app/common//enum/microservice.enum';
import { JwtAuthGuard } from '@app/common//guards/jwt-auth.guard';
import { CreateMessageGatewayDto } from '@app/common//rto/gateway/chat/create-message-gateway.dto';
import { UserRto } from '@app/common//rto/microservices/auth/user.rto';
import { MessageRTO } from '@app/common//rto/microservices/chat/message.rto';
import { RecentChatRTO } from '@app/common//rto/microservices/chat/recent_chat.rto';
import { RecentChatGatewayRTO } from '@app/common//rto/microservices/chat/recent_chat_aggregated.rto';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { NetworkingService } from '@pp/networking';
import { SocketGateway } from 'apps/gateway/websocket/socket.gateway';
import { ChatService } from './chat.service';
import { SOCKET_EVENTS } from '@app/common//enum/socket/socket.enum';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(
    private readonly networking: NetworkingService,
    private readonly socketGateway: SocketGateway,
    private readonly chatService: ChatService,
  ) {}

  @Post('send')
  @UseInterceptors(FilesInterceptor('files'))
  async sendMessage(
    @Body() body: CreateMessageGatewayDto,
    @ActiveUser() user: User,
    @UploadedFiles() files?: Express.Multer.File[],
  ): Promise<any> {
    const res = await this.chatService.createMessage(user.id, body, files);

    this.socketGateway.server
      .to(res.roomId)
      .emit(SOCKET_EVENTS.NEW_MESSAGE, res);
    const recentChatRto = await this.chatService.getRecentChatRto(user.id, body.receiverId);

    this.socketGateway.server
      .to(body.receiverId)
      .emit(SOCKET_EVENTS.RECENT_CHAT_UPDATE, recentChatRto);

    return res;
  }

  @Get('recent-chats')
  async recentChats(@ActiveUser() user: User): Promise<RecentChatGatewayRTO[]> {
    try {
      const recentChats = await this.networking.send<RecentChatRTO[]>(
        `${MICROSERVICE.CHAT}.${CONTROLLER.MESSAGES}.${ACTION.GET_CHAT_LIST}`,
        user.id,
      );

      const currentUser = await this.networking.send<UserRto>(
        `${MICROSERVICE.AUTHENTICATION}.${CONTROLLER.AUTH}.${ACTION.GET_USER}`,
        user.id,
      );

      const rtos = await Promise.all(
        recentChats.map(async (chat) => {
          const participantId = chat.participants.find(
            (p) => p.toString() !== user.id,
          );

          if (!participantId) {
            throw new Error('No valid participant found in chat room');
          }

          const participant = await this.networking.send<UserRto>(
            `${MICROSERVICE.AUTHENTICATION}.${CONTROLLER.AUTH}.${ACTION.GET_USER}`,
            participantId,
          );

          return RecentChatGatewayRTO.fromRecentChatAndUsers(
            chat,
            participant,
            currentUser,
          );
        }),
      );

      return rtos;
    } catch (error) {
      console.error('Error retrieving recent chats:', error);
      throw new Error('Failed to retrieve recent chats');
    }
  }

  @Get('messages/:roomId')
  async getMessages(@Param('roomId') roomId: string): Promise<MessageRTO[]> {
    const messages = await this.networking.send<MessageRTO[]>(
      `${MICROSERVICE.CHAT}.${CONTROLLER.MESSAGES}.${ACTION.RETRIEVE}`,
      roomId,
    );

    return messages;
  }
}
