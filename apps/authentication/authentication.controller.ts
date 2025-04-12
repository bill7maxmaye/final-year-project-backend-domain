import { Controller, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy, MessagePattern, Payload } from '@nestjs/microservices';
import { AuthenticationService } from './authentication.service';

@Controller()
export class AuthenticationController {
  constructor(
    private configService: ConfigService,
    @Inject('RABBITMQ_SERVICE') private client: ClientProxy,
    private readonly authenticationService: AuthenticationService,
  ) {}

  @MessagePattern({ cmd: 'register_user' })
  register(@Payload() createUserDto: any): any {
    return createUserDto;
  }
}
