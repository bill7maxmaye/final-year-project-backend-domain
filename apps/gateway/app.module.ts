import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthenticationController } from './controllers/authentication/auth.controller';
import { NetworkingModule } from 'libs/networking';
import { ConfigModule } from '@nestjs/config';
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

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [rabbitmqConfig, socketConfig, s3StorageConfig, databaseConfig],
      isGlobal: true,
    }),
    NetworkingModule,
    StorageModule,
    SocketModule,
    // NotificationsModule,
  ],
  controllers: [
    AppController,
    AuthenticationController,
    // SocialController,
    PostController,
    ReelController,
    NotificationsController,
  ],
  providers: [AppService, SocialService, PostService, ReelService, s3Provider],
})
export class AppModule {}
