import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { PostService } from './post.service';

import { PostRto } from '@app/common//rto/social/post/post.rto';
import { CreatePostGatewayDto } from '@app/common//dto/gateway/social/post/post-gateway.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UpdatePostGatewayDto } from '@app/common//dto/gateway/social/post/update-post.dto';

@Controller('social')
export class PostController {
  private readonly logger = new Logger(PostController.name);

  constructor(private readonly postsService: PostService) {}

  @Get('posts')
  getHello(): string {
    console.log('hello from post controller');
    return 'hello from post controller';
  }

  @Post('posts')
  @UseInterceptors(FilesInterceptor('files'))
  async create(
    @Body() body: CreatePostGatewayDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ): Promise<PostRto> {
    const filesArray = Array.isArray(files)
      ? files.filter(Boolean)
      : ([files].filter(Boolean) as unknown as Express.Multer.File[]);

    this.logger.log('Received create post request:', body, 'files', filesArray);

    return this.postsService.createPost(body, filesArray);
  }

  @Patch('posts/:id')
  @UseInterceptors(FilesInterceptor('files'))
  async update(
    @Param('id') id: string,
    @Body() body: UpdatePostGatewayDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ): Promise<PostRto> {
    const filesArray = Array.isArray(files)
      ? files.filter(Boolean)
      : ([files].filter(Boolean) as unknown as Express.Multer.File[]);

    this.logger.log(`Updating post ${id}:`, body, 'files', filesArray);
    return this.postsService.updatePost(id, body, filesArray);
  }

  @Delete('posts/:id')
  async delete(@Param('id') id: string): Promise<{ success: boolean }> {
    this.logger.log(`Deleting post ${id}`);
    await this.postsService.deletePost(id);
    return { success: true };
  }
}
