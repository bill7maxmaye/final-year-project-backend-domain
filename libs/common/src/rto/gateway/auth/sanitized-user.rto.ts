import { UserRto } from '../../microservices/auth/user.rto';
import { OmitType } from '@nestjs/mapped-types';
export class SanitizedUserRto extends OmitType(UserRto, [
  'password',
  'firstName',
  'lastName',
] as const) {
  constructor(user: UserRto) {
    super();
    this.id = user.id; 
    this.email = user.email;
  }
}
