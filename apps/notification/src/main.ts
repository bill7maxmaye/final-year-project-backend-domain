import { NestFactory } from '@nestjs/core';
import { NotificationModule } from './notification.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(NotificationModule);
  // Connect Microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://localhost:5672'], // this is the RabbitMQ URL we are connecting to
      queue: 'notification_queue', //the queue name should be the same as the one in the gateway microservice, that is the one we will be listening to
      queueOptions: {
        durable: false, // Set to true for production
      },
    },
  });

  await app.startAllMicroservices();
  await app.listen(process.env.port ?? 3003);
  console.log(
    '🚀 Notification Microservice is running on http://localhost:3003',
  );
}
bootstrap();
