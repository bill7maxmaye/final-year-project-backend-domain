import { BaseRepository } from '@app/common//baseRepository/base-repository';
import { ReelDocument } from '@app/common//models/reel/reel.model';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class ReelsRepository extends BaseRepository<ReelDocument> {
  constructor(
    @InjectModel(ReelDocument.name)
    readonly model: Model<ReelDocument>,
  ) {
    super(model);
  }
}
