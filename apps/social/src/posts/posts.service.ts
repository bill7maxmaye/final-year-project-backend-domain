/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, HttpStatus } from '@nestjs/common';
import { MicroserviceException } from '@app/common/exceptions/microservice-exception';
import { MicroserviceErrorCode } from '@app/common/enum/error/microservice-error.enum';
import { PostRepository } from './posts.repository';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { PostDocument } from '../models/post.model';
import { ErrorMessage } from '@app/common/enum/social/error-message.enum';


@Injectable()
export class PostService {
  constructor(private readonly postRepository: PostRepository) {}

  async createPost(createPostDto: CreatePostDto): Promise<PostDocument> {
    try {
      const newPost = await this.postRepository.create(createPostDto);
      return newPost;
    } catch {
      throw new MicroserviceException(
        ErrorMessage.INTERNAL_SERVER_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
        MicroserviceErrorCode.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getPostById(id: string): Promise<PostDocument> {
    try {
      const post = await this.postRepository.findOne({ _id: id });
      if (!post) {
        throw MicroserviceException.fromException(
          ErrorMessage.POST_NOT_FOUND,
          HttpStatus.NOT_FOUND,
          MicroserviceErrorCode.POST_NOT_FOUND,
        );
      }
      return post;
    } catch (error) {
      if (error instanceof MicroserviceException) {
        throw error;
      }
      throw new MicroserviceException(
        ErrorMessage.INTERNAL_SERVER_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
        MicroserviceErrorCode.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updatePost(
    id: string,
    updatePostDto: UpdatePostDto,
  ): Promise<PostDocument> {
    try {
      const updatedPost = await this.postRepository.findOneAndUpdate(
        { _id: id },
        updatePostDto,
      );
      if (!updatedPost) {
        throw MicroserviceException.fromException(
          ErrorMessage.POST_NOT_FOUND,
          HttpStatus.NOT_FOUND,
          MicroserviceErrorCode.POST_NOT_FOUND,
        );
      }
      return updatedPost;
    } catch (error) {
      if (error instanceof MicroserviceException) {
        throw error;
      }
      throw new MicroserviceException(
        ErrorMessage.INTERNAL_SERVER_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
        MicroserviceErrorCode.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deletePost(id: string): Promise<void> {
    try {
      const deletedPost = await this.postRepository.deleteOne({ _id: id });
      if (!deletedPost) {
        throw MicroserviceException.fromException(
          ErrorMessage.POST_NOT_FOUND,
          HttpStatus.NOT_FOUND,
          MicroserviceErrorCode.POST_NOT_FOUND,
        );
      }
    } catch (error) {
      if (error instanceof MicroserviceException) {
        throw error;
      }
      throw new MicroserviceException(
        ErrorMessage.INTERNAL_SERVER_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
        MicroserviceErrorCode.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
