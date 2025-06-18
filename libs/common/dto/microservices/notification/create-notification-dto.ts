import { NotificationType } from '@app/common//enum/notification/notification-type.enum';
import { Types } from 'mongoose';

export class CreateNotificationDto {
  constructor(
    public readonly receiverId: Types.ObjectId,
    public readonly message: string,
    public readonly type: NotificationType,
    public readonly isRead: boolean,
    public readonly entityIds: Types.ObjectId[],
    public readonly senders: Types.ObjectId[] = [],
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

  static fromGift(
    receiverId: Types.ObjectId,
    senderId: Types.ObjectId,
    amount: string,
  ): CreateNotificationDto {
    return new CreateNotificationDto(
      receiverId,
      amount,
      NotificationType.GIFT,
      false,
      [],
      [senderId],
    );
  }

  static fromPostRemoved(
    receiverId: Types.ObjectId,
    postId: Types.ObjectId,
    content: string,
  ): CreateNotificationDto {
    return new CreateNotificationDto(
      receiverId,
      `Your post ${content} has been removed because it does not follow our reel content policy.`,
      NotificationType.POST_REMOVED,
      false,
      [postId],
    );
  }

  static fromReelRemoved(
    receiverId: Types.ObjectId,
    postId: Types.ObjectId,
    description: string,
  ): CreateNotificationDto {
    return new CreateNotificationDto(
      receiverId,
      `Your reel ${description} has been removed because it does not follow our reel content policy.`,
      NotificationType.REEL_REMOVED,
      false,
      [postId],
    );
  }

  static fromCommentRemoved(
    receiverId: Types.ObjectId,
    postId: Types.ObjectId,
    content: string,
  ): CreateNotificationDto {
    return new CreateNotificationDto(
      receiverId,
      content,
      NotificationType.COMMENT_REMOVED,
      false,
      [postId],
    );
  }
}
