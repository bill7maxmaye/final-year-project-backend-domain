import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthenticationController } from './controllers/authentication/auth.controller';
import { NetworkingModule } from 'libs/networking';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { rabbitmqConfig } from 'libs/common/config/rabbitmq.config';
import { SocialService } from './controllers/social/social.service';
import { PostController } from './controllers/social/post/post.controller';
import { PostService } from './controllers/social/post/post.service';
import socketConfig from '@app/common//config/socket.config';
import { s3Provider } from './storage/storage.provider';
import { StorageModule } from './storage/storage.module';
import s3StorageConfig from '@app/common//config/s3-storage.config';
import { ReelController } from './controllers/reel/reel.controller';
import { ReelService } from './controllers/reel/reel.service';
import databaseConfig from '@app/common//config/database.config';
import { SocketModule } from './websocket/socket.module';
// import { NotificationsModule } from 'apps/notificationnn/notification.module';
import { NotificationsController } from './controllers/notification/notification.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '@app/common//strategies/jwt.strategy';
import { SocketGateway } from './websocket/socket.gateway';
import { ChatModule } from 'apps/chat/chat.module';
import { ChatController } from './controllers/chat/chat/chat.controller';
import { ChatService } from './controllers/chat/chat/chat.service';
import { CommentController as PostCommentController } from './controllers/social/comment/comment.controller';
import { CommentService } from './controllers/social/comment/comment.service';
import { CommentController as ReelCommentController } from './controllers/reel/comment/comment.controller';
import { UserRepositoryModule } from '@app/common//baseRepository/userRepository/user.repository.module';
import { HttpModule } from '@nestjs/axios';
import { PostRepository } from '@app/common//baseRepository/social/post-repositories/post.repository';
import { ReelsRepository } from 'apps/reel/reel/reel.repository';
import { PostCommentRepository } from '@app/common//baseRepository/social/post-repositories/post-comment.repository';
import { PostReportRepository } from '@app/common//baseRepository/social/post-repositories/report-repository';
import { ReportsRepository } from 'apps/reel/report/report.repository';
// import { AuthenticationModule } from 'apps/authentication/authentication.module';

@Module({
  imports: [
    // AuthenticationModule,
    UserRepositoryModule,
    ConfigModule.forRoot({
      load: [rabbitmqConfig, socketConfig, s3StorageConfig, databaseConfig],
      isGlobal: true,
    }),
    NetworkingModule,
    HttpModule,
    StorageModule,
    ChatModule,
    SocketModule,
    // NotificationsModule,
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
  controllers: [
    AppController,
    AuthenticationController,
    // SocialController,
    PostController,
    ReelController,
    NotificationsController,
    ChatController,
    PostCommentController,
    ReelCommentController,
  ],
  providers: [
    AppService,
    SocialService,
    PostService,
    ChatService,
    ReelService,
    s3Provider,
    CommentService,
    JwtStrategy,
    SocketGateway,
    PostRepository,
    ReelsRepository,
    PostCommentRepository,
    PostReportRepository,
    ReportsRepository,
  ],
})
export class AppModule {}
