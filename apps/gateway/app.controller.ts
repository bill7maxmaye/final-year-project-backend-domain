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
// import { JwtAuthGuard } from '@app/common//guards/jwt-auth.guard';
import { User } from '@app/common//entities/user/user-entity';
import { ActiveUser } from '@app/common//decorators/active-user-decorator';
import { StorageService } from './storage/storage.service';

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
}
