// --- Comment Entity (app/common/entities/reel/comment.entity.ts) ---

import { CommentDocument } from '../../models/reel/comment.model'; // Assuming this path
import { BaseEntity } from '../base.entity'; // Assuming this path and BaseEntity exists
import { MentionedUser } from './mentioned-user.entity'; // Assuming this path and MentionedUser entity exists

// This entity represents the Comment in your application logic, mapped from the database document.
// It should reflect the structure of the *modified* CommentDocument.
export class Comment extends BaseEntity {
  constructor(
    id: string,
    createdAt: Date,
    updatedAt: Date,
    public content: string,
    public ownerId: string, // The ID of the user who created the comment
    public reelId: string, // NEW: Always the ID of the Reel the comment belongs to
    public parentCommentId: string | null, // The ID of the parent comment if it's a reply
    public mentionedUsers: MentionedUser[], // Array of MentionedUser entities
    public likes: number,
  ) {
    // Pass base properties to the parent constructor
    super(id, createdAt, updatedAt);
  }

  /**
   * Maps a database CommentDocument (modified schema) to an application Comment entity.
   * @param document The Mongoose CommentDocument with reelId and parentCommentId.
   * @returns A Comment entity instance.
   */
  static fromDocument(document: CommentDocument): Comment {
    // Ensure the document has reelId (based on the modified schema)
    if (!document.reelId) {
      throw new Error('Comment document is missing reelId field'); // Or handle appropriately
    }

    return new Comment(
      document.id,
      document.createdAt,
      document.updatedAt,
      document.content,
      document.ownerId.toString(), // Convert ObjectId to string
      document.reelId.toString(), // Map from document.reelId (new field)
      document.parentCommentId ? document.parentCommentId.toString() : null, // Map from document.parentCommentId
      MentionedUser.fromDocuments(document.mentionedUsers), // Assuming MentionedUser has a fromDocuments method
      document.likes,
    );
  }

  /**
   * Maps an array of database CommentDocuments to an array of application Comment entities.
   * @param documents An array of Mongoose CommentDocuments.
   * @returns An array of Comment entity instances.
   */
  static fromDocuments(documents: CommentDocument[]): Comment[] {
    return documents.map((document) => Comment.fromDocument(document));
  }
}
