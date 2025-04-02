import { Body, Controller, Get, Inject, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { CreateUserDto } from '../../authentication/src/dtos/userDto';
import { AppService } from './app.service';
import { SanitizedUserRto, UserRto } from '@app/common';
import { lastValueFrom } from 'rxjs';
import { LoginUserDto } from 'apps/authentication/src/dtos/login-user.dto';
import { LoginResponse } from 'apps/authentication/src/rtos/login-response.rto';
import { VerifyEmailDto } from 'apps/authentication/src/dtos/verify-email.dto';
import { JwtAuthGuard } from '../../authentication/src/guards/jwt-auth.guard';
import { Public } from '../../authentication/src/decorators/public.decorator';

@Controller('auth')
@UseGuards(JwtAuthGuard)
export class AppController {
  constructor(
    private configService: ConfigService,
    @Inject('RABBITMQ_SERVICE') private client: ClientProxy,
    private readonly reservationsService: AppService,
  ) {
  }




  // Protected routes below
  @Post('/notification')
  getHello(@Body() data: any): any {
    this.client.emit('notification_created', data);
    return { success: 'Successfully sent message' };
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
  }

  @Get('/port')
  getPort(): any {
    const port = this.configService.get<number>('PORT');
    console.log('PORT:', port);
    return { port };
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
