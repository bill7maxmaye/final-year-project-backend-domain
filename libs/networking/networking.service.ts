import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { MICROSERVICE_QUEUE } from '../common/enum/microservice-queue.enum';
import { RabbitMQConfig } from '../common/config/interfaces/rabbitmq-config.interface';
import { CONFIG_TOKEN } from '../common/config/constant/config-token.constant';

@Injectable()
export class NetworkingService implements OnModuleInit {
  private readonly logger = new Logger(NetworkingService.name);
  private clients: Map<MICROSERVICE_QUEUE, ClientProxy> = new Map();

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    // Initialize all clients at startup
    Object.values(MICROSERVICE_QUEUE).forEach((queue) => {
      this.createClient(queue);
    });
  }

  private createClient(queue: MICROSERVICE_QUEUE) {
    const rmqConfig = this.configService.get<RabbitMQConfig>(
      CONFIG_TOKEN.RABBITMQ,
    );
    if (!rmqConfig?.url) {
      throw new Error('RabbitMQ URL is not configured');
    }

    const client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [rmqConfig.url],
        queue,
        queueOptions: { durable: false },
      },
    });

    this.clients.set(queue, client);
    this.logger.log(`Initialized client for queue: ${queue}`);
  }

  async send<T>(
    queue: MICROSERVICE_QUEUE,
    pattern: string,
    data: any,
  ): Promise<T> {
    const client = this.clients.get(queue);
    if (!client) {
      throw new Error(`No client configured for queue: ${queue}`);
    }

    this.logger.debug(`Sending to ${queue} with pattern: ${pattern}`);
    return lastValueFrom(client.send<T>(pattern, data));
  }

  emit(queue: MICROSERVICE_QUEUE, pattern: string, data: any): void {
    const client = this.clients.get(queue);
    if (!client) {
      throw new Error(`No client configured for queue: ${queue}`);
    }

    this.logger.debug(`Emitting to ${queue} with pattern: ${pattern}`);
    client.emit(pattern, data);
  }
}
