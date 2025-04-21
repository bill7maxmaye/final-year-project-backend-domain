import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { rabbitmqConfig } from '../common/config/rabbitmq.config';
import { NetworkingService } from './networking.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [rabbitmqConfig],
    }),
  ],
  providers: [NetworkingService],
  exports: [NetworkingService],
})
export class NetworkingModule {}