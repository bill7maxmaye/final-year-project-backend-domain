import { Module } from '@nestjs/common';
// import {
//   UserDocument,
//   UserSchema,
// } from 'apps/authentication/models/user.model';
import { ConfigModule } from '@nestjs/config';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';

// import { DatabaseModule } from 'libs/common';
import { RabbitMQModule } from 'libs/rabbitmq';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // DatabaseModule.forFeature([
    //   { name: UserDocument.name, schema: UserSchema },
    // ]),
    RabbitMQModule.register('authentication_queue'),
    RabbitMQModule.register('notification_queue'),
    RabbitMQModule.register('profile_queue'),
    RabbitMQModule.register('social_queue'),
    RabbitMQModule.register('chat_queue'),
    RabbitMQModule.register('gateway_queue'),
  ],
  controllers: [AuthenticationController],
  providers: [AuthenticationService],
  exports: [AuthenticationService],
})
export class AuthenticationModule {}
