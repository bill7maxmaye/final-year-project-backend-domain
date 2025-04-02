import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { UserRepository } from './userRepository/user-repository';

import { EmailService } from './services/email.service';
import { UserDocument, UserSchema } from './entities/user.entity';
import { DatabaseModule } from '@app/common';
import { RabbitMQModule } from '@app/rabbitmq';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule.forFeature([
      { name: UserDocument.name, schema: UserSchema },
    ]),
    RabbitMQModule.register('authentication_queue'),
    RabbitMQModule.register('notification_queue'),
    RabbitMQModule.register('profile_queue'),
    RabbitMQModule.register('social_queue'),
    RabbitMQModule.register('chat_queue'),
    RabbitMQModule.register('gateway_queue'),
  ],
  controllers: [AuthenticationController],
  providers: [AuthenticationService, UserRepository, EmailService],
  exports: [AuthenticationService],
})
export class AuthenticationModule {}
