import { Injectable } from '@nestjs/common';
import { UserRepository } from './userRepository/user-repository';
import { CreateUserDto } from './dtos/userDto';

@Injectable()
export class AppService {
  constructor(private readonly userRepository: UserRepository) {}

  async createUser(CreateUserDto: CreateUserDto) {
    return this.userRepository.create(CreateUserDto);
  }

  async findAll() {
    return this.userRepository.find({});
  }

  async findOne(_id: string) {
    return this.userRepository.findOne({ _id });
  }

  // async update(_id: string, updateReservationDto: UpdateReservationDto) {
  //   return this.userRepository.findOneAndUpdate(
  //     { _id },
  //     { $set: updateReservationDto },
  //   );
  // }

  async remove(_id: string) {
    return this.userRepository.findOneAndDelete({ _id });
  }
}
