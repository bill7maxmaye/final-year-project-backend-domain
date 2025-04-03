import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Public } from 'apps/authentication/src/decorators/public.decorator';
import { CreatePostDto } from 'apps/social/src/dto/create-post.dto';
import { UpdatePostDto } from 'apps/social/src/dto/update-post.dto';

import { PostRto } from 'apps/social/src/rtos/post.rto';
import { lastValueFrom } from 'rxjs';

@Controller('posts')
export class PostController {
  constructor(@Inject('RABBITMQ_SERVICE') private client: ClientProxy) {}

  @Public()
  @Post('/')
  async createPost(@Body() createPostDto: CreatePostDto): Promise<PostRto> {
    console.log('📤 Sending request to Post Microservice:', createPostDto);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const response = await lastValueFrom(
      this.client.send<PostRto>({ cmd: 'create_post' }, createPostDto),
    );
    return response;
  }

  @Public()
  @Get('/:id')
  async getPost(@Param('id') id: string): Promise<PostRto> {
    console.log('📤 Sending request to Post Microservice for post ID:', id);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const response = await lastValueFrom(
      this.client.send<PostRto>({ cmd: 'get_post' }, id),
    );
    return response;
  }

  @Public()
  @Put('/:id')
  async updatePost(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
  ): Promise<PostRto> {
    console.log(
      '📤 Sending update request to Post Microservice for post ID:',
      id,
      updatePostDto,
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const response = await lastValueFrom(
      this.client.send<PostRto>(
        { cmd: 'update_post' },
        { id, ...updatePostDto },
      ),
    );
    return response;
  }

  @Public()
  @Delete('/:id')
  async deletePost(@Param('id') id: string): Promise<{ message: string }> {
    console.log(
      '📤 Sending delete request to Post Microservice for post ID:',
      id,
    );
    const response = await lastValueFrom(
      this.client.send<{ message: string }>({ cmd: 'delete_post' }, id),
    );
    return response;
  }
}