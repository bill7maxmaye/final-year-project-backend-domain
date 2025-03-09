import { HttpStatus, Injectable } from '@nestjs/common';
import { UserRepository } from './userRepository/user-repository';
import { CreateUserDto } from './dtos/userDto';
import * as bcrypt from 'bcryptjs';
import { MicroserviceException } from '@app/common/exceptions/microservice-exception';
import { ErrorMessage } from '@app/common/enum/authentication/error-message.enum';
import { MicroserviceErrorCode } from '@app/common/enum/error/microservice-error.enum';
import { UserDocument } from './entities/user.entity';
import { LoginUserDto } from './dtos/login-user.dto';

@Injectable()
export class AuthenticationService {
  constructor(private readonly userRepository: UserRepository) {}

  async createUser(createUserDto: CreateUserDto): Promise<UserDocument> {
    try {
      // Check if the user already exists
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

      // Hash password before saving and set role
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

  async loginUser(loginUserDto: LoginUserDto): Promise<UserDocument> {
    try {
      // Find the user by email
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

      // Compare the provided password with the stored hashed password
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

      return user;
    } catch {
      throw new MicroserviceException(
        ErrorMessage.INTERNAL_SERVER_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
        MicroserviceErrorCode.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
