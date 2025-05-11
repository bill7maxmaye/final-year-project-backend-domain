import { MentionedUser } from '@app/common//entities/reel/mentioned-user.entity';
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
    public mentionedUsers: MentionedUser[],
    public allowComments: boolean,
    public allowSaveToDevice: boolean,
    public saveWithWatermark: boolean,
    public likes: number,
    public comments: number,
    public favoriteCount: number,
    public shareCount: number,
    public createdAt: string,
    public updatedAt: string,
    public isLikedByUser?: boolean,
  ) {}

  static fromPostAggregatedData(
    entity: ReelRto,
    profile: ProfileSummaryRto,
    isLikedByUser?: boolean,
  ): ReelGatewayRto {
    return new ReelGatewayRto(
      entity.id,
      profile,
      entity.videoURL,
      entity.description,
      entity.isPremiumContent,
      entity.duration,
      entity.hashtags,
      entity.mentionedUsers,
      entity.allowComments,
      entity.allowSaveToDevice,
      entity.saveWithWatermark,
      entity.likes,
      entity.comments,
      entity.favoriteCount,
      entity.shareCount,
      entity.createdAt,
      entity.updatedAt,
      isLikedByUser,
    );
  }
}
