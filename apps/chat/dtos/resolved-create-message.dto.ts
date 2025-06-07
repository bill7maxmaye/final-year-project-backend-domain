import { Types } from 'mongoose';
import { CreateMessageDto } from './create-chat.dto';

export class ResolvedCreateMessageDto {
  constructor(
    public roomId: Types.ObjectId,
    public senderId: Types.ObjectId,
    public content?: string,
    public replyTo?: Types.ObjectId,
    public forwardedFrom?: Types.ObjectId,
    public attachments: Types.ObjectId[] = [],
    public mentionedUserIds: Types.ObjectId[] = [],
  ) {}

  static fromCreateMessage(
    dto: CreateMessageDto,
    roomId: Types.ObjectId,
    senderId: Types.ObjectId,
  ): ResolvedCreateMessageDto {
    return new ResolvedCreateMessageDto(
      roomId,
      senderId,
      dto.content,
      dto.replyTo,
      dto.forwardedFrom,
      dto.attachments ?? [],
      dto.mentionedUserIds ?? [],
    );
  }
}
