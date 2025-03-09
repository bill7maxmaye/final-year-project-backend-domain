import { Controller, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy, MessagePattern, Payload } from '@nestjs/microservices';
import { UserDocument } from 'apps/authentication/src/entities/user.entity';
import { AuthenticationService } from './authentication.service';
import { CreateUserDto } from './dtos/userDto';
import { UserRto } from '@app/common';
import { LoginUserDto } from './dtos/login-user.dto';

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
  async login(@Payload() loginUserDto: LoginUserDto): Promise<UserRto> {
    const response = await this.authenticationService.loginUser(loginUserDto);
    return UserRto.fromEntity(response);
  }
}
