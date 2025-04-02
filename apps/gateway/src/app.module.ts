import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RabbitMQModule } from '@app/rabbitmq';
import { ConfigModule } from '@app/common';
import { SocialModule } from 'apps/social/src/social.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from '../../authentication/src/guards/jwt-auth.guard';
import { AuthController } from './authentication/auth.controller';

@Module({
  imports: [
    ConfigModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '1h' },
    }),
    RabbitMQModule.register('authentication_queue'),
    RabbitMQModule.register('notification_queue'),
    RabbitMQModule.register('profile_queue'),
    RabbitMQModule.register('social_queue'),
    RabbitMQModule.register('chat_queue'),
    SocialModule,
  ],
  controllers: [AppController, AuthController],
  providers: [AppService, JwtAuthGuard],
})
export class AppModule {}
