import { Injectable } from '@nestjs/common';
import { ChatRepository } from './repository/chat.repository';
import { ChatMessageRepository } from './repository/chat-message.repository';
import { RecentChatRTO } from '@app/common//rto/microservices/chat/recent_chat.rto';
import { Types } from 'mongoose';
import { MessageRTO } from '@app/common//rto/microservices/chat/message.rto';
import { ResolvedCreateMessageDto } from './dtos/resolved-create-message.dto';
import { ChatMessage } from '@app/common//entities/chat/chat-message.entity';
import { CreateMessageDto } from './dtos/create-chat.dto';
import { ChatAttachmentsRepository } from './repository/chat-attachments.repository';
import { CreateAttachmentsDto } from './dtos/create-attachments.dto';
import { ChatAttachment } from '@app/common//entities/chat/chat-attachment.entity';
import { ChatAttachmentDocument } from '@app/common//models/chat/chat-attachment.model';

@Injectable()
export class ChatService {
  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly chatMessageRepository: ChatMessageRepository,
    private readonly chatAttachmentsRepository: ChatAttachmentsRepository,
  ) {}

  async getRecentChats(userId: string): Promise<RecentChatRTO[]> {
    const id = new Types.ObjectId(userId);
    const recentChats = await this.chatRepository.getRecentChats(id);
    return RecentChatRTO.fromAggregatedResults(recentChats);
  }

  async createMessage(dto: CreateMessageDto): Promise<MessageRTO> {
    const sender = new Types.ObjectId(dto.senderId);
    const receiver = new Types.ObjectId(dto.receiverId);
    const room = await this.chatRepository.getOrCreateRoom(sender, receiver);

    const resolvedDto = ResolvedCreateMessageDto.fromCreateMessage(
      dto,
      room._id,
      sender,
    );
    const messageDoc = await this.chatMessageRepository.createAndPopulate(
      resolvedDto,
      [{ path: 'attachments', model: ChatAttachmentDocument.name }],
    );

    const entity = ChatMessage.fromDocument(messageDoc);
    console.log(`Created message: ${JSON.stringify(entity)}`);
    console.log(`messageRto: ${JSON.stringify(MessageRTO.fromEntity(entity))}`);
    return MessageRTO.fromEntity(entity);
  }

  async retrieveMessages(roomId: string): Promise<ChatMessage[]> {
    return this.chatMessageRepository.findByRoomId(roomId);
  }

  async createAttachment(
    body: CreateAttachmentsDto[],
  ): Promise<ChatAttachment[]> {
    const documents = await this.chatAttachmentsRepository.createMany(body);
    return ChatAttachment.fromDocuments(documents);
  }
}
