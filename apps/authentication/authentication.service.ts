import { MicroserviceException, MicroserviceErrorCode } from '@app/common';
import { UserRepository } from '@app/common//baseRepository/userRepository/user.repository';
import { CreateUserDto } from '@app/common//dto/microservices/authentication/userDto';
import { ErrorMessage } from '@app/common//enum/authentication/error-message.enum';
import {
  UserDocument,
  UserStatus,
} from '@app/common//models/authentication/user.model';
import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'bcryptjs/umd/types';
import { EmailService } from './email.service';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly configService: ConfigService,
    private readonly userRepository: UserRepository,
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
      // console.log('before verification', this.createUser);
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
      const result = await this.emailService.sendVerificationEmail(
        newUser.email,
        verificationCode,
      );

      console.log('after email...', result);

      return newUser;
    } catch {
      throw new MicroserviceException(
        ErrorMessage.INTERNAL_SERVER_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
        MicroserviceErrorCode.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
