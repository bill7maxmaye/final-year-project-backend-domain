import { UserRto } from '../../microservices/auth/user.rto';

export class ProfileSummaryRto {
  constructor(
    public id: string,
    public online?: boolean,
    public picture?: string,
    public name?: string,
    public walletId?: string,
  ) {}

  static fromProfileRto(
    user: UserRto,
    online: boolean = false,
  ): ProfileSummaryRto {
    return new ProfileSummaryRto(
      user.id,
      online,
      user.picture,
      user.firstName + user.lastName,
      user.walletId,
    );
  }
}
