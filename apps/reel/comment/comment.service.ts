import { CreateCommentDto } from '@app/common//dto/microservices/reel/create-comment.dto';
import { Comment } from '@app/common//entities/reel/comment.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { FilterQuery, Types, UpdateQuery } from 'mongoose';
import { CommentsRepository } from './comment.repository';
import { UpdateCommentDto } from '@app/common//dto/microservices/reel/update-comment.dto';
import { CommentDocument } from '@app/common//models/reel/comment.model';
import { LikeResponse } from '@app/common//dto/interface/like.interface';

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

      console.log(
        body.parentCommentId,
        new Types.ObjectId(body.parentCommentId),
      );

      const comment = await this.commentRepository.create({
        ownerId: id,
        reelId: body.reelId,
        parentCommentId: body.parentCommentId
          ? new Types.ObjectId(body.parentCommentId)
          : undefined,
        content: body.content,
        mentionedUserIds: [],
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
      const updateObject: UpdateQuery<Comment> = {
        $set: updateCommentDto.body,
      };

      const updatedComment = await this.commentRepository.updateOneAndRetrieve(
        { _id: new Types.ObjectId(id) },
        updateObject,
      );

      console.log(updatedComment);

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

  async deleteComment(id: string): Promise<CommentDocument> {
    try {
      const result = await this.commentRepository.findOneAndDelete({
        _id: new Types.ObjectId(id),
      });

      if (!result) {
        throw new NotFoundException(`Comment with ID "${id}" not found`);
      }
      return result;
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

  async likeComment(
    commentId: string,
    likeStatus: LikeResponse,
  ): Promise<number> {
    // Changed parameter name to commentId for clarity, but follow user's original code logic using it as _id
    let objectIdComment: Types.ObjectId; // Renamed variable for clarity
    try {
      // Attempt to convert the string ID to ObjectId
      objectIdComment = new Types.ObjectId(commentId);
    } catch (error) {
      // Catch error if the string format is invalid for ObjectId
      throw new NotFoundException(
        `Invalid Comment ID format "${commentId} ${error}"`,
      ); // Use commentId in error message
    }

    // Determine whether to increment or decrement the like count
    const incrementValue = likeStatus.status === 'LIKED' ? 1 : -1;

    // Define the update operation using Mongoose $inc operator
    const updateOperation: UpdateQuery<CommentDocument> = {
      $inc: { likes: incrementValue },
    };

    try {
      // Use the repository method to find the comment, update its like count, and retrieve the updated document
      const updatedCommentDocument =
        await this.commentRepository.updateOneAndRetrieve(
          { _id: objectIdComment }, // Querying the comment collection by its _id
          updateOperation,
        );

      // Check if the document was found and updated.
      // updateOneAndRetrieve should ideally return the document if found/updated, null otherwise.
      if (!updatedCommentDocument) {
        throw new NotFoundException(
          `Comment with ID "${commentId}" not found or could not be updated`,
        );
      }

      // Return the new like count from the updated document
      return updatedCommentDocument.likes;
    } catch (error) {
      // Re-throw the NotFoundException if it originated from the check above
      if (error instanceof NotFoundException) {
        throw error; // Re-throw the specific error
      }
      // Log other potential errors from the database operation
      console.error(
        `Error updating like count for comment ${commentId}:`,
        error,
      );
      // Re-throw the error (consider using a more specific NestJS exception like InternalServerErrorException)
      throw error;
    }
  }
}
