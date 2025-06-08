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
import { CommentController } from './comment/comment.controller';
import { CommentService } from './comment/comment.service';
import {
  PostCommentDocument,
  PostCommentSchema,
} from '@app/common//models/social/comment.model';
import { PostCommentRepository } from '@app/common//baseRepository/social/post-repositories/post-comment.repository';
import { PostReportRepository } from '@app/common//baseRepository/social/post-repositories/report-repository';
import {
  PostReportDocument,
  ReportSchema,
} from '@app/common//models/social/post-report.model';
import { NetworkingModule, NetworkingService } from '@pp/networking';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forFeature([
      { name: PostDocument.name, schema: PostSchema },
    ]),
    MongooseModule.forFeature([
      { name: PostCommentDocument.name, schema: PostCommentSchema },
    ]),

    MongooseModule.forFeature([
      { name: PostReportDocument.name, schema: ReportSchema },
    ]),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    NetworkingModule,
  ],
  controllers: [SocialController, PostController, CommentController],
  providers: [
    SocialService,
    PostService,
    PostRepository,
    PostCommentRepository,
    CommentService,
    PostReportRepository,
  ],
})
export class SocialModule {}
