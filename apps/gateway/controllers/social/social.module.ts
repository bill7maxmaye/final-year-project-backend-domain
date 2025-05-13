// social/social.module.ts
import { Module } from '@nestjs/common';
import { SocialController } from './social.controller';
import { SocialService } from './social.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PostController } from './post/post.controller';

import { PostService } from './post/post.service';
import { CommentService } from './comment/comment.service';
import { CommentController } from './comment/comment.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
    }),
  ],
  controllers: [SocialController, PostController, CommentController],
  providers: [SocialService, PostService, CommentService],
  exports: [],
})
export class SocialModule {}
