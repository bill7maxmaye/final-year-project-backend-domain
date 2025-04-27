import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { MICROSERVICE_QUEUE } from 'libs/common/enum/microservice-queue.enum';
import { RABBITMQ_URL } from 'libs/common/constant/rabbitmq.constants';
import { ReelModule } from './reel.module';

async function bootstrap() {
  const app = await NestFactory.create(ReelModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [RABBITMQ_URL],
      queue: MICROSERVICE_QUEUE.REELS,
      queueOptions: {
        durable: false,
      },
    },
  });

  await app.startAllMicroservices();
  await app.listen(process.env.port ?? 3003);
  console.log('🚀 Reel Microservice is running on http://localhost:3003');
}
bootstrap();
