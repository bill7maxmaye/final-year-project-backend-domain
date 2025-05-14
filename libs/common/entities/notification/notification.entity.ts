import { NotificationType } from 'aws-sdk/clients/budgets';
import { BaseEntity } from '../base.entity';
import { NotificationDocument } from '../../models/notification/notification.model';

export class Notification extends BaseEntity {
  constructor(
    id: string,
    createdAt: Date,
    updatedAt: Date,
    public receiverId: string,
    public senders: string[],
    public entityIds: string[],
    public message: string,
    public type: NotificationType,
  ) {
    super(id, createdAt, updatedAt);
  }

  static fromDocument(document: NotificationDocument): Notification {
    return new Notification(
      document.id,
      document.createdAt,
      document.updatedAt,
      document.receiverId.toString(),
      document.senders.map((sender) => sender.toString()),
      document.entityIds.map((entityId) => entityId.toString()),
      document.message,
      document.type,
    );
  }

  static fromDocuments(documents: NotificationDocument[]): Notification[] {
    return documents.map((document) => Notification.fromDocument(document));
  }
}
