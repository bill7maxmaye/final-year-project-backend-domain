import { NestFactory } from '@nestjs/core';
import { ProfileModule } from './profile.module';

async function bootstrap() {
  const app = await NestFactory.create(ProfileModule);
  await app.listen(process.env.port ?? 3005);
  console.log('🚀 Profile Microservice is running on http://localhost:3005');
}
bootstrap();
