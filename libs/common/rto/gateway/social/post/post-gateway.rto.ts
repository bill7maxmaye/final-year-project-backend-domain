import { User } from '@app/common//entities/user/user-entity';
import { PostRto } from '../../../social/post/post.rto';

export class PostGatewayRto {
  constructor(
    public id: string,
    public content: string,
    public files: string[],
    public commentIds: string[],
    public likedBy: string[],
    public createdAt: Date,
    public updatedAt: Date,
    public profile: User,
  ) {}

  static fromEntity(post: PostRto, user: User): PostGatewayRto {
    return new PostGatewayRto(
      post.id,
      post.content ?? '',
      post.files ?? [],
      post.commentIds ?? [],
      post.likedBy ?? [],
      post.createdAt,
      post.updatedAt,
      user,
    );
  }
}
