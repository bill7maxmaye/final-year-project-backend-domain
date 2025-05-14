import { MentionedUser } from '@app/common//entities/reel/mentioned-user.entity';
import { Reel } from '@app/common//entities/reel/reel.entity';

export class ReelRto {
  constructor(
    public id: string,
    public ownerId: string,
    public videoURL: string,
    public description: string,
    public isPremiumContent: boolean,
    public duration: number,
    public hashtags: string[],
    public mentionedUsers: MentionedUser[],
    public privacy: string,
    public allowComments: boolean,
    public allowSaveToDevice: boolean,
    public saveWithWatermark: boolean,
    public audienceControlUnder18: boolean,
    public likes: number,
    public comments: number,
    public favoriteCount: number,
    public shareCount: number,
    public createdAt: string,
    public updatedAt: string,
  ) {}

  static fromEntity(entity: Reel): ReelRto {
    return new ReelRto(
      entity.id,
      entity.ownerId,
      entity.videoURL,
      entity.description,
      entity.isPremiumContent,
      entity.duration,
      entity.hashtags,
      entity.mentionedUsers,
      entity.privacy,
      entity.allowComments,
      entity.allowSaveToDevice,
      entity.saveWithWatermark,
      entity.audienceControlUnder18,
      entity.likes,
      entity.comments,
      entity.favoriteCount,
      entity.shareCount,
      entity.createdAt.toISOString(),
      entity.updatedAt.toISOString(),
    );
  }

  static fromEntities(entities: Reel[]): ReelRto[] {
    return entities.map((entity) => ReelRto.fromEntity(entity));
  }
}
