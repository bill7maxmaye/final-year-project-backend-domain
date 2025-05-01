import { CommentDocument } from '../../models/reel/comment.model';
import { BaseEntity } from '../base.entity';
import { MentionedUser } from './mentioned-user.entity';

export class Comment extends BaseEntity {
  constructor(
    id: string,
    createdAt: Date,
    updatedAt: Date,
    public content: string,
    public ownerId: string,
    public targetId: string,
    public onModel: string,
    public parentCommentId: string | null,
    public mentionedUsers: MentionedUser[],
    public likes: number,
  ) {
    super(id, createdAt, updatedAt);
  }

  static fromDocument(document: CommentDocument): Comment {
    return new Comment(
      document.id,
      document.createdAt,
      document.updatedAt,
      document.content,
      document.ownerId.toString(),
      document.targetId.toString(),
      document.onModel,
      document.parentCommentId ? document.parentCommentId.toString() : null,
      MentionedUser.fromDocuments(document.mentionedUsers),
      document.likes,
    );
  }

  static fromDocuments(documents: CommentDocument[]): Comment[] {
    return documents.map((document) => Comment.fromDocument(document));
  }
}
