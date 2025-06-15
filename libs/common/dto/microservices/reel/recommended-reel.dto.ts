import { RecommendedReel } from '../../../entities/reel/recommended-reel.entity';

export class RecommendedReelDto {
  constructor(
    public readonly userId: string,
    public readonly recommendedReels: Array<{
      reelId: string;
      score: number;
    }>,
  ) {}

  static fromEntity(entity: RecommendedReel): RecommendedReelDto {
    return new RecommendedReelDto(entity.userId, entity.recommendedReels);
  }
}
