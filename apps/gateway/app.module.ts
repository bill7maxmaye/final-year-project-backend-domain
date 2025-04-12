import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RabbitMQModule } from 'libs/rabbitmq';
import { ConfigModule } from 'libs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthenticationController } from './controllers/authentication/auth.controller';

@Module({
  imports: [
    ConfigModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '1h' },
    }),
    RabbitMQModule.register('authentication_queue'),
  ],
  controllers: [AppController, AuthenticationController],
  providers: [AppService],
})
export class AppModule {}
