import { Body, Controller, Get, Post } from '@nestjs/common';
import { ACTION } from 'libs/common/enum/action.enum';
import { CONTROLLER } from 'libs/common/enum/controller.enum';
import { MICROSERVICE } from 'libs/common/enum/microservice.enum';
import { NetworkingService } from 'libs/networking';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly networking: NetworkingService) {}

  @Post('create')
  async register(@Body() createNotificationDto: any): Promise<any> {
    console.log(
      '📤 Sending request to Notification Microservice:',
      createNotificationDto,
    );

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const response = await this.networking.send<any>(
        `${MICROSERVICE.NOTIFICATION}.${CONTROLLER.NOTIFICATIONS}.${ACTION.CREATE}`,
        createNotificationDto,
      );

      console.log(
        '📥 Received response from Notifications Microservice:',
        response,
      );
      return response;
    } catch (error) {
      console.error(
        '🔥 Error communicating with Notifications Microservice:',
        error,
      );
      throw error;
    }
  }

  @Get()
  async getNotifications(): Promise<any[]> {
    console.log(`sending network request`);
    return this.networking.send(
      `${MICROSERVICE.NOTIFICATION}.${CONTROLLER.NOTIFICATIONS}.${ACTION.GET}`,
      {},
    );
  }
}
