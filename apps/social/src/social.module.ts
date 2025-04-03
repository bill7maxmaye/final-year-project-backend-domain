import { ConfigModule, DatabaseModule } from '@app/common';
import { RabbitMQModule } from '@app/rabbitmq';
import { Module } from '@nestjs/common';
import { PostDocument, PostSchema } from './models/post.model';
import { SocialController } from './social.controller';
import { SocialService } from './social.service';
import { PostRepository } from './posts/posts.repository';
import { PostService } from './posts/posts.service';
import { PostController } from './posts/posts.controller';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    DatabaseModule.forFeature([
      { name: PostDocument.name, schema: PostSchema },
    ]),
    RabbitMQModule.register('social_queue'),
    RabbitMQModule.register('authentication_queue'),
    RabbitMQModule.register('notification_queue'),
    RabbitMQModule.register('profile_queue'),
    RabbitMQModule.register('social_queue'),
    RabbitMQModule.register('chat_queue'),
    RabbitMQModule.register('gateway_queue'),
  ],
  controllers: [SocialController, PostController],
  providers: [SocialService, PostRepository, PostService],
  exports: [PostService],
})
export class SocialModule {}
