import { CreateUserDto } from '@app/common//dto/microservices/authentication/userDto';
import { MICROSERVICE_QUEUE } from '@app/common//enum/microservice-queue.enum';
import { UserRto } from '@app/common//rto/microservices/auth/user.rto';
import { Body, Controller, Post } from '@nestjs/common';
import { ACTION } from 'libs/common/enum/action.enum';
import { CONTROLLER } from 'libs/common/enum/controller.enum';
import { MICROSERVICE } from 'libs/common/enum/microservice.enum';
import { NetworkingService } from 'libs/networking';

@Controller('auth')
export class AuthenticationController {
  constructor(private readonly networking: NetworkingService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto): Promise<any> {
    console.log('📤 Sending request to Auth Microservice:', createUserDto);

    try {
      const response = await this.networking.send<UserRto>(
        MICROSERVICE_QUEUE.AUTHENTICATION,
        `${MICROSERVICE.AUTHENTICATION}.${CONTROLLER.AUTH}.${ACTION.REGISTER}`,
        createUserDto,
      );

      console.log('📥 Received response from Auth Microservice:', response);
      return response;
    } catch (error) {
      console.error('🔥 Error communicating with Auth Microservice:', error);
      throw error;
    }
  }

  @Post('login')
  login(@Body() createUserDto: any): any {
    console.log('📤 Publishing user.registered event:', createUserDto);

    this.networking.emit(
      MICROSERVICE_QUEUE.AUTHENTICATION,

      `${MICROSERVICE.AUTHENTICATION}.${CONTROLLER.AUTH}.${ACTION.LOGIN}`,
      createUserDto,
    );
    return { status: 'OK', message: 'Registration request sent' };
  }
}
