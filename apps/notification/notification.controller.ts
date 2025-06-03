import { Controller } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import { MICROSERVICE } from '@app/common//enum/microservice.enum';
import { CONTROLLER } from '@app/common//enum/controller.enum';
import { ACTION } from '@app/common//enum/action.enum';
import { CreateNotificationDto } from '@app/common//dto/microservices/notification/create-notification-dto';
import { NotificationType } from '@app/common//enum/notification/notification-type.enum';
import { Types } from 'mongoose';
import { User } from '@app/common//entities/user/user-entity';
import { Notification } from '@app/common//entities/notification/notification.entity';

@Controller()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @MessagePattern(
    `${MICROSERVICE.NOTIFICATION}.${CONTROLLER.NOTIFICATIONS}.${ACTION.RETRIEVE}`,
  )
  async handleNotification(userId: string): Promise<Notification[]> {
    console.log('Received user ID:', userId);
    return await this.notificationService.getNotifications(userId);
  }

  @EventPattern(
    `${MICROSERVICE.NOTIFICATION}.${CONTROLLER.NOTIFICATIONS}.${ACTION.CREATE}`,
  )
  async handleNotificationEvent(payload: CreateNotificationDto): Promise<void> {
    console.log('Received notification payload:', payload);
    await this.notificationService
      .createNotification(payload)
      .then((notification) => {
        console.log('Notification saved:', notification);
      })
      .catch((error) => {
        console.error('Error saving notification:', error);
      });

    return;
  }

  @MessagePattern(
    `${MICROSERVICE.NOTIFICATION}.${CONTROLLER.NOTIFICATIONS}.${ACTION.LIST_ALL}`,
  )
  handleListAllNotifications(body: any) {}
}
