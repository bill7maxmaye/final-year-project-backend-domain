import { Module } from '@nestjs/common';

import { SocketGateway } from './socket.gateway';
import { SocketService } from './socket.service';
import { NetworkingModule } from '@pp/networking';

@Module({
  imports: [NetworkingModule],
  providers: [SocketGateway, SocketService],
  exports: [SocketService],
})
export class SocketModule {}
