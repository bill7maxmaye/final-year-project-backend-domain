import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class NotificationService {
  
  getHello(data: any): any {
    console.log('Notification Service received:', data);
    return 'Hello, RabbitMQ! is working';
  }
}
