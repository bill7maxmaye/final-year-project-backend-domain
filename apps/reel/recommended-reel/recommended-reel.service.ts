import { Injectable, Logger } from '@nestjs/common';
import { RecommendedReelRepository } from './recommended-reel.repository';
import { RecommendedReelDto } from '@app/common//dto/microservices/reel/recommended-reel.dto';

@Injectable()
export class RecommendedReelService {
  private readonly logger = new Logger(RecommendedReelService.name);

  constructor(
    private readonly recommendedReelRepository: RecommendedReelRepository,
  ) {}

  async getRecommendations(userId: string): Promise<RecommendedReelDto> {
    const recommendations =
      await this.recommendedReelRepository.findByUserId(userId);
    if (!recommendations) {
      this.logger.warn(`No recommendations found for user ${userId}`);
      return new RecommendedReelDto(userId, []);
    }
    return RecommendedReelDto.fromEntity(recommendations);
  }

  async updateRecommendations(
    userId: string,
    recommendedReels: Array<{ reelId: string; score: number }>,
  ): Promise<RecommendedReelDto> {
    const updatedRecommendations =
      await this.recommendedReelRepository.updateRecommendations(
        userId,
        recommendedReels,
      );
    return RecommendedReelDto.fromEntity(updatedRecommendations);
  }

  async deleteRecommendations(userId: string): Promise<void> {
    await this.recommendedReelRepository.deleteByUserId(userId);
    this.logger.log(`Deleted recommendations for user ${userId}`);
  }

  async getTopRecommendations(
    userId: string,
    limit: number = 10,
  ): Promise<RecommendedReelDto> {
    const recommendations =
      await this.recommendedReelRepository.getTopRecommendations(userId, limit);
    if (!recommendations) {
      this.logger.warn(`No recommendations found for user ${userId}`);
      return new RecommendedReelDto(userId, []);
    }
    return RecommendedReelDto.fromEntity(recommendations);
  }

  async getRecommendationsByScore(
    userId: string,
    minScore: number,
    limit: number = 10,
  ): Promise<RecommendedReelDto> {
    try {
      const recommendations =
        await this.recommendedReelRepository.getRecommendationsByScore(
          userId,
          minScore,
          limit,
        );

      if (!recommendations) {
        this.logger.warn(
          `No recommendations found for user ${userId} with minimum score ${minScore}`,
        );
        return new RecommendedReelDto(userId, []);
      }

      return RecommendedReelDto.fromEntity(recommendations);
    } catch (error) {
      this.logger.error(
        `Error fetching recommendations by score for user ${userId}:`,
        error,
      );
      throw error;
    }
  }
}
