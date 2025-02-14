import { NestFactory } from '@nestjs/core';
import { AuthenticationModule } from './authentication.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AuthenticationModule);
  // Connect Microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://localhost:5672'],
      queue: 'orders_queue',
      queueOptions: {
        durable: false, // Set to true for production
      },
    },
  });

  await app.startAllMicroservices();
  await app.listen(process.env.port ?? 3001);
  console.log('🚀 Authentication Microservice is running on http://localhost:3000');
}
bootstrap();
