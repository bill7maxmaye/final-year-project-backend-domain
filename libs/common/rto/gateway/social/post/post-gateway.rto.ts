import { PostRto } from '../../../social/post/post.rto';
import { UserRto } from '../../../microservices/auth/user.rto';

export class PostGatewayRto {
  constructor(
    public id: string,
    public content: string,
    public files: string[],
    public commentIds: string[],
    public likedBy: string[],
    public createdAt: Date,
    public updatedAt: Date,
    public owner: UserRto,
  ) {}

  static fromEntity(post: PostRto, user: UserRto): PostGatewayRto {
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
