import { Injectable, Logger } from '@nestjs/common';
import { NetworkingService } from '@pp/networking';

@Injectable()
export class SocialService {
  private readonly logger = new Logger(SocialService.name);

  constructor(private readonly networking: NetworkingService) {}
}
