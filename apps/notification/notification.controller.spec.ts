import { Controller } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MICROSERVICE } from 'libs/common/enum/microservice.enum';
import { CONTROLLER } from 'libs/common/enum/controller.enum';
import { ACTION } from 'libs/common/enum/action.enum';

@Controller()
export class NotificationController {
  constructor(private configService: ConfigService) {}

  @MessagePattern(
    `${MICROSERVICE.NOTIFICATION}.${CONTROLLER.NOTIFICATIONS}.${ACTION.CREATE}`,
  )
  handleUserRegistered(@Payload() createNotificationDto: any): any {
    console.log('📤 received an event in notification ms');
    return createNotificationDto;
  }
}
