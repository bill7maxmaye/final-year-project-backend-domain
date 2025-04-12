import { NestFactory } from '@nestjs/core';
import { AuthenticationModule } from './authentication.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { MICROSERVICE_QUEUE } from 'libs/common/enum/microservice-queue.enum';
import { RABBITMQ_URL } from 'libs/common/constant/rabbitmq.constants';

async function bootstrap() {
  const app = await NestFactory.create(AuthenticationModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [RABBITMQ_URL],
      queue: MICROSERVICE_QUEUE.AUTHENTICATION,
      queueOptions: {
        durable: false,
      },
    },
  });

  await app.startAllMicroservices();
  await app.listen(process.env.port ?? 3001);
  console.log(
    '🚀 Authentication Microservice is running on http://localhost:3001',
  );
}
bootstrap();
