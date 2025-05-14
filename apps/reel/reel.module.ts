import { Module } from '@nestjs/common';
import { ReelController } from './reel.index.controller';
import { ReelService } from './reel/reel.service';
import { ReelDocument, ReelSchema } from '@app/common//models/reel/reel.model';
import {
  CommentDocument,
  CommentSchema,
} from '@app/common//models/reel/comment.model';
import {
  GiftTransactionDocument,
  GiftTransactionSchema,
} from '@app/common//models/reel/gift-transaction.model';
import { LikeDocument, LikeSchema } from '@app/common//models/reel/like.model';
import { DatabaseModule } from '@app/common//database/database.module';
import { CommentController } from 'apps/gateway/controllers/reel/comment/comment.controller';
import { CommentService } from './comment/comment.service';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from '@app/common//config/database.config';
import { ReelsRepository } from './reel/reel.repository';
import { CommentsRepository } from './comment/comment.repository';
import { LikeRepository } from './like/like.repository';
import { LikeService } from './like/like.service';
import { NetworkingModule } from '@pp/networking';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [databaseConfig],
      isGlobal: true,
    }),
    DatabaseModule.forFeature([
      { name: ReelDocument.name, schema: ReelSchema },
      { name: CommentDocument.name, schema: CommentSchema },
      { name: GiftTransactionDocument.name, schema: GiftTransactionSchema },
      { name: LikeDocument.name, schema: LikeSchema },
    ]),
    NetworkingModule,
  ],
  controllers: [ReelController, CommentController],
  providers: [
    ReelService,
    CommentService,
    LikeService,
    LikeRepository,
    ReelsRepository,
    CommentsRepository,
  ],
})
export class ReelModule {}
