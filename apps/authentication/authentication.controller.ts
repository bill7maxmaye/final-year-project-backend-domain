import { ForgotPasswordDto } from '@app/common//dto/microservices/authentication/forgot-password.dto';
import { LoginUserDto } from '@app/common//dto/microservices/authentication/login-user.dto';
import { ResetPasswordDto } from '@app/common//dto/microservices/authentication/reset-password.dto';
import { UpdateProfileDto } from '@app/common//dto/microservices/authentication/update-profile.dto';
import { CreateUserDto } from '@app/common//dto/microservices/authentication/userDto';
import { VerifyEmailDto } from '@app/common//dto/microservices/authentication/verify-email.dto';
import { LoginResponse } from '@app/common//rto/microservices/auth/login-response.rto';
import { UserRto } from '@app/common//rto/microservices/auth/user.rto';
import { Controller } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ACTION } from 'libs/common/enum/action.enum';
import { CONTROLLER } from 'libs/common/enum/controller.enum';
import { MICROSERVICE } from 'libs/common/enum/microservice.enum';
import { AuthenticationService } from './authentication.service';

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

  @MessagePattern(
    `${MICROSERVICE.AUTHENTICATION}.${CONTROLLER.AUTH}.${ACTION.GET_USER}`,
  )
  async getUser(@Payload() userId: string): Promise<UserRto> {
    console.log('received data', userId);
    const response = await this.authenticationService.getUser(userId);
    return UserRto.fromEntity(response);
  }

  @MessagePattern(
    `${MICROSERVICE.AUTHENTICATION}.${CONTROLLER.AUTH}.${ACTION.UPDATE_PROFILE}`,
  )
  async updateProfile(
    @Payload() data: { userId: string; updateProfileDto: UpdateProfileDto },
  ): Promise<UserRto> {
    const response = await this.authenticationService.updateProfile(
      data.userId,
      data.updateProfileDto,
    );
    return UserRto.fromEntity(response);
  }

  @MessagePattern(
    `${MICROSERVICE.AUTHENTICATION}.${CONTROLLER.AUTH}.${ACTION.FOLLOW_USER}`,
  )
  async followUser(
    @Payload() data: { currentUserId: string; targetUserId: string },
  ): Promise<UserRto> {
    const response = await this.authenticationService.followUser(
      data.currentUserId,
      data.targetUserId,
    );
    return UserRto.fromEntity(response);
  }

  @MessagePattern(
    `${MICROSERVICE.AUTHENTICATION}.${CONTROLLER.AUTH}.${ACTION.UNFOLLOW_USER}`,
  )
  async unfollowUser(
    @Payload() data: { currentUserId: string; targetUserId: string },
  ): Promise<UserRto> {
    const response = await this.authenticationService.unfollowUser(
      data.currentUserId,
      data.targetUserId,
    );
    return UserRto.fromEntity(response);
  }

  @MessagePattern(
    `${MICROSERVICE.AUTHENTICATION}.${CONTROLLER.AUTH}.${ACTION.GET_FOLLOWERS}`,
  )
  async getFollowers(@Payload() userId: string): Promise<UserRto[]> {
    const response = await this.authenticationService.getFollowers(userId);
    return response.map((user) => UserRto.fromEntity(user));
  }

  @MessagePattern(
    `${MICROSERVICE.AUTHENTICATION}.${CONTROLLER.AUTH}.${ACTION.GET_FOLLOWING}`,
  )
  async getFollowing(@Payload() userId: string): Promise<UserRto[]> {
    const response = await this.authenticationService.getFollowing(userId);
    return response.map((user) => UserRto.fromEntity(user));
  }

  @MessagePattern(
    `${MICROSERVICE.AUTHENTICATION}.${CONTROLLER.AUTH}.${ACTION.CHECK_FOLLOW_STATUS}`,
  )
  async checkFollowStatus(
    @Payload() data: { currentUserId: string; targetUserId: string },
  ): Promise<boolean> {
    return await this.authenticationService.checkFollowStatus(
      data.currentUserId,
      data.targetUserId,
    );
  }
}
