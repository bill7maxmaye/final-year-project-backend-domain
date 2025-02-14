import { Controller, Get } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { EventPattern, MessagePattern } from '@nestjs/microservices';

@Controller()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @MessagePattern({ cmd: 'notification_created' })
  getHello(data: any): any {
    return this.notificationService.getHello(data);
  }
}
