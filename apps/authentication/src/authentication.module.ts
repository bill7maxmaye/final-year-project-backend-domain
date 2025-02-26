import { Module } from '@nestjs/common';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { RabbitMQModule } from '@app/rabbitmq';
import { DatabaseModule } from '@app/common';

@Module({
  imports: [DatabaseModule, RabbitMQModule.register('authentication_queue')],
  controllers: [AuthenticationController],
  providers: [AuthenticationService],
})
export class AuthenticationModule {}
