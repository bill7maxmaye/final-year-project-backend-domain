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
    this.client.send({ cmd: 'notification_created' }, {});
    console.log('Notification Service received:');
  }
}
