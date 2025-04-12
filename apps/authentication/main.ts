import { NestFactory } from '@nestjs/core';
import { AuthenticationModule } from './authentication.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { MICROSERVICE_QUEUE } from 'libs/common/enum/microservice-queue.enum';

async function bootstrap() {
  const app = await NestFactory.create(AuthenticationModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://localhost:5672'],
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
