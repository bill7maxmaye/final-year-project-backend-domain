import { Module } from '@nestjs/common';
import { NetworkingService } from './networking.service';
import { RabbitMQModule } from 'libs/rabbitmq';
import { MICROSERVICE_QUEUE } from 'libs/common/enum/microservice-queue.enum';
import {
  AUTHENTICATION_RMQ_CLIENT,
  CHAT_RMQ_CLIENT,
  NOTIFICATION_RMQ_CLIENT,
  REELS_RMQ_CLIENT,
  SOCIAL_RMQ_CLIENT,
} from '../common/constant/microservice-client-tokens.constant';

@Module({
  imports: [
    RabbitMQModule.register(
      AUTHENTICATION_RMQ_CLIENT,
      MICROSERVICE_QUEUE.AUTHENTICATION,
    ),
    RabbitMQModule.register(REELS_RMQ_CLIENT, MICROSERVICE_QUEUE.REELS),
    RabbitMQModule.register(
      NOTIFICATION_RMQ_CLIENT,
      MICROSERVICE_QUEUE.NOTIFICATION,
    ),
    RabbitMQModule.register(CHAT_RMQ_CLIENT, MICROSERVICE_QUEUE.CHAT),
    RabbitMQModule.register(SOCIAL_RMQ_CLIENT, MICROSERVICE_QUEUE.SOCIAL)
  ],
  providers: [NetworkingService],
  exports: [NetworkingService],
})
export class NetworkingModule {}
