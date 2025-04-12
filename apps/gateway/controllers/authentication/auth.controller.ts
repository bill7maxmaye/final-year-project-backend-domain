import { Body, Controller, Post } from '@nestjs/common';
import { NetworkingService } from 'libs/networking';

@Controller('auth')
export class AuthenticationController {
  constructor(private readonly networking: NetworkingService) {}

  @Post('register')
  async register(@Body() createUserDto: any): Promise<any> {
    console.log('📤 Sending request to Auth Microservice:', createUserDto);

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const response = await this.networking.send<any>(
        'register_user',
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

    this.networking.emit('registered', createUserDto);
    return { status: 'OK', message: 'Registration request sent' };
  }
}
