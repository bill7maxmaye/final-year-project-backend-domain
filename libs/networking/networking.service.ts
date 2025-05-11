// libs/networking/src/networking.service.ts
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
// Import unique tokens
import {
  AUTHENTICATION_RMQ_CLIENT,
  REELS_RMQ_CLIENT,
} from 'libs/common/constant/microservice-client-tokens.constant';
import { MICROSERVICE } from 'libs/common/enum/microservice.enum'; // Import MICROSERVICE enum
import { lastValueFrom } from 'rxjs';

@Injectable()
export class NetworkingService {
  protected readonly logger = new Logger(NetworkingService.name);
  private readonly clients: Map<MICROSERVICE, ClientProxy>;

  constructor(
    // Inject clients using their unique tokens
    @Inject(AUTHENTICATION_RMQ_CLIENT) private readonly authClient: ClientProxy,
    @Inject(REELS_RMQ_CLIENT) private readonly reelsClient: ClientProxy,
    // Add other clients here
  ) {
    // Map microservice enums to their respective clients
    this.clients = new Map<MICROSERVICE, ClientProxy>([
      [MICROSERVICE.AUTHENTICATION, this.authClient],
      [MICROSERVICE.REELS, this.reelsClient],
      // Add other mappings
    ]);
  }

  // Helper to get the correct client based on the microservice enum
  private getClient(microservice: MICROSERVICE): ClientProxy {
    const client = this.clients.get(microservice);
    if (!client) {
      throw new Error(`Client not found for microservice: ${microservice}`);
    }
    return client;
  }

  // You might need to modify send/emit to include the target microservice
  // Or parse the pattern to determine the target
  async send<T>(pattern: string, data: any): Promise<T> {
    this.logger.debug(`Sending pattern: ${pattern}`);

    // Assuming your pattern always starts with the MICROSERVICE enum value
    const microserviceName = pattern.split('.')[0] as MICROSERVICE;
    const client = this.getClient(microserviceName); // Get the correct client

    return lastValueFrom(client.send<T>(pattern, data)); // Use the correct client
  }

  emit(eventName: string, data: any): void {
    this.logger.debug(`Emitting event: ${eventName}`);

    // Assuming your eventName always starts with the MICROSERVICE enum value
    const microserviceName = eventName.split('.')[0] as MICROSERVICE;
    const client = this.getClient(microserviceName); // Get the correct client

    client.emit(eventName, data); // Use the correct client
  }
}
