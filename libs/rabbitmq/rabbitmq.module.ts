import { Module, DynamicModule, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { rabbitmqConfig } from 'libs/common/config/rabbitmq.config';
import { TRANSPORT_PROXY } from 'libs/common/constant/transport-proxy-token.constant';
import { CONFIG_TOKEN } from '../common/config/constant/config-token.constant';
import { RabbitMQConfig } from '../common/config/interfaces/rabbitmq-config.interface';

@Module({})
export class RabbitMQModule {
  static register(queue: string): DynamicModule {
    return {
      module: RabbitMQModule,
      imports: [
        ConfigModule.forRoot({
          load: [rabbitmqConfig],
          isGlobal: true,
        }),
        ClientsModule.registerAsync([
          {
            name: TRANSPORT_PROXY.RABBITMQ,
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => {
              const rmqConfig = configService.get<RabbitMQConfig>(
                CONFIG_TOKEN.RABBITMQ,
              );
              if (!rmqConfig || !rmqConfig.url) {
                throw new Error('RabbitMQ URL is not configured');
              }
              Logger.log(
                `Connecting to RabbitMQ: ${rmqConfig.url}`,
                'RabbitMQModule',
              );
              return {
                transport: Transport.RMQ,
                options: {
                  urls: [rmqConfig.url],
                  queue,
                  queueOptions: {
                    durable: false,
                  },
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
