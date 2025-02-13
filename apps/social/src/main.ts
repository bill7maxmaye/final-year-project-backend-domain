import { NestFactory } from '@nestjs/core';
import { SocialModule } from './social.module';

async function bootstrap() {
  const app = await NestFactory.create(SocialModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
