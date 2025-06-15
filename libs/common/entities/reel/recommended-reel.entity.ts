import { BaseEntity } from '../base.entity';
import { RecommendedReelDocument } from '../../models/reel/recommended-reel.model';

interface RecommendedReelEntry {
  reelId: string;
  score: number;
}

export class RecommendedReel extends BaseEntity {
  constructor(
    id: string,
    createdAt: Date,
    updatedAt: Date,
    public userId: string,
    public recommendedReels: RecommendedReelEntry[],
    public lastUpdated: Date,
  ) {
    super(id, createdAt, updatedAt);
  }

  static fromDocument(document: RecommendedReelDocument): RecommendedReel {
    return new RecommendedReel(
      document._id.toString(),
      document.createdAt,
      document.updatedAt,
      document.userId.toString(),
      document.recommendedReels.map((reel) => ({
        reelId: reel.reelId.toString(),
        score: reel.score,
      })),
      document.lastUpdated,
    );
  }
}
