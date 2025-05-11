import { Controller } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { AuthenticationService } from './authentication.service';
import { MICROSERVICE } from 'libs/common/enum/microservice.enum';
import { CONTROLLER } from 'libs/common/enum/controller.enum';
import { ACTION } from 'libs/common/enum/action.enum';
import { CreateUserDto } from '@app/common//dto/microservices/authentication/userDto';
import { UserRto } from '@app/common//rto/microservices/auth/user.rto';
import { VerifyEmailDto } from '@app/common//dto/microservices/authentication/verify-email.dto';
import { LoginUserDto } from '@app/common//dto/microservices/authentication/login-user.dto';
import { LoginResponse } from '@app/common//rto/microservices/auth/login-response.rto';
import { ResetPasswordDto } from '@app/common//dto/microservices/authentication/reset-password.dto';
import { ForgotPasswordDto } from '@app/common//dto/microservices/authentication/forgot-password.dto';

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
    console.log('received data', createUserDto);
    const response = await this.authenticationService.createUser(createUserDto);
    return UserRto.fromEntity(response);
  }

  @MessagePattern(
    `${MICROSERVICE.AUTHENTICATION}.${CONTROLLER.AUTH}.${ACTION.LOGIN}`,
  )
  async handleUserLogin(
    @Payload() LoginUserDto: LoginUserDto,
  ): Promise<LoginResponse> {
    console.log('received data', LoginUserDto);
    const response = await this.authenticationService.loginUser(LoginUserDto);
    return response;
  }

  @MessagePattern(
    `${MICROSERVICE.AUTHENTICATION}.${CONTROLLER.AUTH}.${ACTION.VERIFY_EMAIL}`,
  )
  async verifyEmail(
    @Payload() verifyEmailDto: VerifyEmailDto,
  ): Promise<UserRto> {
    console.log('received data', verifyEmailDto);
    const response =
      await this.authenticationService.verifyEmail(verifyEmailDto);
    return UserRto.fromEntity(response);
  }

  @MessagePattern(
    `${MICROSERVICE.AUTHENTICATION}.${CONTROLLER.AUTH}.${ACTION.RESEND_VERIFICATION_EMAIL}`,
  )
  async resendVerificationEmail(@Payload() email: string): Promise<UserRto> {
    console.log('received data', email);
    const response =
      await this.authenticationService.resendVerificationCode(email);
    return UserRto.fromEntity(response);
  }

  @MessagePattern(
    `${MICROSERVICE.AUTHENTICATION}.${CONTROLLER.AUTH}.${ACTION.FORGOT_PASSWORD}`,
  )
  async handleForgotPassword(
    @Payload() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<boolean> {
    return this.authenticationService.forgotPassword(forgotPasswordDto);
  }

  @MessagePattern(
    `${MICROSERVICE.AUTHENTICATION}.${CONTROLLER.AUTH}.${ACTION.RESET_PASSWORD}`,
  )
  async handleResetPassword(
    @Payload() resetPasswordDto: ResetPasswordDto,
  ): Promise<boolean> {
    return this.authenticationService.resetPassword(resetPasswordDto);
  }
}
