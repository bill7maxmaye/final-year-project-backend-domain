import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { RABBITMQ_URL } from '@app/common//constant/rabbitmq.constants';
import { MICROSERVICE_QUEUE } from '@app/common//enum/microservice-queue.enum';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    app.enableCors({
      origin: '*',
    });

    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.RMQ,
      options: {
        urls: [RABBITMQ_URL],
        queue: MICROSERVICE_QUEUE.GATEWAY,
        queueOptions: {
          durable: false,
        },
      },
    });

    await app.startAllMicroservices();
    await app.listen(3000);
    console.log('🚀 Gateway Microservice is running on http://localhost:3000');
  } catch (error) {
    console.error('Error starting the application', error);
  }
}

bootstrap();
