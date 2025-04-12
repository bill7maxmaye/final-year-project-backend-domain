import { Controller } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { AuthenticationService } from './authentication.service';

@Controller()
export class AuthenticationController {
  constructor(
    private configService: ConfigService,
    private readonly authenticationService: AuthenticationService,
  ) {}

  @MessagePattern('register_user')
  handleUserRegistered(@Payload() createUserDto: any): any {
    return createUserDto;
  }

  @EventPattern('registered')
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
