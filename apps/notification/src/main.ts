import { NestFactory } from '@nestjs/core';
import { NotificationModule } from './notification.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(NotificationModule);
 
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://localhost:5672'], 
      queue: 'notification_queue', 
      queueOptions: {
        durable: false, 
      },
    },
  });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://localhost:5672'], 
      queue: 'profile_queue', 
      queueOptions: {
        durable: false, 
      },
    },
  });

  await app.startAllMicroservices();
  await app.listen(process.env.port ?? 3003);
  console.log(
    '🚀 Notification Microservice is running on http://localhost:3003 🚀',
  );
}
bootstrap();
