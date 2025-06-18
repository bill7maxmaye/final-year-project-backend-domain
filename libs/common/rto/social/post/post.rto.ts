import { PostDocument } from '@app/common//models/social/post.model';

export class PostRto {
  constructor(
    public id: string,
    public content: string,
    public files: string[],
    public authorId: string,
    public commentIds: string[],
    public likedBy: string[],
    public reportCount: number = 0,
    public score: number,
    public label: string,
    public createdAt: Date,
    public updatedAt: Date,
  ) {}

  static fromEntity(entity: PostDocument): PostRto {
    return new PostRto(
      entity._id.toString(),
      entity.content ?? '',
      entity.files ?? [],
      entity.authorId ?? '',
      entity.commentIds ?? [],
      entity.likedBy ?? [],
      entity.reportCount ?? 0,
      entity.score,
      entity.label,
      entity.createdAt,
      entity.updatedAt,
    );
  }
}
