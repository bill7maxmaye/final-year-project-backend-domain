import { Controller, Get } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  //@MessagePattern({ cmd: 'notification_created' })
  @EventPattern('notification_created')
  getHello(@Payload() data: any): any {
    return this.notificationService.getHello(data);
  }


  @MessagePattern({ cmd: 'notification_createdd' })
  getNotifications(): any {
    return this.notificationService.getNotification();
  }
}

