import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { RabbitMQModule } from '@app/rabbitmq';

@Module({
  imports: [RabbitMQModule.register('chat_queue')],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
