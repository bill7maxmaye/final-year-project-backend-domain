/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { MicroserviceErrorCode, MicroserviceException } from '@app/common';
import { ActiveUser } from '@app/common//decorators/active-user-decorator';
import { CreatePostCommentGatewayDto } from '@app/common//dto/gateway/social/post/create-comment-gateway.rto';
import { UpdateCommentGatewayDto } from '@app/common//dto/gateway/social/post/update-comment-gateway.dto';
import { CreateCommentDto } from '@app/common//dto/microservices/social/post/create-comment-dto';
import { ListAllDto } from '@app/common//dto/microservices/social/post/list-all.dto';
import { ACTION } from '@app/common//enum/action.enum';
import { ErrorMessage } from '@app/common//enum/authentication/error-message.enum';
import { CONTROLLER } from '@app/common//enum/controller.enum';
import { MICROSERVICE } from '@app/common//enum/microservice.enum';
import { FindResult } from '@app/common//rto/find-result';
import { CommentRto } from '@app/common//rto/social/comment/comment.rto';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { NetworkingService } from '@pp/networking';
import { StorageService } from 'apps/gateway/storage/storage.service';
import { User } from '@app/common//entities/user/user-entity';
import { UserRto } from '@app/common//rto/microservices/auth/user.rto';
import { CommentGatewayRto } from '@app/common//rto/gateway/social/post/comment-gateway-rto';
import { JwtAuthGuard } from '@app/common//guards/jwt-auth.guard';

@Controller('social')
@UseGuards(JwtAuthGuard)
export class CommentController {
  private readonly logger = new Logger(CommentController.name);

  constructor(
    private readonly networking: NetworkingService,
    private readonly storageService: StorageService,
  ) {}

  @Get('commentTest')
  test(): { message: string } {
    return { message: 'Hello from CommentController!' };
  }

  @Post('comments')
  @UseInterceptors(FilesInterceptor('files'))
  async create(
    @Body() body: CreatePostCommentGatewayDto,
    @ActiveUser() user: User,
    @UploadedFiles() files?: Express.Multer.File[],
  ): Promise<CommentGatewayRto> {
    console.log('Creating comment:', body);
    console.log();
    const uploadResult =
      files && (await this.storageService.uploadMultipleFiles(files));

    const comment = CreateCommentDto.fromCreate(body, uploadResult, user.id);
    console.log('Comment:', comment);

    const response = await this.networking.send<CommentRto>(
      `${MICROSERVICE.SOCIAL}.${CONTROLLER.SOCIAL_COMMENTS}.${ACTION.CREATE}`,
      comment,
    );

    const owner = await this.networking.send<UserRto>(
      `${MICROSERVICE.AUTHENTICATION}.${CONTROLLER.AUTH}.${ACTION.GET_USER}`,
      comment.authorId,
    );

    const result = CommentGatewayRto.fromComment(response, owner);

    console.log('Response:', response);

    return result;
  }

  @Patch('comments/:id')
  @UseInterceptors(FilesInterceptor('files'))
  async update(
    @Param('id') id: string,
    @Body() body: UpdateCommentGatewayDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ): Promise<CommentRto> {
    const uploadResult =
      files && (await this.storageService.uploadMultipleFiles(files));

    const updatedComment = CreateCommentDto.fromUpdate(body, uploadResult);

    const response = await this.networking.send<CommentRto>(
      `${MICROSERVICE.SOCIAL}.${CONTROLLER.SOCIAL_COMMENTS}.${ACTION.UPDATE}`,
      { id, data: updatedComment },
    );

    const owner = await this.networking.send<UserRto>(
      `${MICROSERVICE.AUTHENTICATION}.${CONTROLLER.AUTH}.${ACTION.GET_USER}`,
      response.authorId,
    );

    const result = CommentGatewayRto.fromComment(response, owner);

    return result;
  }

  @Delete('comments/:id')
  async delete(@Param('id') id: string): Promise<{ success: boolean }> {
    const result = await this.networking.send<{ success: boolean }>(
      `${MICROSERVICE.SOCIAL}.${CONTROLLER.SOCIAL_COMMENTS}.${ACTION.DELETE}`,
      { id },
    );
    return result;
  }

  @Post('comments/:id/toggleReaction')
  async toggleReaction(
    @Param('id') id: string,
    @ActiveUser() user: User,
  ): Promise<CommentGatewayRto> {
    const response = await this.networking.send<CommentRto>(
      `${MICROSERVICE.SOCIAL}.${CONTROLLER.SOCIAL_COMMENTS}.${ACTION.TOGGLE}`,
      { id, userId: user.id },
    );

    const owner = await this.networking.send<UserRto>(
      `${MICROSERVICE.AUTHENTICATION}.${CONTROLLER.AUTH}.${ACTION.GET_USER}`,
      user.id,
    );

    const result = CommentGatewayRto.fromComment(response, owner);

    return result;
  }

  @Get('comments')
  async listAll(
    @Query() query: ListAllDto,
  ): Promise<FindResult<CommentGatewayRto>> {
    try {
      // First fetch all comments
      const response = await this.networking.send<FindResult<CommentRto>>(
        `${MICROSERVICE.SOCIAL}.${CONTROLLER.SOCIAL_COMMENTS}.${ACTION.LIST_ALL}`,
        {
          payload: query,
        },
      );

      // Get unique owner IDs from all comments
      const ownerIds = [
        ...new Set(response.data.map((comment) => comment.authorId!)),
      ];

      // Fetch all owners in a single batch request if your API supports it
      const owners = await Promise.all(
        ownerIds.map((ownerId) =>
          this.networking.send<UserRto>(
            `${MICROSERVICE.AUTHENTICATION}.${CONTROLLER.AUTH}.${ACTION.GET_USER}`,
            ownerId,
          ),
        ),
      );

      // Create a map of ownerId -> owner for quick lookup
      const ownerMap = new Map<string, UserRto>();
      owners.forEach((owner, index) => {
        ownerMap.set(ownerIds[index], owner);
      });

      // Map comments with their respective owners
      const comments = response.data.map((comment) => {
        const owner = ownerMap.get(comment.authorId!);
        if (!owner) {
          this.logger.warn(
            `Owner not found for comment ${comment.id} with owner ${comment.authorId}`,
          );
          // You might want to handle this case differently - either throw or continue with minimal data
          throw new Error(`Owner not found for comment ${comment.id}`);
        }

        console.log('Mapping comment:', comment, 'with owner:', owner);
        return CommentGatewayRto.fromComment(comment, owner);
      });

      return {
        data: comments,
        total: response.total,
      };
    } catch (error) {
      this.logger.error('Error listing comments', error.stack);
      throw error;
    }
  }
  @Get('comments/:id')
  async getById(@Param('id') id: string): Promise<CommentRto> {
    console.log('receiving data', id);
    try {
      const response = await this.networking.send<CommentRto>(
        `${MICROSERVICE.SOCIAL}.${CONTROLLER.SOCIAL_COMMENTS}.${ACTION.RETRIEVE}`,
        id,
      );
      if (!response) {
        throw MicroserviceException.fromException(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          ErrorMessage.COMMENT_NOT_FOUND,
          HttpStatus.NOT_FOUND,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          MicroserviceErrorCode.COMMENT_NOT_FOUND,
        );
      }
      return response;
    } catch (error) {
      this.logger.error(`Error retrieving post ${id}`, error.stack);
      throw error;
    }
  }

  @Get('posts/:id/comments')
  async getCommentsForSinglePost(
    @Param('id') id: string,
    // @ActiveUser() user: User,
  ): Promise<CommentGatewayRto[]> {
    this.logger.log(`Retrieving comments for post ${id}`);
    try {
      // Fetch comments for a single post
      const comments = await this.networking.send<CommentRto[]>(
        `${MICROSERVICE.SOCIAL}.${CONTROLLER.SOCIAL_COMMENTS}.${ACTION.RETRIEVE_ALL}`,
        id,
      );

      // Extract unique author IDs
      const ownerIds = [
        ...new Set(comments.map((comment) => comment.authorId)),
      ];

      // Fetch all owners in batch
      const owners = await Promise.all(
        ownerIds.map((ownerId) =>
          this.networking.send<UserRto>(
            `${MICROSERVICE.AUTHENTICATION}.${CONTROLLER.AUTH}.${ACTION.GET_USER}`,
            ownerId,
          ),
        ),
      );

      // Map ownerId -> owner object
      const ownerMap = new Map<string, UserRto>();
      owners.forEach((owner, index) => {
        const ownerId = ownerIds[index];
        if (ownerId) {
          ownerMap.set(ownerId, owner);
        }
      });

      // Map each comment to its gateway RTO with owner info
      const result = comments.map((comment) => {
        const owner = ownerMap.get(comment.authorId!);
        if (!owner) {
          this.logger.warn(
            `Owner not found for comment ${comment.id} by author ${comment.authorId}`,
          );
          throw new Error(`Owner not found for comment ${comment.id}`);
        }

        return CommentGatewayRto.fromComment(comment, owner);
      });

      return result;
    } catch (error) {
      this.logger.error(
        `Error retrieving comments for post ${id}`,
        error.stack,
      );
      throw error;
    }
  }
}
