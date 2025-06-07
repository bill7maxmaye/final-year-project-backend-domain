import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { MICROSERVICE_QUEUE } from 'libs/common/enum/microservice-queue.enum';
import { RABBITMQ_URL } from 'libs/common/constant/rabbitmq.constants';
import { NotificationModule } from './notification.module';
async function bootstrap() {
  const app = await NestFactory.create(NotificationModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [RABBITMQ_URL],
      queue: MICROSERVICE_QUEUE.NOTIFICATION,
      queueOptions: {
        durable: false,
      },
    },
  });

  await app.startAllMicroservices();
  await app.listen(process.env.port ?? 3009);
  console.log(
    '🚀 Notification Microservice is running on http://localhost:3003',
  );
}
bootstrap();
