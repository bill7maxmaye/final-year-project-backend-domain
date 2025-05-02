import { Controller } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { AuthenticationService } from './authentication.service';
import { MICROSERVICE } from 'libs/common/enum/microservice.enum';
import { CONTROLLER } from 'libs/common/enum/controller.enum';
import { ACTION } from 'libs/common/enum/action.enum';
import { CreateUserDto } from '@app/common//dto/microservices/authentication/userDto';
import { UserRto } from '@app/common//rto/microservices/auth/user.rto';

@Controller()
export class AuthenticationController {
  constructor(
    private configService: ConfigService,
    private readonly authenticationService: AuthenticationService,
  ) {}

  @MessagePattern(
    `${MICROSERVICE.AUTHENTICATION}.${CONTROLLER.AUTH}.${ACTION.REGISTER}`,
  )
  async handleUserRegistered(
    @Payload() createUserDto: CreateUserDto,
  ): Promise<UserRto> {
    const response = await this.authenticationService.createUser(createUserDto);
    return UserRto.fromEntity(response);
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
