import { ActiveUser } from '@app/common//decorators/active-user-decorator';
import { Notification } from '@app/common//entities/notification/notification.entity';
import { User } from '@app/common//entities/user/user-entity';
import { JwtAuthGuard } from '@app/common//guards/jwt-auth.guard';
import { NotificationsGatewayRTO } from '@app/common//rto/gateway/notification/notifications-gateway.rto';
import { UserRto } from '@app/common//rto/microservices/auth/user.rto';
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { SocketGateway } from 'apps/gateway/websocket/socket.gateway';
import { ACTION } from 'libs/common/enum/action.enum';
import { CONTROLLER } from 'libs/common/enum/controller.enum';
import { MICROSERVICE } from 'libs/common/enum/microservice.enum';
import { NetworkingService } from 'libs/networking';
import { lastValueFrom } from 'rxjs/internal/lastValueFrom';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(
    private readonly networking: NetworkingService,
    private readonly socketGateway: SocketGateway,
  ) {}

  @Post('create')
  create(@Body() createNotificationDto: any): any {
    console.log(
      '📤 Sending request to Notification Microservice:',
      createNotificationDto,
    );

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      // const response = await lastValueFrom(
      //   this.networking
      //     .send(
      //       `${MICROSERVICE.NOTIFICATION}.${CONTROLLER.NOTIFICATIONS}.${ACTION.CREATE}`,
      //       {},
      //     )
      //     .pipe(defaultIfEmpty(null)), // ← This avoids EmptyError
      // );

      // console.log(
      //   '📥 Received response from Notifications Microservice:',
      //   response,
      // );
      // return response;
    } catch (error) {
      console.error(
        '🔥 Error communicating with Notifications Microservice:',
        error,
      );
      throw error;
    }
  }

  @Get()
  async getNotifications(
    @ActiveUser() user: User,
  ): Promise<NotificationsGatewayRTO[]> {
    console.log(`user id is ${user.id}`);
    const notifications = await this.networking.send<Notification[]>(
      `${MICROSERVICE.NOTIFICATION}.${CONTROLLER.NOTIFICATIONS}.${ACTION.RETRIEVE}`,
      user.id,
    );

    const aggregatedNotification = notifications.map(async (notification) => {
      const sendersPromises = notification.senders.map((senderId) => {
        return this.networking.send<UserRto>(
          `${MICROSERVICE.AUTHENTICATION}.${CONTROLLER.AUTH}.${ACTION.GET_USER}`,
          senderId,
        );
      });

      return Promise.all(sendersPromises).then((senders) => {
        return NotificationsGatewayRTO.fromNotificationAndUsers(
          notification,
          senders,
        );
      });
    });

    return Promise.all(aggregatedNotification);
  }

  @EventPattern(
    `${MICROSERVICE.NOTIFICATION}.${CONTROLLER.NOTIFICATIONS}.${ACTION.CREATED}`,
  )
  handleNotificationCreated(data: any): void {
    console.log('Notification created:', data);
    this.socketGateway.server.emit('notification', data);
  }
}
