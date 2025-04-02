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
    console.log("here changes")
  }

  @Public()
  @Post('/register')
  async registerUser(
    @Body() createUserDto: CreateUserDto,
  ): Promise<SanitizedUserRto> {
    console.log('📤 Sending request to Auth Microservice:', createUserDto);
    const response = await lastValueFrom(
      this.client.send<UserRto>({ cmd: 'register_user' }, createUserDto),
    );
    console.log("here is the response", response)
    return new SanitizedUserRto(response);
  }

  @Public()
  @Post('/login')
  async login(@Body() createUserDto: LoginUserDto): Promise<LoginResponse> {
    console.log('📤 Sending request to Auth Microservice:', createUserDto);
    const response = await lastValueFrom(
      this.client.send<LoginResponse>({ cmd: 'login_user' }, createUserDto),
    );
    return response;
  }

  @Public()
  @Post('/verify-email')
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto): Promise<UserRto> {
    console.log('📤 Sending verification request to Auth Microservice:', verifyEmailDto);
    const response = await lastValueFrom(
      this.client.send<UserRto>({ cmd: 'verify_email' }, verifyEmailDto),
    );
    return response;
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
    //return { sucess: 'Suceesfully sent message' };
  }

  //endpoint to test if the config module is set up globally and working
  @Get('/port')
  getPort(): any {
    const port = this.configService.get<number>('PORT');
    console.log('PORT:', port); // Debugging
    return { port }; // Return as JSON response
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
