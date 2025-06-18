import { MicroserviceErrorCode, MicroserviceException } from '@app/common';
import { UserRepository } from '@app/common//baseRepository/userRepository/user.repository';
import { ChangePasswordDto } from '@app/common//dto/microservices/authentication/change-password.dto';
import { ForgotPasswordDto } from '@app/common//dto/microservices/authentication/forgot-password.dto';
import { LoginUserDto } from '@app/common//dto/microservices/authentication/login-user.dto';
import { ResetPasswordDto } from '@app/common//dto/microservices/authentication/reset-password.dto';
import { UpdateProfileDto } from '@app/common//dto/microservices/authentication/update-profile.dto';
import { CreateUserDto } from '@app/common//dto/microservices/authentication/userDto';
import { VerifyEmailDto } from '@app/common//dto/microservices/authentication/verify-email.dto';
import { ErrorMessage } from '@app/common//enum/authentication/error-message.enum';
import {
  UserDocument,
  UserStatus,
} from '@app/common//models/authentication/user.model';
import { LoginResponse } from '@app/common//rto/microservices/auth/login-response.rto';
import {
  HttpStatus,
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { EmailService } from './email.service';
import { StorageService } from 'apps/gateway/storage/storage.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthenticationService {
  private readonly logger = new Logger(AuthenticationService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly userRepository: UserRepository,
    private readonly emailService: EmailService,
    private readonly storageService: StorageService,
  ) {}

  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
  private generateResetCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async createUser(createUserDto: CreateUserDto): Promise<UserDocument> {
    // try {
    const existingUser = await this.userRepository
      .findOne({ email: createUserDto.email })
      .catch(() => null);
    if (existingUser) {
      throw MicroserviceException.fromException(
        ErrorMessage.USER_ALREADY_EXISTS,
        HttpStatus.BAD_REQUEST,
        MicroserviceErrorCode.USER_ALREADY_EXISTS,
      );
    }

    createUserDto.password = await bcrypt.hash(createUserDto.password, 10);
    // console.log('before verification', this.createUser);
    const verificationCode = this.generateVerificationCode();
    //console.log('after verification', verificationCode);

    // Create user in database with verification code
    const newUser = await this.userRepository.create({
      ...createUserDto,
      verificationCode,
      isVerified: false,
      status: UserStatus.PENDING,
    });

    console.log('new user>>>', newUser);

    // Send verification email
    const result = await this.emailService.sendVerificationEmail(
      newUser.email,
      verificationCode,
    );

    console.log('after email...', result);

    return newUser;
    // } catch {
    //   throw new MicroserviceException(
    //     ErrorMessage.INTERNAL_SERVER_ERROR,
    //     HttpStatus.INTERNAL_SERVER_ERROR,
    //     MicroserviceErrorCode.INTERNAL_SERVER_ERROR,
    //   );
    // }
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto): Promise<UserDocument> {
    try {
      const user = await this.userRepository.findOne({
        email: verifyEmailDto.email,
      });

      if (!user) {
        throw MicroserviceException.fromException(
          ErrorMessage.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND,
          MicroserviceErrorCode.USER_NOT_FOUND,
        );
      }

      if (user.isVerified) {
        throw MicroserviceException.fromException(
          'Email already verified',
          HttpStatus.BAD_REQUEST,
          MicroserviceErrorCode.INVALID_VERIFICATION,
        );
      }

      if (user.verificationCode !== verifyEmailDto.verificationCode) {
        throw MicroserviceException.fromException(
          'Invalid verification code',
          HttpStatus.BAD_REQUEST,
          MicroserviceErrorCode.INVALID_VERIFICATION,
        );
      }

      // Update user verification status
      user.isVerified = true;
      user.status = UserStatus.ACTIVE;
      user.verificationCode = undefined;

      return await this.userRepository.findOneAndUpdate(
        { _id: user._id },
        {
          isVerified: true,
          status: UserStatus.ACTIVE,
          verificationCode: undefined,
        },
      );
    } catch (error) {
      if (error instanceof MicroserviceException) {
        throw error;
      }
      throw new MicroserviceException(
        ErrorMessage.INTERNAL_SERVER_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
        MicroserviceErrorCode.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async loginUser(loginUserDto: LoginUserDto): Promise<LoginResponse> {
    // try {
    const user = await this.userRepository
      .findOne({ email: loginUserDto.email })
      .catch(() => null);
    console.log('user ------------------', user);
    if (!user) {
      throw MicroserviceException.fromException(
        ErrorMessage.USER_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        MicroserviceErrorCode.USER_NOT_FOUND,
      );
    }

    if (!user.isVerified) {
      throw MicroserviceException.fromException(
        'Please verify your email first',
        HttpStatus.UNAUTHORIZED,
        MicroserviceErrorCode.EMAIL_NOT_VERIFIED,
      );
    }

    const isPasswordValid = await bcrypt.compare(
      loginUserDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw MicroserviceException.fromException(
        ErrorMessage.INVALID_CREDENTIALS,
        HttpStatus.UNAUTHORIZED,
        MicroserviceErrorCode.INVALID_CREDENTIALS,
      );
    }

    const payload = { userId: user._id, email: user.email, role: user.role };
    const jwtSecret = this.configService.get<string>('JWT_SECRET');

    const accessToken = jwt.sign(payload, jwtSecret, { expiresIn: '10h' });

    return new LoginResponse(accessToken, user._id.toString());
    // } catch {
    //   throw new MicroserviceException(
    //     ErrorMessage.INTERNAL_SERVER_ERROR,
    //     HttpStatus.INTERNAL_SERVER_ERROR,
    //     MicroserviceErrorCode.INTERNAL_SERVER_ERROR,
    //   );
    // }
  }

  async resendVerificationCode(email: string): Promise<UserDocument> {
    const user = await this.userRepository.findOne({ email });
    if (!user) {
      throw MicroserviceException.fromException(
        ErrorMessage.USER_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        MicroserviceErrorCode.USER_NOT_FOUND,
      );
    }

    if (user.isVerified) {
      throw MicroserviceException.fromException(
        'Email already verified',
        HttpStatus.BAD_REQUEST,
        MicroserviceErrorCode.INVALID_VERIFICATION,
      );
    }

    const newCode = this.generateVerificationCode();
    await this.userRepository.findOneAndUpdate(
      { _id: user._id },
      { verificationCode: newCode },
    );

    await this.emailService.sendVerificationEmail(user.email, newCode);

    return this.userRepository.findOne({ _id: user._id });
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<boolean> {
    const { email } = forgotPasswordDto;
    const user = await this.userRepository.findOne({ email });
    if (!user) {
      throw MicroserviceException.fromException(
        ErrorMessage.USER_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        MicroserviceErrorCode.USER_NOT_FOUND,
      );
    }

    // Generate code and store it
    const resetCode = this.generateResetCode();
    await this.userRepository.findOneAndUpdate(
      { _id: user._id },
      { resetCode },
    );

    // Send email with reset code
    await this.emailService.sendVerificationEmail(email, resetCode);

    return true;
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<boolean> {
    const { email, resetCode, newPassword } = resetPasswordDto;
    const user = await this.userRepository.findOne({ email });

    if (!user) {
      throw MicroserviceException.fromException(
        ErrorMessage.USER_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        MicroserviceErrorCode.USER_NOT_FOUND,
      );
    }

    if (!user.resetCode || user.resetCode !== resetCode) {
      throw MicroserviceException.fromException(
        'Invalid or missing password reset code',
        HttpStatus.BAD_REQUEST,
        MicroserviceErrorCode.INVALID_VERIFICATION,
      );
    }

    // Update the user's password and clear the reset code
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userRepository.findOneAndUpdate(
      { _id: user._id },
      { password: hashedPassword, resetCode: undefined },
    );

    return true;
  }

  async getUser(userId: string): Promise<UserDocument> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw MicroserviceException.fromException(
        ErrorMessage.USER_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        MicroserviceErrorCode.USER_NOT_FOUND,
      );
    }
    return user;
  }

  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<UserDocument> {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw MicroserviceException.fromException(
          ErrorMessage.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND,
          MicroserviceErrorCode.USER_NOT_FOUND,
        );
      }

      // Check if we're updating the username and it's already taken
      if (updateProfileDto.username) {
        const existingUser = await this.userRepository
          .findOne({
            username: updateProfileDto.username,
            _id: { $ne: user._id }, // Exclude current user from search
          })
          .catch(() => null);

        if (existingUser) {
          throw MicroserviceException.fromException(
            'Username already taken',
            HttpStatus.BAD_REQUEST,
            MicroserviceErrorCode.INVALID_OPERATION,
          );
        }
      }

      // Update the user with findOneAndUpdate to get the updated document
      const updatedUser = await this.userRepository.findOneAndUpdate(
        { _id: user._id },
        updateProfileDto,
      );

      return updatedUser;
    } catch (error) {
      if (error instanceof MicroserviceException) {
        throw error;
      }
      throw MicroserviceException.fromException(
        error.message || ErrorMessage.INTERNAL_SERVER_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
        MicroserviceErrorCode.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async followUser(
    currentUserId: string,
    targetUserId: string,
  ): Promise<UserDocument> {
    try {
      // Prevent users from following themselves
      if (currentUserId === targetUserId) {
        throw MicroserviceException.fromException(
          'Cannot follow yourself',
          HttpStatus.BAD_REQUEST,
          MicroserviceErrorCode.INVALID_OPERATION,
        );
      }

      const [currentUser, targetUser] = await Promise.all([
        this.userRepository.findById(currentUserId),
        this.userRepository.findById(targetUserId),
      ]);

      if (!currentUser || !targetUser) {
        throw MicroserviceException.fromException(
          ErrorMessage.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND,
          MicroserviceErrorCode.USER_NOT_FOUND,
        );
      }

      if (currentUser.following.includes(targetUserId)) {
        throw MicroserviceException.fromException(
          'Already following this user',
          HttpStatus.BAD_REQUEST,
          MicroserviceErrorCode.INVALID_OPERATION,
        );
      }

      // Update current user's following list
      await this.userRepository.findOneAndUpdate(
        { _id: currentUser._id },
        { $push: { following: targetUserId } },
      );

      // Update target user's followers list
      await this.userRepository.findOneAndUpdate(
        { _id: targetUser._id },
        { $push: { followers: currentUserId } },
      );

      return await this.userRepository.findById(currentUserId);
    } catch (error) {
      if (error instanceof MicroserviceException) {
        throw error;
      }
      throw MicroserviceException.fromException(
        error.message || ErrorMessage.INTERNAL_SERVER_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
        MicroserviceErrorCode.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async unfollowUser(
    currentUserId: string,
    targetUserId: string,
  ): Promise<UserDocument> {
    try {
      // Prevent users from unfollowing themselves
      if (currentUserId === targetUserId) {
        throw MicroserviceException.fromException(
          'Cannot unfollow yourself',
          HttpStatus.BAD_REQUEST,
          MicroserviceErrorCode.INVALID_OPERATION,
        );
      }

      const [currentUser, targetUser] = await Promise.all([
        this.userRepository.findById(currentUserId),
        this.userRepository.findById(targetUserId),
      ]);

      if (!currentUser || !targetUser) {
        throw MicroserviceException.fromException(
          ErrorMessage.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND,
          MicroserviceErrorCode.USER_NOT_FOUND,
        );
      }

      if (!currentUser.following.includes(targetUserId)) {
        throw MicroserviceException.fromException(
          'Not following this user',
          HttpStatus.BAD_REQUEST,
          MicroserviceErrorCode.INVALID_OPERATION,
        );
      }

      // Update current user's following list
      await this.userRepository.findOneAndUpdate(
        { _id: currentUser._id },
        { $pull: { following: targetUserId } },
      );

      // Update target user's followers list
      await this.userRepository.findOneAndUpdate(
        { _id: targetUser._id },
        { $pull: { followers: currentUserId } },
      );

      return await this.userRepository.findById(currentUserId);
    } catch (error) {
      if (error instanceof MicroserviceException) {
        throw error;
      }
      throw MicroserviceException.fromException(
        error.message || ErrorMessage.INTERNAL_SERVER_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
        MicroserviceErrorCode.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getFollowers(userId: string): Promise<UserDocument[]> {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw MicroserviceException.fromException(
          ErrorMessage.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND,
          MicroserviceErrorCode.USER_NOT_FOUND,
        );
      }

      return await this.userRepository.find({ _id: { $in: user.followers } });
    } catch (error) {
      if (error instanceof MicroserviceException) {
        throw error;
      }
      throw MicroserviceException.fromException(
        error.message || ErrorMessage.INTERNAL_SERVER_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
        MicroserviceErrorCode.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getFollowing(userId: string): Promise<UserDocument[]> {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw MicroserviceException.fromException(
          ErrorMessage.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND,
          MicroserviceErrorCode.USER_NOT_FOUND,
        );
      }

      return await this.userRepository.find({ _id: { $in: user.following } });
    } catch (error) {
      if (error instanceof MicroserviceException) {
        throw error;
      }
      throw MicroserviceException.fromException(
        error.message || ErrorMessage.INTERNAL_SERVER_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
        MicroserviceErrorCode.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async checkFollowStatus(
    currentUserId: string,
    targetUserId: string,
  ): Promise<boolean> {
    try {
      const currentUser = await this.userRepository.findById(currentUserId);
      if (!currentUser) {
        throw MicroserviceException.fromException(
          ErrorMessage.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND,
          MicroserviceErrorCode.USER_NOT_FOUND,
        );
      }

      return currentUser.following.includes(targetUserId);
    } catch (error) {
      if (error instanceof MicroserviceException) {
        throw error;
      }
      throw MicroserviceException.fromException(
        error.message || ErrorMessage.INTERNAL_SERVER_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
        MicroserviceErrorCode.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async checkUsernameAvailability(username: string): Promise<boolean> {
    try {
      const existingUser = await this.userRepository.findOne({ username });
      return false; // Username is taken
    } catch (error) {
      if (error instanceof NotFoundException) {
        return true; // Username is available
      }
      throw MicroserviceException.fromException(
        error.message || ErrorMessage.INTERNAL_SERVER_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
        MicroserviceErrorCode.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<boolean> {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw MicroserviceException.fromException(
          ErrorMessage.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND,
          MicroserviceErrorCode.USER_NOT_FOUND,
        );
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(
        changePasswordDto.currentPassword,
        user.password,
      );

      if (!isCurrentPasswordValid) {
        throw MicroserviceException.fromException(
          'Current password is incorrect',
          HttpStatus.UNAUTHORIZED,
          MicroserviceErrorCode.INVALID_CREDENTIALS,
        );
      }

      // Check if new password is same as current
      const isSamePassword = await bcrypt.compare(
        changePasswordDto.newPassword,
        user.password,
      );

      if (isSamePassword) {
        throw MicroserviceException.fromException(
          'New password must be different from current password',
          HttpStatus.BAD_REQUEST,
          MicroserviceErrorCode.INVALID_OPERATION,
        );
      }

      // Hash and update the new password
      const hashedNewPassword = await bcrypt.hash(
        changePasswordDto.newPassword,
        10,
      );
      await this.userRepository.findOneAndUpdate(
        { _id: user._id },
        { password: hashedNewPassword },
      );

      return true;
    } catch (error) {
      if (error instanceof MicroserviceException) {
        throw error;
      }
      throw MicroserviceException.fromException(
        error.message || ErrorMessage.INTERNAL_SERVER_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
        MicroserviceErrorCode.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateUsername(
    userId: string,
    updateUsernameDto: UpdateProfileDto,
  ): Promise<UserDocument> {
    // Check if username is taken
    const existingUser = await this.userRepository
      .findOne({
        username: updateUsernameDto.username,
        _id: { $ne: userId },
      })
      .catch(() => null);

    if (existingUser) {
      throw MicroserviceException.fromException(
        'Username already taken',
        HttpStatus.BAD_REQUEST,
        MicroserviceErrorCode.INVALID_OPERATION,
      );
    }

    // Update username
    const updatedUser = await this.userRepository.findOneAndUpdate(
      { _id: userId },
      { username: updateUsernameDto.username },
    );

    return updatedUser;
  }

  async getAllUsers(): Promise<UserDocument[]> {
    return this.userRepository.find({});
  }

  async searchUsers(query: string): Promise<UserDocument[]> {
    return this.userRepository.find({
      $or: [
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
        { username: { $regex: query, $options: 'i' } },
      ],
    });
  }

  async deleteUser(userId: string): Promise<boolean> {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw MicroserviceException.fromException(
          ErrorMessage.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND,
          MicroserviceErrorCode.USER_NOT_FOUND,
        );
      }

      // Delete user's profile picture if exists
      if (user.profilePic) {
        try {
          const key = user.profilePic.split('/').pop();
          if (key) {
            await this.storageService.deleteFile(`POC/${key}`);
          }
        } catch (error) {
          console.error('Error deleting profile picture:', error);
          // Continue with user deletion even if profile picture deletion fails
        }
      }

      // Delete the user
      await this.userRepository.deleteOne({ _id: userId });
      return true;
    } catch (error) {
      if (error instanceof MicroserviceException) {
        throw error;
      }
      throw MicroserviceException.fromException(
        error.message || ErrorMessage.INTERNAL_SERVER_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
        MicroserviceErrorCode.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async countUsers(): Promise<number> {
    try {
      return await this.userRepository.countDocuments();
    } catch (error) {
      this.logger.error('Error counting users:', error);
      throw error;
    }
  }
}
