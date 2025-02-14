import { Controller, Post,Inject, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { ClientProxy } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(@Inject('RABBITMQ_SERVICE') private client: ClientProxy) {}

  @Post('/notification')
  getHello(@Body() data: any): any {
    return this.client.send({ cmd: 'notification_created' }, data);
  }
}
