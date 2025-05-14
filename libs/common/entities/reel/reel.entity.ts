import { BaseEntity } from '../base.entity';
import { ReelPrivacy } from '../../enum/reel/reel-visibility.enum';
import { ReelDocument } from '../../models/reel/reel.model';
import { MentionedUser } from './mentioned-user.entity';

export class Reel extends BaseEntity {
  constructor(
    id: string,
    createdAt: Date,
    updatedAt: Date,
    public ownerId: string,
    public videoURL: string,
    public description: string,
    public isPremiumContent: boolean,
    public duration: number,
    public hashtags: string[],
    public mentionedUsers: MentionedUser[],
    public privacy: ReelPrivacy,
    public allowComments: boolean,
    public allowSaveToDevice: boolean,
    public saveWithWatermark: boolean,
    public audienceControlUnder18: boolean,
    public likes: number,
    public key: string,
    public comments: number,
    public favoriteCount: number,
    public shareCount: number,
  ) {
    super(id, createdAt, updatedAt);
  }

  static fromDocument(document: ReelDocument): Reel {
    return new Reel(
      document.id,
      document.createdAt,
      document.updatedAt,
      document.ownerId.toString(),
      document.videoURL,
      document.description,
      document.isPremiumContent,
      document.duration,
      document.hashtags,
      MentionedUser.fromDocuments(document.mentionedUsers),
      document.privacy,
      document.allowComments,
      document.allowSaveToDevice,
      document.saveWithWatermark,
      document.audienceControlUnder18,
      document.likes,
      document.key,
      document.comments,
      document.favoriteCount,
      document.shareCount,
    );
  }

  static fromDocuments(documents: ReelDocument[]): Reel[] {
    return documents.map((document) => Reel.fromDocument(document));
  }
}
