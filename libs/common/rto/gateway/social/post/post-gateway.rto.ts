import { PostRto } from '../../../social/post/post.rto';
import { UserRto } from '../../../microservices/auth/user.rto';

export class PostGatewayRto {
  constructor(
    public id: string,
    public content: string,
    public files: string[],
    public commentIds: string[],
    public likedBy: string[],
    public score: number,
    public label: string,
    public createdAt: Date,
    public updatedAt: Date,
    public owner: UserRto,
    public reportCount: number = 0,
  ) {}

  static fromEntity(post: PostRto, user: UserRto): PostGatewayRto {
    return new PostGatewayRto(
      post.id,
      post.content ?? '',
      post.files ?? [],
      post.commentIds ?? [],
      post.likedBy ?? [],
      post.score,
      post.label,
      post.createdAt,
      post.updatedAt,
      user,
      post.reportCount ?? 0,
    );
  }
}
