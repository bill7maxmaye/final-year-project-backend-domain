import { Controller, Post, Inject, Body, Get, Param, Patch, Delete } from '@nestjs/common';
import { AppService } from './app.service';
import { ClientProxy } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from './dtos/userDto';
@Controller()
export class AppController {
  constructor(
    private configService: ConfigService,
    @Inject('RABBITMQ_SERVICE') private client: ClientProxy,
    private readonly reservationsService: AppService,
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

  //below here are endpoints to test if user is created
  @Post('/createUser')
  create(@Body() CreateUserDto: CreateUserDto) {
    return this.reservationsService.createUser(CreateUserDto);
  }

  @Get()
  findAll() {
    return this.reservationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reservationsService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reservationsService.remove(id);
  }
}
