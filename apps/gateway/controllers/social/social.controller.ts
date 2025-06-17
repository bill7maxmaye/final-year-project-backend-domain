import { ActiveUser } from '@app/common//decorators/active-user-decorator';
import { User } from '@app/common//entities/user/user-entity';
import { JwtAuthGuard } from '@app/common//guards/jwt-auth.guard';
import { Controller, Get, Logger, UseGuards } from '@nestjs/common';
import { SocialService } from './social.service';

@Controller('socials')
@UseGuards(JwtAuthGuard)
export class SocialController {
  private readonly logger = new Logger(SocialController.name);

  constructor(private readonly socialService: SocialService) {}

  @Get('')
  @UseGuards(JwtAuthGuard)
  getHello(@ActiveUser() user: User): string {
    console.log('User social:', user);
    return 'this.socialService.getHello()';
  }
}
