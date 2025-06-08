import { ChatAttachmentDocument } from '../../models/chat/chat-attachment.model';
import { BaseEntity } from '../base.entity';

export class ChatAttachment extends BaseEntity {
  constructor(
    id: string,
    createdAt: Date,
    updatedAt: Date,
    public url: string,
    public type: string,
    public fileName?: string,
    public sizeInBytes?: number,
    public uploadedBy?: string,
    public uploadedAt?: Date,
  ) {
    super(id, createdAt, updatedAt);
  }

  static fromDocument(doc: ChatAttachmentDocument): ChatAttachment {
    return new ChatAttachment(
      doc._id.toString(),
      doc.createdAt,
      doc.updatedAt,
      doc.url,
      doc.type,
      doc.fileName,
      doc.sizeInBytes,
      doc.uploadedBy?.toString(),
      doc.uploadedAt,
    );
  }

  static fromDocuments(docs: ChatAttachmentDocument[]): ChatAttachment[] {
    return docs.map((doc) => ChatAttachment.fromDocument(doc));
  }
}
