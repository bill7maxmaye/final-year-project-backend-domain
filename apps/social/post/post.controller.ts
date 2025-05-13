import { CreatePostDto } from '@app/common//dto/microservices/social/post/create-post.dto';
import { ACTION } from '@app/common//enum/action.enum';
import { CONTROLLER } from '@app/common//enum/controller.enum';
import { MICROSERVICE } from '@app/common//enum/microservice.enum';
import { PostRto } from '@app/common//rto/social/post/post.rto';
import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PostService } from './post.service';
import { ListAllDto } from '@app/common//dto/microservices/social/post/list-all.dto';
import { FindResult } from '@app/common//rto/find-result';
import { PostReportDto } from '@app/common//dto/gateway/social/post/post-report.dto';

@Controller()
export class PostController {
  private readonly logger = new Logger(PostController.name);

  constructor(private readonly service: PostService) {}

  @MessagePattern(
    `${MICROSERVICE.SOCIAL}.${CONTROLLER.SOCIAL_POSTS}.${ACTION.CREATE}`,
  )
  async create(@Payload() payload: CreatePostDto): Promise<PostRto> {
    try {
      const response = await this.service.createPost(payload);
      return PostRto.fromEntity(response);
    } catch (error) {
      this.logger.error('Error creating post:', error);
      throw error;
    }
  }

  @MessagePattern(
    `${MICROSERVICE.SOCIAL}.${CONTROLLER.SOCIAL_POSTS}.${ACTION.UPDATE}`,
  )
  async update(
    @Payload() payload: { id: string; data: CreatePostDto },
  ): Promise<PostRto> {
    try {
      const { id, data } = payload;
      console.log('Updating post:', id, data);
      const response = await this.service.updatePost(id, data);
      return PostRto.fromEntity(response);
    } catch (error) {
      this.logger.error(`Error updating post ${payload.id}:`, error);
      throw error;
    }
  }

  @MessagePattern(
    `${MICROSERVICE.SOCIAL}.${CONTROLLER.SOCIAL_POSTS}.${ACTION.DELETE}`,
  )
  async delete(
    @Payload() payload: { id: string },
  ): Promise<{ success: boolean }> {
    try {
      const result = await this.service.deletePost(payload.id);

      return { success: result };
    } catch (error) {
      this.logger.error(`Error deleting post ${payload.id}:`, error);
      throw error;
    }
  }

  // Like a post
  @MessagePattern(
    `${MICROSERVICE.SOCIAL}.${CONTROLLER.SOCIAL_POSTS}.${ACTION.LIKE}`,
  )
  async likePost(
    @Payload() payload: { id: string; userId: string },
  ): Promise<PostRto> {
    try {
      const { id, userId } = payload;
      console.log(`User ${userId} is liking post ${id}`);
      const response = await this.service.likePost(id, userId);
      return PostRto.fromEntity(response);
    } catch (error) {
      this.logger.error(`Error liking post ${payload.id}:`, error);
      throw error;
    }
  }

  @MessagePattern(
    `${MICROSERVICE.SOCIAL}.${CONTROLLER.SOCIAL_POSTS}.${ACTION.UNLIKE}`,
  )
  async unlikePost(
    @Payload() payload: { id: string; userId: string },
  ): Promise<PostRto> {
    try {
      const { id, userId } = payload;
      console.log(`User ${userId} is unliking post ${id}`);
      const response = await this.service.unlikePost(id, userId);
      return PostRto.fromEntity(response);
    } catch (error) {
      this.logger.error(`Error unliking post ${payload.id}:`, error);
      throw error;
    }
  }

  @MessagePattern(
    `${MICROSERVICE.SOCIAL}.${CONTROLLER.SOCIAL_POSTS}.${ACTION.LIST_ALL}`,
  )
  async listAll(@Payload() payload: ListAllDto): Promise<FindResult<PostRto>> {
    try {
      const result = await this.service.listAllPosts(payload);
      return new FindResult<PostRto>(
        result.data.map((item) => PostRto.fromEntity(item)),
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
    `${MICROSERVICE.SOCIAL}.${CONTROLLER.SOCIAL_POSTS}.${ACTION.RETRIEVE}`,
  )
  async getById(@Payload() payload: { id: string }): Promise<PostRto> {
    try {
      const post = await this.service.getById(payload.id);
      return PostRto.fromEntity(post);
    } catch (error) {
      this.logger.error(`Error retrieving post ${payload.id}:`, error);
      throw error;
    }
  }

  @MessagePattern(
    `${MICROSERVICE.SOCIAL}.${CONTROLLER.SOCIAL_POSTS}.${ACTION.REPORT}`,
  )
  async reportPost(
    @Payload() payload: PostReportDto,
  ): Promise<{ success: boolean }> {
    try {
      this.logger.log(
        `Reporting post ${payload.content_id} for reason: ${payload.mainReason}`,
      );
      const result = await this.service.reportPost(payload);
      return result;
    } catch (error) {
      this.logger.error(`Error reporting post ${payload.content_id}:`, error);
      throw error;
    }
  }
}
