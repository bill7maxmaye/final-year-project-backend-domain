import { BaseRepository } from '@app/common//baseRepository/base-repository';
import { ChatMessage } from '@app/common//entities/chat/chat-message.entity';
import { ChatAttachmentDocument } from '@app/common//models/chat/chat-attachment.model';
import { ChatMessageDocument } from '@app/common//models/chat/chat-message.model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

export class ChatMessageRepository extends BaseRepository<ChatMessageDocument> {
  constructor(
    @InjectModel(ChatMessageDocument.name)
    protected readonly model: Model<ChatMessageDocument>,
  ) {
    super(model);
  }

  async findByRoomId(roomId: string): Promise<ChatMessage[]> {
    const messagesDocument = await this.find({ roomId })
      .sort({ createdAt: -1 })
      .populate({ path: 'attachments', model: ChatAttachmentDocument.name })

      .exec();

    return ChatMessage.fromDocuments(messagesDocument);
  }
}
