import { BaseRepository } from '@app/common//baseRepository/base-repository';
import { CommentDocument } from '@app/common//models/reel/comment.model';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';

@Injectable()
export class CommentsRepository extends BaseRepository<CommentDocument> {
  constructor(
    @InjectModel(CommentDocument.name)
    readonly model: Model<CommentDocument>,
  ) {
    super(model);
  }

  async findOneOrNull(
    // <--- Method name changed
    filterQuery: FilterQuery<CommentDocument>,
  ): Promise<CommentDocument | null> {
    // The underlying Mongoose findOne returns null if no document is found.
    const document = await this.model
      .findOne<CommentDocument>(filterQuery)
      .exec(); // Added .exec() which is good practice

    // Return the document (which will be null if not found)
    return document;
  }
}
