import { ErrorMessage } from '@app/common/enum/authentication/error-message.enum';
import { MicroserviceErrorCode } from '@app/common/enum/error/microservice-error.enum';
import { MicroserviceException } from '@app/common/exceptions/microservice-exception';
import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { LoginUserDto } from './dtos/login-user.dto';
import { CreateUserDto } from './dtos/userDto';
import { UserDocument } from './models/user.model';
import { LoginResponse } from './rtos/login-response.rto';
import { UserRepository } from './userRepository/user-repository';
import { EmailService } from './services/email.service';
import { VerifyEmailDto } from './dtos/verify-email.dto';
import { UserStatus } from './models/user.model';


@Injectable()
export class AuthenticationService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async createUser(createUserDto: CreateUserDto): Promise<UserDocument> {
    try {
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
      console.log('before verification', this.createUser);
      const verificationCode = this.generateVerificationCode();
      console.log('after verification', verificationCode);

      // Create user in database with verification code
      const newUser = await this.userRepository.create({
        ...createUserDto,
        verificationCode,
        isVerified: false,
        status: UserStatus.PENDING,
      });

      console.log('new user>>>', newUser);

      // Send verification email
      const result =await this.emailService.sendVerificationEmail(
        newUser.email,
        verificationCode,
      );

      console.log("after email...",result )

      return newUser;
    } catch {
      throw new MicroserviceException(
        ErrorMessage.INTERNAL_SERVER_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
        MicroserviceErrorCode.INTERNAL_SERVER_ERROR,
      );
    }
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
        { isVerified: true, status: UserStatus.ACTIVE, verificationCode: undefined },
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
    try {
      const user = await this.userRepository
        .findOne({ email: loginUserDto.email })
        .catch(() => null);
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

      const accessToken = jwt.sign(payload, jwtSecret, { expiresIn: '1h' });

      return new LoginResponse(accessToken, user._id.toString());
    } catch {
      throw new MicroserviceException(
        ErrorMessage.INTERNAL_SERVER_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
        MicroserviceErrorCode.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
