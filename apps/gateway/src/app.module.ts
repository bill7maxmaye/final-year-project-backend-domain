import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RabbitMQModule } from '@app/rabbitmq';
import { ConfigModule, DatabaseModule } from '@app/common';



@Module({
  imports: [
    ConfigModule,
    RabbitMQModule.register('notification_queue'),
    RabbitMQModule.register('profile_queue'),
    RabbitMQModule.register('social_queue'),
    RabbitMQModule.register('chat_queue'),
    RabbitMQModule.register('authentication_queue'),
    DatabaseModule,

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
