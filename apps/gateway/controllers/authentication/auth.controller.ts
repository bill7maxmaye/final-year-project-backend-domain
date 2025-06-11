import { ActiveUser } from '@app/common//decorators/active-user-decorator';
import { ChangePasswordDto } from '@app/common//dto/microservices/authentication/change-password.dto';
import { ForgotPasswordDto } from '@app/common//dto/microservices/authentication/forgot-password.dto';
import { LoginUserDto } from '@app/common//dto/microservices/authentication/login-user.dto';
import { ResetPasswordDto } from '@app/common//dto/microservices/authentication/reset-password.dto';
import { UpdateProfileDto } from '@app/common//dto/microservices/authentication/update-profile.dto';
import { CreateUserDto } from '@app/common//dto/microservices/authentication/userDto';
import { VerifyEmailDto } from '@app/common//dto/microservices/authentication/verify-email.dto';
import { User } from '@app/common//entities/user/user-entity';
import { JwtAuthGuard } from '@app/common//guards/jwt-auth.guard';
import { LoginResponse } from '@app/common//rto/microservices/auth/login-response.rto';
import { UserRto } from '@app/common//rto/microservices/auth/user.rto';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from 'apps/gateway/storage/storage.service';
import { ACTION } from 'libs/common/enum/action.enum';
import { CONTROLLER } from 'libs/common/enum/controller.enum';
import { MICROSERVICE } from 'libs/common/enum/microservice.enum';
import { NetworkingService } from 'libs/networking';

@Controller('auth')
export class AuthenticationController {
  constructor(
    private readonly networking: NetworkingService,
    private readonly storageService: StorageService,
  ) {}

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

  @UseGuards(JwtAuthGuard)
  @Put('updateprofile')
  async updateProfile(
    @ActiveUser() user: User,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<UserRto> {
    console.log('📤 Sending update profile request to Auth Microservice');
    return this.networking.send<UserRto>(
      `${MICROSERVICE.AUTHENTICATION}.${CONTROLLER.AUTH}.${ACTION.UPDATE_PROFILE}`,
      { userId: user.id, updateProfileDto },
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('follow/:targetId')
  async followUser(
    @ActiveUser() user: User,
    @Param('targetId') targetId: string,
  ): Promise<UserRto> {
    console.log('📤 Sending follow user request to Auth Microservice');
    return this.networking.send<UserRto>(
      `${MICROSERVICE.AUTHENTICATION}.${CONTROLLER.AUTH}.${ACTION.FOLLOW_USER}`,
      { currentUserId: user.id, targetUserId: targetId },
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('unfollow/:targetId')
  async unfollowUser(
    @ActiveUser() user: User,
    @Param('targetId') targetId: string,
  ): Promise<UserRto> {
    console.log('📤 Sending unfollow user request to Auth Microservice');
    return this.networking.send<UserRto>(
      `${MICROSERVICE.AUTHENTICATION}.${CONTROLLER.AUTH}.${ACTION.UNFOLLOW_USER}`,
      { currentUserId: user.id, targetUserId: targetId },
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('followers')
  async getFollowers(@ActiveUser() user: User): Promise<UserRto[]> {
    console.log('📤 Sending get followers request to Auth Microservice');
    return this.networking.send<UserRto[]>(
      `${MICROSERVICE.AUTHENTICATION}.${CONTROLLER.AUTH}.${ACTION.GET_FOLLOWERS}`,
      user.id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('following')
  async getFollowing(@ActiveUser() user: User): Promise<UserRto[]> {
    console.log('📤 Sending get following request to Auth Microservice');
    return this.networking.send<UserRto[]>(
      `${MICROSERVICE.AUTHENTICATION}.${CONTROLLER.AUTH}.${ACTION.GET_FOLLOWING}`,
      user.id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('follow-status/:targetId')
  async checkFollowStatus(
    @ActiveUser() user: User,
    @Param('targetId') targetId: string,
  ): Promise<boolean> {
    console.log('📤 Sending check follow status request to Auth Microservice');
    return this.networking.send<boolean>(
      `${MICROSERVICE.AUTHENTICATION}.${CONTROLLER.AUTH}.${ACTION.CHECK_FOLLOW_STATUS}`,
      { currentUserId: user.id, targetUserId: targetId },
    );
  }

  @Get('check-username/:username')
  async checkUsernameAvailability(
    @Param('username') username: string,
  ): Promise<{ available: boolean }> {
    console.log('📤 Checking username availability:', username);
    const isAvailable = await this.networking.send<boolean>(
      `${MICROSERVICE.AUTHENTICATION}.${CONTROLLER.AUTH}.${ACTION.CHECK_USERNAME_AVAILABILITY}`,
      username,
    );
    return { available: isAvailable };
  }

  @UseGuards(JwtAuthGuard)
  @Post('upload-profile-picture')
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfilePicture(
    @ActiveUser() user: User,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new HttpException(
        'No profile picture provided',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      // Upload the file to S3
      const uploadResult = await this.storageService.uploadFile(file);

      // Get the signed URL
      const fileSignedUrl = await this.storageService.downloadFile(
        uploadResult.Location,
      );

      console.log('File signed URL:', fileSignedUrl);
      // Update the user profile with the new profile picture URL
      const updateProfileDto: UpdateProfileDto = {
        profilePic: uploadResult.Location,
      };

      const updatedUser = await this.networking.send<UserRto>(
        `${MICROSERVICE.AUTHENTICATION}.${CONTROLLER.AUTH}.${ACTION.UPDATE_PROFILE}`,
        { userId: user.id, updateProfileDto },
      );

      return {
        message: 'Profile picture uploaded successfully',
        user: updatedUser,
      };
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      throw new HttpException(
        'Failed to upload profile picture',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete-profile-picture')
  async removeProfilePicture(@ActiveUser() user: User) {
    try {
      // Get the current user to find their profile picture URL
      const currentUser = await this.networking.send<UserRto>(
        `${MICROSERVICE.AUTHENTICATION}.${CONTROLLER.AUTH}.${ACTION.GET_USER}`,
        user.id,
      );

      // Check if user has a profile picture to delete
      if (!currentUser || !currentUser.profilePic) {
        throw new HttpException(
          'No profile picture to delete',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Extract the key from the profilePic URL
      // Assuming the URL format is like https://bucket-name.s3.region.amazonaws.com/POC/filename
      const profilePicUrl = currentUser.profilePic;
      const key = profilePicUrl.split('/').pop();

      if (key) {
        try {
          // Delete the file from S3
          await this.storageService.deleteFile(`POC/${key}`);
        } catch (error) {
          console.error('Error deleting file from S3:', error);
          // Continue with profile update even if S3 deletion fails
        }
      }

      // Update the user profile to remove the profile picture URL
      const updateProfileDto: UpdateProfileDto = {
        profilePic: '',
      };

      const updatedUser = await this.networking.send<UserRto>(
        `${MICROSERVICE.AUTHENTICATION}.${CONTROLLER.AUTH}.${ACTION.UPDATE_PROFILE}`,
        { userId: user.id, updateProfileDto },
      );

      return {
        message: 'Profile picture removed successfully',
        user: updatedUser,
      };
    } catch (error) {
      console.error('Error removing profile picture:', error);
      throw new HttpException(
        'Failed to remove profile picture',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getUserProfile(@ActiveUser() user: User): Promise<UserRto> {
    console.log('📤 Fetching user profile for:', user.id);
    return this.networking.send<UserRto>(
      `${MICROSERVICE.AUTHENTICATION}.${CONTROLLER.AUTH}.${ACTION.GET_USER}`,
      user.id,
    );
  }

  // @Get('get-user')
  // @UseGuards(JwtAuthGuard)
  // async getUser(@ActiveUser() user: User): Promise<UserRto> {
  //   console.log('📤 Sending request to Auth Microservice:', user.id);

  //   try {
  //     const response = await this.networking.send<UserRto>(
  //       `${MICROSERVICE.AUTHENTICATION}.${CONTROLLER.AUTH}.${ACTION.GET_USER}`,
  //       user.id,
  //     );

  //     console.log('📥 Received response from Auth Microservice:', response);
  //     return response;
  //   } catch (error) {
  //     console.error('🔥 Error communicating with Auth Microservice:', error);
  //     throw error;
  //   }
  // }
  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @ActiveUser() user: User,
  ): Promise<boolean> {
    console.log('📤 Sending CHANGE PASSWORD request to Auth Microservice');

    return this.networking.send<boolean>(
      `${MICROSERVICE.AUTHENTICATION}.${CONTROLLER.AUTH}.${ACTION.CHANGE_PASSWORD}`,
      {
        userId: user.id,
        changePasswordDto,
      },
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put('update-username')
  async updateUsername(
    @ActiveUser() user: User,
    @Body() updateUsernameDto: UpdateProfileDto,
  ): Promise<UserRto> {
    return this.networking.send<UserRto>(
      `${MICROSERVICE.AUTHENTICATION}.${CONTROLLER.AUTH}.${ACTION.UPDATE_USERNAME}`,
      { userId: user.id, updateUsernameDto },
    );
  }
  @UseGuards(JwtAuthGuard)
  @Get('user/:id')
  async getUserById(@Param('id') id: string): Promise<UserRto> {
    return this.networking.send<UserRto>(
      `${MICROSERVICE.AUTHENTICATION}.${CONTROLLER.AUTH}.${ACTION.GET_USER_BY_ID}`,
      id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('users')
  async getAllUsers(): Promise<UserRto[]> {
    return this.networking.send<UserRto[]>(
      `${MICROSERVICE.AUTHENTICATION}.${CONTROLLER.AUTH}.${ACTION.GET_ALL_USERS}`,
      {},
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('search-users')
  async searchUsers(
    @Query('q') query: string,
    @ActiveUser() user: UserRto,
  ): Promise<UserRto[]> {
    const res = await this.networking.send<UserRto[]>(
      `${MICROSERVICE.AUTHENTICATION}.${CONTROLLER.AUTH}.${ACTION.SEARCH_USERS}`,
      { query, currentUserId: user.id },
    );
    return res;
  }
}
