import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RabbitMQModule } from '@app/rabbitmq';
import { ConfigModule } from '@app/common';
import { SocialModule } from 'apps/social/src/social.module';

@Module({
  imports: [
    ConfigModule,
    RabbitMQModule.register('authentication_queue'),
    RabbitMQModule.register('notification_queue'),
    RabbitMQModule.register('profile_queue'),
    RabbitMQModule.register('social_queue'),
    RabbitMQModule.register('chat_queue'),
    SocialModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
