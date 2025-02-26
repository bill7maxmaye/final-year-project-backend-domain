import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { RabbitMQModule } from '@app/rabbitmq';

@Module({
  imports: [
    RabbitMQModule.register('profile_queue'),
    RabbitMQModule.register('notification_queue'),
  ],
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}
