import { Injectable, NotFoundException } from '@nestjs/common';
import { ReelsRepository } from './reel.repository';
import { CreateReelDto } from '@app/common//dto/microservices/reel/create-reel.dto';
import { Reel } from '@app/common//entities/reel/reel.entity';
import { FilterQuery, Types, UpdateQuery } from 'mongoose';
import { UpdateReelDto } from '@app/common//dto/microservices/reel/update-reel.dto';
import { PaginationOptions } from '@app/common//dto/interface/pagination-options.interface';
import { LikeReelResponse } from '@app/common//dto/interface/like.interface';
import { ReelDocument } from '@app/common//models/reel/reel.model';

@Injectable()
export class ReelService {
  constructor(private readonly reelRepository: ReelsRepository) {}

  async createReel(createReelDto: CreateReelDto): Promise<Reel> {
    try {
      const reel = await this.reelRepository.create({
        ...createReelDto,
      });
      return Reel.fromDocument(reel);
    } catch (error) {
      console.error('Error creating reel:', error);
      throw error;
    }
  }

  async getReel(id: string): Promise<Reel> {
    try {
      const reel = await this.reelRepository.findOne({
        _id: new Types.ObjectId(id),
      });

      if (!reel) {
        throw new NotFoundException(`Reel with ID "${id}" not found`);
      }
      return Reel.fromDocument(reel);
    } catch (error) {
      if (error instanceof Types.ObjectId) {
        throw new NotFoundException(`Invalid Reel ID "${id}"`);
      } else {
        throw error;
      }
    }
  }

  async updateReel(id: string, updateReelDto: UpdateReelDto): Promise<Reel> {
    try {
      const updateObject: UpdateQuery<Reel> = {
        $set: updateReelDto.body,
      };

      console.log('Update Object:', updateObject);

      const updatedReel = await this.reelRepository.updateOneAndRetrieve(
        { _id: new Types.ObjectId(id) },
        updateObject,
      );

      return Reel.fromDocument(updatedReel);
    } catch (error: any) {
      if (error) {
        throw new NotFoundException(`Invalid Reel ID format "${id}"`);
      }
      throw error;
    }
  }

  async deleteReel(id: string): Promise<void> {
    try {
      const result = await this.reelRepository.deleteOne({
        _id: new Types.ObjectId(id),
      });

      if (!result) {
        throw new NotFoundException(`Reel with ID "${id}" not found`);
      }
    } catch (error) {
      if (error instanceof Types.ObjectId) {
        throw new NotFoundException(`Invalid Reel ID "${id}"`);
      } else {
        throw error;
      }
    }
  }

  async getManyReels(paginationOptions: PaginationOptions): Promise<Reel[]> {
    const { page, limit } = paginationOptions;
    const skip = (page - 1) * limit;

    try {
      const filterQuery: FilterQuery<Reel> = {};

      const reels = await this.reelRepository
        .find(filterQuery)
        .skip(skip)
        .limit(limit)
        .exec();

      return Reel.fromDocuments(reels);
    } catch (error: any) {
      if (error instanceof Types.ObjectId) {
        throw new NotFoundException(`Invalid Reel ID in reelIds array`);
      }
      console.error('Error fetching reels:', error);
      throw error;
    }
  }

  async likeReel(reelId: string, likeStatus: LikeReelResponse): Promise<void> {
    let objectIdReel: Types.ObjectId;
    try {
      objectIdReel = new Types.ObjectId(reelId);
    } catch (error) {
      throw new NotFoundException(`Invalid Reel ID format "${error}"`);
    }

    const incrementValue = likeStatus.status === 'LIKED' ? 1 : -1;

    const updateOperation: UpdateQuery<ReelDocument> = {
      $inc: { likes: incrementValue },
    };

    try {
      await this.reelRepository.updateOneAndRetrieve(
        { _id: objectIdReel },
        updateOperation,
      );
    } catch (error) {
      console.error(`Error updating like count for reel ${reelId}:`, error);
      throw error;
    }
  }

  async shareReel(reelId: string): Promise<void> {
    let objectIdReel: Types.ObjectId;
    try {
      objectIdReel = new Types.ObjectId(reelId);
    } catch (error) {
      throw new NotFoundException(`Invalid Reel ID format "${error}"`);
    }

    const updateOperation: UpdateQuery<ReelDocument> = {
      $inc: { shareCount: 1 },
    };

    try {
      await this.reelRepository.updateOneAndRetrieve(
        { _id: objectIdReel },
        updateOperation,
      );
    } catch (error) {
      console.error(`Error updating share count for reel ${reelId}:`, error);
      throw error;
    }
  }

  async favoriteReel(reelId: string): Promise<void> {
    let objectIdReel: Types.ObjectId;
    try {
      objectIdReel = new Types.ObjectId(reelId);
    } catch (error) {
      throw new NotFoundException(`Invalid Reel ID format "${error}"`);
    }

    const updateOperation: UpdateQuery<ReelDocument> = {
      $inc: { favoriteCount: 1 },
    };

    try {
      await this.reelRepository.updateOneAndRetrieve(
        { _id: objectIdReel },
        updateOperation,
      );
    } catch (error) {
      console.error(`Error updating favorite count for reel ${reelId}:`, error);
      throw error;
    }
  }

  async incrementCommentCount(reelId: string): Promise<void> {
    let objectIdReel: Types.ObjectId;
    try {
      objectIdReel = new Types.ObjectId(reelId);
    } catch (error) {
      throw new NotFoundException(`Invalid Reel ID format "${error}"`);
    }

    console.log(objectIdReel);

    const updateOperation: UpdateQuery<ReelDocument> = {
      $inc: { commentCount: 1 },
    };

    try {
      await this.reelRepository.updateOneAndRetrieve(
        { _id: objectIdReel },
        updateOperation,
      );
    } catch (error) {
      console.error(`Error updating comment count for reel ${reelId}:`, error);
      throw error;
    }
  }

  async decrementCommentCount(reelId: string): Promise<void> {
    let objectIdReel: Types.ObjectId;
    try {
      objectIdReel = new Types.ObjectId(reelId);
    } catch (error) {
      throw new NotFoundException(`Invalid Reel ID format "${error}"`);
    }

    const updateOperation: UpdateQuery<ReelDocument> = {
      $inc: { commentCount: -1 },
    };

    try {
      await this.reelRepository.updateOneAndRetrieve(
        { _id: objectIdReel },
        updateOperation,
      );
    } catch (error) {
      console.error(`Error updating comment count for reel ${reelId}:`, error);
      throw error;
    }
  }
}
