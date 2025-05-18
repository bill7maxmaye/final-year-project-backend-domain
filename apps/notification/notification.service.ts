import { Injectable } from '@nestjs/common';
import { NotificationRepository } from './notification.repository';
import { CreateNotificationDto } from '@app/common//dto/microservices/notification/create-notification-dto';
import { Notification } from '@app/common//entities/notification/notification.entity';
import { NetworkingService } from '@pp/networking';
import { MICROSERVICE } from '@app/common//enum/microservice.enum';
import { CONTROLLER } from '@app/common//enum/controller.enum';
import { ACTION } from '@app/common//enum/action.enum';
import { Types } from 'mongoose';

@Injectable()
export class NotificationService {
  constructor(
    public repository: NotificationRepository,
    public networkingService: NetworkingService,
  ) {}

  async createNotification(
    createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
    const notification = await this.repository.create(createNotificationDto);
    if (!notification) {
      throw new Error('Failed to create notification');
    }

    this.networkingService.emit(
      `${MICROSERVICE.NOTIFICATION}.${CONTROLLER.NOTIFICATIONS}.${ACTION.CREATED}`,
      notification,
    );

    return Notification.fromDocument(notification);
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    const id = new Types.ObjectId(userId);
    const notifications = await this.repository.find({ receiverId: id });
    if (!notifications) {
      throw new Error('Failed to fetch notifications');
    }

    await this.repository.updateMany(
      { receiverId: id, isRead: false },
      { isRead: true },
    );

    return notifications.map((notification) =>
      Notification.fromDocument(notification),
    );
  }
}
