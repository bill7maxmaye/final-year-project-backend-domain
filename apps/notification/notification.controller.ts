import { Controller, Get } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { MessagePattern } from '@nestjs/microservices';
import { MICROSERVICE } from '@app/common//enum/microservice.enum';
import { CONTROLLER } from '@app/common//enum/controller.enum';
import { ACTION } from '@app/common//enum/action.enum';

@Controller()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  getHello(): string {
    return this.notificationService.getHello();
  }

  @MessagePattern(
    `${MICROSERVICE.NOTIFICATION}.${CONTROLLER.NOTIFICATIONS}.${ACTION.GET}`,
  )
  handleNotification(body: any) {
    return [
      {
        receiverId: '665c9b5f4c9e4a83df4fced1',
        senders: ['665c9b5f4c9e4a83df4fced2'],
        message: 'Someone commented on your post.',
        type: 'comment',
        entityIds: ['665c9b5f4c9e4a83df4fced3'],
        isRead: false,
      },
      {
        receiverId: '665c9b5f4c9e4a83df4fced4',
        senders: ['665c9b5f4c9e4a83df4fced5'],
        message: 'Someone liked your photo.',
        type: 'like',
        entityIds: ['665c9b5f4c9e4a83df4fced6'],
        isRead: true,
      },
      {
        receiverId: '665c9b5f4c9e4a83df4fced7',
        senders: ['665c9b5f4c9e4a83df4fced8'],
        message: 'You have a new follower.',
        type: 'follow',
        entityIds: [],
        isRead: true,
      },
      {
        receiverId: '665c9b5f4c9e4a83df4fced9',
        senders: ['665c9b5f4c9e4a83df4fceda'],
        message: 'You were mentioned in a comment.',
        type: 'mention',
        entityIds: ['665c9b5f4c9e4a83df4fcedb'],
        isRead: true,
      },
      {
        receiverId: '665c9b5f4c9e4a83df4fcedc',
        senders: ['665c9b5f4c9e4a83df4fcedd'],
        message: 'Someone reacted to your post.',
        type: 'reaction',
        entityIds: ['665c9b5f4c9e4a83df4fcede'],
        isRead: true,
      },
      {
        receiverId: '665c9b5f4c9e4a83df4fcedf',
        senders: ['665c9b5f4c9e4a83df4fcee0'],
        message: 'Your post was shared.',
        type: 'share',
        entityIds: ['665c9b5f4c9e4a83df4fcee1'],
        isRead: true,
      },
      {
        receiverId: '665c9b5f4c9e4a83df4fcee2',
        senders: ['665c9b5f4c9e4a83df4fcee3'],
        message: 'New post from someone you follow.',
        type: 'post',
        entityIds: ['665c9b5f4c9e4a83df4fcee4'],
        isRead: true,
      },
      {
        receiverId: '665c9b5f4c9e4a83df4fcee5',
        senders: ['665c9b5f4c9e4a83df4fcee6'],
        message: 'You have a new message.',
        type: 'message',
        entityIds: ['665c9b5f4c9e4a83df4fcee7'],
        isRead: true,
      },
      {
        receiverId: '665c9b5f4c9e4a83df4fcee8',
        senders: ['665c9b5f4c9e4a83df4fcee9'],
        message: 'You received a friend request.',
        type: 'friend_request',
        entityIds: ['665c9b5f4c9e4a83df4fceea'],
        isRead: true,
      },
      {
        receiverId: '665c9b5f4c9e4a83df4fceeb',
        senders: ['665c9b5f4c9e4a83df4fceec'],
        message: 'Your friend request was accepted.',
        type: 'friend_request_accepted',
        entityIds: ['665c9b5f4c9e4a83df4fceed'],
        isRead: true,
      },
    ];
  }
}
