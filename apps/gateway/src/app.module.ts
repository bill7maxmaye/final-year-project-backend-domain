import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RabbitMQModule } from '@app/rabbitmq';


@Module({
  imports: [RabbitMQModule.register('notification_queue')],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
