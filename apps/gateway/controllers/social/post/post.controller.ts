/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { PostRto } from '@app/common//rto/social/post/post.rto';
import { CreatePostGatewayDto } from '@app/common//dto/gateway/social/post/post-gateway.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UpdatePostGatewayDto } from '@app/common//dto/gateway/social/post/update-post.dto';
import { NetworkingService } from '@pp/networking';
import { MICROSERVICE } from '@app/common//enum/microservice.enum';
import { CONTROLLER } from '@app/common//enum/controller.enum';
import { ACTION } from '@app/common//enum/action.enum';
import { CreatePostDto } from '@app/common//dto/microservices/social/post/create-post.dto';
import { StorageService } from 'apps/gateway/storage/storage.service';
import { v4 as uuidv4 } from 'uuid';
import { FindResult } from '@app/common//rto/find-result';
import { ListAllDto } from '@app/common//dto/microservices/social/post/list-all.dto';
import { PostReportDto } from '@app/common//dto/gateway/social/post/post-report.dto';
import { ActiveUser } from '@app/common//decorators/active-user-decorator';
import { User } from '@app/common//entities/user/user-entity';
import { JwtAuthGuard } from '@app/common//guards/jwt-auth.guard';
import { PostGatewayRto } from '@app/common//rto/gateway/social/post/post-gateway.rto';

@Controller('social')
@UseGuards(JwtAuthGuard)
export class PostController {
  private readonly logger = new Logger(PostController.name);

  constructor(
    private readonly networking: NetworkingService,
    private readonly storageService: StorageService,
  ) {}

  @Get('test')
  test(@ActiveUser() user: User): { message: string } {
    console.log('User:', user);
    return { message: 'Hello from PostController!' };
  }

  @Post('posts')
  @UseInterceptors(FilesInterceptor('files'))
  async create(
    @Body() body: CreatePostGatewayDto,
    @ActiveUser() user: User,
    @UploadedFiles() files?: Express.Multer.File[],
  ): Promise<PostGatewayRto> {
    const uploadResult =
      files && (await this.storageService.uploadMultipleFiles(files));
    console.log('userId', user);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const post = CreatePostDto.fromCreate(body, uploadResult);

    const response = await this.networking.send<PostRto>(
      `${MICROSERVICE.SOCIAL}.${CONTROLLER.SOCIAL_POSTS}.${ACTION.CREATE}`,
      post,
    );

    const result = PostGatewayRto.fromEntity(response, user);

    return result;
  }

  @Patch('posts/:id')
  @UseInterceptors(FilesInterceptor('files'))
  async update(
    @Param('id') id: string,
    @Body() body: UpdatePostGatewayDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ): Promise<PostRto> {
    const uploadResult =
      files && (await this.storageService.uploadMultipleFiles(files));
    // const userId = uuidv4();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const post = CreatePostDto.fromUpdate(body, uploadResult);
    const response = await this.networking.send<PostRto>(
      `${MICROSERVICE.SOCIAL}.${CONTROLLER.SOCIAL_POSTS}.${ACTION.UPDATE}`,
      { id, data: post },
    );

    return response;
  }

  @Delete('posts/:id')
  async delete(@Param('id') id: string): Promise<{ success: boolean }> {
    const result = await this.networking.send<{ success: boolean }>(
      `${MICROSERVICE.SOCIAL}.${CONTROLLER.SOCIAL_POSTS}.${ACTION.DELETE}`,
      { id },
    );
    return result;
  }

  @Post('posts/:id/like')
  async likePost(@Param('id') id: string): Promise<PostRto> {
    const userId = uuidv4();
    const response = await this.networking.send<PostRto>(
      `${MICROSERVICE.SOCIAL}.${CONTROLLER.SOCIAL_POSTS}.${ACTION.LIKE}`,
      { id, userId },
    );
    return response;
  }

  @Get('posts')
  async listAll(@Query() query: ListAllDto): Promise<FindResult<PostRto>> {
    try {
      const response = await this.networking.send<FindResult<PostRto>>(
        `${MICROSERVICE.SOCIAL}.${CONTROLLER.SOCIAL_POSTS}.${ACTION.LIST_ALL}`,
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

  @Get('posts/:id')
  async getById(@Param('id') id: string): Promise<PostRto> {
    try {
      const response = await this.networking.send<PostRto>(
        `${MICROSERVICE.SOCIAL}.${CONTROLLER.SOCIAL_POSTS}.${ACTION.RETRIEVE}`,
        { id },
      );
      return response;
    } catch (error) {
      this.logger.error(`Error retrieving post ${id}`, error.stack);
      throw error;
    }
  }

  @Post('posts/:id/unlike')
  async unlikePost(@Param('id') id: string): Promise<PostRto> {
    const userId = uuidv4();
    const response = await this.networking.send<PostRto>(
      `${MICROSERVICE.SOCIAL}.${CONTROLLER.SOCIAL_POSTS}.${ACTION.UNLIKE}`,
      { id, userId },
    );
    return response;
  }

  @Post('posts/:id/report')
  async reportPost(
    @Body() body: PostReportDto,
    @Param('id') id: string,
  ): Promise<{ success: boolean }> {
    console.log('Reporting post with ID:', id);
    console.log('Report details:', body);
    const response = await this.networking.send<{ success: boolean }>(
      `${MICROSERVICE.SOCIAL}.${CONTROLLER.SOCIAL_POSTS}.${ACTION.REPORT}`,
      { ...body, content_id: id },
    );
    return response;
  }
}
