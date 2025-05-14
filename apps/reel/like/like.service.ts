import { Injectable } from '@nestjs/common';
import { LikeRepository } from './like.repository';
import { Types } from 'mongoose';
import { LikeableType } from '@app/common//enum/reel/likeable-type.enum';
import { LikeReelResponse } from '@app/common//dto/interface/like.interface';
import { LikeDocument } from '@app/common//models/reel/like.model';

@Injectable()
export class LikeService {
  constructor(private readonly likeRepository: LikeRepository) {}

  async likeReel(userId: string, reelId: string): Promise<LikeReelResponse> {
    try {
      const userIdObjectId = new Types.ObjectId(userId);
      const reelIdObjectId = new Types.ObjectId(reelId);

      const existingLike = await this.likeRepository.findOne({
        userId: userIdObjectId,
        targetId: reelIdObjectId,
        onModel: LikeableType.REEL,
      });

      if (existingLike) {
        await this.likeRepository.deleteOne({ _id: existingLike._id });
        return {
          status: 'UNLIKED',
        };
      } else {
        const newLike: Partial<LikeDocument> = {
          userId: userIdObjectId,
          targetId: reelIdObjectId,
          onModel: LikeableType.REEL,
        };

        await this.likeRepository.create(newLike);
        return {
          status: 'LIKED',
        };
      }
    } catch (error) {
      console.error('Error liking/unliking reel:', error);
      throw error;
    }
  }
}
