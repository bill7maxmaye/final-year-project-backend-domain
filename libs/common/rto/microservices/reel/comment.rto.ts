// --- CommentRto (app/api/reel/dto/comment.rto.ts) --- // Assuming a typical location for RTOs

import { Comment } from '@app/common//entities/reel/comment.entity'; // Assuming this path
import { MentionedUser } from '@app/common//entities/reel/mentioned-user.entity'; // Assuming this path

// This RTO represents the structure of a Comment object returned to the client.
// It maps from the Comment entity structure (which includes reelId and parentCommentId).
export class CommentRto {
  constructor(
    public id: string,
    public content: string,
    public ownerId: string, // The ID of the user who created the comment
    public reelId: string, // NEW: The ID of the top-level Reel this comment belongs to
    public parentCommentId: string | null, // The ID of the parent comment if it's a reply
    public mentionedUsers: MentionedUser[], // Array of MentionedUser entities
    public likes: number,
    public createdAt: string, // Sending dates as ISO strings is standard practice
    public updatedAt: string, // Sending dates as ISO strings is standard practice
  ) {
    // No super call needed as this does not extend BaseEntity
  }

  /**
   * Maps an application Comment entity to a CommentRto.
   * @param entity The Comment entity instance.
   * @returns A CommentRto instance for API response.
   */
  static fromEntity(entity: Comment): CommentRto {
    // Ensure the entity has reelId based on the updated entity structure
    if (!entity.reelId) {
      // This should ideally not happen if the entity is correctly mapped from the DB
      throw new Error('Comment entity is missing reelId field');
    }

    return new CommentRto(
      entity.id,
      entity.content,
      entity.ownerId,
      entity.reelId, // Map from entity.reelId (new field)
      entity.parentCommentId, // Map from entity.parentCommentId
      entity.mentionedUsers, // Map directly from the entity's mentionedUsers array
      entity.likes,
      entity.createdAt.toISOString(), // Convert Date object to ISO string
      entity.updatedAt.toISOString(), // Convert Date object to ISO string
    );
  }

  /**
   * Maps an array of application Comment entities to an array of CommentRtos.
   * @param entities An array of Comment entity instances.
   * @returns An array of CommentRto instances for API response.
   */
  static fromEntities(entities: Comment[]): CommentRto[] {
    // Filter out any null/undefined entities if necessary, though typically not needed
    return entities.map((entity) => CommentRto.fromEntity(entity));
  }
}
