import { Controller } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { AuthenticationService } from './authentication.service';
import { MICROSERVICE } from 'libs/common/enum/microservice.enum';
import { CONTROLLER } from 'libs/common/enum/controller.enum';
import { ACTION } from 'libs/common/enum/action.enum';

@Controller()
export class AuthenticationController {
  constructor(
    private configService: ConfigService,
    private readonly authenticationService: AuthenticationService,
  ) {}

  @MessagePattern(
    `${MICROSERVICE.AUTHENTICATION}.${CONTROLLER.AUTH}.${ACTION.REGISTER}`,
  )
  handleUserRegistered(@Payload() createUserDto: any): any {
    return createUserDto;
  }

  @EventPattern(
    `${MICROSERVICE.AUTHENTICATION}.${CONTROLLER.AUTH}.${ACTION.LOGIN}`,
  )
  handleUserLogin(@Payload() createUserDto: any): void {
    console.log('📥 Received user.registered event:', createUserDto);

    try {
      console.log(
        '✅ User created successfully (replace with your actual logic)',
      );
    } catch (error) {
      console.error('🔥 Error creating user:', error);
    }
  }
}
