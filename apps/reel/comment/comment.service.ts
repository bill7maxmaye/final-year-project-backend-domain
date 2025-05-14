import { CreateCommentDto } from '@app/common//dto/microservices/reel/create-comment.dto';
import { Comment } from '@app/common//entities/reel/comment.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { FilterQuery, Types } from 'mongoose';
import { CommentsRepository } from './comment.repository';
import { UpdateCommentDto } from '@app/common//dto/microservices/reel/update-comment.dto';
import { CommentDocument } from '@app/common//models/reel/comment.model';

interface PaginationOptions {
  page: number;
  limit: number;
}

@Injectable()
export class CommentService {
  constructor(private readonly commentRepository: CommentsRepository) {}

  async createComment(createCommentDto: CreateCommentDto): Promise<Comment> {
    try {
      const { id, body } = createCommentDto;

      const comment = await this.commentRepository.create({
        ownerId: id, // Ensure this is a valid ObjectId or string that can be cast to ObjectId
        reelId: body.reelId, // Extract reelId from the 'body'
        content: body.content,
        mentionedUsers: [],
      });

      console.log(comment);

      return Comment.fromDocument(comment);
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error;
    }
  }
  async getComment(id: string): Promise<Comment> {
    try {
      const comment = await this.commentRepository.findOne({
        _id: new Types.ObjectId(id),
      });

      if (!comment) {
        throw new NotFoundException(`Comment with ID "${id}" not found`);
      }
      return Comment.fromDocument(comment);
    } catch (error) {
      if (error instanceof Types.ObjectId) {
        throw new NotFoundException(`Invalid Comment ID "${id}"`);
      } else {
        throw error;
      }
    }
  }

  async updateComment(
    id: string,
    updateCommentDto: UpdateCommentDto,
  ): Promise<Comment> {
    try {
      const updatedComment = await this.commentRepository.findOneAndUpdate(
        { _id: new Types.ObjectId(id) },
        updateCommentDto,
      );

      if (!updatedComment) {
        throw new NotFoundException(`Comment with ID "${id}" not found`);
      }
      return Comment.fromDocument(updatedComment);
    } catch (error) {
      if (error instanceof Types.ObjectId) {
        throw new NotFoundException(`Invalid Comment ID "${id}"`);
      } else {
        throw error;
      }
    }
  }

  async deleteComment(id: string): Promise<void> {
    try {
      const result = await this.commentRepository.deleteOne({
        _id: new Types.ObjectId(id),
      });

      if (!result) {
        throw new NotFoundException(`Comment with ID "${id}" not found`);
      }
    } catch (error) {
      if (error instanceof Types.ObjectId) {
        throw new NotFoundException(`Invalid Comment ID "${id}"`);
      } else {
        throw error;
      }
    }
  }

  // async getManyComments(
  //   commentIds: string[],
  //   paginationOptions: PaginationOptions,
  // ): Promise<Comment[]> {
  //   const { page, limit } = paginationOptions;
  //   const skip = (page - 1) * limit;

  //   try {
  //     const objectIds = commentIds.map((id) => new Types.ObjectId(id));

  //     const filterQuery: FilterQuery<CommentDocument> = {
  //       reelId: { $in: objectIds },
  //     };

  //     const comments = await this.commentRepository
  //       .find(filterQuery)
  //       .skip(skip)
  //       .limit(limit)
  //       .exec();

  //     return Comment.fromDocuments(comments);
  //   } catch (error: any) {
  //     if (error instanceof Types.ObjectId) {
  //       throw new NotFoundException(`Invalid Comment ID in commentIds array`);
  //     }
  //     console.error('Error fetching comments:', error);
  //     throw error;
  //   }
  // }

  async getCommentsByReelId(
    reelId: string,
    paginationOptions: PaginationOptions,
  ): Promise<Comment[]> {
    const { page, limit } = paginationOptions;
    const skip = (page - 1) * limit;

    // if (!Types.ObjectId.isValid(reelId)) {
    //   console.warn(`Invalid Reel ID format: "${reelId}"`);
    //   throw new NotFoundException(`Invalid Reel ID format: "${reelId}"`);
    // }

    try {
      const filterQuery: FilterQuery<CommentDocument> = {
        reelId: reelId,
      };

      const comments = await this.commentRepository
        .find(filterQuery)
        .skip(skip)
        .limit(limit)
        .exec();

      console.log(
        comments.length === 0
          ? `No comments found for valid Reel ID "${reelId}".`
          : `Found ${comments.length} comments for valid Reel ID "${reelId}".`,
      );

      return Comment.fromDocuments(comments); // Will return [] if no comments
    } catch (error: any) {
      console.error(`Error fetching comments for reel ID "${reelId}":`, error);
      throw error;
    }
  }
}
