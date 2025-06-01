import { ACTION } from '@app/common//enum/action.enum';
import { CONTROLLER } from '@app/common//enum/controller.enum';
import { MICROSERVICE } from '@app/common//enum/microservice.enum';
import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { CreateMessageDto } from './dtos/create-chat.dto';
import { ChatService } from './chat.service';
import { MessageRTO } from '@app/common//rto/microservices/chat/message.rto';
import { RecentChatRTO } from '@app/common//rto/microservices/chat/recent_chat.rto';
import { CreateAttachmentsDto } from './dtos/create-attachments.dto';
import { AttachmentsRto } from '@app/common//rto/microservices/chat/attachments.rto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @MessagePattern(
    `${MICROSERVICE.CHAT}.${CONTROLLER.MESSAGES}.${ACTION.CREATE}`,
  )
  async handleMessageCreation(body: CreateMessageDto): Promise<MessageRTO> {
    const message = await this.chatService.createMessage(body);
    return message;
  }

  @MessagePattern(
    `${MICROSERVICE.CHAT}.${CONTROLLER.MESSAGES}.${ACTION.GET_CHAT_LIST}`,
  )
  async handleGetMessages(userId: string): Promise<RecentChatRTO[]> {
    const messages = await this.chatService.getRecentChats(userId);
    return messages;
  }

  @MessagePattern(
    `${MICROSERVICE.CHAT}.${CONTROLLER.MESSAGES}.${ACTION.RETRIEVE}`,
  )
  async retrieveMessages(roomId: string): Promise<MessageRTO[]> {
    const messages = await this.chatService.retrieveMessages(roomId);

    return MessageRTO.fromEntities(messages);
  }

  @MessagePattern(
    `${MICROSERVICE.CHAT}.${CONTROLLER.MESSAGES}.${ACTION.CREATE_MANY}`,
  )
  async createAttachments(
    body: CreateAttachmentsDto[],
  ): Promise<AttachmentsRto[]> {
    const attachments = await this.chatService.createAttachment(body);

    return AttachmentsRto.fromEntities(attachments);
  }
}
