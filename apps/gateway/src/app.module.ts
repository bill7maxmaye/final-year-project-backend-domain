import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RabbitMQModule } from '@app/rabbitmq';
import { ConfigModule, DatabaseModule } from '@app/common';
import { UserDocument, UserSchema } from './entities/user.entity';
import { UserRepository } from './userRepository/user-repository';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    DatabaseModule.forFeature([
      { name: UserDocument.name, schema: UserSchema },
    ]),
    RabbitMQModule.register('notification_queue'),
    RabbitMQModule.register('profile_queue'),
    RabbitMQModule.register('social_queue'),
    RabbitMQModule.register('chat_queue'),
    RabbitMQModule.register('authentication_queue'),
  ],
  controllers: [AppController],
  providers: [AppService, UserRepository],
})
export class AppModule {}
