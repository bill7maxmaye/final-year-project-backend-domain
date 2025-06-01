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
}
