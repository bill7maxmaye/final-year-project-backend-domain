import { NotificationType } from '@app/common//enum/notification/notification-type.enum';
import { Types } from 'mongoose';

export class CreateNotificationDto {
  constructor(
    public readonly receiverId: Types.ObjectId,
    public readonly message: string,
    public readonly type: NotificationType,
    public readonly isRead: boolean,
    public readonly entityIds: Types.ObjectId[],
    public readonly senders: Types.ObjectId[],
  ) {}

  static fromLikePost(
    receiverId: Types.ObjectId,
    postId: Types.ObjectId,
    senderId: Types.ObjectId,
  ): CreateNotificationDto {
    return new CreateNotificationDto(
      receiverId,
      `User Liked Your Post`,
      NotificationType.LIKE,
      false,
      [postId],
      [senderId],
    );
  }
}
