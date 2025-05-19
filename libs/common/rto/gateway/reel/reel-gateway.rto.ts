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
    public createdAt: string,
    public updatedAt: string,
    public privacy: ReelPrivacy,
    public isLikedByUser: boolean,
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
      entity.createdAt,
      entity.updatedAt,
      entity.privacy,
      entity.isLiked,
    );
  }
}
