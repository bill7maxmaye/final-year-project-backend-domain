import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, Logger } from '@nestjs/common';
import { UserDocument } from '../entities/user.entity';
import { BaseRepository } from '@app/common/baseRepository/base-repository';

@Injectable()
export class UserRepository extends BaseRepository<UserDocument> {
  protected readonly logger = new Logger(UserRepository.name);
  constructor(
    @InjectModel(UserDocument.name)
    protected readonly userModel: Model<UserDocument>,
  ) {
    super(userModel);
  }
}
