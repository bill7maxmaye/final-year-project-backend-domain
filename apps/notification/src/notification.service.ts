import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class NotificationService {
  getHello(data: any): any {
    console.log('Notification Service received:', data);
    return 'Hello, RabbitMQ! is working';
  }

  getNotification(): any {
    console.log('Notification Service received:  GET GET GET REQUEST');
    const data ='Hello, RabbitMQ! is working WITH GET GET GET';
    return data;
  }
}
