// libs/rabbitmq/src/rabbitmq.module.ts
import { Module, DynamicModule, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { rabbitmqConfig } from 'libs/common/config/rabbitmq.config';
import { CONFIG_TOKEN } from '../common/config/constant/config-token.constant';
import { RabbitMQConfig } from '../common/config/interfaces/rabbitmq-config.interface';

@Module({})
export class RabbitMQModule {
  // Add a 'name' parameter
  static register(name: string | symbol, queue: string): DynamicModule {
    return {
      module: RabbitMQModule,
      imports: [
        // It's better to have ConfigModule.forRoot({ isGlobal: true, ... })
        // only in your root AppModule. If you already have it there,
        // you can remove the forRoot here and just use [ConfigModule].
        ConfigModule.forRoot({
          load: [rabbitmqConfig],
          isGlobal: true, // Make global if not already
        }),
        ClientsModule.registerAsync([
          {
            // Use the passed-in 'name' here
            name: name,
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => {
              const rmqConfig = configService.get<RabbitMQConfig>(
                CONFIG_TOKEN.RABBITMQ,
              );
              if (!rmqConfig || !rmqConfig.url) {
                throw new Error('RabbitMQ URL is not configured');
              }
              Logger.log(
                `Connecting to RabbitMQ for queue ${queue}: ${rmqConfig.url}`,
                'RabbitMQModule',
              );
              return {
                transport: Transport.RMQ,
                options: {
                  urls: [rmqConfig.url],
                  queue: queue, // Use the passed-in 'queue'
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
      // Export the ClientsModule, which now contains a client with the dynamic 'name'
      exports: [ClientsModule],
    };
  }
}
