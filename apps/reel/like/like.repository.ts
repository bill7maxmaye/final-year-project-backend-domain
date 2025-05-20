import { BaseRepository } from '@app/common//baseRepository/base-repository';
import { LikeDocument } from '@app/common//models/reel/like.model';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';

@Injectable()
export class LikeRepository extends BaseRepository<LikeDocument> {
  constructor(
    @InjectModel(LikeDocument.name)
    readonly model: Model<LikeDocument>,
  ) {
    super(model);
  }

  async findOneOrNull(
    // <--- Method name changed
    filterQuery: FilterQuery<LikeDocument>,
  ): Promise<LikeDocument | null> {
    // The underlying Mongoose findOne returns null if no document is found.
    const document = await this.model.findOne<LikeDocument>(filterQuery).exec(); // Added .exec() which is good practice

    return document;
  }
}
