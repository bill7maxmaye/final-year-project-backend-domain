import { Comment } from '@app/common//entities/reel/comment.entity';

export class CommentRto {
  constructor(
    public id: string,
    public content: string,
    public ownerId: string,
    public reelId: string,
    public parentCommentId: string | null,
    public mentionedUsers: string[], // Assuming this is an array of user IDs mentioned in the comment
    public likes: number, // Total like count for this comment
    public createdAt: string,
    public updatedAt: string,
    public isLiked: boolean, // True if the current user has liked this comment
    public reelCommentCount: number, // Total comment count for the reel this comment belongs to
    // ------------------------------
  ) {}

  /**
   * Creates a CommentRto from a Comment entity, checking against a set of liked comment IDs and including the reel's total comment count.
   * @param entity The Comment entity from the database.
   * @param likedCommentIds A Set containing the IDs of comments liked by the current user. Pass an empty Set or null/undefined if the user is not logged in.
   * @param reelCommentCount The total number of comments for the reel this comment belongs to. This value must be fetched separately.
   * @returns The CommentRto representing the comment.
   */
  static fromEntity(
    entity: Comment,
    reelCommentCount: number, // <--- Added parameter
    likedCommentIds?: Set<string> | null,
  ): CommentRto {
    if (!entity.reelId) {
      console.warn(`Comment entity ${entity.id} is missing reelId field`);
      throw new Error(`Comment entity ${entity.id} is missing reelId field`);
    }

    // Logic to determine isLiked based on input Set
    const isLikedByUser =
      likedCommentIds != null && likedCommentIds.has(entity.id);

    return new CommentRto(
      entity.id,
      entity.content,
      entity.ownerId,
      entity.reelId,
      entity.parentCommentId,
      entity.mentionedUserIds,
      entity.likes,
      entity.createdAt.toISOString(),
      entity.updatedAt.toISOString(),
      isLikedByUser,
      reelCommentCount,
    );
  }

  static fromEntities(
    entities: Comment[],
    reelCommentCount: number,
    likedCommentIds?: Set<string> | null,
  ): CommentRto[] {
    return entities.map((entity) =>
      CommentRto.fromEntity(entity, reelCommentCount, likedCommentIds),
    );
  }
}
