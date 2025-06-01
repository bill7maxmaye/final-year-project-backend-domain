import { Types } from 'mongoose';
import { ChatMessageDocument } from '../../models/chat/chat-message.model';
import { BaseEntity } from '../base.entity';
import { ChatAttachment } from './chat-attachment.entity';
import { MessageView } from './message-view.entity';

export class ChatMessage extends BaseEntity {
  constructor(
    id: string,
    createdAt: Date,
    updatedAt: Date,
    public roomId: string,
    public senderId: string,
    public content: string | null,
    public edited: boolean,
    public replyTo?: string,
    public forwardedFrom?: string,
    public reactions: Record<string, number> = {},
    public attachments: ChatAttachment[] = [],
    public mentionedUserIds: string[] = [],
    public isDeleted: boolean = false,
    public deletedBy: string[] = [],
    public views: MessageView[] = [],
    public isPinned: boolean = false,
  ) {
    super(id, createdAt, updatedAt);
  }

  static fromDocument(doc: ChatMessageDocument): ChatMessage {
    return new ChatMessage(
      doc._id.toString(),
      doc.createdAt,
      doc.updatedAt,
      doc.roomId.toString(),
      doc.senderId.toString(),
      doc.content ?? null,
      doc.edited ?? false,
      doc.replyTo?.toString(),
      doc.forwardedFrom?.toString(),
      doc.reactions instanceof Map
        ? Object.fromEntries(doc.reactions.entries())
        : (doc.reactions ?? {}),
      doc.attachments
        ?.map((a: any) =>
          a instanceof Types.ObjectId ? null : ChatAttachment.fromDocument(a),
        )
        .filter(Boolean) as ChatAttachment[],

      (doc.mentionedUserIds ?? []).map((id) => id.toString()),
      doc.isDeleted ?? false,
      (doc.deletedBy ?? []).map((id) => id.toString()),
      (doc.views ?? []).map((view) => MessageView.fromDocument(view)),
      doc.isPinned ?? false,
    );
  }

  static fromDocuments(docs: ChatMessageDocument[]): ChatMessage[] {
    return docs.map((doc) => ChatMessage.fromDocument(doc));
  }
}
