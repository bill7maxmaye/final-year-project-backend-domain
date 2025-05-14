import { BaseRepository } from '@app/common//baseRepository/base-repository';
import { CommentDocument } from '@app/common//models/reel/comment.model';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class CommentsRepository extends BaseRepository<CommentDocument> {
  constructor(
    @InjectModel(CommentDocument.name)
    readonly model: Model<CommentDocument>,
  ) {
    super(model);
  }
}
