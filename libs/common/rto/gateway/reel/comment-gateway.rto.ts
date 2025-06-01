import { ProfileSummaryRto } from './profile-summary.rto';
import { CommentRto } from '../../microservices/reel/comment.rto';

export class CommentGatewayRto {
  constructor(
    public id: string,
    public content: string,
    public owner: ProfileSummaryRto,
    public reelId: string,
    public parentCommentId: string | null,
    public mentionedUsers: string[],
    public likes: number,
    public createdAt: string,
    public updatedAt: string,
    public reelCommentCount: number,
    public isLiked?: boolean,
  ) {}

  static fromPostAggregatedData(
    entity: CommentRto,
    profile: ProfileSummaryRto,
  ): CommentGatewayRto {
    if (!entity.reelId) {
      throw new Error(
        'Comment entity is missing reelId field during RTO mapping',
      );
    }

    return new CommentGatewayRto(
      entity.id,
      entity.content,
      profile,
      entity.reelId,
      entity.parentCommentId,
      entity.mentionedUsers,
      entity.likes,
      entity.createdAt.toString(),
      entity.updatedAt.toString(),
      entity.reelCommentCount,
      entity.isLiked,
    );
  }

  static fromPostAggregatedDataArray(
    entities: CommentRto[],
    profiles: { [userId: string]: ProfileSummaryRto },
  ): CommentGatewayRto[] {
    return entities.map((entity) => {
      const profile = profiles[entity.ownerId];
      return CommentGatewayRto.fromPostAggregatedData(entity, profile);
    });
  }
}
