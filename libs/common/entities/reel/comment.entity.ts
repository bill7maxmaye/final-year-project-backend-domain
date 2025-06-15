import { CommentDocument } from '../../models/reel/comment.model';
import { BaseEntity } from '../base.entity';

export class Comment extends BaseEntity {
  constructor(
    id: string,
    createdAt: Date,
    updatedAt: Date,
    public content: string,
    public ownerId: string,
    public reelId: string,
    public parentCommentId: string | null,
    public mentionedUserIds: string[],
    public likes: number,
    public label: string,
    public score: number,
  ) {
    super(id, createdAt, updatedAt);
  }

  static fromDocument(document: CommentDocument): Comment {
    if (!document.reelId) {
      throw new Error('Comment document is missing reelId field');
    }

    return new Comment(
      document._id.toString(),
      document.createdAt,
      document.updatedAt,
      document.content,
      document.ownerId.toString(),
      document.reelId.toString(),
      document.parentCommentId ? document.parentCommentId.toString() : null,
      document.mentionedUserIds,
      document.likes,
      document.lable,
      document.score,
    );
  }

  static fromDocuments(documents: CommentDocument[]): Comment[] {
    return documents.map((document) => Comment.fromDocument(document));
  }
}
