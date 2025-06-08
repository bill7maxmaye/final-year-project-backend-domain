import { ActiveUser } from '@app/common//decorators/active-user-decorator';
import { Notification } from '@app/common//entities/notification/notification.entity';
import { User } from '@app/common//entities/user/user-entity';
import { SOCKET_EVENTS } from '@app/common//enum/socket/socket.enum';
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

@Controller('notifications')
// @UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(
    private readonly networking: NetworkingService,
    private readonly socketGateway: SocketGateway,
  ) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
  async getNotifications(
    @ActiveUser() user: User,
  ): Promise<NotificationsGatewayRTO[]> {
    console.log(`user id is ${user.id}`);
    const notifications = await this.networking.send<Notification[]>(
      `${MICROSERVICE.NOTIFICATION}.${CONTROLLER.NOTIFICATIONS}.${ACTION.RETRIEVE}`,
      user.id,
    );

    const notificationsRto = await this.getNotificationRto(notifications);

    return notificationsRto;
  }

  @EventPattern(
    `${MICROSERVICE.GATEWAY}.${CONTROLLER.NOTIFICATIONS}.${ACTION.CREATED}`,
  )
  async handleNotificationCreated(data: Notification): Promise<void> {
    console.log(
      `📥 Received notification from Notification Microservice: ${data}`,
    );
    const notificationRto = await this.getNotificationRto([data]);

    this.socketGateway.server
      .to(notificationRto[0].receiverId)
      .emit(SOCKET_EVENTS.NEW_NOTIFICATION, notificationRto[0]);

    console.log(
      `📨 Notification emitted to user ${notificationRto[0].receiverId}`,
    );
  }

  private getNotificationRto(
    notifications: Notification[],
  ): Promise<NotificationsGatewayRTO[]> {
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
}
