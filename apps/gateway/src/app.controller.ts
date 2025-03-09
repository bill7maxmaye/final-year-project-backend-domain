import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { CreateUserDto } from '../../authentication/src/dtos/userDto';
import { AppService } from './app.service';
import { SanitizedUserRto, UserRto } from '@app/common';
import { lastValueFrom } from 'rxjs';
import { LoginUserDto } from 'apps/authentication/src/dtos/login-user.dto';
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
  @Post('/register')
  async registerUser(
    @Body() createUserDto: CreateUserDto,
  ): Promise<SanitizedUserRto> {
    console.log('📤 Sending request to Auth Microservice:', createUserDto);
    // const response = await this.client.send({ cmd: 'register_user' }, createUserDto);
    const response = await lastValueFrom(
      this.client.send<UserRto>({ cmd: 'register_user' }, createUserDto),
    );
    return new SanitizedUserRto(response);
  }

  @Post('/login')
  async login(@Body() createUserDto: LoginUserDto): Promise<SanitizedUserRto> {
    console.log('📤 Sending request to Auth Microservice:', createUserDto);
    // const response = await this.client.send({ cmd: 'register_user' }, createUserDto);
    const response = await lastValueFrom(
      this.client.send<UserRto>({ cmd: 'login_user' }, createUserDto),
    );
    return new SanitizedUserRto(response);
  }

  // @Get()
  // findAll() {
  //   return this.reservationsService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.reservationsService.findOne(id);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.reservationsService.remove(id);
  // }
}
