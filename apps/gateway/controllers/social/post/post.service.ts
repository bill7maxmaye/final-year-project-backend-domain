import { cloudinary } from '@app/common//config/cloudinary.config';
import { CreatePostGatewayDto } from '@app/common//dto/gateway/social/post/post-gateway.dto';
import { UpdatePostGatewayDto } from '@app/common//dto/gateway/social/post/update-post.dto';
import { CreatePostDto } from '@app/common//dto/microservices/social/post/create-post.dto';
import { ACTION } from '@app/common//enum/action.enum';
import { CONTROLLER } from '@app/common//enum/controller.enum';
import { MICROSERVICE } from '@app/common//enum/microservice.enum';
import { PostRto } from '@app/common//rto/social/post/post.rto';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { NetworkingService } from '@pp/networking';
import { UploadApiResponse } from 'cloudinary';

@Injectable()
export class PostService {
  private readonly logger = new Logger(PostService.name);

  constructor(private readonly networking: NetworkingService) {}

  async createPost(
    body: CreatePostGatewayDto,
    files?: Express.Multer.File[],
  ): Promise<PostRto> {
    const fileUrls = await this.handleFileUploads(files);
    const payload = CreatePostDto.fromCreate(body, fileUrls);

    try {
      return await this.networking.send<PostRto>(
        // MICROSERVICE_QUEUE.SOCIAL,
        `${MICROSERVICE.SOCIAL}.${CONTROLLER.SOCIAL_POSTS}.${ACTION.CREATE}`,
        payload,
      );
    } catch (error) {
      this.logger.error('Error creating post:', error);
      throw error;
    }
  }

  async updatePost(
    id: string,
    body: UpdatePostGatewayDto,
    files?: Express.Multer.File[],
  ): Promise<PostRto> {
    const fileUrls = await this.handleFileUploads(files);
    const payload = CreatePostDto.fromUpdate(body, fileUrls);

    try {
      return await this.networking.send<PostRto>(
        // MICROSERVICE_QUEUE.SOCIAL,
        `${MICROSERVICE.SOCIAL}.${CONTROLLER.SOCIAL_POSTS}.${ACTION.UPDATE}`,
        { id, data: payload },
      );
    } catch (error) {
      this.logger.error(`Error updating post ${id}:`, error);
      throw error;
    }
  }

  async deletePost(id: string): Promise<{ success: boolean }> {
    try {
      const result = await this.networking.send<{ success: boolean }>(
        // MICROSERVICE_QUEUE.SOCIAL,
        `${MICROSERVICE.SOCIAL}.${CONTROLLER.SOCIAL_POSTS}.${ACTION.DELETE}`,
        { id },
      );

      console.log('Delete result:', result);
      if (!result) {
        this.logger.warn(`Post with ID ${id} not found`);
        throw new NotFoundException(`Post with ID ${id} not found`);
      }
      return { success: true };
    } catch (error) {
      this.logger.error(`Error deleting post ${id}:`, error);
      throw error;
    }
  }

  private async handleFileUploads(
    files?: Express.Multer.File[],
  ): Promise<string[]> {
    if (!files || files.length === 0) return [];

    try {
      return await Promise.all(
        files.map((file) => this.uploadToCloudinary(file)),
      );
    } catch (error) {
      this.logger.error('Error uploading files:', error);
      throw new Error('Failed to upload files');
    }
  }

  private async uploadToCloudinary(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: 'auto' },
        (error: any, result: UploadApiResponse) => {
          if (error) {
            this.logger.error('Cloudinary upload error:', error);
            return reject(error);
          }
          resolve(result.secure_url);
        },
      );
      stream.end(file.buffer);
    });
  }
}
