import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../base-repository';
import { CommentDocument } from '@app/common//models/social/comment.model';

@Injectable()
export class CommentRepository extends BaseRepository<CommentDocument> {
  constructor(@InjectModel(Comment.name) commentModel: Model<CommentDocument>) {
    super(commentModel);
  }

  // async findCommentsByPost(postId: string): Promise<CommentDocument[]> {
  //   return this.find({ postId, isDeleted: false });
  // }

  // async findCommentsByAuthor(authorId: string): Promise<CommentDocument[]> {
  //   return this.find({ authorId, isDeleted: false });
  // }

  // async findCommentById(id: string): Promise<CommentDocument> {
  //   return this.findOne({ _id: id, isDeleted: false });
  // }

  // async softDelete(id: string): Promise<CommentDocument> {
  //   return this.findOneAndUpdate(
  //     { _id: id, isDeleted: false },
  //     { isDeleted: true },
  //   );
  // }

  // async addLike(commentId: string, userId: string): Promise<CommentDocument> {
  //   return this.findOneAndUpdate(
  //     { _id: commentId, isDeleted: false },
  //     { $push: { likedBy: userId } },
  //   );
  // }

  // async removeLike(
  //   commentId: string,
  //   userId: string,
  // ): Promise<CommentDocument> {
  //   return this.findOneAndUpdate(
  //     { _id: commentId, isDeleted: false },
  //     { $pull: { likedBy: userId } },
  //   );
  // }
}
