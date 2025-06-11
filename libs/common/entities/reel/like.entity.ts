import { BaseEntity } from '../base.entity';
import { LikeableType } from '../../enum/reel/likeable-type.enum';
import { LikeDocument } from '../../models/reel/like.model';

export class Like extends BaseEntity {
  constructor(
    id: string,
    createdAt: Date,
    updatedAt: Date,
    public userId: string,
    public targetId: string,
    public onModel: LikeableType,
  ) {
    super(id, createdAt, updatedAt);
  }

  static fromDocument(document: LikeDocument): Like {
    return new Like(
      document.id,
      document.createdAt,
      document.updatedAt,
      document.userId.toString(),
      document.targetId.toString(),
      document.onModel,
    );
  }

  static fromDocuments(documents: LikeDocument[]): Like[] {
    return documents.map((document) => Like.fromDocument(document));
  }
}
