/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Controller, Inject } from '@nestjs/common';
import { ClientProxy, MessagePattern, Payload } from '@nestjs/microservices';
import { PostService } from './posts.service';
import { PostRto } from '../rtos/post.rto';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';

@Controller()
export class PostController {
  constructor(
    @Inject('RABBITMQ_SERVICE') private client: ClientProxy,
    private readonly postService: PostService,
  ) {}

  @MessagePattern({ cmd: 'create_post' })
  async create(@Payload() createPostDto: CreatePostDto): Promise<PostRto> {
    const response = await this.postService.createPost(createPostDto);
    return new PostRto(response);
  }

  @MessagePattern({ cmd: 'get_post' })
  async get(@Payload() id: string): Promise<PostRto> {
    const response = await this.postService.getPostById(id);
    return new PostRto(response);
  }

  @MessagePattern({ cmd: 'update_post' })
  async update(
    @Payload() payload: { id: string; updatePostDto: UpdatePostDto },
  ): Promise<PostRto> {
    const { id, updatePostDto } = payload;
    const response = await this.postService.updatePost(id, updatePostDto);
    return new PostRto(response);
  }

  @MessagePattern({ cmd: 'delete_post' })
  async delete(@Payload() id: string): Promise<{ message: string }> {
    await this.postService.deletePost(id);
    return { message: 'Post deleted successfully' };
  }
}
