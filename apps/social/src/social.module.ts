import { Module } from '@nestjs/common';
import { SocialController } from './social.controller';
import { SocialService } from './social.service';
import { RabbitMQModule } from '@app/rabbitmq';

@Module({
  imports: [RabbitMQModule.register('social_queue')],
  controllers: [SocialController],
  providers: [SocialService],
})
export class SocialModule {}
