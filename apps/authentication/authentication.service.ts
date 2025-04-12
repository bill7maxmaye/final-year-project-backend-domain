import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthenticationService {
  constructor(private readonly configService: ConfigService) {}
}
