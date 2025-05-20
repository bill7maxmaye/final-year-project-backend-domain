import { UserDocument } from '@app/common//models/authentication/user.model';

export class UserRto {
  constructor(
    public id: string,
    public email: string,
    public firstName: string,
    public picture: string,
    public lastName: string,
    public role: string,
    public username?: string,
    public bio?: string,
    public profilePic?: string,
    public following?: string[],
    public followers?: string[],
    public createdAt?: Date,
    public updatedAt?: Date,
  ) {}

  static fromEntity(entity: UserDocument): UserRto {
    return new UserRto(
      entity._id.toString(),
      entity.email,
      entity.firstName,
      entity.profilePic!,
      entity.lastName,
      entity.role,
      entity.username,
      entity.bio,
      entity.profilePic,
      entity.following,
      entity.followers,
      entity.createdAt,
      entity.updatedAt,
    );
  }
}
