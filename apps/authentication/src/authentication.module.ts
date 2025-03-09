import { ConfigModule, DatabaseModule } from '@app/common';
import { RabbitMQModule } from '@app/rabbitmq';
import { Module } from '@nestjs/common';
import {
  UserDocument,
  UserSchema,
} from 'apps/authentication/src/entities/user.entity';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { UserRepository } from './userRepository/user-repository';


@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
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
  providers: [AuthenticationService, UserRepository],
})
export class AuthenticationModule {}
