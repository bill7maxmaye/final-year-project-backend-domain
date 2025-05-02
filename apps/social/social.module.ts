import { Module } from '@nestjs/common';
import { SocialController } from './social.controller';
import { SocialService } from './social.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PostController } from './post/post.controller';
import { PostService } from './post/post.service';
import {
  PostDocument,
  PostSchema,
} from '@app/common//models/social/post.model';
import { MongooseModule } from '@nestjs/mongoose';
import { PostRepository } from '@app/common//baseRepository/social/post-repositories/post.repository';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forFeature([
      { name: PostDocument.name, schema: PostSchema },
    ]),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [SocialController, PostController],
  providers: [SocialService, PostService, PostRepository],
})
export class SocialModule {}
