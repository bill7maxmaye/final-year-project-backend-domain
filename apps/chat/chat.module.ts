import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatMessageRepository } from './repository/chat-message.repository';
import { ChatRepository } from './repository/chat.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config/dist/config.module';
import { ConfigService } from '@nestjs/config';
import { NetworkingModule } from '@pp/networking';
import {
  ChatRoomDocument,
  ChatRoomSchema,
} from '@app/common//models/chat/chat-room.model';
import {
  ChatMessageDocument,
  ChatMessageSchema,
} from '@app/common//models/chat/chat-message.model';
import { ChatAttachmentsRepository } from './repository/chat-attachments.repository';
import {
  ChatAttachmentDocument,
  ChatAttachmentSchema,
} from '@app/common//models/chat/chat-attachment.model';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: ChatRoomDocument.name, schema: ChatRoomSchema },
      { name: ChatMessageDocument.name, schema: ChatMessageSchema },
      { name: ChatAttachmentDocument.name, schema: ChatAttachmentSchema },
    ]),

    NetworkingModule,
  ],
  controllers: [ChatController],
  providers: [
    ChatService,
    ChatMessageRepository,
    ChatRepository,
    ChatAttachmentsRepository,
  ],
})
export class ChatModule {}
