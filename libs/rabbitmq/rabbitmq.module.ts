import { Module, DynamicModule } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({})
export class RabbitMQModule {
  static register(queue: string): DynamicModule {
    return {
      module: RabbitMQModule,
      imports: [
        ClientsModule.register([
          {
            name: 'RABBITMQ_SERVICE',
            transport: Transport.RMQ,
            options: {
              urls: ['amqp://guest:guest@localhost:5672'], // RabbitMQ connection URL
              queue,
              queueOptions: {
                durable: false,
              },
            },
          },
        ]),
      ],
      exports: [ClientsModule],
    };
  }
}
