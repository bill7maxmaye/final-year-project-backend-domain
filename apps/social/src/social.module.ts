import { ConfigModule, DatabaseModule } from '@app/common';
import { RabbitMQModule } from '@app/rabbitmq';
import { Module } from '@nestjs/common';
import { PostDocument, PostSchema } from './models/post.model';
import { SocialController } from './social.controller';
import { SocialService } from './social.service';

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
