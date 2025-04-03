import { BaseRepository } from '@app/common/baseRepository/base-repository';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PostDocument } from 'apps/social/src/models/post.model';
import { Model } from 'mongoose';

@Injectable()
export class PostRepository extends BaseRepository<PostDocument> {
  protected readonly logger = new Logger(PostRepository.name);
  constructor(
    @InjectModel(PostDocument.name)
    protected readonly postModel: Model<PostDocument>,
  ) {
    super(postModel);
  }
}