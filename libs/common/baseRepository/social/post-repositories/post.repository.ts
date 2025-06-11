import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../base-repository';
import { PostDocument } from '@app/common//models/social/post.model';

@Injectable()
export class PostRepository extends BaseRepository<PostDocument> {
  constructor(@InjectModel(PostDocument.name) postModel: Model<PostDocument>) {
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
