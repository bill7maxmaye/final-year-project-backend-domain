import { PostCommentDocument } from '@app/common//models/social/comment.model';

export class CommentRto {
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
    public authorId?: string,
  ) {}

  static fromEntity(entity: PostCommentDocument): CommentRto {
    return new CommentRto(
      entity._id.toString(),
      entity.content,
      entity.postId!,
      entity.replies ?? [],
      entity.likedBy ?? [],
      entity.files ?? [],
      entity.mentions ?? [],
      entity.createdAt,
      entity.updatedAt,
      entity.parentId,
      entity.authorId,
    );
  }
}
