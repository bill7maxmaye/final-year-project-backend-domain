import { Reel } from '@app/common//entities/reel/reel.entity';
import { ReelPrivacy } from '@app/common//enum/reel/reel-visibility.enum';

export class ReelRto {
  constructor(
    public id: string,
    public ownerId: string,
    public videoURL: string,
    public description: string,
    public isPremiumContent: boolean,
    public duration: number,
    public hashtags: string[],
    public mentionedUserIds: string[],
    public privacy: ReelPrivacy,
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
    public isLiked: boolean,
    public transcription_text?: string,
    public transcription_label?: string,
    public transcription_sentiment?: string,
    public transcription_keywords?: string[],
    public transcription_named_entities?: string[],
  ) {}

  static fromEntity(entity: Reel, likedReelIds?: Set<string> | null): ReelRto {
    const isLikedByUser = likedReelIds != null && likedReelIds.has(entity.id);

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
      isLikedByUser,
      entity.transcription_text,
      entity.transcription_label,
      entity.transcription_sentiment,
      entity.transcription_keywords,
      entity.transcription_named_entities,
    );
  }

  static fromEntities(
    entities: Reel[],
    likedReelIds?: Set<string> | null,
  ): ReelRto[] {
    return entities.map((entity) => ReelRto.fromEntity(entity, likedReelIds));
  }
}
