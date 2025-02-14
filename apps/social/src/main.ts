import { NestFactory } from '@nestjs/core';
import { SocialModule } from './social.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(SocialModule);
  // Connect Microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://localhost:5672'],
      queue: 'social_queue',
      queueOptions: {
        durable: false, // Set to true for production
      },
    },
  });

  await app.startAllMicroservices();
  await app.listen(process.env.port ?? 3005);
  console.log('🚀 Social Microservice is running on http://localhost:3000');
}
bootstrap();
