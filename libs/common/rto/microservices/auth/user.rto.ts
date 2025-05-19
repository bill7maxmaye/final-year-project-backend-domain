import { UserDocument } from '@app/common//models/authentication/user.model';

export class UserRto {
  constructor(
    public id: string,
    public email: string,
    public password: string,
    public firstName: string,
    public picture: string,
    public lastName: string,
    public role: string,
  ) {}

  static fromEntity(entity: UserDocument): UserRto {
    console.log('entity here', entity);
    return new UserRto(
      entity._id.toString(),
      entity.email,
      entity.password,
      entity.firstName,
      entity.profilePic,
      entity.lastName,
      entity.role,
    );
  }
}
