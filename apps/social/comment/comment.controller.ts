import { Controller, Logger } from '@nestjs/common';
import { CommentService } from './comment.service';
import { MICROSERVICE } from '@app/common//enum/microservice.enum';
import { CONTROLLER } from '@app/common//enum/controller.enum';
import { ACTION } from '@app/common//enum/action.enum';
import { CreateCommentDto } from '@app/common//dto/microservices/social/post/create-comment-dto';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CommentRto } from '@app/common//rto/social/comment/comment.rto';
import { ListAllDto } from '@app/common//dto/microservices/social/post/list-all.dto';
import { FindResult } from '@app/common//rto/find-result';
import { ModerationDto } from '@app/common//dto/microservices/reel/comment-moderation.dto';
import { SuccessRto } from '@app/common//rto/success.rto';

@Controller()
export class CommentController {
  private readonly logger = new Logger(CommentController.name);

  constructor(private readonly service: CommentService) {}

  @MessagePattern(
    `${MICROSERVICE.SOCIAL}.${CONTROLLER.SOCIAL_COMMENTS}.${ACTION.CREATE}`,
  )
  async create(@Payload() payload: CreateCommentDto): Promise<CommentRto> {
    try {
      console.log('Creating comment:', payload);
      const response = await this.service.createComment(payload);
      console.log('Comment created:', response);

      return CommentRto.fromEntity(response);
    } catch (error) {
      this.logger.error('Error creating comment:', error);
      throw error;
    }
  }

  @MessagePattern(
    `${MICROSERVICE.SOCIAL}.${CONTROLLER.SOCIAL_COMMENTS}.${ACTION.UPDATE}`,
  )
  async update(
    @Payload() payload: { id: string; data: CreateCommentDto },
  ): Promise<CommentRto> {
    try {
      console.log('Updating comment>>after micro:', payload.id, payload.data);

      const { id, data } = payload;
      const response = await this.service.updateComment(id, data);
      return CommentRto.fromEntity(response);
    } catch (error) {
      this.logger.error(`Error updating comment ${payload.id}:`, error);
      throw error;
    }
  }

  @MessagePattern(
    `${MICROSERVICE.SOCIAL}.${CONTROLLER.SOCIAL_COMMENTS}.${ACTION.DELETE}`,
  )
  async delete(
    @Payload() payload: { id: string },
  ): Promise<{ success: boolean }> {
    try {
      const result = await this.service.deleteComment(payload.id);
      return { success: result };
    } catch (error) {
      this.logger.error(`Error deleting comment ${payload.id}:`, error);
      throw error;
    }
  }

  @MessagePattern(
    `${MICROSERVICE.SOCIAL}.${CONTROLLER.SOCIAL_COMMENTS}.${ACTION.LIKE}`,
  )
  async likePost(
    @Payload() payload: { id: string; userId: string },
  ): Promise<CommentRto> {
    try {
      const { id, userId } = payload;
      console.log(`User ${userId} is liking post ${id}`);
      const response = await this.service.likePost(id, userId);
      return CommentRto.fromEntity(response);
    } catch (error) {
      this.logger.error(`Error liking post ${payload.id}:`, error);
      throw error;
    }
  }

  @MessagePattern(
    `${MICROSERVICE.SOCIAL}.${CONTROLLER.SOCIAL_COMMENTS}.${ACTION.UNLIKE}`,
  )
  async unlikePost(
    @Payload() payload: { id: string; userId: string },
  ): Promise<CommentRto> {
    try {
      const { id, userId } = payload;
      console.log(`User ${userId} is unliking post ${id}`);
      const response = await this.service.unlikePost(id, userId);
      return CommentRto.fromEntity(response);
    } catch (error) {
      this.logger.error(`Error unliking post ${payload.id}:`, error);
      throw error;
    }
  }

  @MessagePattern(
    `${MICROSERVICE.SOCIAL}.${CONTROLLER.SOCIAL_COMMENTS}.${ACTION.LIST_ALL}`,
  )
  async listAll(
    @Payload() payload: ListAllDto,
  ): Promise<FindResult<CommentRto>> {
    try {
      const result = await this.service.listAllComments(payload);
      return new FindResult<CommentRto>(
        result.data.map((item) => CommentRto.fromEntity(item)),
        result.total,
        result.next,
        result.previous,
      );
    } catch (error) {
      this.logger.error('Error listing posts:', error);
      throw error;
    }
  }

  @MessagePattern(
    `${MICROSERVICE.SOCIAL}.${CONTROLLER.SOCIAL_COMMENTS}.${ACTION.RETRIEVE}`,
  )
  async getById(@Payload() id: string): Promise<CommentRto> {
    try {
      console.log('receiving data', id);
      const comment = await this.service.getById(id);
      return CommentRto.fromEntity(comment);
    } catch (error) {
      this.logger.error(`Error retrieving post ${id}:`, error);
      throw error;
    }
  }

  @MessagePattern(
    `${MICROSERVICE.SOCIAL}.${CONTROLLER.SOCIAL_COMMENTS}.${ACTION.RETRIEVE_ALL}`,
  )
  async getCommentsForSinglePost(
    @Payload() postId: string,
  ): Promise<CommentRto[]> {
    try {
      console.log('Receiving comments for post:', postId);
      const comments = await this.service.getCommentsByPostId(postId);
      return comments.map((comment) => CommentRto.fromEntity(comment));
    } catch (error) {
      this.logger.error(`Error retrieving comments for post ${postId}:`, error);
      throw error;
    }
  }

  @MessagePattern(
    `${MICROSERVICE.SOCIAL}.${CONTROLLER.SOCIAL_COMMENTS}.${ACTION.TOGGLE}`,
  )
  async togglePost(
    @Payload() payload: { id: string; userId: string },
  ): Promise<CommentRto> {
    try {
      const { id, userId } = payload;
      console.log(`User ${userId} is toogling post ${id}`);
      const response = await this.service.toggleReaction(id, userId);
      return CommentRto.fromEntity(response);
    } catch (error) {
      this.logger.error(`Error liking post ${payload.id}:`, error);
      throw error;
    }
  }

  @MessagePattern(
    `${MICROSERVICE.SOCIAL}.${CONTROLLER.SOCIAL_COMMENTS}.${ACTION.COUNT}`,
  )
  async countComments(): Promise<number> {
    try {
      return await this.service.countDocuments();
    } catch (error) {
      this.logger.error('Error counting comments:', error);
      throw error;
    }
  }

  @MessagePattern(
    `${MICROSERVICE.SOCIAL}.${CONTROLLER.SOCIAL_COMMENTS}.${ACTION.COMMENT_MODERATION_RESULT}`,
  )
  async handleCommentModerationResult(
    @Payload() payload: { commentId: string; moderation: ModerationDto },
  ): Promise<SuccessRto> {
    console.log(JSON.stringify(payload));
    try {
      await this.service.moderationResult(
        payload.commentId,
        payload.moderation,
      );
      return new SuccessRto();
    } catch (error) {
      this.logger.error(
        `Error reel moderation result ${payload.commentId}: ${error}`,
      );
      throw error;
    }
  }
}
