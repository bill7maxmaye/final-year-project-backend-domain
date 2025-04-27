import { ReactionsDocument } from '../../../models/social/reactions.model';

export class CommentRto {
  id: string;
  content: string;
  authorId: string;
  postId: string;
  reactions: ReactionsDocument;
  likedBy: string[];
  createdAt: Date;
  updatedAt: Date;

  constructor(comment: any) {
    this.id = comment._id;
    this.content = comment.content;
    this.authorId = comment.authorId;
    this.postId = comment.postId;
    this.reactions = comment.reactions;
    this.likedBy = comment.likedBy;
    this.createdAt = comment.createdAt;
    this.updatedAt = comment.updatedAt;
  }
}
