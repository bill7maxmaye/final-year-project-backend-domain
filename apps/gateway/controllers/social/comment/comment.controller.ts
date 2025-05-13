/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { MicroserviceErrorCode, MicroserviceException } from '@app/common';
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
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { NetworkingService } from '@pp/networking';
import { StorageService } from 'apps/gateway/storage/storage.service';
import { v4 as uuidv4 } from 'uuid';

@Controller('social')
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
    @UploadedFiles() files?: Express.Multer.File[],
  ): Promise<CommentRto> {
    console.log('Creating comment:', body);
    const uploadResult =
      files && (await this.storageService.uploadMultipleFiles(files));

    const comment = CreateCommentDto.fromCreate(body, uploadResult);
    console.log('Comment:', comment);

    const response = await this.networking.send<CommentRto>(
      `${MICROSERVICE.SOCIAL}.${CONTROLLER.SOCIAL_COMMENTS}.${ACTION.CREATE}`,
      comment,
    );

    console.log('Response:', response);

    return response;
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

    return response;
  }

  @Delete('comments/:id')
  async delete(@Param('id') id: string): Promise<{ success: boolean }> {
    const result = await this.networking.send<{ success: boolean }>(
      `${MICROSERVICE.SOCIAL}.${CONTROLLER.SOCIAL_COMMENTS}.${ACTION.DELETE}`,
      { id },
    );
    return result;
  }

  @Post('posts/:id/like')
  async likePost(@Param('id') id: string): Promise<CommentRto> {
    const userId = uuidv4();
    const response = await this.networking.send<CommentRto>(
      `${MICROSERVICE.SOCIAL}.${CONTROLLER.SOCIAL_COMMENTS}.${ACTION.LIKE}`,
      { id, userId },
    );
    return response;
  }

  @Post('posts/:id/unlike')
  async unlikePost(@Param('id') id: string): Promise<CommentRto> {
    const userId = uuidv4();
    const response = await this.networking.send<CommentRto>(
      `${MICROSERVICE.SOCIAL}.${CONTROLLER.SOCIAL_COMMENTS}.${ACTION.UNLIKE}`,
      { id, userId },
    );
    return response;
  }

  @Get('comments')
  async listAll(@Query() query: ListAllDto): Promise<FindResult<CommentRto>> {
    try {
      const response = await this.networking.send<FindResult<CommentRto>>(
        `${MICROSERVICE.SOCIAL}.${CONTROLLER.SOCIAL_COMMENTS}.${ACTION.LIST_ALL}`,
        {
          payload: query,
        },
      );
      return response;
    } catch (error) {
      this.logger.error('Error listing posts', error.stack);
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
  ): Promise<CommentRto[]> {
    console.log('receiving data', id);
    try {
      const response = await this.networking.send<CommentRto[]>(
        `${MICROSERVICE.SOCIAL}.${CONTROLLER.SOCIAL_COMMENTS}.${ACTION.RETRIEVE_ALL}`,
        id,
      );

      return response;
    } catch (error) {
      this.logger.error(`Error retrieving post ${id}`, error.stack);
      throw error;
    }
  }
}
