import { Module, DynamicModule, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { rabbitmqConfig } from 'libs/common/config/rabbitmq.config';
import { TRANSPORT_PROXY } from 'libs/common/constant/transport-proxy-token.constant';
import { CONFIG_TOKEN } from '../common/config/constant/config-token.constant';
import { RabbitMQConfig } from '../common/config/interfaces/rabbitmq-config.interface';
import { MICROSERVICE_QUEUE } from '../common/enum/microservice-queue.enum';

@Module({})
export class RabbitMQModule {
  static register(queue: MICROSERVICE_QUEUE): DynamicModule {
    return {
      module: RabbitMQModule,
      imports: [
        ConfigModule.forRoot({
          load: [rabbitmqConfig],
          isGlobal: true,
        }),
        ClientsModule.registerAsync([
          {
            name: `${TRANSPORT_PROXY.RABBITMQ}_${queue}`, // Unique name per queue
            useFactory: (configService: ConfigService) => {
              const rmqConfig = configService.get<RabbitMQConfig>(
                CONFIG_TOKEN.RABBITMQ,
              );
              if (!rmqConfig?.url) throw new Error('RabbitMQ URL missing');

              Logger.log(`Connecting to RabbitMQ queue: ${queue}`);
              return {
                transport: Transport.RMQ,
                options: {
                  urls: [rmqConfig.url],
                  queue,
                  queueOptions: { durable: false },
                },
              };
            },
            inject: [ConfigService],
          },
        ]),
      ],
      exports: [ClientsModule],
    };
  }
}
