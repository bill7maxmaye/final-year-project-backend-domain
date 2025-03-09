import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../../authentication/src/dtos/userDto';
import { UserRepository } from './userRepository/user-repository';

@Injectable()
export class AppService {
  constructor() {}

  // async createUser(CreateUserDto: CreateUserDto) {
  //   return this.userRepository.create(CreateUserDto);
  // }

  // async findAll() {
  //   return this.userRepository.find({});
  // }

  // async findOne(_id: string) {
  //   return this.userRepository.findOne({ _id });
  // }

  // async update(_id: string, updateReservationDto: UpdateReservationDto) {
  //   return this.userRepository.findOneAndUpdate(
  //     { _id },
  //     { $set: updateReservationDto },
  //   );
  // }

  // async remove(_id: string) {
  //   return this.userRepository.findOneAndDelete({ _id });
  // }
}
