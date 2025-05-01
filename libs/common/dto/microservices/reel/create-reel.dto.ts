import { MentionedUser } from '@app/common//entities/reel/mentioned-user.entity';
import { ReelPrivacy } from '../../../enum/reel/reel-visibility.enum';
import { CreateReelGatewayDto } from '../../gateway/reel/create-reel.gateway.dto';
import { extractHashtags } from '@app/common//utils/string.utils';

export class CreateReelDto {
  constructor(
    public readonly ownerId: string,
    public readonly videoURL: string,
    public readonly key: string,
    public readonly description: string,
    public readonly duration: number,
    public readonly isPremiumContent?: boolean,
    public readonly hashtags?: string[],
    public readonly mentionedUsers?: MentionedUser[],
    public readonly privacy?: ReelPrivacy,
    public readonly allowComments?: boolean,
    public readonly allowSaveToDevice?: boolean,
    public readonly saveWithWatermark?: boolean,
    public readonly audienceControlUnder18?: boolean,
  ) {}

  static fromGateway(
    id: string,
    body: CreateReelGatewayDto,
    videoUrl: string,
    key: string,
  ): CreateReelDto {
    const hashtags = extractHashtags(body.description! ?? '');

    return new CreateReelDto(
      id,
      videoUrl,
      key,
      body.description!,
      body.duration,
      body.isPremiumContent,
      hashtags,
      body.mentionedUsers,
      body.privacy,
      body.allowComments,
      body.allowSaveToDevice,
      body.saveWithWatermark,
      body.audienceControlUnder18,
    );
  }
}
