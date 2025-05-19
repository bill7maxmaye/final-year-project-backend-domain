import { Injectable } from '@nestjs/common';
import { PostReportDocument } from '@app/common//models/social/post-report.model';
import { Model } from 'mongoose';
import { BaseRepository } from '../../base-repository';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PostReportRepository extends BaseRepository<PostReportDocument> {
  constructor(
    @InjectModel(PostReportDocument.name) postModel: Model<PostReportDocument>,
  ) {
    super(postModel);
  }

  // async findPostsByAuthor(authorId: string): Promise<PostDocument[]> {
  //   return await this.find({ authorId, isDeleted: false });
  // }

  // async findPostById(id: string): Promise<PostDocument> {
  //   return this.findOne({ _id: id, isDeleted: false });
  // }

  // async softDelete(id: string): Promise<PostDocument> {
  //   return this.findOneAndUpdate(
  //     { _id: id, isDeleted: false },
  //     { isDeleted: true },
  //   );
  // }

  // async addComment(postId: string, commentId: string): Promise<PostDocument> {
  //   return this.findOneAndUpdate(
  //     { _id: postId, isDeleted: false },
  //     { $push: { commentIds: commentId } },
  //   );
  // }

  // async addLike(postId: string, userId: string): Promise<PostDocument> {
  //   return this.findOneAndUpdate(
  //     { _id: postId, isDeleted: false },
  //     { $push: { likedBy: userId } },
  //   );
  // }

  // async removeLike(postId: string, userId: string): Promise<PostDocument> {
  //   return this.findOneAndUpdate(
  //     { _id: postId, isDeleted: false },
  //     { $pull: { likedBy: userId } },
  //   );
  // }
}
