import { Controller } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { EventPattern } from '@nestjs/microservices';

@Controller()
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @EventPattern('notification_created')
  getHello(data: any): string {
    return this.profileService.getHello(data);
  }
}
