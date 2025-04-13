import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RabbitMQModule } from 'libs/rabbitmq';
import { AuthenticationController } from './controllers/authentication/auth.controller';
import { NetworkingModule } from 'libs/networking';
import { MICROSERVICE_QUEUE } from 'libs/common/enum/microservice-queue.enum';
import { ConfigModule } from '@nestjs/config';
import { rabbitmqConfig } from 'libs/common/config/rabbitmq.config';
import socketConfig from '@app/common//config/socket.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [rabbitmqConfig, socketConfig],
    }),
    RabbitMQModule.register(MICROSERVICE_QUEUE.AUTHENTICATION),
    NetworkingModule,
  ],
  controllers: [AppController, AuthenticationController],
  providers: [AppService],
})
export class AppModule {}
