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

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService,
  ) {}

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

      // Create user in database
      const newUser = await this.userRepository.create(createUserDto);
      return newUser;
    } catch {
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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const accessToken = jwt.sign(payload, jwtSecret, { expiresIn: '1h' });
      console.log('🔑 JWT Payload:', accessToken);

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
