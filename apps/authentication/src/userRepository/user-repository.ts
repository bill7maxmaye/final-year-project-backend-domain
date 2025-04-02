import { BaseRepository } from '@app/common/baseRepository/base-repository';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserDocument } from 'apps/authentication/src/models/user.model';
import { Model } from 'mongoose';

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
