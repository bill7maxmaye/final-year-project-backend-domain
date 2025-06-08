import { NotificationType } from '@app/common//enum/notification/notification-type.enum';
import { UserRto } from '../../microservices/auth/user.rto';
import { Notification } from '@app/common//entities/notification/notification.entity';

export class NotificationsGatewayRTO {
  constructor(
    public id: string,
    public createdAt: Date,
    public updatedAt: Date,
    public receiverId: string,
    public senders: UserRto[],
    public entityIds: string[],
    public message: string,
    public type: NotificationType,
  ) {}

  static fromNotificationAndUsers(
    notification: Notification,
    users: UserRto[],
  ): NotificationsGatewayRTO {
    return new NotificationsGatewayRTO(
      notification.id,
      notification.createdAt,
      notification.updatedAt,
      notification.receiverId,
      users,
      notification.entityIds,
      notification.message,
      notification.type as NotificationType,
    );
  }
}
