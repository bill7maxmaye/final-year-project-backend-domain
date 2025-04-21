import { CreatePostDto } from '@app/common//dto/microservices/social/post/create-post.dto';
import { ACTION } from '@app/common//enum/action.enum';
import { CONTROLLER } from '@app/common//enum/controller.enum';
import { MICROSERVICE } from '@app/common//enum/microservice.enum';
import { PostRto } from '@app/common//rto/social/post/post.rto';
import { Controller, Logger, NotFoundException } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PostService } from './post.service';

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
}
