/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
export class ProfileSummaryRto {
  constructor(
    public id: string,
    public online?: boolean,
    public picture?: string,
    public name?: string,
    public username?: string,
  ) {}

  static fromProfileRto(user: any): ProfileSummaryRto {
    return new ProfileSummaryRto(
      user.id,
      user.online,
      user.picture,
      user.fullName,
      user.username,
    );
  }
}
