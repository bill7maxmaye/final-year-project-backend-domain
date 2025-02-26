import { Controller, Inject } from '@nestjs/common';
import {
  ClientProxy,
  EventPattern,
  MessagePattern,
  Payload,
} from '@nestjs/microservices';
import { NotificationService } from './notification.service';

@Controller()
export class NotificationController {
  constructor(
    @Inject('RABBITMQ_SERVICE') private client: ClientProxy,
    private readonly notificationService: NotificationService,
  ) {}

  @EventPattern('notification_created')
  getHello(@Payload() data: any): any {
    return this.notificationService.getHello(data);
  }

  @MessagePattern({ cmd: 'notification_created' })
  getNotifications(): any {
    return this.notificationService.getNotification();
  }

  @EventPattern('to_notification')
  FromNotification(@Payload() data: any): any {
    //console.log(data);
    this.client.emit('from_notification', data);
  }
}
