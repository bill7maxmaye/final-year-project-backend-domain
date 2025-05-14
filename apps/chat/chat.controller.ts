import { ACTION } from '@app/common//enum/action.enum';
import { CONTROLLER } from '@app/common//enum/controller.enum';
import { MICROSERVICE } from '@app/common//enum/microservice.enum';
import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

@Controller('chat')
export class ChatController {
  constructor() {}

  @MessagePattern(
    `${MICROSERVICE.CHAT}.${CONTROLLER.MESSAGES}.${ACTION.CREATE}`,
  )
  async handleMessageCreation(body: any) {
    
  }
}
