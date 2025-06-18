import { Injectable, NotFoundException } from '@nestjs/common';
import { ReelsRepository } from './reel.repository';
import { CreateReelDto } from '@app/common//dto/microservices/reel/create-reel.dto';
import { Reel } from '@app/common//entities/reel/reel.entity';
import { FilterQuery, Types, UpdateQuery } from 'mongoose';
import { UpdateReelDto } from '@app/common//dto/microservices/reel/update-reel.dto';
import { PaginationOptions } from '@app/common//dto/interface/pagination-options.interface';
import { LikeResponse } from '@app/common//dto/interface/like.interface';
import { ReelDocument } from '@app/common//models/reel/reel.model';
import { ModerationDto } from '@app/common//dto/microservices/reel/comment-moderation.dto';
import { ReelAnalyticsDto } from '@app/common//dto/microservices/reel/reel-analytics.dto';
import { Logger } from '@nestjs/common';
import { ReportsRepository } from '../report/report.repository';
import { LikeRepository } from '../like/like.repository';
// import { ReportRepository } from '@app/common//repositories/report/report.repository';

@Injectable()
export class ReelService {
  private readonly logger = new Logger(ReelService.name);

  constructor(
    private readonly reelRepository: ReelsRepository,
    private readonly reportRepository: ReportsRepository,
    private readonly likeRepository: LikeRepository,
  ) {}

  async createReel(createReelDto: CreateReelDto): Promise<Reel> {
    try {
      const reel = await this.reelRepository.create({
        ...createReelDto,
      });
      console.log('reel', reel);
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

      // console.log('Update Object:', updateObject);

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

  async moderationResult(
    id: string,
    moderationDto: ModerationDto,
  ): Promise<Reel> {
    try {
      const updateObject: UpdateQuery<Reel> = {
        $set: {
          label: moderationDto.label,
          score: moderationDto.score,
        },
      };

      console.log('Update Object here:', id, updateObject);

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

  async deleteReel(id: string): Promise<string> {
    try {
      const result = await this.reelRepository.findOneAndDelete({
        _id: new Types.ObjectId(id),
      });

      if (!result) {
        throw new NotFoundException(`Reel with ID "${id}" not found`);
      }
      return result.key;
    } catch (error) {
      if (error instanceof Types.ObjectId) {
        throw new NotFoundException(`Invalid Reel ID "${id}"`);
      } else {
        throw error;
      }
    }
  }

  async getManyReels(
    paginationOptions: PaginationOptions,
    reelIds?: string[],
  ): Promise<Reel[]> {
    const { page, limit } = paginationOptions;
    const skip = (page - 1) * limit;

    try {
      const filterQuery: FilterQuery<Reel> = {};

      if (reelIds && reelIds.length > 0) {
        filterQuery._id = { $in: reelIds.map((id) => new Types.ObjectId(id)) };
      }

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

  async likeReel(reelId: string, likeStatus: LikeResponse): Promise<number> {
    // Changed return type to Promise<number>
    let objectIdReel: Types.ObjectId;
    try {
      // Attempt to convert the string ID to ObjectId
      objectIdReel = new Types.ObjectId(reelId);
    } catch (error) {
      // Catch error if the string format is invalid for ObjectId
      throw new NotFoundException(
        `Invalid Reel ID format "${reelId} ${error}"`,
      ); // Use reelId in error message
    }

    // Determine whether to increment or decrement the like count
    const incrementValue = likeStatus.status === 'LIKED' ? 1 : -1;

    // Define the update operation using Mongoose $inc operator
    const updateOperation: UpdateQuery<ReelDocument> = {
      $inc: { likes: incrementValue },
    };

    try {
      // Use the repository method to find the reel, update its like count, and retrieve the updated document
      const updatedReelDocument =
        await this.reelRepository.updateOneAndRetrieve(
          { _id: objectIdReel },
          updateOperation,
        );

      // Check if the document was found and updated.
      // updateOneAndRetrieve should ideally return the document if found/updated, null otherwise.
      if (!updatedReelDocument) {
        throw new NotFoundException(
          `Reel with ID "${reelId}" not found or could not be updated`,
        );
      }

      // Return the new like count from the updated document
      return updatedReelDocument.likes;
    } catch (error) {
      // Re-throw the NotFoundException if it originated from the check above
      if (error instanceof NotFoundException) {
        throw error;
      }
      // Log other potential errors from the database operation
      console.error(`Error updating like count for reel ${reelId}:`, error);
      // Re-throw the error (consider using a more specific NestJS exception like InternalServerErrorException)
      throw error;
    }
  }

  async shareReel(reelId: string): Promise<number> {
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
      const reel = await this.reelRepository.updateOneAndRetrieve(
        { _id: objectIdReel },
        updateOperation,
      );
      return reel.shareCount;
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

  async incrementCommentCount(reelId: string): Promise<number> {
    // Changed return type
    let objectIdReel: Types.ObjectId;
    try {
      objectIdReel = new Types.ObjectId(reelId);
    } catch (error) {
      throw new NotFoundException(
        `Invalid Reel ID format "${reelId} ${error}"`,
      ); // Used reelId for clarity
    }

    // console.log('objectIdReel', objectIdReel);

    const updateOperation: UpdateQuery<ReelDocument> = {
      $inc: { comments: 1 },
    };

    try {
      const updatedReelDocument =
        await this.reelRepository.updateOneAndRetrieve(
          { _id: objectIdReel },
          updateOperation,
        );

      // Check if the document was found and updated
      if (!updatedReelDocument) {
        throw new NotFoundException(
          `Reel with ID "${reelId}" not found or could not be updated`,
        );
      }

      // Return the new comment count
      return updatedReelDocument.comments;
    } catch (error) {
      // Re-throw the NotFoundException if it originated from the check above
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(`Error updating comment count for reel ${reelId}:`, error);
      throw error;
    }
  }

  // --- MODIFIED METHOD ---
  async decrementCommentCount(reelId: string): Promise<number> {
    // Changed return type
    let objectIdReel: Types.ObjectId;
    try {
      objectIdReel = new Types.ObjectId(reelId);
    } catch (error) {
      throw new NotFoundException(
        `Invalid Reel ID format "${reelId} ${error}"`,
      ); // Used reelId for clarity
    }

    const updateOperation: UpdateQuery<ReelDocument> = {
      $inc: { comments: -1 },
    };

    try {
      const updatedReelDocument =
        await this.reelRepository.updateOneAndRetrieve(
          { _id: objectIdReel },
          updateOperation,
        );

      // Check if the document was found and updated
      if (!updatedReelDocument) {
        throw new NotFoundException(
          `Reel with ID "${reelId}" not found or could not be updated`,
        );
      }

      // Return the new comment count
      return updatedReelDocument.comments;
    } catch (error) {
      // Re-throw the NotFoundException if it originated from the check above
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(`Error updating comment count for reel ${reelId}:`, error);
      throw error;
    }
  }

  async getReelsCreatedAfter(
    createdAt: Date,
    limit: number = 2,
  ): Promise<Reel[]> {
    try {
      // if (isNaN(createdAt.getTime())) {
      //   throw new Error('Invalid date provided for getReelsCreatedAfter');
      // }

      console.log('am here');

      const filterQuery: FilterQuery<ReelDocument> = {
        createdAt: { $gt: createdAt },
      };

      const reels = await this.reelRepository
        .find(filterQuery)
        .sort({ createdAt: 1 })
        .limit(limit)
        .exec();

      return Reel.fromDocuments(reels);
    } catch (error: any) {
      console.error(`Error fetching reels created after `, error);
      throw error;
    }
  }

  async incrementReportCount(reelId: string): Promise<number> {
    let objectIdReel: Types.ObjectId;
    try {
      objectIdReel = new Types.ObjectId(reelId);
    } catch (error: any) {
      throw new NotFoundException(`Invalid Reel ID format "${error}"`);
    }

    const updateOperation: UpdateQuery<ReelDocument> = {
      $inc: { reportCount: 1 },
    };

    try {
      const updatedReelDocument =
        await this.reelRepository.updateOneAndRetrieve(
          { _id: objectIdReel },
          updateOperation,
        );

      if (!updatedReelDocument) {
        throw new NotFoundException(
          `Reel with ID "${reelId}" not found or could not be updated`,
        );
      }

      return updatedReelDocument.reportCount;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(`Error updating report count for reel ${reelId}:`, error);
      throw error;
    }
  }

  async getLikedReelsAnalytics(userId: string): Promise<ReelAnalyticsDto> {
    try {
      // Get all reels liked by the user
      const likedReels = await this.likeRepository.find({
        userId: new Types.ObjectId(userId),
        onModel: 'Reel', // Add a filter to ensure we only get likes for Reels
      });

      console.log(likedReels, userId);

      if (!likedReels || likedReels.length === 0) {
        return {
          totalReels: 0,
          labelAnalytics: [],
        };
      }

      // Extract targetIds from the likedReels
      const reelIds = likedReels.map((like) => like.targetId);

      // Fetch Reels based on targetIds
      const reels = await this.reelRepository.find({
        _id: { $in: reelIds },
      });

      if (!reels || reels.length === 0) {
        return {
          totalReels: 0,
          labelAnalytics: [],
        };
      }

      // Count labels
      const labelCounts = new Map<string, number>();
      reels.forEach((reel) => {
        if (reel.transcription_label) {
          // Corrected from reel.label
          labelCounts.set(
            reel.transcription_label,
            (labelCounts.get(reel.transcription_label) || 0) + 1,
          );
        }
      });

      // Calculate percentages and create analytics
      const totalReels = reels.length; // Use the actual number of Reels found
      const labelAnalytics = Array.from(labelCounts.entries()).map(
        ([label, count]) => ({
          label,
          count,
          percentage: (count / totalReels) * 100,
        }),
      );

      return {
        totalReels,
        labelAnalytics,
      };
    } catch (error) {
      console.error('Error getting liked reels analytics:', error);
      throw error;
    }
  }

  async countDocuments(): Promise<number> {
    try {
      return await this.reelRepository.countDocuments();
    } catch (error) {
      this.logger.error('Error counting reels:', error);
      throw error;
    }
  }

  async countReports(): Promise<number> {
    try {
      return await this.reportRepository.countDocuments();
    } catch (error) {
      this.logger.error('Error counting reel reports:', error);
      throw error;
    }
  }
}
