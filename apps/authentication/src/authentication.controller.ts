import { UserRto } from '@app/common';
import { Controller, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy, MessagePattern, Payload } from '@nestjs/microservices';
import { AuthenticationService } from './authentication.service';
import { LoginUserDto } from './dtos/login-user.dto';
import { CreateUserDto } from './dtos/userDto';
import { LoginResponse } from './rtos/login-response.rto';

@Controller()
export class AuthenticationController {
  constructor(
    private configService: ConfigService,
    @Inject('RABBITMQ_SERVICE') private client: ClientProxy,
    private readonly authenticationService: AuthenticationService,
  ) {}

  @MessagePattern({ cmd: 'register_user' })
  async create(@Payload() createUserDto: CreateUserDto): Promise<UserRto> {
    const response = await this.authenticationService.createUser(createUserDto);
    return UserRto.fromEntity(response);
  }

  @MessagePattern({ cmd: 'login_user' })
  async login(@Payload() loginUserDto: LoginUserDto): Promise<LoginResponse> {
    const response = await this.authenticationService.loginUser(loginUserDto);
    return response;
  }
}
