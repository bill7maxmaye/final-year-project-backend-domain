import { UserRto } from '../../../microservices/auth/user.rto';
import { CommentRto } from '../../../social/comment/comment.rto';

export class CommentGatewayRto {
  constructor(
    public id: string,
    public content: string,
    public postId: string,
    public replies: string[],
    public likedBy: string[],
    public files: string[],
    public mentions: string[],
    public createdAt: Date,
    public updatedAt: Date,
    public parentId?: string,
    public owner?: UserRto,
  ) {}

  static fromComment(comment: CommentRto, user: UserRto): CommentGatewayRto {
    return new CommentGatewayRto(
      comment.id,
      comment.content,
      comment.postId,
      comment.replies ?? [],
      comment.likedBy ?? [],
      comment.files ?? [],
      comment.mentions ?? [],
      comment.createdAt,
      comment.updatedAt,
      comment.parentId,
      user,
    );
  }
}
