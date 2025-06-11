import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { MICROSERVICE_QUEUE } from 'libs/common/enum/microservice-queue.enum';
import { RABBITMQ_URL } from 'libs/common/constant/rabbitmq.constants';
import { SocialModule } from './social.module';

async function bootstrap() {
  const app = await NestFactory.create(SocialModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [RABBITMQ_URL],
      queue: MICROSERVICE_QUEUE.SOCIAL,
      queueOptions: {
        durable: false,
      },
    },
  });

  await app.startAllMicroservices();
  await app.listen(process.env.port ?? 3002);
  console.log('🚀 Social Microservice is running on http://localhost:3002');
}
bootstrap();
