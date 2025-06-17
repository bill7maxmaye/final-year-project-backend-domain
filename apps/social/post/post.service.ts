import { PostRepository } from '@app/common//baseRepository/social/post-repositories/post.repository';
import { PostReportRepository } from '@app/common//baseRepository/social/post-repositories/report-repository';
import { PostReportDto } from '@app/common//dto/gateway/social/post/post-report.dto';
import { CreateNotificationDto } from '@app/common//dto/microservices/notification/create-notification-dto';
import { CreatePostDto } from '@app/common//dto/microservices/social/post/create-post.dto';
import { ListAllDto } from '@app/common//dto/microservices/social/post/list-all.dto';
import { ACTION } from '@app/common//enum/action.enum';
import { CONTROLLER } from '@app/common//enum/controller.enum';
import { MICROSERVICE } from '@app/common//enum/microservice.enum';
import { PostReportDocument } from '@app/common//models/social/post-report.model';
import { PostDocument } from '@app/common//models/social/post.model';
import { FindResult } from '@app/common//rto/find-result';
import { Injectable, NotFoundException } from '@nestjs/common';
import { NetworkingService } from '@pp/networking';
import { FilterQuery, Types } from 'mongoose';
import { Logger } from '@nestjs/common';

@Injectable()
export class PostService {
  private readonly logger = new Logger(PostService.name);

  constructor(
    private readonly postRepository: PostRepository,
    private readonly postReportRepository: PostReportRepository,
    private readonly networkingService: NetworkingService,
  ) {}

  async createPost(createPostDto: CreatePostDto): Promise<PostDocument> {
    const post = await this.postRepository.create({
      ...createPostDto,
    });
    console.log('Post created:', post);
    return post;
  }

  async updatePost(
    id: string,
    updatedPostDto: CreatePostDto,
  ): Promise<PostDocument> {
    try {
      console.log('Post before update:', updatedPostDto, id);
      const post = await this.postRepository.updateOneAndRetrieve(
        { _id: id },
        updatedPostDto,
      );

      console.log('Post after update:', post);

      if (!post) {
        throw new NotFoundException(`Post with ID ${id} not found`);
      }

      return post;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
  }

  async deletePost(id: string): Promise<boolean> {
    try {
      const post = await this.postRepository.findOneAndDelete({ _id: id });
      await this.postReportRepository.deleteMany({ content_id: id });

      return post !== null;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
  }

  async toggleReaction(postId: string, userId: string): Promise<PostDocument> {
    try {
      const post = await this.postRepository.findOne({ _id: postId });

      if (!post) {
        throw new NotFoundException(`Post with ID ${postId} not found`);
      }
      const likedByStrings = post.likedBy.map((id) => id.toString());
      const isLiked = likedByStrings.includes(userId);
      console.log('Post liked by:', post.likedBy, isLiked, userId);
      const updateQuery = isLiked
        ? { $pull: { likedBy: userId } } // remove if already liked
        : { $addToSet: { likedBy: userId } }; // add only if not already there

      await this.postRepository.updateOne({ _id: postId }, updateQuery);

      if (!isLiked) {
        const createNotificationDto = CreateNotificationDto.fromLikePost(
          new Types.ObjectId(post.authorId), // Assuming post.userId is the owner of the post
          post._id,
          new Types.ObjectId(userId),
        );

        this.networkingService.emit(
          `${MICROSERVICE.NOTIFICATION}.${CONTROLLER.NOTIFICATIONS}.${ACTION.CREATE}`,
          createNotificationDto,
        );
      }

      // Return the updated post (optional: you can refetch it or return original)
      return await this.postRepository.findOne({ _id: postId });
    } catch (error) {
      console.error('Error toggling like/unlike:', error);
      throw new NotFoundException(
        `Post with ID ${postId} failed to update reaction`,
      );
    }
  }

  async findByContentId(contentId: string): Promise<PostReportDocument[]> {
    const response = await this.postReportRepository
      .find({ content_id: contentId })
      .exec();

    return response;
  }

  async getById(id: string): Promise<PostDocument> {
    return this.postRepository.findOne({ _id: id });
  }

  async listAllPosts(query: ListAllDto): Promise<FindResult<PostDocument>> {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    console.log('Pagination params:', { page, limit, skip });
    console.log('Query:', query);

    const filter: FilterQuery<PostDocument> = {};

    if (query.search && query.search.trim()) {
      const searchTerm = query.search.trim();
      filter.content = { $regex: new RegExp(searchTerm, 'i') };
    }

    if (query.authorId) {
      filter.authorId = query.authorId;
    }

    console.log('Filter:', filter);

    const [data, total] = await Promise.all([
      this.postRepository.findMany(filter, {
        skip,
        limit,
        sort: {
          [query.sortBy || 'createdAt']: query.sortDirection === 'asc' ? 1 : -1,
        },
      }),
      this.postRepository.countDocuments(filter),
    ]);

    console.log('Query results:', {
      total,
      returned: data.length,
      page,
      limit,
      skip,
    });

    const totalPages = Math.ceil(total / limit);

    const nextPage = page < totalPages ? page + 1 : null;
    const prevPage = page > 1 ? page - 1 : null;

    // Build query parameters for pagination links
    const buildQueryParams = (pageNum: number) => {
      const params = new URLSearchParams();
      params.append('page', pageNum.toString());
      params.append('limit', limit.toString());
      if (query.search) params.append('search', query.search);
      if (query.authorId) params.append('authorId', query.authorId);
      if (query.sortBy) params.append('sortBy', query.sortBy);
      if (query.sortDirection)
        params.append('sortDirection', query.sortDirection);
      return params.toString();
    };

    const next = nextPage ? `?${buildQueryParams(nextPage)}` : undefined;
    const previous = prevPage ? `?${buildQueryParams(prevPage)}` : undefined;

    return FindResult.fromListAll(data, total, next, previous);
  }

  async resolveReport(
    reportId: string,
    resolvedBy: string,
  ): Promise<{ success: boolean }> {
    try {
      console.log('Resolving report with ID:', reportId);
      const report = await this.postReportRepository.findOneAndUpdate(
        { _id: reportId },
        {
          status: 'RESOLVED',
          resolvedBy,
          resolvedAt: new Date(),
        },
      );
      console.log('Report found:', report);
      if (!report) {
        console.log('Report not found>>>>>');
        throw new NotFoundException(`Report with ID ${reportId} not found`);
      }

      // Decrement the report count for the post
      // await this.postRepository.updateOne(
      //   { _id: report.content_id },
      //   { $inc: { reportCount: -1 } },
      // );

      console.log('Report resolved:', report);
      return { success: true };
    } catch (error) {
      console.error('Error resolving report:', error);
      return { success: false };
    }
  }

  async reportPost(report: PostReportDto): Promise<{ success: boolean }> {
    try {
      console.log('Reporting post:', report);

      const post = await this.postRepository.findOne({
        _id: report.content_id,
      });

      console.log('Post found:', post);

      if (!post) {
        console.log('Post not found>>>>>');
        throw new NotFoundException(
          `Post with ID ${report.content_id} not found`,
        );
      }

      console.log('Post found>>>:', post);

      // Create the report
      await this.postReportRepository.create(report);

      // Increment the report count
      await this.postRepository.updateOne(
        { _id: report.content_id },
        { $inc: { reportCount: 1 } },
      );

      return { success: true };
    } catch (error) {
      console.error('Error reporting post:', error);
      throw new NotFoundException(
        `Post with ID ${report.content_id} not found`,
      );
    }
  }

  async searchPostsByContent(
    query: ListAllDto,
  ): Promise<FindResult<PostDocument>> {
    console.log('Search query received in service:', query);
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter: FilterQuery<PostDocument> = {};

    if (query.search && query.search.trim()) {
      const searchTerm = query.search.trim();
      console.log('Search term:', searchTerm);
      filter.content = { $regex: new RegExp(searchTerm, 'i') };
      console.log('Search filter:', JSON.stringify(filter));
    }

    try {
      const [data, total] = await Promise.all([
        this.postRepository.findMany(filter, {
          skip,
          limit,
          sort: {
            [query.sortBy || 'createdAt']:
              query.sortDirection === 'asc' ? 1 : -1,
          },
        }),
        this.postRepository.countDocuments(filter),
      ]);

      console.log('Search results:', {
        total,
        found: data.length,
        firstResult: data[0]?.content?.substring(0, 100),
      });

      const totalPages = Math.ceil(total / limit);
      const nextPage = page < totalPages ? page + 1 : null;
      const prevPage = page > 1 ? page - 1 : null;

      // Build query parameters for pagination links
      const buildQueryParams = (pageNum: number) => {
        const params = new URLSearchParams();
        params.append('page', pageNum.toString());
        params.append('limit', limit.toString());
        if (query.search) {
          params.append('search', query.search);
        }
        if (query.sortBy) {
          params.append('sortBy', query.sortBy);
        }
        if (query.sortDirection) {
          params.append('sortDirection', query.sortDirection);
        }
        return params.toString();
      };

      const next = nextPage ? `?${buildQueryParams(nextPage)}` : undefined;
      const previous = prevPage ? `?${buildQueryParams(prevPage)}` : undefined;

      return FindResult.fromListAll(data, total, next, previous);
    } catch (error) {
      console.error('Error in searchPostsByContent:', error);
      throw error;
    }
  }

  async getPostsByUserId(
    query: ListAllDto,
    userId: string,
  ): Promise<FindResult<PostDocument>> {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter: FilterQuery<PostDocument> = {
      authorId: userId,
    };

    const [data, total] = await Promise.all([
      this.postRepository.findMany(filter, {
        skip,
        limit,
        sort: {
          [query.sortBy || 'createdAt']: query.sortDirection === 'asc' ? 1 : -1,
        },
      }),
      this.postRepository.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);
    const nextPage = page < totalPages ? page + 1 : null;
    const prevPage = page > 1 ? page - 1 : null;

    // Build query parameters for pagination links
    const buildQueryParams = (pageNum: number) => {
      const params = new URLSearchParams();
      params.append('page', pageNum.toString());
      params.append('limit', limit.toString());
      if (query.sortBy) {
        params.append('sortBy', query.sortBy);
      }
      if (query.sortDirection) {
        params.append('sortDirection', query.sortDirection);
      }
      return params.toString();
    };

    const next = nextPage ? `?${buildQueryParams(nextPage)}` : undefined;
    const previous = prevPage ? `?${buildQueryParams(prevPage)}` : undefined;

    return FindResult.fromListAll(data, total, next, previous);
  }

  async countDocuments(): Promise<number> {
    try {
      return await this.postRepository.countDocuments();
    } catch (error) {
      this.logger.error('Error counting posts:', error);
      throw error;
    }
  }

  async countReports(): Promise<number> {
    try {
      return await this.postReportRepository.countDocuments();
    } catch (error) {
      this.logger.error('Error counting post reports:', error);
      throw error;
    }
  }
}
