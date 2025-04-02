import { Module } from '@nestjs/common';
import { SocialController } from './social.controller';
import { SocialService } from './social.service';
import { RabbitMQModule } from '@app/rabbitmq';
import { ConfigModule, DatabaseModule } from '@app/common';
import { PostDocument, PostSchema } from './models/post.model';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    DatabaseModule.forFeature([
      { name: PostDocument.name, schema: PostSchema },
    ]),
    RabbitMQModule.register('social_queue'),
  ],
  controllers: [SocialController],
  providers: [SocialService],
})
export class SocialModule {}
