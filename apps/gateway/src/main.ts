import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);

    // Connect Microservice
    // app.connectMicroservice<MicroserviceOptions>({
    //   transport: Transport.RMQ,
    //   options: {
    //     urls: ['amqp://localhost:5672'],
    //     queue: 'notification_queue',
    //     queueOptions: {
    //       durable: false, // Set to true for production
    //     },
    //   },
    // });

    // Connect to the profile microservice
    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://localhost:5672'],
        queue: 'profile_queue',
        queueOptions: {
          durable: false, // Set to true for production
        },
      },
    });

    // Connect to the authentication microservice
    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://localhost:5672'],
        queue: 'authentication_queue',
        queueOptions: {
          durable: false, // Set to true for production
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
