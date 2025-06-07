import { MicroserviceErrorCode, MicroserviceException } from '@app/common';
import { PostCommentRepository } from '@app/common//baseRepository/social/post-repositories/post-comment.repository';
import { PostRepository } from '@app/common//baseRepository/social/post-repositories/post.repository';
import { CreateCommentDto } from '@app/common//dto/microservices/social/post/create-comment-dto';
import { ListAllDto } from '@app/common//dto/microservices/social/post/list-all.dto';
import { ErrorMessage } from '@app/common//enum/authentication/error-message.enum';
import { CommentDocument } from '@app/common//models/reel/comment.model';
import { PostCommentDocument } from '@app/common//models/social/comment.model';
import { FindResult } from '@app/common//rto/find-result';
import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class CommentService {
  constructor(
    private readonly commentRepository: PostCommentRepository,
    private readonly postRepository: PostRepository,
  ) {}

  async createComment(
    createCommentDto: CreateCommentDto,
    authorId?: string,
  ): Promise<PostCommentDocument> {
    console.log('Creating comment with authorId:', createCommentDto, authorId);

    const newComment = await this.commentRepository.create({
      ...createCommentDto,
      authorId: authorId ?? createCommentDto.authorId,
    });

    if (!newComment.parentId) {
      await this.postRepository.updateOne(
        { _id: createCommentDto.postId },
        { $push: { commentIds: newComment._id } },
      );
    }

    if (createCommentDto.parentId) {
      await this.commentRepository.updateOne(
        { _id: createCommentDto.parentId },
        { $push: { replies: newComment._id } },
      );
    }

    console.log('Comment created:', newComment);
    return newComment;
  }

  async updateComment(
    id: string,
    updatedCommentDto: CreateCommentDto,
  ): Promise<PostCommentDocument> {
    try {
      const comment = await this.commentRepository.updateOneAndRetrieve(
        { _id: id },
        updatedCommentDto,
      );

      if (!comment) {
        throw new NotFoundException(`Comment with ID ${id} not found`);
      }

      return comment;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }
  }
  async deleteComment(id: string): Promise<boolean> {
    try {
      console.log('Deleting comment with ID:', id);
      const comment = await this.commentRepository.findOneAndDelete({
        _id: id,
      });

      console.log('Comment deleted:', comment);
      if (comment && !comment.parentId) {
        // Remove this comment ID from the post's commentIds array
        console.log('Deleting comment from post:', comment.postId);
        await this.postRepository.updateOne(
          { _id: comment.postId },
          { $pull: { commentIds: comment._id } },
        );
      }

      return comment !== null;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }
  }

  async likePost(
    commentId: string,
    userId: string,
  ): Promise<PostCommentDocument> {
    try {
      const comment = await this.commentRepository.findOne({ _id: commentId });

      console.log('Post before like:', comment);

      if (!comment) {
        throw new NotFoundException(`Post with ID ${commentId} not found`);
      }

      if (!comment.likedBy.includes(userId)) {
        comment.likedBy.push(userId);
        await comment.save();
      }

      return comment;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(`Post with ID ${commentId} `);
    }
  }

  async unlikePost(
    commentId: string,
    userId: string,
  ): Promise<PostCommentDocument> {
    try {
      const comment = await this.commentRepository.findOne({ _id: commentId });

      if (!comment) {
        throw new NotFoundException(`Post with ID ${commentId} not found`);
      }

      console.log('Post before unlike:', comment, userId);
      comment.likedBy = comment.likedBy.filter((id) => id !== userId);

      await comment.save();

      return comment;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(`Post with ID ${commentId} not found `);
    }
  }

  async getById(id: string): Promise<PostCommentDocument> {
    console.log('receivied id', id);
    const response = await this.commentRepository.findOne({ _id: id });

    if (!response) {
      throw MicroserviceException.fromException(
        ErrorMessage.COMMENT_NOT_FOUND,
        HttpStatus.NOT_FOUND,

        MicroserviceErrorCode.COMMENT_NOT_FOUND,
      );
    }
    return response;
  }

  async toggleReaction(
    commentId: string,
    userId: string,
  ): Promise<PostCommentDocument> {
    try {
      const post = await this.commentRepository.findOne({ _id: commentId });

      if (!post) {
        throw new NotFoundException(`Post with ID ${commentId} not found`);
      }
      const likedByStrings = post.likedBy.map((id) => id.toString());
      const isLiked = likedByStrings.includes(userId);
      console.log('Post liked by:', post.likedBy, isLiked, userId);
      const updateQuery = isLiked
        ? { $pull: { likedBy: userId } } // remove if already liked
        : { $addToSet: { likedBy: userId } }; // add only if not already there

      await this.commentRepository.updateOne({ _id: commentId }, updateQuery);

      // Return the updated post (optional: you can refetch it or return original)
      return await this.commentRepository.findOne({ _id: commentId });
    } catch (error) {
      console.error('Error toggling like/unlike:', error);
      throw new NotFoundException(
        `Post with ID ${commentId} failed to update reaction`,
      );
    }
  }

  async getCommentsByPostId(postId: string): Promise<PostCommentDocument[]> {
    console.log('Fetching comments for postId:', postId);

    const comments = await this.commentRepository
      .find({ postId: postId })
      .sort({ createdAt: -1 });

    if (!comments || comments.length === 0) {
      return [] as PostCommentDocument[];
    }

    return comments ?? ([] as PostCommentDocument[]);
  }
  async listAllComments(
    query: ListAllDto,
  ): Promise<FindResult<PostCommentDocument>> {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 100;
    const skip = (page - 1) * limit;

    const filter: any = {};

    if (query.search) {
      filter.$or = [
        { content: { $regex: query.search, $options: 'i' } },
        { title: { $regex: query.search, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.commentRepository.findMany(filter, {
        skip,
        limit,
        sort: { createdAt: -1 },
      }),
      this.commentRepository.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    const nextPage = page < totalPages ? page + 1 : null;
    const prevPage = page > 1 ? page - 1 : null;

    const baseUrl = '/posts'; // or inject base URL if needed
    const next = nextPage
      ? `${baseUrl}?page=${nextPage}&limit=${limit}`
      : undefined;
    const previous = prevPage
      ? `${baseUrl}?page=${prevPage}&limit=${limit}`
      : undefined;

    return FindResult.fromListAll(data, total, next, previous);
  }
}
