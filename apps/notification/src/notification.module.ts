import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { RabbitMQModule } from '@app/rabbitmq';

@Module({
  imports: [RabbitMQModule.register('notification_queue')],
  controllers: [NotificationController],
  providers: [NotificationService],
})
export class NotificationModule {}
