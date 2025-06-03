import { CreateMessageGatewayDto } from '@app/common//rto/gateway/chat/create-message-gateway.dto';
import { Types } from 'mongoose';

export class CreateMessageDto {
  constructor(
    public senderId: Types.ObjectId,
    public receiverId: Types.ObjectId | undefined,
    public content: string | undefined,
    public replyTo: Types.ObjectId | undefined,
    public forwardedFrom: Types.ObjectId | undefined,
    public attachments: Types.ObjectId[] = [],
    public mentionedUserIds: Types.ObjectId[] = [],
  ) {}

  static fromGateway(
    dto: CreateMessageGatewayDto,
    senderId: string,
    attachments: Types.ObjectId[] = [],
  ): CreateMessageDto {
    const userId = new Types.ObjectId(senderId);
    console.log('CreateMessageDto.fromGateway', JSON.stringify(dto), userId);
    return new CreateMessageDto(
      userId,
      new Types.ObjectId(dto.receiverId),
      dto.content,
      dto.replyTo ? new Types.ObjectId(dto.replyTo) : undefined,
      dto.forwardedFrom ? new Types.ObjectId(dto.forwardedFrom) : undefined,
      attachments,
      dto.mentionedUserIds
        ? dto.mentionedUserIds.map((element) => new Types.ObjectId(element))
        : [],
    );
  }
}
