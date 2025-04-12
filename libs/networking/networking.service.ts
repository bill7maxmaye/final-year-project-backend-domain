import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { TRANSPORT_PROXY } from 'libs/common/constant/transport-proxy-token.constant';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class NetworkingService {
  protected readonly logger = new Logger(NetworkingService.name);

  constructor(
    @Inject(TRANSPORT_PROXY.RABBITMQ) private readonly rabbitmq: ClientProxy,
  ) {}

  async send<T>(pattern: string, data: any): Promise<T> {
    return lastValueFrom(this.rabbitmq.send<T>(pattern, data));
  }

  emit(eventName: string, data: any): void {
    this.rabbitmq.emit(eventName, data);
  }
}
