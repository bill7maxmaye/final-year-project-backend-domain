import { BaseEntity } from '../base.entity';
import { ReelPrivacy } from '../../enum/reel/reel-visibility.enum';
import { ReelDocument } from '../../models/reel/reel.model';

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
    public mentionedUsers: string[],
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
    public reportCount: number,
    public label: string,
    public score: number,
    public transcription_text?: string,
    public transcription_label?: string,
    public transcription_sentiment?: string,
    public transcription_keywords?: string[],
    public transcription_named_entities?: string[],
  ) {
    super(id, createdAt, updatedAt);
  }

  static fromDocument(document: ReelDocument): Reel {
    return new Reel(
      document._id.toString(),
      document.createdAt,
      document.updatedAt,
      document.ownerId.toString(),
      document.videoURL,
      document.description,
      document.isPremiumContent,
      document.duration,
      document.hashtags,
      document.mentionedUserIds,
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
      document.reportCount,
      document.label,
      document.score,
      document.transcription_text,
      document.transcription_label,
      document.transcription_sentiment,
      document.transcription_keywords,
      document.transcription_named_entities,
    );
  }

  static fromDocuments(documents: ReelDocument[]): Reel[] {
    return documents.map((document) => Reel.fromDocument(document));
  }
}
