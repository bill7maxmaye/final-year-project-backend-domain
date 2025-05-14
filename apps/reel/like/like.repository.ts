import { BaseRepository } from '@app/common//baseRepository/base-repository';
import { LikeDocument } from '@app/common//models/reel/like.model';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class LikeRepository extends BaseRepository<LikeDocument> {
  constructor(
    @InjectModel(LikeDocument.name)
    readonly model: Model<LikeDocument>,
  ) {
    super(model);
  }
}
