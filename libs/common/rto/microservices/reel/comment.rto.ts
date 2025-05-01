import { Comment } from '@app/common//entities/reel/comment.entity';
import { MentionedUser } from '@app/common//entities/reel/mentioned-user.entity';

export class CommentRto {
  constructor(
    public id: string,
    public content: string,
    public ownerId: string,
    public targetId: string,
    public onModel: string,
    public parentCommentId: string | null,
    public mentionedUsers: MentionedUser[],
    public likes: number,
    public createdAt: string,
    public updatedAt: string,
  ) {}

  static fromEntity(entity: Comment): CommentRto {
    return new CommentRto(
      entity.id,
      entity.content,
      entity.ownerId,
      entity.targetId,
      entity.onModel,
      entity.parentCommentId,
      entity.mentionedUsers,
      entity.likes,
      entity.createdAt.toISOString(),
      entity.updatedAt.toISOString(),
    );
  }

  static fromEntities(entities: Comment[]): CommentRto[] {
    return entities.map((entity) => CommentRto.fromEntity(entity));
  }
}
