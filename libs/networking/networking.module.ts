import { Module } from '@nestjs/common';
import { NetworkingService } from './networking.service';
import { RabbitMQModule } from 'libs/rabbitmq';
import { MICROSERVICE_QUEUE } from 'libs/common/enum/microservice-queue.enum';
import {
  AUTHENTICATION_RMQ_CLIENT,
  REELS_RMQ_CLIENT,
} from '../common/constant/microservice-client-tokens.constant';

@Module({
  imports: [
    RabbitMQModule.register(
      AUTHENTICATION_RMQ_CLIENT,
      MICROSERVICE_QUEUE.AUTHENTICATION,
    ),
    RabbitMQModule.register(REELS_RMQ_CLIENT, MICROSERVICE_QUEUE.REELS),
  ],
  providers: [NetworkingService],
  exports: [NetworkingService],
})
export class NetworkingModule {}
