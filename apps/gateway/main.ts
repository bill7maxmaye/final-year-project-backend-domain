import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    app.enableCors({
      origin: '*',
    });
    await app.startAllMicroservices();
    await app.listen(3000);
    console.log('🚀 Gateway Microservice is running on http://localhost:3000');
  } catch (error) {
    console.error('Error starting the application', error);
  }
}

bootstrap();
