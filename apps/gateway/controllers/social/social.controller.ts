import { Controller, Get } from '@nestjs/common';

@Controller('social')
export class SocialController {
  constructor() {}

  @Get()
  getHello(): string {
    return 'this.socialService.getHello()';
  }
}
