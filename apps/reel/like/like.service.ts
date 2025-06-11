import { Injectable } from '@nestjs/common';
import { LikeRepository } from './like.repository';
import { FilterQuery, QueryOptions, Types } from 'mongoose';
import { LikeableType } from '@app/common//enum/reel/likeable-type.enum';
import { LikeDocument } from '@app/common//models/reel/like.model';
import { LikeResponse } from '@app/common//dto/interface/like.interface';

interface LikeTargetIdProjection {
  targetId: Types.ObjectId;
}

@Injectable()
export class LikeService {
  constructor(private readonly likeRepository: LikeRepository) {}

  async likeReel(
    userId: string,
    targetId: string,
    onModelType: LikeableType,
  ): Promise<LikeResponse> {
    try {
      const userIdObjectId = new Types.ObjectId(userId);
      const reelIdObjectId = new Types.ObjectId(targetId);

      const existingLike = await this.likeRepository.findOneOrNull({
        userId: userIdObjectId,
        targetId: reelIdObjectId,
        onModel: onModelType,
      });

      console.log(existingLike);

      if (existingLike) {
        await this.likeRepository.deleteOne({ _id: existingLike._id });
        return {
          status: 'UNLIKED',
        };
      } else {
        const newLike: Partial<LikeDocument> = {
          userId: userIdObjectId,
          targetId: reelIdObjectId,
          onModel: onModelType,
        };

        console.log('newLike', newLike);

        await this.likeRepository.create(newLike);
        return {
          status: 'LIKED',
        };
      }
    } catch (error) {
      console.error('Error liking/unliking target :', error);
      throw error;
    }
  }

  async findLikedTargetIds(
    userId: string,
    targetIds: Set<string>,
    onModelType: LikeableType,
  ): Promise<Set<string>> {
    try {
      // 1. Validate userId format and convert to ObjectId
      if (!Types.ObjectId.isValid(userId)) {
        console.warn(
          `LikeService - findLikedTargetIds: Invalid userId format received: ${userId}. Type: ${onModelType}`,
        );
        return new Set<string>();
      }
      const userIdObjectId = new Types.ObjectId(userId);

      // 2. Convert input targetIds set to array of valid ObjectIds
      const targetObjectIds = Array.from(targetIds)
        .filter((idString) => Types.ObjectId.isValid(idString))
        .map((idString) => new Types.ObjectId(idString));

      if (targetObjectIds.length === 0) {
        console.log(
          `LikeService - findLikedTargetIds: No valid target IDs provided for type ${onModelType}. Returning empty set.`,
        );
        return new Set<string>();
      }

      // 3. Query the likes collection
      // Construct the filter query
      const filterQuery: FilterQuery<LikeDocument> = {
        userId: userIdObjectId,
        onModel: onModelType,
        targetId: { $in: targetObjectIds },
      };

      // Construct the query options with projection
      const queryOptions: QueryOptions<LikeDocument> = {
        projection: { targetId: 1, _id: 0 }, // Explicitly define projection
      };

      // IMPORTANT: Your repository's find method needs to accept query options.
      // It should have a signature like:
      // find(filter: FilterQuery<TDocument>, options?: QueryOptions<TDocument>): Query<TDocument[], TDocument>;
      // If it doesn't, you MUST update your BaseRepository or LikeRepository definition.

      // Execute the query with filter and projection
      const likedDocuments = (await this.likeRepository.find(
        filterQuery,
        queryOptions, // Pass the options object as the second argument
      )) as (LikeTargetIdProjection & LikeDocument)[]; // Add type assertion for clarity if repository types are loose

      // 4. Process the results
      const likedTargetIdsSet = new Set<string>(
        // Map the results. Use the defined interface for safer access.
        likedDocuments.map((doc) => doc.targetId.toString()),
      );

      console.log(
        `LikeService - findLikedTargetIds: Found ${likedTargetIdsSet.size} liked targets of type ${onModelType} out of ${targetIds.size} checked for user ${userId}`,
      );

      return likedTargetIdsSet;
    } catch (error) {
      console.error(
        `LikeService - Error finding liked target IDs for type ${onModelType} for user ${userId}:`,
        error,
      );
      throw error;
    }
  }
}
