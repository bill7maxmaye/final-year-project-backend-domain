import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument } from '../../models/authentication/user.model';
import { BaseRepository } from '../base-repository';

@Injectable()
export class UserRepository extends BaseRepository<UserDocument> {
  protected readonly logger = new Logger(UserRepository.name);
  constructor(
    @InjectModel(UserDocument.name)
    protected readonly userModel: Model<UserDocument>,
  ) {
    super(userModel);
  }
  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      this.logger.warn(`User not found with id: ${id}`);
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
