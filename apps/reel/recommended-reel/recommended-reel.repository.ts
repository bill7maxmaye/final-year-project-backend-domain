import { BaseRepository } from '@app/common//baseRepository/base-repository';
import { RecommendedReel } from '@app/common//entities/reel/recommended-reel.entity';
import { RecommendedReelDocument } from '@app/common//models/reel/recommended-reel.model';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

@Injectable()
export class RecommendedReelRepository extends BaseRepository<RecommendedReelDocument> {
  constructor(
    @InjectModel(RecommendedReelDocument.name)
    private readonly recommendedReelModel: Model<RecommendedReelDocument>,
  ) {
    super(recommendedReelModel);
  }

  async findByUserId(userId: string): Promise<RecommendedReel | null> {
    const document = await this.recommendedReelModel.findOne({
      userId: new Types.ObjectId(userId),
    });
    return document ? RecommendedReel.fromDocument(document) : null;
  }

  async updateRecommendations(
    userId: string,
    recommendedReels: Array<{ reelId: string; score: number }>,
  ): Promise<RecommendedReel> {
    const document = await this.recommendedReelModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      {
        $set: {
          recommendedReels: recommendedReels.map((reel) => ({
            reelId: new Types.ObjectId(reel.reelId),
            score: reel.score,
          })),
          lastUpdated: new Date(),
        },
      },
      { new: true, upsert: true },
    );
    return RecommendedReel.fromDocument(document);
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.recommendedReelModel.deleteOne({
      userId: new Types.ObjectId(userId),
    });
  }

  async getTopRecommendations(
    userId: string,
    limit: number = 10,
  ): Promise<RecommendedReel | null> {
    const document = await this.recommendedReelModel.findOne(
      { userId: new Types.ObjectId(userId) },
      {
        recommendedReels: { $slice: ['$recommendedReels', limit] },
      },
    );
    return document ? RecommendedReel.fromDocument(document) : null;
  }

  async getRecommendationsByScore(
    userId: string,
    minScore: number,
    limit: number = 10,
  ): Promise<RecommendedReel | null> {
    const document = await this.recommendedReelModel
      .findOne(
        {
          userId: new Types.ObjectId(userId),
          'recommendedReels.score': { $gte: minScore },
        },
        {
          recommendedReels: {
            $filter: {
              input: '$recommendedReels',
              as: 'reel',
              cond: { $gte: ['$$reel.score', minScore] },
            },
          },
        },
      )
      .sort({ 'recommendedReels.score': -1 })
      .limit(limit);

    return document ? RecommendedReel.fromDocument(document) : null;
  }
}
