import {
  defaultNumberOf,
  PostsNumberOfDocument,
} from '@app/common//models/social/post-number.model';
import { PostDocument } from '@app/common//models/social/post.model';

export class PostRto {
  constructor(
    public id: string,
    public content: string,
    public files: string[],
    public authorId: string,
    public commentIds: string[],
    public likedBy: string[],
    public numberOf: PostsNumberOfDocument,
    public createdAt: Date,
    public updatedAt: Date,
  ) {}

  static fromEntity(entity: PostDocument): PostRto {
    return new PostRto(
      entity._id.toString(),
      entity.content,
      entity.files ?? [],
      entity.authorId ?? '',
      entity.commentIds ?? [],
      entity.likedBy ?? [],
      entity.numberOf ?? defaultNumberOf,
      entity.createdAt,
      entity.updatedAt,
    );
  }
}
