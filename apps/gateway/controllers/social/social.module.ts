// social/social.module.ts
import { Module } from '@nestjs/common';
import { SocialController } from './social.controller';
import { SocialService } from './social.service';
import { ConfigModule } from '@nestjs/config';
import { PostController } from './post/post.controller';

import { PostService } from './post/post.service';
import { CommentService } from './comment/comment.service';
import { CommentController } from './comment/comment.controller';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [SocialController, PostController, CommentController],
  providers: [SocialService, PostService, CommentService],
  exports: [],
})
export class SocialModule {}
