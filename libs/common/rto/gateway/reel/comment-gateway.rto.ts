import { Comment } from '@app/common//entities/reel/comment.entity';
import { ProfileSummaryRto } from './profile-summary.rto';
import { MentionedUser } from '@app/common//entities/reel/mentioned-user.entity';

export class CommentGatewayRto {
  constructor(
    public id: string,
    public content: string,
    public owner: ProfileSummaryRto, // Represents the owner's profile info
    public reelId: string,
    public parentCommentId: string | null,
    public mentionedUsers: MentionedUser[],
    public likes: number,
    public createdAt: string,
    public updatedAt: string,
    public isLikedByUser?: boolean,
  ) {}

  /**
   * Maps a Comment entity (and related aggregated data) to a CommentGatewayRto for API response.
   * @param entity The Comment entity instance (from database mapping).
   * @param profile The ProfileSummaryRto of the comment owner.
   * @param likedByUser Optional boolean indicating if the request user liked this comment.
   * @returns A CommentGatewayRto instance ready for API response.
   */
  static fromPostAggregatedData(
    entity: Comment,
    profile: ProfileSummaryRto,
    likedByUser?: boolean,
  ): CommentGatewayRto {
    // Ensure the entity has reelId based on the updated entity structure
    if (!entity.reelId) {
      // This should ideally not happen if the entity is correctly mapped from the DB
      throw new Error(
        'Comment entity is missing reelId field during RTO mapping',
      );
    }

    return new CommentGatewayRto(
      entity.id, // Map from entity ID
      entity.content, // Map from entity content
      profile, // Use the provided ProfileSummaryRto
      entity.reelId, // Map from entity.reelId (the new field)
      entity.parentCommentId, // Map from entity.parentCommentId
      entity.mentionedUsers, // Map directly from entity's mentionedUsers
      entity.likes, // Map from entity likes count
      entity.createdAt.toISOString(), // Convert Date to ISO string
      entity.updatedAt.toISOString(), // Convert Date to ISO string
      likedByUser, // Include the optional like status
    );
  }

  // You might also want a method for mapping an array if you return lists of comments
  static fromPostAggregatedDataArray(
    entities: Comment[],
    profiles: { [userId: string]: ProfileSummaryRto }, // Assuming a map of owner IDs to profiles
    likedComments: Set<string>, // Assuming a set of comment IDs liked by the user
  ): CommentGatewayRto[] {
    return entities.map((entity) => {
      const profile = profiles[entity.ownerId];
      const isLiked = likedComments.has(entity.id);
      return CommentGatewayRto.fromPostAggregatedData(entity, profile, isLiked);
    });
  }
}
