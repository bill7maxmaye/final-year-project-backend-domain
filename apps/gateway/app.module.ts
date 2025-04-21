import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RabbitMQModule } from 'libs/rabbitmq';
import { AuthenticationController } from './controllers/authentication/auth.controller';
import { NetworkingModule } from 'libs/networking';
import { MICROSERVICE_QUEUE } from 'libs/common/enum/microservice-queue.enum';
import { ConfigModule } from '@nestjs/config';
import { rabbitmqConfig } from 'libs/common/config/rabbitmq.config';
import { SocialController } from './controllers/social/social.controller';
import { SocialService } from './controllers/social/social.service';
import { PostController } from './controllers/social/post/post.controller';
import { PostService } from './controllers/social/post/post.service';
import socketConfig from '@app/common//config/socket.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [rabbitmqConfig, socketConfig],
    }),
    RabbitMQModule.register(MICROSERVICE_QUEUE.AUTHENTICATION),
    RabbitMQModule.register(MICROSERVICE_QUEUE.SOCIAL),
    NetworkingModule,
  ],
  controllers: [
    AppController,
    AuthenticationController,
    SocialController,
    PostController,
  ],
  providers: [AppService, SocialService, PostService],
})
export class AppModule {}
