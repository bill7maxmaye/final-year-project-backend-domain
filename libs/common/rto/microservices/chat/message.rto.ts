import { ChatMessage } from '@app/common//entities/chat/chat-message.entity';

export class MessageRTO {
  constructor(
    public id: string,
    public roomId: string,
    public senderId: string,
    public content: string | null,
    public createdAt: Date,
    public edited: boolean,
    public isDeleted: boolean = false,
    public isPinned: boolean = false,
    public replyTo?: string,
    public forwardedFrom?: string,
    public attachments: any[] = [],
    public mentionedUserIds: string[] = [],
    public reactions: Record<string, number> = {},
  ) {}

  static fromEntity(entity: ChatMessage): MessageRTO {
    return new MessageRTO(
      entity.id,
      entity.roomId,
      entity.senderId,
      entity.content,
      entity.createdAt,
      entity.edited,
      entity.isDeleted,
      entity.isPinned,
      entity.replyTo,
      entity.forwardedFrom,
      entity.attachments,
      entity.mentionedUserIds,
      entity.reactions,
    );
  }

  static fromEntities(entities: ChatMessage[]): MessageRTO[] {
    return entities.map((entity) => MessageRTO.fromEntity(entity));
  }
}
