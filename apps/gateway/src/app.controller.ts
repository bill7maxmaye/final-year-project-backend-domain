import { Controller, Post, Inject, Body, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ClientProxy } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(@Inject('RABBITMQ_SERVICE') private client: ClientProxy) {}

  @Post('/notification')
  getHello(@Body() data: any): any {
    // this.client.send({ cmd: 'notification_created' }, data);
    this.client.emit('notification_created', data);
    return 'Notification sent to the queue'; 
    // console.log('Notification Service received:', data);
  }

  @Get('/notification')
  getHelloNotifications(): any {
    const response = this.client.send({ cmd: 'notification_createdd' }, {});
    console.log(response);
    return response;
  }

  @Post('/profile')
  getProfile(data: any): any {
    this.client.emit('profile_requested', data);
    return { success: true };
  }
}
