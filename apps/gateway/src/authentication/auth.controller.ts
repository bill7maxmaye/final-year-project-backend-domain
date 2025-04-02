import { SanitizedUserRto, UserRto } from '@app/common';
import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { Public } from 'apps/authentication/src/decorators/public.decorator';
import { LoginUserDto } from 'apps/authentication/src/dtos/login-user.dto';
import { CreateUserDto } from 'apps/authentication/src/dtos/userDto';
import { LoginResponse } from 'apps/authentication/src/rtos/login-response.rto';
import { lastValueFrom } from 'rxjs';
import { AppService } from '../app.service';
import { VerifyEmailDto } from 'apps/authentication/src/dtos/verify-email.dto';


@Controller('auth')
export class AuthController {
  constructor(
    private configService: ConfigService,
    @Inject('RABBITMQ_SERVICE') private client: ClientProxy,
    private readonly reservationsService: AppService,
  ) {
    console.log('here changes');
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
    console.log('here is the response', response);
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
    console.log(
      '📤 Sending verification request to Auth Microservice:',
      verifyEmailDto,
    );
    const response = await lastValueFrom(
      this.client.send<UserRto>({ cmd: 'verify_email' }, verifyEmailDto),
    );
    return response;
  }
}
