/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Logger,
  Get,
  Delete,
  Query,
  Body,
  // UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AppService } from './app.service';
import { StorageService } from './storage/storage.service';
// import { JwtAuthGuard } from '@app/common//guards/jwt-auth.guard';
import { User } from '@app/common//entities/user/user-entity';
import { ActiveUser } from '@app/common//decorators/active-user-decorator';
import { PostService } from './controllers/social/post/post.service';
import { CommentService } from './controllers/social/comment/comment.service';
import { UserRepository } from '@app/common//baseRepository/userRepository/user.repository';
import { PostRepository } from '@app/common//baseRepository/social/post-repositories/post.repository';
import { PostCommentRepository } from '@app/common//baseRepository/social/post-repositories/post-comment.repository';
import { ReelService } from './controllers/reel/reel.service';
import { ReelsRepository } from 'apps/reel/reel/reel.repository';

// const TEMP_UPLOAD_DIR_WINDOWS = path.join(os.tmpdir(), 'image_uploads_nestjs');

interface UploadRequestDto {
  title: string;
  description: string;
}

@Controller()
// @UseGuards(JwtAuthGuard)
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(
    private readonly appService: AppService,
    private readonly storageService: StorageService,
    private readonly postService: PostService,
    private readonly reelService: ReelService,
    private readonly commentService: CommentService,
    private readonly userRepository: UserRepository,
    private readonly postRepository: PostRepository,
    private readonly reelRepository: ReelsRepository,
    private readonly commentRepository: PostCommentRepository,
  ) {}

  @Get('/')
  test(@ActiveUser() user: User) {
    console.log('User:', user);
    return 'Hello World';
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UploadRequestDto,
  ) {
    this.logger.log('Received request to upload file with additional data');

    try {
      const uploadResult = await this.storageService.uploadFile(file); // Pass file
      // Access text fields from the 'body' object
      const { title, description } = body;
      this.logger.log(`Title: ${title}, Description: ${description}`);

      // You can now save the file information to a database,
      // including the S3 URL (from uploadResult) and the title/description

      return {
        message: 'File uploaded successfully',
        fileInfo: uploadResult, // whatever upload result contains
        metadata: { title, description },
      };
    } catch (error) {
      this.logger.error('Error during upload:', error);
      throw error; // or return an error response.
    }
  }

  @Get('list')
  async listObjects(): Promise<any> {
    this.logger.log('Listing content of bucket ');
    let responseData = await this.storageService.listObject();
    this.logger.log('Response Data ' + responseData);
    return responseData;
  }

  // @Get('download')
  // async getObjects(): Promise<any> {
  //   this.logger.log('Downloading file from s3 bucket ');
  //   let responseData = await this.storageService.downloadFile();
  //   this.logger.log('Response Data ' + responseData);
  //   return responseData;
  // }

  @Delete()
  async deleteFile(@Query('fileKey') fileKey: string) {
    try {
      await this.storageService.deleteFile(fileKey);
      return { message: `File ${fileKey} deleted successfully` };
    } catch (error) {
      return {
        message: `Error deleting file ${fileKey}`,
        error: error?.message,
      };
    }
  }

  @Get('stats')
  async getCollectionStats() {
    try {
      const [postCount, reelCount, commentCount, userCount] = await Promise.all(
        [
          this.postRepository.countDocuments(),
          this.reelRepository.countDocuments(),
          this.commentRepository.countDocuments(),
          this.userRepository.countDocuments(),
        ],
      );

      return {
        posts: postCount,
        reels: reelCount,
        comments: commentCount,
        users: userCount,
        total: postCount + reelCount + commentCount + userCount,
      };
    } catch (error) {
      this.logger.error('Error getting collection stats:', error);
      throw error;
    }
  }
}
