import { Injectable, NotFoundException } from '@nestjs/common';
import { ReelsRepository } from './reel.repository';
import { CreateReelDto } from '@app/common//dto/microservices/reel/create-reel.dto';
import { Reel } from '@app/common//entities/reel/reel.entity';
import { FilterQuery, Types } from 'mongoose';
import { UpdateReelDto } from '@app/common//dto/microservices/reel/update-reel.dto';

interface PaginationOptions {
  page: number;
  limit: number;
}

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
      const updatedReel = await this.reelRepository.findOneAndUpdate(
        { _id: new Types.ObjectId(id) },
        updateReelDto,
      );

      if (!updatedReel) {
        throw new NotFoundException(`Reel with ID "${id}" not found`);
      }
      return Reel.fromDocument(updatedReel);
    } catch (error) {
      if (error instanceof Types.ObjectId) {
        throw new NotFoundException(`Invalid Reel ID "${id}"`);
      } else {
        throw error;
      }
    }
  }

  async deleteReel(id: string): Promise<void> {
    try {
      const result = await this.reelRepository.deleteOne({
        _id: new Types.ObjectId(id),
      });

      if (result) {
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

  async getManyReels(
    reelIds: string[],
    paginationOptions: PaginationOptions,
  ): Promise<Reel[]> {
    const { page, limit } = paginationOptions;
    const skip = (page - 1) * limit;

    try {
      const objectIds = reelIds.map((id) => new Types.ObjectId(id));

      const filterQuery: FilterQuery<Reel> = { _id: { $in: objectIds } };

      const reels = await this.reelRepository
        .find(filterQuery)
        .skip(skip)
        .limit(limit)
        .exec();

      return Reel.fromDocuments(reels);
    } catch (error: any) {
      if (error instanceof Types.ObjectId) {
        throw new NotFoundException(`Invalid Reel ID in reelIds array`); // Or a more specific error
      }
      console.error('Error fetching reels:', error);
      throw error;
    }
  }
}
