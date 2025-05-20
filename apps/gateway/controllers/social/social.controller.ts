import { ActiveUser } from '@app/common//decorators/active-user-decorator';
import { User } from '@app/common//entities/user/user-entity';
import { JwtAuthGuard } from '@app/common//guards/jwt-auth.guard';
import { Controller, Get, UseGuards } from '@nestjs/common';

@Controller('social')
export class SocialController {
  constructor() {}

  @Get('')
  @UseGuards(JwtAuthGuard)
  getHello(@ActiveUser() user: User): string {
    console.log('User social:', user);
    return 'this.socialService.getHello()';
  }
}
