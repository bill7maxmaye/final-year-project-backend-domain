import { ForgotPasswordDto } from '@app/common//dto/microservices/authentication/forgot-password.dto';
import { LoginUserDto } from '@app/common//dto/microservices/authentication/login-user.dto';
import { ResetPasswordDto } from '@app/common//dto/microservices/authentication/reset-password.dto';
import { CreateUserDto } from '@app/common//dto/microservices/authentication/userDto';
import { VerifyEmailDto } from '@app/common//dto/microservices/authentication/verify-email.dto';
import { LoginResponse } from '@app/common//rto/microservices/auth/login-response.rto';
import { UserRto } from '@app/common//rto/microservices/auth/user.rto';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { Payload } from '@nestjs/microservices';
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
  async login(@Body() createUserDto: LoginUserDto): Promise<LoginResponse> {
    console.log('📤 Publishing user.registered event:', createUserDto);

    const response = await this.networking.send<LoginResponse>(
      `${MICROSERVICE.AUTHENTICATION}.${CONTROLLER.AUTH}.${ACTION.LOGIN}`,
      createUserDto,
    );
    return response;
  }

  @Post('verifyEmail')
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto): Promise<UserRto> {
    console.log('📤 Sending request to Auth Microservice:', verifyEmailDto);

    try {
      const response = await this.networking.send<UserRto>(
        `${MICROSERVICE.AUTHENTICATION}.${CONTROLLER.AUTH}.${ACTION.VERIFY_EMAIL}`,
        verifyEmailDto,
      );

      console.log('📥 Received response from Auth Microservice:', response);
      return response;
    } catch (error) {
      console.error('🔥 Error communicating with Auth Microservice:', error);
      throw error;
    }
  }

  @Post('resend-otp')
  async resendVerificationCode(@Body('email') email: string): Promise<UserRto> {
    console.log('📤 Sending request to Auth Microservice:', email);

    try {
      const response = await this.networking.send<UserRto>(
        `${MICROSERVICE.AUTHENTICATION}.${CONTROLLER.AUTH}.${ACTION.RESEND_VERIFICATION_EMAIL}`,
        email,
      );

      console.log('📥 Received response from Auth Microservice:', response);
      return response;
    } catch (error) {
      console.error('🔥 Error communicating with Auth Microservice:', error);
      throw error;
    }
  }

  @Post('forgot-password')
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<boolean> {
    return this.networking.send<boolean>(
      `${MICROSERVICE.AUTHENTICATION}.${CONTROLLER.AUTH}.${ACTION.FORGOT_PASSWORD}`,
      forgotPasswordDto,
    );
  }

  @Post('reset-password')
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<boolean> {
    console.log('📤 Sending RESET PASSWORD request to Auth Microservice:');
    return this.networking.send<boolean>(
      `${MICROSERVICE.AUTHENTICATION}.${CONTROLLER.AUTH}.${ACTION.RESET_PASSWORD}`,
      resetPasswordDto,
    );
  }

  // @Get('get-user')
  // async getUser(@Payload() userId: string): Promise<UserRto> {
  //   console.log('📤 Sending request to Auth Microservice:', userId);

  //   try {
  //     const response = await this.networking.send<UserRto>(
  //       `${MICROSERVICE.AUTHENTICATION}.${CONTROLLER.AUTH}.${ACTION.GET_USER}`,
  //       userId,
  //     );

  //     console.log('📥 Received response from Auth Microservice:', response);
  //     return response;
  //   } catch (error) {
  //     console.error('🔥 Error communicating with Auth Microservice:', error);
  //     throw error;
  //   }
  // }
}
