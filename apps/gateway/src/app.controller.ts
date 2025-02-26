import { Controller, Post, Inject, Body, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ClientProxy } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
@Controller()
export class AppController {
  constructor(
    private configService: ConfigService,
    @Inject('RABBITMQ_SERVICE') private client: ClientProxy,
  ) {}

  @Post('/notification')
  getHello(@Body() data: any): any {
    this.client.emit('notification_created', data);
    return { sucess: 'Suceesfully sent message' };
  }

  @Get('/notification')
  getHelloNotifications(): any {
    const response = this.client.send({ cmd: 'notification_created' }, {});
    console.log(response);
    return response;
  }

  @Post('/profile')
  getProfile(data: any): any {
    this.client.emit('profile_requested', data);
    return { success: true };
  }

  @Post('/tonotification')
  ToNotification(@Body() data: any): any {
    this.client.emit('to_notification', data);
    //return { sucess: 'Suceesfully sent message' };
  }

  //endpoint to test if the config module is set up globally and working
  @Get('/port')
  getPort(): any {
    const port = this.configService.get<number>('PORT');
    console.log('PORT:', port); // Debugging
    return { port }; // Return as JSON response
  }
}
