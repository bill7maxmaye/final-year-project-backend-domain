import { Comment } from '@app/common//entities/reel/comment.entity';
import { ProfileSummaryRto } from './profile-summary.rto';
import { MentionedUser } from '@app/common//entities/reel/mentioned-user.entity';

export class CommentGatewayRto {
  constructor(
    public id: string,
    public content: string,
    public owner: ProfileSummaryRto,
    public targetId: string,
    public onModel: string,
    public parentCommentId: string | null,
    public mentionedUsers: MentionedUser[],
    public likes: number,
    public createdAt: string,
    public updatedAt: string,
    public isLikedByUser?: boolean,
  ) {}

  static fromPostAggregatedData(
    entity: Comment,
    profile: ProfileSummaryRto,
    likedByUser?: boolean,
  ): CommentGatewayRto {
    return new CommentGatewayRto(
      entity.id,
      entity.content,
      profile,
      entity.targetId,
      entity.onModel,
      entity.parentCommentId,
      entity.mentionedUsers,
      entity.likes,
      entity.createdAt.toISOString(),
      entity.updatedAt.toISOString(),
      likedByUser,
    );
  }
}
