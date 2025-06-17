import { CreatePostDto } from '@app/common//dto/microservices/social/post/create-post.dto';
import { ACTION } from '@app/common//enum/action.enum';
import { CONTROLLER } from '@app/common//enum/controller.enum';
import { MICROSERVICE } from '@app/common//enum/microservice.enum';
import { PostRto } from '@app/common//rto/social/post/post.rto';
import { BadRequestException, Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { PostService } from './post.service';
import { ListAllDto } from '@app/common//dto/microservices/social/post/list-all.dto';
import { FindResult } from '@app/common//rto/find-result';
import { PostReportDto } from '@app/common//dto/gateway/social/post/post-report.dto';
import { PostReportRto } from '@app/common//rto/social/post/post-report.rto';

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

  @MessagePattern(
    `${MICROSERVICE.SOCIAL}.${CONTROLLER.SOCIAL_POSTS}.${ACTION.TOGGLE}`,
  )
  async togglePost(
    @Payload() payload: { id: string; userId: string },
  ): Promise<PostRto> {
    try {
      const { id, userId } = payload;
      console.log(`User ${userId} is toogling post ${id}`);
      const response = await this.service.toggleReaction(id, userId);
      return PostRto.fromEntity(response);
    } catch (error) {
      this.logger.error(`Error liking post ${payload.id}:`, error);
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
    `${MICROSERVICE.SOCIAL}.${CONTROLLER.SOCIAL_POSTS}.${ACTION.GET_REPORTS}`,
  )
  async getPostReports(
    @Payload() payload: { content_id: string },
  ): Promise<{ report: PostReportRto[] }> {
    try {
      const reports = await this.service.findByContentId(payload.content_id);

      return {
        report: reports.map((report) => PostReportRto.fromEntity(report)),
      };
    } catch (error) {
      this.logger.error(
        `Error retrieving reports for post ${payload.content_id}:${error}`,
      );
      throw new RpcException(
        new BadRequestException(
          `Failed to get reports for post ${payload.content_id}`,
        ),
      );
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

  @MessagePattern(
    `${MICROSERVICE.SOCIAL}.${CONTROLLER.SOCIAL_POSTS}.${ACTION.RESOLVE_REPORT}`,
  )
  async resolveReport(
    @Payload() payload: { reportId: string; resolvedBy: string },
  ): Promise<{ success: boolean }> {
    try {
      this.logger.log(`Resolving report ${payload.reportId}`);
      const result = await this.service.resolveReport(
        payload.reportId,
        payload.resolvedBy,
      );
      return result;
    } catch (error) {
      this.logger.error(`Error resolving report ${payload.reportId}:`, error);
      throw error;
    }
  }

  @MessagePattern(
    `${MICROSERVICE.SOCIAL}.${CONTROLLER.SOCIAL_POSTS}.${ACTION.SEARCH}`,
  )
  async searchPosts(
    @Payload() payload: ListAllDto,
  ): Promise<FindResult<PostRto>> {
    try {
      this.logger.log(`Searching posts with query: ${JSON.stringify(payload)}`);

      // Make sure we're calling the correct service method
      const result = await this.service.searchPostsByContent(payload);

      return new FindResult<PostRto>(
        result.data.map((item) => PostRto.fromEntity(item)),
        result.total,
        result.next,
        result.previous,
      );
    } catch (error) {
      this.logger.error('Error searching posts:', error);
      throw error;
    }
  }

  @MessagePattern(
    `${MICROSERVICE.SOCIAL}.${CONTROLLER.SOCIAL_POSTS}.${ACTION.GET_USER_POSTS}`,
  )
  async getPostsByUser(
    @Payload() payload: ListAllDto & { authorId?: string },
  ): Promise<FindResult<PostRto>> {
    try {
      const { authorId, ...query } = payload;
      this.logger.log(`Getting posts for user ${authorId}`);

      if (authorId) {
        const result = await this.service.getPostsByUserId(query, authorId);
        return new FindResult<PostRto>(
          result.data.map((item) => PostRto.fromEntity(item)),
          result.total,
          result.next,
          result.previous,
        );
      } else {
        const result = await this.service.listAllPosts(query);
        return new FindResult<PostRto>(
          result.data.map((item) => PostRto.fromEntity(item)),
          result.total,
          result.next,
          result.previous,
        );
      }
    } catch (error) {
      this.logger.error(
        `Error getting posts for user ${payload.authorId}:`,
        error,
      );
      throw error;
    }
  }

  @MessagePattern(
    `${MICROSERVICE.SOCIAL}.${CONTROLLER.SOCIAL_POSTS}.${ACTION.COUNT}`,
  )
  async countPosts(): Promise<number> {
    try {
      return await this.service.countDocuments();
    } catch (error) {
      this.logger.error('Error counting posts:', error);
      throw error;
    }
  }

  @MessagePattern(
    `${MICROSERVICE.SOCIAL}.${CONTROLLER.SOCIAL_POSTS}.${ACTION.COUNT_REPORTS}`,
  )
  async countPostReports(): Promise<number> {
    try {
      return await this.service.countDocuments();
    } catch (error) {
      this.logger.error('Error counting post reports:', error);
      throw error;
    }
  }
}
