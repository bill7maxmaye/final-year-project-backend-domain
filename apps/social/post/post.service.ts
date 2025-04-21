import { PostRepository } from '@app/common//baseRepository/social/post-repositories/post.repository';
import { CreatePostDto } from '@app/common//dto/microservices/social/post/create-post.dto';
import { PostDocument } from '@app/common//models/social/post.model';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class PostService {
  constructor(private readonly postRepository: PostRepository) {}

  async createPost(
    createPostDto: CreatePostDto,
    authorId?: string,
  ): Promise<PostDocument> {
    const post = await this.postRepository.create({
      ...createPostDto,
      authorId: authorId,
    });
    return post;
  }

  async updatePost(
    id: string,
    updatedPostDto: CreatePostDto,
  ): Promise<PostDocument> {
    try {
      console.log('Post before update:', updatedPostDto);
      const post = await this.postRepository.updateOneAndRetrieve(
        { _id: id, isDeleted: false },
        updatedPostDto,
      );

      console.log('Post after update:', post);

      if (!post) {
        throw new NotFoundException(`Post with ID ${id} not found`);
      }

      return post;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
  }

  async deletePost(id: string): Promise<boolean> {
    try {
      const post = await this.postRepository.findOneAndDelete({ _id: id });

      return post !== null;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
  }

  // Hard delete alternative (uncomment if needed)
  /*
    async hardDeletePost(id: string): Promise<{ success: boolean }> {
      try {
        const result = await this.postRepository.deleteOne({ _id: id });
        if (result.deletedCount === 0) {
          throw new NotFoundException(`Post with ID ${id} not found`);
        }
        return { success: true };
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw error;
        }
        throw new NotFoundException(`Post with ID ${id} not found`);
      }
    }
    */
}
