import { Controller } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller()
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @EventPattern('from_notification')
  getHello(@Payload() data: any): any {
    //return this.profileService.getHello(data);
    console.log(data);
  }
}
