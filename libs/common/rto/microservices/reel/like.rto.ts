import { Like } from '@app/common//entities/reel/like.entity';
import { LikeableType } from '@app/common//enum/reel/likeable-type.enum';

export class LikeRto {
  constructor(
    public id: string,
    public userId: string,
    public targetId: string,
    public onModel: LikeableType,
    public createdAt: string,
    public updatedAt: string,
  ) {}

  static fromEntity(entity: Like): LikeRto {
    return new LikeRto(
      entity.id,
      entity.userId,
      entity.targetId,
      entity.onModel,
      entity.createdAt.toISOString(),
      entity.updatedAt.toISOString(),
    );
  }

  static fromEntities(entities: Like[]): LikeRto[] {
    return entities.map((entity) => LikeRto.fromEntity(entity));
  }
}
