import { BaseRepository } from '@app/common//baseRepository/base-repository';
import { ChatAttachmentDocument } from '@app/common//models/chat/chat-attachment.model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

export class ChatAttachmentsRepository extends BaseRepository<ChatAttachmentDocument> {
  constructor(
    @InjectModel(ChatAttachmentDocument.name)
    protected readonly model: Model<ChatAttachmentDocument>,
  ) {
    super(model);
  }
}
