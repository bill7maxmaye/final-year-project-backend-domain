import { Module, DynamicModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { rabbitmqConfig } from 'libs/common/config/rabbitmq.config';
import { TRANSPORT_PROXY } from 'libs/common/constant/transport-proxy-token.constant';

@Module({})
export class RabbitMQModule {
  static register(queue: string): DynamicModule {
    return {
      module: RabbitMQModule,
      imports: [
        ConfigModule.forRoot({
          load: [rabbitmqConfig],
        }),
        ClientsModule.registerAsync([
          {
            name: TRANSPORT_PROXY.RABBITMQ,
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => {
              const url = configService.get<string>('rabbitmq.url');
              if (!url) {
                throw new Error('RabbitMQ URL is not configured');
              }
              return {
                transport: Transport.RMQ,
                options: {
                  urls: [url],
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
