import { Injectable } from '@nestjs/common';

@Injectable()
export class ProfileService {
  getHello(data: any): string {
    console.log('Payment Service received order:', data);
    return 'Hello World!';
  }
}
