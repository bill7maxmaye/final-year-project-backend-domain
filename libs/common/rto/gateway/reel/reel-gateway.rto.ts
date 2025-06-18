import { ReelPrivacy } from '@app/common//enum/reel/reel-visibility.enum';
import { ReelRto } from '../../microservices/reel/reel.rto';
import { ProfileSummaryRto } from './profile-summary.rto';

export class ReelGatewayRto {
  constructor(
    public id: string,
    public profile: ProfileSummaryRto,
    public videoURL: string,
    public description: string,
    public isPremiumContent: boolean,
    public duration: number,
    public hashtags: string[],
    public mentionedUsers: string[],
    public allowComments: boolean,
    public allowSaveToDevice: boolean,
    public saveWithWatermark: boolean,
    public audienceControlUnder18: boolean,
    public likes: number,
    public comments: number,
    public favoriteCount: number,
    public shareCount: number,
    public reportCount: number,
    public score: number,
    public label: string,
    public createdAt: string,
    public updatedAt: string,
    public privacy: ReelPrivacy,
    public isLikedByUser: boolean,
    public transcription_text?: string,
    public transcription_label?: string,
    public transcription_sentiment?: string,
    public transcription_keywords?: string[],
    public transcription_named_entities?: string[],
  ) {}

  static fromPostAggregatedData(
    entity: ReelRto,
    profile: ProfileSummaryRto,
  ): ReelGatewayRto {
    return new ReelGatewayRto(
      entity.id,
      profile,
      entity.videoURL,
      entity.description,
      entity.isPremiumContent,
      entity.duration,
      entity.hashtags,
      entity.mentionedUserIds,
      entity.allowComments,
      entity.allowSaveToDevice,
      entity.saveWithWatermark,
      entity.audienceControlUnder18,
      entity.likes,
      entity.comments,
      entity.favoriteCount,
      entity.shareCount,
      entity.reportCount,
      entity.score,
      entity.label,
      entity.createdAt,
      entity.updatedAt,
      entity.privacy,
      entity.isLiked,
      entity.transcription_text,
      entity.transcription_label,
      entity.transcription_sentiment,
      entity.transcription_keywords,
      entity.transcription_named_entities,
    );
  }
}
