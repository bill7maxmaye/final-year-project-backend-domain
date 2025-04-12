import { Module } from '@nestjs/common';
import { NetworkingService } from './networking.service';
import { RabbitMQModule } from 'libs/rabbitmq';
import { MICROSERVICE_QUEUE } from 'libs/common/enum/microservice-queue.enum';

@Module({
  imports: [RabbitMQModule.register(MICROSERVICE_QUEUE.AUTHENTICATION)],
  providers: [NetworkingService],
  exports: [NetworkingService],
})
export class NetworkingModule {}
